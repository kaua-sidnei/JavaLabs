/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ALL_MODULES,
  EXERCISES,
  INITIAL_COPILOT_FINDINGS_M03_EX07,
  INITIAL_SOLVED_EXERCISE_IDS,
  INITIAL_SUBMISSIONS,
  RECOMMENDED_MATERIALS,
  TRACK_METADATA,
} from './data/curriculum';
import type {
  ActiveTab,
  CopilotChatMessage,
  CopilotFinding,
  Difficulty,
  EvaluationResult,
  Exercise,
  ImprovementHint,
  LanguageTrack,
  RecurringPattern,
  SubmissionRecord,
} from './types/javalab';
import {
  aggregateRecurringPatterns,
  analyzeCodeStatic,
  computeDashboardStats,
  filterByTrack,
  getModuleExercisesByDifficulty,
  migratePersistedState,
  type PersistedLabState,
} from './utils/labLogic';
import { TopNav } from './components/TopNav';
import { AuthModal } from './components/AuthModal';
import { TrilhaView } from './components/TrilhaView';
import { PraticarView } from './components/PraticarView';
import { CopilotView } from './components/CopilotView';
import { HistoricoView } from './components/HistoricoView';
import { useAuthProgress } from './hooks/useAuthProgress';

const STORAGE_KEY = 'javalabs_state_v3';
const TRACK_ORDER: LanguageTrack[] = ['java', 'javascript', 'appscript', 'python'];
const ALL_TRACKS = TRACK_ORDER.map((id) => TRACK_METADATA[id]);
const VALID_EXERCISE_IDS = new Set(EXERCISES.map((ex) => ex.id));
const DEFAULT_BY_TRACK: Record<LanguageTrack, string> = {
  java: TRACK_METADATA.java.defaultExerciseId,
  javascript: TRACK_METADATA.javascript.defaultExerciseId,
  appscript: TRACK_METADATA.appscript.defaultExerciseId,
  python: TRACK_METADATA.python.defaultExerciseId,
};

