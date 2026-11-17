import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import type { Exercise, LanguageTrack, SubmissionRecord } from '../types/javalab';
import type { PersistedLabState } from '../utils/labLogic';
import { auth, googleProvider } from '../lib/firebase';
import { createEmptyPersistedState } from '../utils/cloudMerge';
import {
  clearCloudSessionCache,
  mesclarProgressoLocalComNuvem,
  registrarSubmissaoNuvem,
  resetarProgressoContaNuvem,
  salvarPreferenciaTrilha,
  salvarProgressoAtividade,
  type SaveActivityProgressInput,
} from '../services/progressService';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface UseAuthProgressOptions {
  persisted: PersistedLabState;
  allExercises: Exercise[];
  defaultsByTrack: Record<LanguageTrack, string>;
  onApplyMergedState: (merged: PersistedLabState) => void;
}

function translateAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'A janela de login foi fechada antes da conclusão. Tente novamente quando quiser.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou o popup do Google. Libere popups para este site e tente novamente.';
    case 'auth/cancelled-popup-request':
      return 'Solicitação de login substituída por outra mais recente.';
    case 'auth/network-request-failed':
      return 'Sem conexão com os servidores de autenticação. Verifique sua internet.';
    case 'auth/unauthorized-domain':
      return 'Domínio não autorizado no Firebase Auth. Adicione este domínio em Authentication > Settings > Authorized domains.';
    default:
      if (error instanceof Error && error.message.includes('Quota exceeded')) {
        return 'Cota gratuita diária do Firestore atingida. Ela será restaurada amanhã.';
      }
      return error instanceof Error
        ? error.message
        : 'Não foi possível concluir a autenticação com o Google.';
  }
}

