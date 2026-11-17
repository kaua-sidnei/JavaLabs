import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import type { Exercise, LanguageTrack, SubmissionRecord } from '../types/javalab';
import type { PersistedLabState } from '../utils/labLogic';
import {
  clampScore,
  clampTestCount,
  FIREBASE_CONSTRAINTS,
  isValidDifficultyValue,
  isValidFirebaseId,
  isValidTrackValue,
  mapCloudSubmissionToRecord,
  mergeLocalAndCloudState,
  sanitizeFirebaseId,
  sanitizeTitle,
  truncateCode,
  type CloudActivityRecord,
  type CloudUserStateRecord,
} from '../utils/cloudMerge';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface SaveActivityProgressInput {
  id_atividade: string;
  track: LanguageTrack;
  pontuacao: number;
  resolvido: boolean;
  codigo_salvo: string;
}

export interface LoadedCloudProgress {
  userState: CloudUserStateRecord | null;
  progressByActivity: Record<string, CloudActivityRecord>;
  submissions: SubmissionRecord[];
}

// Cache local por sessão para respeitar atualizações por ação e pontuação monotônica sem leituras extras
const knownCloudProgressByUser = new Map<string, Map<string, { resolvido: boolean; pontuacao: number }>>();
const knownUserParentExists = new Set<string>();

function toIsoString(val: unknown): string | null {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') {
    return val;
  }
  return null;
}

function buildUserStatePayload(
  uid: string,
  state: Pick<PersistedLabState, 'activeTrack' | 'currentExerciseByTrack'>,
  defaultsByTrack: Record<LanguageTrack, string>
) {
  return {
    uid,
    activeTrack: isValidTrackValue(state.activeTrack) ? state.activeTrack : 'java',
    currentJavaExerciseId: sanitizeFirebaseId(state.currentExerciseByTrack.java, defaultsByTrack.java),
    currentJsExerciseId: sanitizeFirebaseId(state.currentExerciseByTrack.javascript, defaultsByTrack.javascript),
    currentGasExerciseId: sanitizeFirebaseId(state.currentExerciseByTrack.appscript, defaultsByTrack.appscript),
    currentPyExerciseId: sanitizeFirebaseId(state.currentExerciseByTrack.python, defaultsByTrack.python),
    updatedAt: serverTimestamp(),
  };
}

