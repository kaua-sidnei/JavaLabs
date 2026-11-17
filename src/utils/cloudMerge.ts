import type {
  CopilotFinding,
  Difficulty,
  Exercise,
  ImprovementHint,
  LanguageTrack,
  SubmissionRecord,
} from '../types/javalab';
import type { PersistedLabState } from './labLogic';

export const FIREBASE_CONSTRAINTS = {
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  MAX_ID_LEN: 128,
  MAX_CODE_LEN: 25000,
  MAX_TITLE_LEN: 200,
  MAX_EMAIL_LEN: 254,
  MAX_DISPLAY_NAME_LEN: 120,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
} as const;

export const CURRENT_RESET_EPOCH = 1;

export interface CloudActivityRecord {
  userId: string;
  id_atividade: string;
  track: LanguageTrack;
  pontuacao: number;
  resolvido: boolean;
  codigo_salvo: string;
  concluido_em: string | null;
  atualizado_em: string | null;
}

export interface CloudUserStateRecord {
  uid: string;
  activeTrack: LanguageTrack;
  currentJavaExerciseId: string;
  currentJsExerciseId: string;
  currentGasExerciseId: string;
  currentPyExerciseId: string;
  resetEpoch?: number;
}

export function createEmptyPersistedState(
  defaultsByTrack: Record<LanguageTrack, string>
): PersistedLabState {
  return {
    activeTrack: 'java',
    solvedIds: [],
    submissions: [],
    codeByExercise: {},
    customExercises: [],
    currentExerciseId: defaultsByTrack.java,
    currentExerciseByTrack: { ...defaultsByTrack },
  };
}

export interface ProgressUploadCandidate {
  id_atividade: string;
  track: LanguageTrack;
  pontuacao: number;
  resolvido: boolean;
  codigo_salvo: string;
}

export function isValidFirebaseId(value: string): boolean {
  return (
    typeof value === 'string' &&
    value.length >= 1 &&
    value.length <= FIREBASE_CONSTRAINTS.MAX_ID_LEN &&
    FIREBASE_CONSTRAINTS.ID_PATTERN.test(value)
  );
}

export function sanitizeFirebaseId(value: string | undefined, fallback: string): string {
  if (value && isValidFirebaseId(value)) return value;
  const cleaned = (value ?? '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, FIREBASE_CONSTRAINTS.MAX_ID_LEN);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(
    FIREBASE_CONSTRAINTS.MIN_SCORE,
    Math.min(FIREBASE_CONSTRAINTS.MAX_SCORE, Math.round(score))
  );
}

export function clampTestCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function truncateCode(code: string): string {
  if (typeof code !== 'string') return '';
  if (code.length <= FIREBASE_CONSTRAINTS.MAX_CODE_LEN) return code;
  return code.slice(0, FIREBASE_CONSTRAINTS.MAX_CODE_LEN);
}