const DEFAULT_PATTERNS_BY_TRACK: Record<LanguageTrack, RecurringPattern[]> = {
  java: [
    {
      id: 'default-java-p1',
      track: 'java',
      severity: 'ERRO',
      title: 'Formatação de saída',
      description:
        'Use printf("%.4f%n", valor) para garantir casas decimais exatas sem depender de println.',
      occurrences: 1,
      category: 'Formatação de saída',
      targetExerciseId: 'm03-ex07',
    },
    {
      id: 'default-java-p2',
      track: 'java',
      severity: 'AVISO',
      title: 'Locale do Scanner',
      description:
        'Sem Locale.US, entradas decimais com ponto como 2.00 quebram em máquinas pt-BR.',
      occurrences: 1,
      category: 'Locale do Scanner',
      targetExerciseId: 'm03-ex07',
    },
    {
      id: 'default-java-p3',
      track: 'java',
      severity: 'DICA',
      title: 'Nomes de variáveis',
      description:
        'Troque identificadores de uma letra por nomes expressivos como raio e area.',
      occurrences: 1,
      category: 'Nomes de variáveis',
      targetExerciseId: 'm03-ex07',
    },
  ],
  javascript: [
    {
      id: 'default-js-p1',
      track: 'javascript',
      severity: 'ERRO',
      title: 'fetch() e response.ok',
      description:
        'O fetch não rejeita em HTTP 404/500: valide sempre if (!resp.ok) antes de resp.json().',
      occurrences: 1,
      category: 'Fetch API & Rede',
      targetExerciseId: 'js-m3-ex03',
    },
    {
      id: 'default-js-p2',
      track: 'javascript',
      severity: 'AVISO',
      title: 'Escopo e var vs const/let',
      description:
        'Evite var para prevenir hoisting inesperado e vazamento de escopo fora de blocos.',
      occurrences: 1,
      category: 'Escopo ES6+',
      targetExerciseId: 'js-m1-ex01',
    },
    {
      id: 'default-js-p3',
      track: 'javascript',
      severity: 'DICA',
      title: 'Utility Types e Type Guards no TS',
      description:
        'Combine Partial<Omit<T, "id">> e Narrowing em unknown para tipagem segura sem any.',
      occurrences: 1,
      category: 'TypeScript',
      targetExerciseId: 'js-m5-ex03',
    },
  ],
  appscript: [
    {
      id: 'default-gas-p1',
      track: 'appscript',
      severity: 'ERRO',
      title: 'Leitura/escrita dentro de loop',
      description:
        'Nunca chame getValue()/setValue() dentro de for: leia com getValues() e grave em lote com setValues().',
      occurrences: 1,
      category: 'Performance em Lote',
      targetExerciseId: 'gas-m1-ex05',
    },
    {
      id: 'default-gas-p2',
      track: 'appscript',
      severity: 'AVISO',
      title: 'UrlFetchApp sem muteHttpExceptions',
      description:
        'Passe { muteHttpExceptions: true } e verifique getResponseCode() antes de JSON.parse().',
      occurrences: 1,
      category: 'Resiliência de API',
      targetExerciseId: 'gas-m3-ex03',
    },
    {
      id: 'default-gas-p3',
      track: 'appscript',
      severity: 'DICA',
      title: 'Triggers e LockService',
      description:
        'Cheque if (!e || !e.range) em onEdit(e) e evite triggers duplicados com getProjectTriggers().',
      occurrences: 1,
      category: 'Triggers GAS',
      targetExerciseId: 'gas-m4-ex05',
    },
  ],
  python: [
    {
      id: 'default-py-p1',
      track: 'python',
      severity: 'ERRO',
      title: 'Argumentos default mutáveis',
      description:
        'Nunca use lista=[] como valor padrão de função em Python; inicialize None -> [] dentro do corpo.',
      occurrences: 1,
      category: 'Armadilhas Python',
      targetExerciseId: 'py-m2-ex01',
    },
    {
      id: 'default-py-p2',
      track: 'python',
      severity: 'AVISO',
      title: 'Context Manager (with open)',
      description:
        'Sempre manipule arquivos com with open(..., encoding="utf-8") e capture exceções específicas.',
      occurrences: 1,
      category: 'Context Managers',
      targetExerciseId: 'py-m2-ex05',
    },
    {
      id: 'default-py-p3',
      track: 'python',
      severity: 'DICA',
      title: 'Requests, BeautifulSoup e FastAPI/Pandas',
      description:
        'Defina timeout= em requests, trate select_one() == None e evite iterrows() em Pandas.',
      occurrences: 1,
      category: 'Web Scraping & Dados',
      targetExerciseId: 'py-m5-ex04',
    },
  ],
};

function loadInitialState(): PersistedLabState {
  try {
    const v3Raw = localStorage.getItem(STORAGE_KEY);
    if (v3Raw) {
      return migratePersistedState(v3Raw, {
        isLegacyVersion: false,
        validExerciseIds: VALID_EXERCISE_IDS,
        defaultByTrack: DEFAULT_BY_TRACK,
        initialSolvedJavaIds: INITIAL_SOLVED_EXERCISE_IDS,
        initialJavaSubmissions: INITIAL_SUBMISSIONS,
      });
    }
    const legacyRaw =
      localStorage.getItem('javalabs_state_v2') ?? localStorage.getItem('javalabs_state_v1');
    return migratePersistedState(legacyRaw, {
      isLegacyVersion: true,
      validExerciseIds: VALID_EXERCISE_IDS,
      defaultByTrack: DEFAULT_BY_TRACK,
      initialSolvedJavaIds: INITIAL_SOLVED_EXERCISE_IDS,
      initialJavaSubmissions: INITIAL_SUBMISSIONS,
    });
  } catch {
    return migratePersistedState(null, {
      isLegacyVersion: false,
      validExerciseIds: VALID_EXERCISE_IDS,
      defaultByTrack: DEFAULT_BY_TRACK,
      initialSolvedJavaIds: INITIAL_SOLVED_EXERCISE_IDS,
      initialJavaSubmissions: INITIAL_SUBMISSIONS,
    });
  }
}