function ensureUserParentInBatch(
  batch: WriteBatch,
  uid: string,
  state: Pick<PersistedLabState, 'activeTrack' | 'currentExerciseByTrack'>,
  defaultsByTrack: Record<LanguageTrack, string>
) {
  const userRef = doc(db, 'users', uid);
  const payload = buildUserStatePayload(uid, state, defaultsByTrack);
  if (knownUserParentExists.has(uid)) {
    batch.update(userRef, {
      activeTrack: payload.activeTrack,
      currentJavaExerciseId: payload.currentJavaExerciseId,
      currentJsExerciseId: payload.currentJsExerciseId,
      currentGasExerciseId: payload.currentGasExerciseId,
      currentPyExerciseId: payload.currentPyExerciseId,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.set(userRef, payload);
  }
}

function getKnownProgressCache(uid: string): Map<string, { resolvido: boolean; pontuacao: number }> {
  let cache = knownCloudProgressByUser.get(uid);
  if (!cache) {
    cache = new Map();
    knownCloudProgressByUser.set(uid, cache);
  }
  return cache;
}

export function clearCloudSessionCache(uid?: string) {
  if (uid) {
    knownCloudProgressByUser.delete(uid);
    knownUserParentExists.delete(uid);
  } else {
    knownCloudProgressByUser.clear();
    knownUserParentExists.clear();
  }
}

/**
 * Busca todo o progresso salvo no Cloud Firestore para o usuário autenticado.
 * Utiliza `where('userId', '==', uid)` conforme exigido pelas regras de consulta seguras.
 */
export async function buscarProgressoUsuario(
  uid: string,
  exerciseCatalog: Exercise[]
): Promise<LoadedCloudProgress> {
  if (!isValidFirebaseId(uid)) {
    throw new Error('Identificador de usuário inválido.');
  }

  const catalogMap = new Map<string, Exercise>();
  for (const ex of exerciseCatalog) {
    catalogMap.set(ex.id, ex);
  }

  const userDocPath = `users/${uid}`;
  let userState: CloudUserStateRecord | null = null;

  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      knownUserParentExists.add(uid);
      const raw = userSnap.data();
      userState = {
        uid,
        activeTrack: isValidTrackValue(raw.activeTrack) ? raw.activeTrack : 'java',
        currentJavaExerciseId: String(raw.currentJavaExerciseId ?? ''),
        currentJsExerciseId: String(raw.currentJsExerciseId ?? ''),
        currentGasExerciseId: String(raw.currentGasExerciseId ?? ''),
        currentPyExerciseId: String(raw.currentPyExerciseId ?? ''),
      };
    } else {
      knownUserParentExists.delete(uid);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  const progressPath = `users/${uid}/progress`;
  const progressByActivity: Record<string, CloudActivityRecord> = {};
  const cache = getKnownProgressCache(uid);
  cache.clear();

  try {
    const progressQuery = query(
      collection(db, 'users', uid, 'progress'),
      where('userId', '==', uid),
      limit(250)
    );
    const snap = await getDocs(progressQuery);
    snap.forEach((docSnap) => {
      const raw = docSnap.data();
      const idAtividade = String(raw.id_atividade ?? docSnap.id);
      const track: LanguageTrack = isValidTrackValue(raw.track) ? raw.track : 'java';
      const pontuacao = clampScore(Number(raw.pontuacao ?? 0));
      const resolvido = Boolean(raw.resolvido);
      const record: CloudActivityRecord = {
        userId: uid,
        id_atividade: idAtividade,
        track,
        pontuacao,
        resolvido,
        codigo_salvo: typeof raw.codigo_salvo === 'string' ? raw.codigo_salvo : '',
        concluido_em: toIsoString(raw.concluido_em),
        atualizado_em: toIsoString(raw.atualizado_em),
      };
      progressByActivity[idAtividade] = record;
      cache.set(idAtividade, { resolvido, pontuacao });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, progressPath);
  }

  const submissionsPath = `users/${uid}/submissions`;
  const submissions: SubmissionRecord[] = [];

  try {
    const submissionsQuery = query(
      collection(db, 'users', uid, 'submissions'),
      where('userId', '==', uid),
      limit(100)
    );
    const subSnap = await getDocs(submissionsQuery);
    subSnap.forEach((docSnap) => {
      const raw = docSnap.data();
      const idAtividade = String(raw.id_atividade ?? '');
      if (!isValidFirebaseId(idAtividade)) return;
      submissions.push(
        mapCloudSubmissionToRecord(
          docSnap.id,
          {
            id_atividade: idAtividade,
            track: isValidTrackValue(raw.track) ? raw.track : 'java',
            titulo: typeof raw.titulo === 'string' ? raw.titulo : idAtividade,
            dificuldade: isValidDifficultyValue(raw.dificuldade) ? raw.dificuldade : 'Fácil',
            pontuacao: clampScore(Number(raw.pontuacao ?? 0)),
            aprovado: Boolean(raw.aprovado),
            testes_passados: clampTestCount(Number(raw.testes_passados ?? 0)),
            testes_total: clampTestCount(Number(raw.testes_total ?? 0)),
            codigo: typeof raw.codigo === 'string' ? raw.codigo : '',
            criado_em: toIsoString(raw.criado_em),
          },
          catalogMap
        )
      );
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, submissionsPath);
  }

  return { userState, progressByActivity, submissions };
}

function appendProgressWriteToBatch(
  batch: WriteBatch,
  uid: string,
  input: SaveActivityProgressInput
) {
  const idAtividade = sanitizeFirebaseId(input.id_atividade, 'ex-desconhecido');
  const docRef = doc(db, 'users', uid, 'progress', idAtividade);
  const cache = getKnownProgressCache(uid);
  const known = cache.get(idAtividade);
  const sanitizedCode = truncateCode(input.codigo_salvo);
  const candidateScore = clampScore(input.pontuacao);

  if (!known) {
    batch.set(docRef, {
      userId: uid,
      id_atividade: idAtividade,
      track: isValidTrackValue(input.track) ? input.track : 'java',
      pontuacao: candidateScore,
      resolvido: Boolean(input.resolvido),
      codigo_salvo: sanitizedCode,
      concluido_em: input.resolvido ? serverTimestamp() : null,
      atualizado_em: serverTimestamp(),
    });
    cache.set(idAtividade, { resolvido: Boolean(input.resolvido), pontuacao: candidateScore });
    return;
  }

  const nextScore = Math.max(known.pontuacao, candidateScore);

  if (!known.resolvido && !input.resolvido) {
    batch.update(docRef, {
      codigo_salvo: sanitizedCode,
      pontuacao: candidateScore,
      atualizado_em: serverTimestamp(),
    });
    cache.set(idAtividade, { resolvido: false, pontuacao: candidateScore });
    return;
  }

  if (!known.resolvido && input.resolvido) {
    batch.update(docRef, {
      codigo_salvo: sanitizedCode,
      pontuacao: nextScore,
      resolvido: true,
      concluido_em: serverTimestamp(),
      atualizado_em: serverTimestamp(),
    });
    cache.set(idAtividade, { resolvido: true, pontuacao: nextScore });
    return;
  }

  // Já concluída no servidor: mantém concluido_em imutável e pontuação não regressiva
  batch.update(docRef, {
    codigo_salvo: sanitizedCode,
    pontuacao: nextScore,
    atualizado_em: serverTimestamp(),
  });
  cache.set(idAtividade, { resolvido: true, pontuacao: nextScore });
}

/**
 * Salva ou atualiza o progresso de uma atividade no Firestore (id_atividade, pontuacao, concluido_em).
 */
export async function salvarProgressoAtividade(
  uid: string,
  input: SaveActivityProgressInput,
  currentState: Pick<PersistedLabState, 'activeTrack' | 'currentExerciseByTrack'>,
  defaultsByTrack: Record<LanguageTrack, string>
): Promise<void> {
  if (!isValidFirebaseId(uid)) return;
  const idAtividade = sanitizeFirebaseId(input.id_atividade, '');
  if (!idAtividade) return;

  const path = `users/${uid}/progress/${idAtividade}`;
  const cache = getKnownProgressCache(uid);

  // Caso ainda não tenhamos carregado este documento na sessão, consulta antes para escolher a ação correta
  if (!cache.has(idAtividade)) {
    try {
      const existingSnap = await getDoc(doc(db, 'users', uid, 'progress', idAtividade));
      if (existingSnap.exists()) {
        const raw = existingSnap.data();
        cache.set(idAtividade, {
          resolvido: Boolean(raw.resolvido),
          pontuacao: clampScore(Number(raw.pontuacao ?? 0)),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  try {
    const batch = writeBatch(db);
    if (!knownUserParentExists.has(uid)) {
      ensureUserParentInBatch(batch, uid, currentState, defaultsByTrack);
    }
    appendProgressWriteToBatch(batch, uid, input);
    await batch.commit();
    knownUserParentExists.add(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function salvarPreferenciaTrilha(
  uid: string,
  state: Pick<PersistedLabState, 'activeTrack' | 'currentExerciseByTrack'>,
  defaultsByTrack: Record<LanguageTrack, string>
): Promise<void> {
  if (!isValidFirebaseId(uid)) return;
  const path = `users/${uid}`;
  try {
    const batch = writeBatch(db);
    ensureUserParentInBatch(batch, uid, state, defaultsByTrack);
    await batch.commit();
    knownUserParentExists.add(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function registrarSubmissaoNuvem(
  uid: string,
  submission: SubmissionRecord,
  currentState: Pick<PersistedLabState, 'activeTrack' | 'currentExerciseByTrack'>,
  defaultsByTrack: Record<LanguageTrack, string>
): Promise<void> {
  if (!isValidFirebaseId(uid)) return;
  const subId = sanitizeFirebaseId(submission.id, `sub-${Date.now()}`);
  const idAtividade = sanitizeFirebaseId(submission.exerciseId, 'ex-1');
  const path = `users/${uid}/submissions/${subId}`;

  try {
    const batch = writeBatch(db);
    if (!knownUserParentExists.has(uid)) {
      ensureUserParentInBatch(batch, uid, currentState, defaultsByTrack);
    }
    batch.set(doc(db, 'users', uid, 'submissions', subId), {
      userId: uid,
      id_atividade: idAtividade,
      track: isValidTrackValue(submission.track) ? submission.track : 'java',
      titulo: sanitizeTitle(submission.exerciseTitle, idAtividade),
      dificuldade: isValidDifficultyValue(submission.difficulty) ? submission.difficulty : 'Fácil',
      pontuacao: clampScore(submission.qualityScore),
      aprovado: Boolean(submission.passed),
      testes_passados: clampTestCount(submission.testsPassed),
      testes_total: clampTestCount(submission.testsTotal),
      codigo: truncateCode(submission.code),
      criado_em: serverTimestamp(),
    });
    await batch.commit();
    knownUserParentExists.add(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Busca progresso existente na nuvem ao carregar/logar, mescla com o estado local
 * sem perder atividades concluídas em nenhuma das pontas e envia o delta em lote.
 */
export async function mesclarProgressoLocalComNuvem(
  user: User,
  localState: PersistedLabState,
  exerciseCatalog: Exercise[],
  defaultsByTrack: Record<LanguageTrack, string>
): Promise<{
  mergedState: PersistedLabState;
  bestScores: Record<string, number>;
  cloudCount: number;
}> {
  const uid = user.uid;
  const loaded = await buscarProgressoUsuario(uid, exerciseCatalog);

  const { mergedState, bestScores, progressToUpload, submissionsToUpload } =
    mergeLocalAndCloudState({
      localState,
      cloudState: loaded.userState,
      cloudProgress: loaded.progressByActivity,
      cloudSubmissions: loaded.submissions,
      exerciseCatalog,
      defaultsByTrack,
    });

  const email = (user.email ?? 'aluno@javalabs.dev').trim().slice(0, FIREBASE_CONSTRAINTS.MAX_EMAIL_LEN);
  const displayName = (user.displayName ?? 'Estudante JavaLabs')
    .trim()
    .slice(0, FIREBASE_CONSTRAINTS.MAX_DISPLAY_NAME_LEN) || 'Estudante JavaLabs';

  // Verifica se o documento privado de perfil já existe para respeitar create vs update
  let privateExists = false;
  const privatePath = `users/${uid}/private/profile`;
  try {
    const privateSnap = await getDoc(doc(db, 'users', uid, 'private', 'profile'));
    privateExists = privateSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath);
  }

  try {
    const batch = writeBatch(db);
    ensureUserParentInBatch(batch, uid, mergedState, defaultsByTrack);

    const privateRef = doc(db, 'users', uid, 'private', 'profile');
    if (privateExists) {
      batch.update(privateRef, {
        email,
        displayName,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(privateRef, {
        uid,
        email,
        displayName,
        updatedAt: serverTimestamp(),
      });
    }

    // Lote limitado para manter abaixo do teto de 500 operações do Firestore
    const progressQueue = progressToUpload.slice(0, 200);
    for (const item of progressQueue) {
      appendProgressWriteToBatch(batch, uid, item);
    }

    const subQueue = submissionsToUpload.slice(0, 20);
    for (const sub of subQueue) {
      const subId = sanitizeFirebaseId(sub.id, `sub-${Date.now()}`);
      batch.set(doc(db, 'users', uid, 'submissions', subId), {
        userId: uid,
        id_atividade: sanitizeFirebaseId(sub.exerciseId, 'ex-1'),
        track: isValidTrackValue(sub.track) ? sub.track : 'java',
        titulo: sanitizeTitle(sub.exerciseTitle, sub.exerciseId),
        dificuldade: isValidDifficultyValue(sub.difficulty) ? sub.difficulty : 'Fácil',
        pontuacao: clampScore(sub.qualityScore),
        aprovado: Boolean(sub.passed),
        testes_passados: clampTestCount(sub.testsPassed),
        testes_total: clampTestCount(sub.testsTotal),
        codigo: truncateCode(sub.code),
        criado_em: serverTimestamp(),
      });
    }

    await batch.commit();
    knownUserParentExists.add(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }

  return {
    mergedState,
    bestScores,
    cloudCount: getKnownProgressCache(uid).size,
  };
}