export function sanitizeTitle(title: string, fallback = 'Exercício JavaLabs'): string {
  const trimmed = (title ?? '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, FIREBASE_CONSTRAINTS.MAX_TITLE_LEN);
}

export function isValidTrackValue(track: unknown): track is LanguageTrack {
  return track === 'java' || track === 'javascript' || track === 'appscript' || track === 'python';
}

export function isValidDifficultyValue(diff: unknown): diff is Difficulty {
  return diff === 'Fácil' || diff === 'Médio' || diff === 'Difícil';
}

function inferTrackFromExerciseId(
  exerciseId: string,
  catalogMap: Map<string, Exercise>
): LanguageTrack {
  const fromCatalog = catalogMap.get(exerciseId)?.track;
  if (fromCatalog) return fromCatalog;
  if (exerciseId.startsWith('js-') || exerciseId.startsWith('ai-javascript-')) return 'javascript';
  if (exerciseId.startsWith('gas-') || exerciseId.startsWith('ai-appscript-')) return 'appscript';
  if (exerciseId.startsWith('py-') || exerciseId.startsWith('ai-python-')) return 'python';
  return 'java';
}

export function mergeLocalAndCloudState(params: {
  localState: PersistedLabState;
  cloudState: CloudUserStateRecord | null;
  cloudProgress: Record<string, CloudActivityRecord>;
  cloudSubmissions: SubmissionRecord[];
  exerciseCatalog: Exercise[];
  defaultsByTrack: Record<LanguageTrack, string>;
}): {
  mergedState: PersistedLabState;
  bestScores: Record<string, number>;
  progressToUpload: ProgressUploadCandidate[];
  submissionsToUpload: SubmissionRecord[];
} {
  const {
    localState,
    cloudState,
    cloudProgress,
    cloudSubmissions,
    exerciseCatalog,
    defaultsByTrack,
  } = params;

  const catalogMap = new Map<string, Exercise>();
  for (const ex of exerciseCatalog) {
    catalogMap.set(ex.id, ex);
  }
  for (const ex of localState.customExercises) {
    catalogMap.set(ex.id, ex);
  }

  // 1. Merge solvedIds (union of local + cloud solved)
  const mergedSolvedSet = new Set<string>(localState.solvedIds);
  for (const item of Object.values(cloudProgress)) {
    if (item.resolvido && isValidFirebaseId(item.id_atividade)) {
      mergedSolvedSet.add(item.id_atividade);
    }
  }

  // 2. Merge best scores from submissions + cloud progress
  const localBestScore: Record<string, number> = {};
  for (const sub of localState.submissions) {
    const score = clampScore(sub.qualityScore);
    localBestScore[sub.exerciseId] = Math.max(localBestScore[sub.exerciseId] ?? 0, score);
  }

  const bestScores: Record<string, number> = { ...localBestScore };
  for (const item of Object.values(cloudProgress)) {
    bestScores[item.id_atividade] = Math.max(
      bestScores[item.id_atividade] ?? 0,
      clampScore(item.pontuacao)
    );
  }

  // 3. Merge codeByExercise (preserve local active edits, fill gaps from cloud)
  const mergedCode: Record<string, string> = { ...localState.codeByExercise };
  for (const item of Object.values(cloudProgress)) {
    if (!mergedCode[item.id_atividade] && item.codigo_salvo) {
      mergedCode[item.id_atividade] = item.codigo_salvo;
    }
  }

  // 4. Merge submissions (deduplicate by id, newest timestamp first, cap at 50)
  const submissionMap = new Map<string, SubmissionRecord>();
  for (const sub of cloudSubmissions) {
    submissionMap.set(sub.id, sub);
  }
  for (const sub of localState.submissions) {
    if (!submissionMap.has(sub.id)) {
      submissionMap.set(sub.id, sub);
    }
  }

  const mergedSubmissions = Array.from(submissionMap.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);

  // 5. Reconcile activeTrack & currentExerciseByTrack
  const hasLocalDrafts = Object.keys(localState.codeByExercise).length > 0;
  const activeTrack: LanguageTrack =
    !hasLocalDrafts && cloudState && isValidTrackValue(cloudState.activeTrack)
      ? cloudState.activeTrack
      : localState.activeTrack;

  const currentExerciseByTrack: Partial<Record<LanguageTrack, string>> = {
    java:
      (!hasLocalDrafts && cloudState?.currentJavaExerciseId) ||
      localState.currentExerciseByTrack.java ||
      defaultsByTrack.java,
    javascript:
      (!hasLocalDrafts && cloudState?.currentJsExerciseId) ||
      localState.currentExerciseByTrack.javascript ||
      defaultsByTrack.javascript,
    appscript:
      (!hasLocalDrafts && cloudState?.currentGasExerciseId) ||
      localState.currentExerciseByTrack.appscript ||
      defaultsByTrack.appscript,
    python:
      (!hasLocalDrafts && cloudState?.currentPyExerciseId) ||
      localState.currentExerciseByTrack.python ||
      defaultsByTrack.python,
  };

  const currentExerciseId = currentExerciseByTrack[activeTrack] ?? defaultsByTrack[activeTrack];

  // 6. Compute local entries that should be pushed up to Firestore on first sync
  const candidateIds = new Set<string>([
    ...localState.solvedIds,
    ...Object.keys(localState.codeByExercise),
  ]);

  const progressToUpload: ProgressUploadCandidate[] = [];
  for (const id of candidateIds) {
    if (!isValidFirebaseId(id)) continue;
    const existingCloud = cloudProgress[id];
    const isSolvedLocally = localState.solvedIds.includes(id);
    const localCode = truncateCode(localState.codeByExercise[id] ?? existingCloud?.codigo_salvo ?? '');
    const bestScore = clampScore(
      Math.max(
        bestScores[id] ?? 0,
        isSolvedLocally && (bestScores[id] ?? 0) === 0 ? 85 : 0
      )
    );

    const needsCreate = !existingCloud;
    const needsSolveUpgrade = Boolean(existingCloud && !existingCloud.resolvido && isSolvedLocally);
    const needsScoreUpgrade = Boolean(existingCloud && bestScore > existingCloud.pontuacao);
    const needsCodeUpdate = Boolean(
      existingCloud &&
        localState.codeByExercise[id] &&
        localState.codeByExercise[id] !== existingCloud.codigo_salvo
    );

    if (needsCreate || needsSolveUpgrade || needsScoreUpgrade || needsCodeUpdate) {
      progressToUpload.push({
        id_atividade: id,
        track: inferTrackFromExerciseId(id, catalogMap),
        pontuacao: bestScore,
        resolvido: Boolean(existingCloud?.resolvido || isSolvedLocally),
        codigo_salvo: localCode,
      });
    }
  }

  const cloudSubmissionIds = new Set(cloudSubmissions.map((s) => s.id));
  const submissionsToUpload = localState.submissions
    .filter((sub) => isValidFirebaseId(sub.id) && !cloudSubmissionIds.has(sub.id))
    .slice(0, 20);

  return {
    mergedState: {
      activeTrack,
      solvedIds: Array.from(mergedSolvedSet),
      submissions: mergedSubmissions,
      codeByExercise: mergedCode,
      customExercises: localState.customExercises,
      currentExerciseId,
      currentExerciseByTrack,
    },
    bestScores,
    progressToUpload,
    submissionsToUpload,
  };
}

export function mapCloudSubmissionToRecord(
  id: string,
  data: {
    id_atividade: string;
    track: LanguageTrack;
    titulo: string;
    dificuldade: Difficulty;
    pontuacao: number;
    aprovado: boolean;
    testes_passados: number;
    testes_total: number;
    codigo: string;
    criado_em: string | null;
  },
  catalogMap: Map<string, Exercise>
): SubmissionRecord {
  const ex = catalogMap.get(data.id_atividade);
  const emptyFindings: CopilotFinding[] = [];
  const emptyImprovements: ImprovementHint[] = ex?.preloadedImprovements ?? [];
  return {
    id,
    track: data.track,
    timestamp: data.criado_em ?? new Date().toISOString(),
    moduleId: ex?.moduleId ?? 1,
    moduleTitle: ex?.focusTags?.[0] ?? 'Nuvem Firestore',
    exerciseId: data.id_atividade,
    exerciseTitle: data.titulo || ex?.title || data.id_atividade,
    difficulty: data.dificuldade,
    passed: data.aprovado,
    testsPassed: data.testes_passados,
    testsTotal: data.testes_total,
    qualityScore: data.pontuacao,
    code: data.codigo,
    findings: emptyFindings,
    improvementsForEnunciado: emptyImprovements,
  };
}