async function parseApiJson<T>(res: Response, fallbackError: string): Promise<T> {
  const rawText = await res.text();
  let parsed: (T & { error?: string }) | null = null;

  if (rawText.trim()) {
    try {
      parsed = JSON.parse(rawText) as T & { error?: string };
    } catch {
      const preview = rawText.replace(/\s+/g, ' ').trim().slice(0, 80);
      throw new Error(
        `A API retornou uma resposta inválida (HTTP ${res.status}: "${preview}"). Verifique se as funções /api/* estão publicadas e se GEMINI_API_KEY está configurada no servidor.`
      );
    }
  }

  if (!res.ok) {
    throw new Error(parsed?.error || `${fallbackError} (HTTP ${res.status})`);
  }

  if (!parsed) {
    throw new Error(`${fallbackError} (resposta vazia do servidor).`);
  }

  return parsed;
}

export default function App() {
  const [persisted, setPersisted] = useState<PersistedLabState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1' ? 'praticar' : 'trilha';
  });
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'Todas'>('Todas');

  // Active workspace transient state
  const [evaluationByExercise, setEvaluationByExercise] = useState<
    Record<string, EvaluationResult>
  >({});
  const [aiReviewByExercise, setAiReviewByExercise] = useState<
    Record<
      string,
      {
        findings: CopilotFinding[];
        improvements: ImprovementHint[];
        qualityScore: number;
      }
    >
  >(() => ({
    'm03-ex07': {
      findings: INITIAL_COPILOT_FINDINGS_M03_EX07,
      improvements: INITIAL_SUBMISSIONS[2].improvementsForEnunciado,
      qualityScore: 35,
    },
  }));
  const [chatByExercise, setChatByExercise] = useState<
    Record<string, CopilotChatMessage[]>
  >({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore storage quota errors
    }
  }, [persisted]);

  const allExercises = useMemo(
    () => [...EXERCISES, ...persisted.customExercises],
    [persisted.customExercises]
  );

  const {
    user,
    isAuthenticating,
    syncStatus,
    lastSyncedAt,
    cloudActivityCount,
    authError,
    syncError,
    bestScores,
    clearAuthError,
    clearSyncError,
    loginWithGoogle,
    logout,
    syncActivityImmediate,
    syncActivityDebounced,
    syncSubmission,
    syncTrackPreference,
    resyncNow,
  } = useAuthProgress({
    persisted,
    allExercises,
    defaultsByTrack: DEFAULT_BY_TRACK,
    onApplyMergedState: (merged) => setPersisted(merged),
  });

  const solvedSet = useMemo(
    () => new Set(persisted.solvedIds),
    [persisted.solvedIds]
  );

  const activeTrack = persisted.activeTrack;
  const activeTrackMeta = TRACK_METADATA[activeTrack];

  const trackModules = useMemo(
    () => filterByTrack(ALL_MODULES, activeTrack),
    [activeTrack]
  );
  const trackExercises = useMemo(
    () => filterByTrack(allExercises, activeTrack),
    [allExercises, activeTrack]
  );
  const trackSubmissions = useMemo(
    () => persisted.submissions.filter((s) => (s.track ?? 'java') === activeTrack),
    [persisted.submissions, activeTrack]
  );

  const currentExercise = useMemo(() => {
    const preferredId =
      persisted.currentExerciseByTrack[activeTrack] ??
      (activeTrack === 'java' ? persisted.currentExerciseId : activeTrackMeta.defaultExerciseId);
    return (
      trackExercises.find((ex) => ex.id === preferredId) ??
      trackExercises.find((ex) => ex.id === activeTrackMeta.defaultExerciseId) ??
      trackExercises[0] ??
      allExercises[0]
    );
  }, [
    trackExercises,
    allExercises,
    activeTrack,
    activeTrackMeta.defaultExerciseId,
    persisted.currentExerciseByTrack,
    persisted.currentExerciseId,
  ]);

  const currentModule = useMemo(
    () =>
      ALL_MODULES.find((m) => m.id === currentExercise.moduleId) ??
      trackModules[0] ??
      ALL_MODULES[0],
    [currentExercise.moduleId, trackModules]
  );

  const moduleExercises = useMemo(
    () => getModuleExercisesByDifficulty(allExercises, currentModule.id, 'Todas'),
    [allExercises, currentModule.id]
  );

  const currentExerciseIndex = moduleExercises.findIndex(
    (ex) => ex.id === currentExercise.id
  );
  const hasPreviousExercise = currentExerciseIndex > 0;
  const hasNextExercise =
    currentExerciseIndex >= 0 && currentExerciseIndex < moduleExercises.length - 1;

  const currentCode =
    persisted.codeByExercise[currentExercise.id] ?? currentExercise.starterCode;

  // Instant static analysis if user edited code and hasn't re-run AI review yet
  const staticAnalysis = useMemo(
    () => analyzeCodeStatic(currentCode, currentExercise),
    [currentCode, currentExercise]
  );

  const cachedAiReview = aiReviewByExercise[currentExercise.id];
  const activeFindings = cachedAiReview ? cachedAiReview.findings : staticAnalysis.findings;
  const activeEnunciadoImprovements = cachedAiReview
    ? cachedAiReview.improvements
    : staticAnalysis.improvementsForEnunciado.length > 0
    ? staticAnalysis.improvementsForEnunciado
    : currentExercise.preloadedImprovements;
  const activeQualityScore = cachedAiReview
    ? cachedAiReview.qualityScore
    : staticAnalysis.qualityScore;

  const hasAttemptedCurrent = Boolean(
    cachedAiReview ||
      persisted.submissions.some((s) => s.exerciseId === currentExercise.id)
  );

  const dashboardStats = useMemo(
    () =>
      computeDashboardStats(
        trackModules,
        trackExercises,
        solvedSet,
        trackSubmissions
      ),
    [trackModules, trackExercises, solvedSet, trackSubmissions]
  );

  const trackRecurringPatterns = useMemo(() => {
    const agg = aggregateRecurringPatterns(trackSubmissions);
    if (agg.length > 0) return agg;
    return DEFAULT_PATTERNS_BY_TRACK[activeTrack];
  }, [trackSubmissions, activeTrack]);

  const trackRecommendedMaterials = useMemo(
    () => RECOMMENDED_MATERIALS.filter((m) => m.track === activeTrack),
    [activeTrack]
  );

  const handleSelectTrack = (track: LanguageTrack) => {
    setWorkspaceError(null);
    setGenerateError(null);
    const targetExId =
      persisted.currentExerciseByTrack[track] ?? TRACK_METADATA[track].defaultExerciseId;
    setPersisted((prev) => ({
      ...prev,
      activeTrack: track,
      currentExerciseId: targetExId,
    }));
    void syncTrackPreference({
      activeTrack: track,
      currentExerciseByTrack: persisted.currentExerciseByTrack,
    });
  };

  const handleOpenExercise = (exerciseId: string) => {
    setWorkspaceError(null);
    const target = allExercises.find((ex) => ex.id === exerciseId);
    const targetTrack = target?.track ?? activeTrack;
    const nextByTrack = {
      ...persisted.currentExerciseByTrack,
      [targetTrack]: exerciseId,
    };
    setPersisted((prev) => ({
      ...prev,
      activeTrack: targetTrack,
      currentExerciseId: exerciseId,
      currentExerciseByTrack: nextByTrack,
    }));
    setActiveTab('praticar');
    void syncTrackPreference({
      activeTrack: targetTrack,
      currentExerciseByTrack: nextByTrack,
    });
  };

  const handleSelectModule = (moduleId: number) => {
    const candidates = getModuleExercisesByDifficulty(allExercises, moduleId, 'Todas');
    if (candidates.length > 0) {
      handleOpenExercise(candidates[0].id);
    }
  };

  const handleSelectDifficultyInWorkspace = (difficulty: Difficulty) => {
    const match = moduleExercises.find((ex) => ex.difficulty === difficulty);
    if (match) {
      handleOpenExercise(match.id);
    } else {
      const anyMatch = trackExercises.find((ex) => ex.difficulty === difficulty);
      if (anyMatch) handleOpenExercise(anyMatch.id);
    }
  };

  const handleCodeChange = (nextCode: string) => {
    setWorkspaceError(null);
    setAiReviewByExercise((prev) => {
      if (!prev[currentExercise.id]) return prev;
      const copy = { ...prev };
      delete copy[currentExercise.id];
      return copy;
    });

    setPersisted((prev) => ({
      ...prev,
      codeByExercise: {
        ...prev.codeByExercise,
        [currentExercise.id]: nextCode,
      },
    }));

    const isCurrentSolved = solvedSet.has(currentExercise.id);
    const currentBest = bestScores[currentExercise.id] ?? staticAnalysis.qualityScore;
    syncActivityDebounced({
      id_atividade: currentExercise.id,
      track: currentExercise.track,
      pontuacao: isCurrentSolved ? currentBest : staticAnalysis.qualityScore,
      resolvido: isCurrentSolved,
      codigo_salvo: nextCode,
    });
  };

  const handleResetCode = () => {
    setWorkspaceError(null);
    setEvaluationByExercise((prev) => {
      const copy = { ...prev };
      delete copy[currentExercise.id];
      return copy;
    });
    setAiReviewByExercise((prev) => {
      const copy = { ...prev };
      delete copy[currentExercise.id];
      return copy;
    });
    setPersisted((prev) => {
      const nextMap = { ...prev.codeByExercise };
      delete nextMap[currentExercise.id];
      return {
        ...prev,
        codeByExercise: nextMap,
      };
    });

    const isCurrentSolved = solvedSet.has(currentExercise.id);
    syncActivityDebounced({
      id_atividade: currentExercise.id,
      track: currentExercise.track,
      pontuacao: isCurrentSolved ? (bestScores[currentExercise.id] ?? 0) : 0,
      resolvido: isCurrentSolved,
      codigo_salvo: currentExercise.starterCode,
    });
  };

  const handleEvaluate = async (mode: 'run' | 'submit') => {
    setIsEvaluating(true);
    setWorkspaceError(null);

    try {
      const res = await fetch('/api/java/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          exercise: currentExercise,
          mode,
        }),
      });

      const evalResult = await parseApiJson<EvaluationResult>(
        res,
        'Falha ao avaliar código.'
      );
      const findings = Array.isArray(evalResult.findings) ? evalResult.findings : [];
      const improvements = Array.isArray(evalResult.improvementsForEnunciado)
        ? evalResult.improvementsForEnunciado
        : [];
      const score =
        typeof evalResult.qualityScore === 'number'
          ? evalResult.qualityScore
          : staticAnalysis.qualityScore;

      setEvaluationByExercise((prev) => ({
        ...prev,
        [currentExercise.id]: evalResult,
      }));
      setAiReviewByExercise((prev) => ({
        ...prev,
        [currentExercise.id]: {
          findings,
          improvements,
          qualityScore: score,
        },
      }));

      const testsTotal = Array.isArray(evalResult.testResults)
        ? evalResult.testResults.length
        : currentExercise.examples.length;
      const testsPassed = Array.isArray(evalResult.testResults)
        ? evalResult.testResults.filter((t) => t.passed).length
        : 0;

      const newSubmission: SubmissionRecord = {
        id: `sub-${Date.now()}`,
        track: currentExercise.track,
        timestamp: new Date().toISOString(),
        moduleId: currentModule.id,
        moduleTitle: currentModule.title,
        exerciseId: currentExercise.id,
        exerciseTitle: currentExercise.title,
        difficulty: currentExercise.difficulty,
        passed: Boolean(evalResult.compiled && evalResult.allPassed),
        testsPassed,
        testsTotal,
        qualityScore: score,
        code: currentCode,
        findings,
        improvementsForEnunciado: improvements,
      };

      const solvedNow = Boolean(
        solvedSet.has(currentExercise.id) ||
          (mode === 'submit' && evalResult.compiled && evalResult.allPassed)
      );

      setPersisted((prev) => {
        const nextSolved = new Set(prev.solvedIds);
        if (mode === 'submit' && evalResult.compiled && evalResult.allPassed) {
          nextSolved.add(currentExercise.id);
        }
        return {
          ...prev,
          solvedIds: Array.from(nextSolved),
          submissions: [newSubmission, ...prev.submissions].slice(0, 50),
        };
      });

      void syncSubmission(newSubmission, {
        id_atividade: currentExercise.id,
        track: currentExercise.track,
        pontuacao: Math.max(bestScores[currentExercise.id] ?? 0, score),
        resolvido: solvedNow,
        codigo_salvo: currentCode,
      });
    } catch (err) {
      setWorkspaceError(
        err instanceof Error ? err.message : 'Erro ao comunicar com o avaliador.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReviewWithCopilot = async () => {
    setIsReviewing(true);
    setWorkspaceError(null);

    try {
      const res = await fetch('/api/copilot/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          exercise: currentExercise,
        }),
      });
      const data = await parseApiJson<{
        findings?: CopilotFinding[];
        improvementsForEnunciado?: ImprovementHint[];
        qualityScore?: number;
      }>(res, 'Falha ao revisar código com Copilot.');

      const nextScore =
        typeof data.qualityScore === 'number'
          ? data.qualityScore
          : staticAnalysis.qualityScore;

      setAiReviewByExercise((prev) => ({
        ...prev,
        [currentExercise.id]: {
          findings: Array.isArray(data.findings) ? data.findings : [],
          improvements: Array.isArray(data.improvementsForEnunciado)
            ? data.improvementsForEnunciado
            : [],
          qualityScore: nextScore,
        },
      }));

      void syncActivityImmediate({
        id_atividade: currentExercise.id,
        track: currentExercise.track,
        pontuacao: Math.max(bestScores[currentExercise.id] ?? 0, nextScore),
        resolvido: solvedSet.has(currentExercise.id),
        codigo_salvo: currentCode,
      });
    } catch (err) {
      setWorkspaceError(
        err instanceof Error ? err.message : 'Erro ao consultar revisão do Copilot.'
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSendChatMessage = async (message: string) => {
    const userMsg: CopilotChatMessage = {
      id: `chat-u-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const existingHistory = chatByExercise[currentExercise.id] ?? [];
    setChatByExercise((prev) => ({
      ...prev,
      [currentExercise.id]: [...existingHistory, userMsg],
    }));
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          code: currentCode,
          exercise: currentExercise,
          history: existingHistory,
          findings: activeFindings,
        }),
      });
      const data = await parseApiJson<{ reply: string }>(
        res,
        'Erro ao enviar pergunta ao Copilot.'
      );

      const assistantMsg: CopilotChatMessage = {
        id: `chat-a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setChatByExercise((prev) => ({
        ...prev,
        [currentExercise.id]: [...(prev[currentExercise.id] ?? []), assistantMsg],
      }));
    } catch (err) {
      const errorMsg: CopilotChatMessage = {
        id: `chat-err-${Date.now()}`,
        role: 'assistant',
        content:
          err instanceof Error
            ? `Não foi possível responder: ${err.message}`
            : 'Erro ao responder.',
        timestamp: new Date().toISOString(),
      };
      setChatByExercise((prev) => ({
        ...prev,
        [currentExercise.id]: [...(prev[currentExercise.id] ?? []), errorMsg],
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateExercise = async (
    moduleId: number,
    difficulty: Difficulty,
    focusWeakPoints = true
  ) => {
    const mod = ALL_MODULES.find((m) => m.id === moduleId) ?? ALL_MODULES[0];
    const meta = TRACK_METADATA[mod.track];
    setIsGeneratingExercise(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/copilot/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: mod,
          difficulty,
          weakPatterns: focusWeakPoints ? trackRecurringPatterns.slice(0, 3) : [],
        }),
      });
      const data = await parseApiJson<{
        title?: string;
        estimatedMinutes?: number;
        prompt: string;
        formula?: string;
        datasetTable?: Exercise['datasetTable'];
        examples?: Exercise['examples'];
        requirements?: string[];
        starterCode?: string;
        preloadedImprovements?: Exercise['preloadedImprovements'];
        focusTags?: Exercise['focusTags'];
      }>(res, 'Falha ao gerar exercício personalizado.');

      const existingCount = allExercises.filter((ex) => ex.moduleId === moduleId).length;
      const newExercise: Exercise = {
        id: `ai-${mod.track}-m${String(moduleId).padStart(2, '0')}-${Date.now()}`,
        track: mod.track,
        moduleId,
        orderInModule: existingCount + 1,
        title: data.title || `Desafio ${difficulty} · ${mod.title}`,
        difficulty,
        estimatedMinutes: typeof data.estimatedMinutes === 'number' ? data.estimatedMinutes : 15,
        prompt: data.prompt,
        formula: data.formula || undefined,
        datasetTable: data.datasetTable?.columns ? data.datasetTable : undefined,
        examples: Array.isArray(data.examples) ? data.examples : [],
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        starterCode:
          data.starterCode ||
          (mod.track === 'python'
            ? 'def resolver() -> None:\n    pass\n'
            : mod.track === 'appscript'
            ? 'function processarPlanilha() {\n  const ss = SpreadsheetApp.getActiveSpreadsheet();\n}\n'
            : mod.track === 'javascript'
            ? 'export function resolver() {\n  // implemente aqui\n}\n'
            : 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}'),
        fileName: meta.defaultFileName,
        runtimeLabel: meta.defaultRuntimeLabel,
        preloadedImprovements: Array.isArray(data.preloadedImprovements)
          ? data.preloadedImprovements
          : [],
        focusTags: Array.isArray(data.focusTags) ? data.focusTags : [mod.title],
        isAiGenerated: true,
      };

      setPersisted((prev) => ({
        ...prev,
        activeTrack: mod.track,
        customExercises: [...prev.customExercises, newExercise],
        currentExerciseId: newExercise.id,
        currentExerciseByTrack: {
          ...prev.currentExerciseByTrack,
          [mod.track]: newExercise.id,
        },
      }));
      setActiveTab('praticar');
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : 'Não foi possível gerar o exercício.'
      );
    } finally {
      setIsGeneratingExercise(false);
    }
  };

  const handleReopenSubmission = (record: SubmissionRecord) => {
    const targetTrack = record.track ?? 'java';
    setPersisted((prev) => ({
      ...prev,
      activeTrack: targetTrack,
      currentExerciseId: record.exerciseId,
      currentExerciseByTrack: {
        ...prev.currentExerciseByTrack,
        [targetTrack]: record.exerciseId,
      },
      codeByExercise: {
        ...prev.codeByExercise,
        [record.exerciseId]: record.code,
      },
    }));
    setAiReviewByExercise((prev) => ({
      ...prev,
      [record.exerciseId]: {
        findings: record.findings,
        improvements: record.improvementsForEnunciado,
        qualityScore: record.qualityScore,
      },
    }));
    setActiveTab('praticar');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F6]">
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        streakDays={7}
        currentModule={currentModule}
        currentExercise={currentExercise}
        exercisePosition={currentExerciseIndex >= 0 ? currentExerciseIndex + 1 : 1}
        totalInModule={moduleExercises.length}
        hasPreviousExercise={hasPreviousExercise}
        onPreviousExercise={() => {
          if (hasPreviousExercise) {
            handleOpenExercise(moduleExercises[currentExerciseIndex - 1].id);
          }
        }}
        onRunTests={() => handleEvaluate('run')}
        onSubmitSolution={() => handleEvaluate('submit')}
        isEvaluating={isEvaluating}
        user={user}
        syncStatus={syncStatus}
        onOpenAuthModal={() => {
          clearAuthError();
          setIsAuthModalOpen(true);
        }}
      />

      {syncError && (
        <div
          role="status"
          className="border-b border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2 text-xs text-[#FCA5A5]"
        >
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
            <span>{syncError}</span>
            <button
              type="button"
              onClick={clearSyncError}
              className="text-[#FCA5A5] hover:text-white underline underline-offset-2 whitespace-nowrap"
            >
              Dispensar
            </button>
          </div>
        </div>
      )}

      {activeTab === 'trilha' && (
        <TrilhaView
          activeTrack={activeTrack}
          onSelectTrack={handleSelectTrack}
          trackMeta={activeTrackMeta}
          allTracks={ALL_TRACKS}
          modules={trackModules}
          exercises={trackExercises}
          solvedIds={solvedSet}
          stats={dashboardStats}
          continueExercise={currentExercise}
          continueModule={currentModule}
          recurringPatterns={trackRecurringPatterns}
          recommendedMaterials={trackRecommendedMaterials}
          difficultyFilter={difficultyFilter}
          onDifficultyFilterChange={setDifficultyFilter}
          onOpenExercise={handleOpenExercise}
          onNavigateCopilot={() => setActiveTab('copilot')}
          onGenerateForModule={(modId, diff) => handleGenerateExercise(modId, diff, true)}
          isGeneratingExercise={isGeneratingExercise}
        />
      )}

      {activeTab === 'praticar' && (
        <PraticarView
          activeTrack={activeTrack}
          allTracks={ALL_TRACKS}
          onSelectTrack={handleSelectTrack}
          modules={trackModules}
          moduleExercises={moduleExercises}
          currentModule={currentModule}
          currentExercise={currentExercise}
          code={currentCode}
          onCodeChange={handleCodeChange}
          onResetCode={handleResetCode}
          onSelectModule={handleSelectModule}
          onSelectExercise={handleOpenExercise}
          onSelectDifficulty={handleSelectDifficultyInWorkspace}
          onReviewWithCopilot={handleReviewWithCopilot}
          hasNextExercise={hasNextExercise}
          onNextExercise={() => {
            if (hasNextExercise) {
              handleOpenExercise(moduleExercises[currentExerciseIndex + 1].id);
            }
          }}
          evaluation={evaluationByExercise[currentExercise.id] ?? null}
          findings={activeFindings}
          enunciadoImprovements={activeEnunciadoImprovements}
          qualityScore={activeQualityScore}
          hasAttemptedCurrent={hasAttemptedCurrent}
          isEvaluating={isEvaluating}
          isReviewing={isReviewing}
          errorMessage={workspaceError}
          chatMessages={chatByExercise[currentExercise.id] ?? []}
          onSendChatMessage={handleSendChatMessage}
          isChatLoading={isChatLoading}
          isSolved={solvedSet.has(currentExercise.id)}
        />
      )}

      {activeTab === 'copilot' && (
        <CopilotView
          activeTrack={activeTrack}
          allTracks={ALL_TRACKS}
          onSelectTrack={handleSelectTrack}
          modules={trackModules}
          recurringPatterns={trackRecurringPatterns}
          submissions={trackSubmissions}
          onOpenExercise={handleOpenExercise}
          onGenerateExercise={handleGenerateExercise}
          isGenerating={isGeneratingExercise}
          generateError={generateError}
        />
      )}

      {activeTab === 'historico' && (
        <HistoricoView
          submissions={persisted.submissions}
          onReopenSubmission={handleReopenSubmission}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        isAuthenticating={isAuthenticating}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        solvedCount={persisted.solvedIds.length}
        cloudActivityCount={cloudActivityCount}
        authError={authError}
        syncError={syncError}
        onLoginGoogle={loginWithGoogle}
        onLogout={logout}
        onResync={resyncNow}
        onClearError={() => {
          clearAuthError();
          clearSyncError();
        }}
      />
    </div>
  );
}

