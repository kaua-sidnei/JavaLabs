export type LanguageTrack = 'java' | 'javascript' | 'appscript' | 'python';

export type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

export type ModuleCategory =
  | 'Fundamentos'
  | 'POO'
  | 'Avançado'
  | 'Bônus'
  | 'Moderno & TS'
  | 'Async & APIs'
  | 'TypeScript'
  | 'Planilhas & GAS'
  | 'Dados & Logística'
  | 'APIs & Webhooks'
  | 'Triggers & Regras'
  | 'APIs & Scraping'
  | 'Pandas & FastAPI';

export type FindingSeverity = 'ERRO' | 'AVISO' | 'DICA';

export type ActiveTab = 'trilha' | 'praticar' | 'copilot' | 'historico';

export interface ExerciseExample {
  input: string;
  expectedOutput: string;
}

export interface DatasetTable {
  sheetName: string;
  description?: string;
  columns: string[];
  rows: string[][];
}

export interface CopilotFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  line: number;
  explanation: string;
  suggestionCode?: string;
  category: string;
}

export interface ImprovementHint {
  title: string;
  detail: string;
  line?: number;
  severity: FindingSeverity;
}

export interface Exercise {
  id: string;
  track: LanguageTrack;
  moduleId: number;
  orderInModule: number;
  title: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prompt: string;
  formula?: string;
  datasetTable?: DatasetTable;
  examples: ExerciseExample[];
  requirements: string[];
  starterCode: string;
  fileName?: string;
  runtimeLabel?: string;
  /**
   * Pontos de atenção / melhorias exibidos logo no enunciado antes mesmo do envio,
   * combinando armadilhas clássicas do tópico com padrões detectados nas tentativas.
   */
  preloadedImprovements: ImprovementHint[];
  focusTags: string[];
  isAiGenerated?: boolean;
}

export interface JavaModule {
  id: number;
  track: LanguageTrack;
  code: string;
  title: string;
  subtitle: string;
  lessonsCount: number;
  durationLabel: string;
  category: ModuleCategory;
  categoryLabel: string;
  isProject?: boolean;
}

export interface RecommendedMaterial {
  id: string;
  track: LanguageTrack;
  title: string;
  authorOrSource: string;
  description: string;
}

export interface TestCaseResult {
  index: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface EvaluationResult {
  compiled: boolean;
  compileError?: string;
  allPassed: boolean;
  testResults: TestCaseResult[];
  stdout: string;
  qualityScore: number;
  findings: CopilotFinding[];
  improvementsForEnunciado: ImprovementHint[];
  summary: string;
}

export interface SubmissionRecord {
  id: string;
  track: LanguageTrack;
  timestamp: string;
  moduleId: number;
  moduleTitle: string;
  exerciseId: string;
  exerciseTitle: string;
  difficulty: Difficulty;
  passed: boolean;
  testsPassed: number;
  testsTotal: number;
  qualityScore: number;
  code: string;
  findings: CopilotFinding[];
  improvementsForEnunciado: ImprovementHint[];
}

export interface CopilotChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RecurringPattern {
  id: string;
  track?: LanguageTrack;
  severity: FindingSeverity;
  title: string;
  description: string;
  occurrences: number;
  category: string;
  targetExerciseId?: string;
}

export interface DashboardStats {
  solvedCount: number;
  totalExercises: number;
  completedModules: number;
  totalModules: number;
  averageCopilotScore: number;
  overallProgressPercent: number;
}