export function useAuthProgress({
  persisted,
  allExercises,
  defaultsByTrack,
  onApplyMergedState,
}: UseAuthProgressOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudActivityCount, setCloudActivityCount] = useState<number>(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [bestScores, setBestScores] = useState<Record<string, number>>({});

  const latestPersistedRef = useRef(persisted);
  latestPersistedRef.current = persisted;

  const allExercisesRef = useRef(allExercises);
  allExercisesRef.current = allExercises;

  const onApplyMergedRef = useRef(onApplyMergedState);
  onApplyMergedRef.current = onApplyMergedState;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMergeUidRef = useRef<string | null>(null);

  const runCloudMergeForUser = useCallback(
    async (firebaseUser: User) => {
      setSyncStatus('syncing');
      setSyncError(null);
      try {
        const result = await mesclarProgressoLocalComNuvem(
          firebaseUser,
          latestPersistedRef.current,
          allExercisesRef.current,
          defaultsByTrack
        );
        onApplyMergedRef.current(result.mergedState);
        setBestScores(result.bestScores);
        setCloudActivityCount(result.cloudCount);
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        const rawMsg = err instanceof Error ? err.message : '';
        const msg = rawMsg.includes('Quota exceeded')
          ? 'Cota gratuita do Firestore atingida hoje. Seu código continua salvo localmente.'
          : rawMsg.includes('permission-denied') || rawMsg.includes('Missing or insufficient permissions')
          ? 'Permissão negada no Firestore ao sincronizar/resetar. Publique as regras atualizadas no Firebase Console.'
          : 'Falha ao sincronizar com a nuvem. Suas alterações seguem salvas localmente.';
        setSyncError(msg);
      }
    },
    [defaultsByTrack]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        activeMergeUidRef.current = null;
        clearCloudSessionCache();
        setSyncStatus('idle');
        setSyncError(null);
        setCloudActivityCount(0);
        return;
      }

      if (activeMergeUidRef.current !== nextUser.uid) {
        activeMergeUidRef.current = nextUser.uid;
        void runCloudMergeForUser(nextUser);
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [runCloudMergeForUser]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      setAuthError(translateAuthError(err));
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setAuthError(null);
    setSyncError(null);
    try {
      await signOut(auth);
      clearCloudSessionCache();
      setSyncStatus('idle');
    } catch (err) {
      setAuthError(translateAuthError(err));
    }
  }, []);

  const syncActivityImmediate = useCallback(
    async (input: SaveActivityProgressInput) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setSyncStatus('syncing');
      setSyncError(null);
      try {
        await salvarProgressoAtividade(
          currentUser.uid,
          input,
          latestPersistedRef.current,
          defaultsByTrack
        );
        setBestScores((prev) => ({
          ...prev,
          [input.id_atividade]: Math.max(prev[input.id_atividade] ?? 0, input.pontuacao),
        }));
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        setSyncError(
          err instanceof Error && err.message.includes('Quota exceeded')
            ? 'Cota gratuita diária do Firestore atingida. Progresso mantido no navegador.'
            : 'Não foi possível salvar esta atividade na nuvem agora.'
        );
      }
    },
    [defaultsByTrack]
  );

  const syncActivityDebounced = useCallback(
    (input: SaveActivityProgressInput, delayMs = 900) => {
      if (!auth.currentUser) return;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        void syncActivityImmediate(input);
      }, delayMs);
    },
    [syncActivityImmediate]
  );

  const syncSubmission = useCallback(
    async (submission: SubmissionRecord, progressInput: SaveActivityProgressInput) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      setSyncStatus('syncing');
      setSyncError(null);
      try {
        await Promise.all([
          salvarProgressoAtividade(
            currentUser.uid,
            progressInput,
            latestPersistedRef.current,
            defaultsByTrack
          ),
          registrarSubmissaoNuvem(
            currentUser.uid,
            submission,
            latestPersistedRef.current,
            defaultsByTrack
          ),
        ]);
        setBestScores((prev) => ({
          ...prev,
          [progressInput.id_atividade]: Math.max(
            prev[progressInput.id_atividade] ?? 0,
            progressInput.pontuacao
          ),
        }));
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('error');
        setSyncError(
          err instanceof Error && err.message.includes('Quota exceeded')
            ? 'Cota gratuita diária do Firestore atingida. Submissão mantida localmente.'
            : 'Erro ao registrar submissão na nuvem. Dados mantidos no navegador.'
        );
      }
    },
    [defaultsByTrack]
  );

  const syncTrackPreference = useCallback(
    async (nextState: Pick<PersistedLabState, 'activeTrack' | 'currentExerciseByTrack'>) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        await salvarPreferenciaTrilha(currentUser.uid, nextState, defaultsByTrack);
        setLastSyncedAt(new Date().toISOString());
      } catch {
        // Preferência de trilha é não-crítica; evita ruído caso offline
      }
    },
    [defaultsByTrack]
  );

  const resyncNow = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    await runCloudMergeForUser(currentUser);
  }, [runCloudMergeForUser]);

  const resetAccountProgress = useCallback(
    async (onResetLocal: (emptyState: PersistedLabState) => void): Promise<boolean> => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const emptyState = createEmptyPersistedState(defaultsByTrack);
      onResetLocal(emptyState);
      setBestScores({});
      setCloudActivityCount(0);
      setSyncError(null);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        return true;
      }

      setSyncStatus('syncing');
      try {
        await resetarProgressoContaNuvem(currentUser, defaultsByTrack);
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('synced');
        return true;
      } catch (err) {
        setSyncStatus('error');
        const rawMsg = err instanceof Error ? err.message : '';
        setSyncError(
          rawMsg.includes('permission-denied') || rawMsg.includes('Missing or insufficient permissions')
            ? 'Progresso local zerado, mas o Firestore recusou apagar documentos antigos. Atualize as regras no Firebase Console.'
            : 'Progresso local zerado, mas houve erro ao limpar os dados na nuvem.'
        );
        return false;
      }
    },
    [defaultsByTrack]
  );

  return {
    user,
    authReady,
    isAuthenticating,
    syncStatus,
    lastSyncedAt,
    cloudActivityCount,
    authError,
    syncError,
    bestScores,
    clearAuthError: () => setAuthError(null),
    clearSyncError: () => setSyncError(null),
    loginWithGoogle,
    logout,
    syncActivityImmediate,
    syncActivityDebounced,
    syncSubmission,
    syncTrackPreference,
    resyncNow,
    resetAccountProgress,
  };
}
