import type {
  JavaModule,
  LanguageTrack,
  RecommendedMaterial,
} from '../types/javalab';
import { GAS_TRACK_EXERCISES } from './gasTrackExercises';
import { JS_TRACK_EXERCISES } from './jsTrackExercises';
import { PYTHON_TRACK_EXERCISES } from './pythonTrackExercises';

export interface TrackMetadata {
  id: LanguageTrack;
  label: string;
  shortLabel: string;
  eyebrow: string;
  heroTitleStart: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  defaultFileName: string;
  defaultRuntimeLabel: string;
  defaultExerciseId: string;
  snippetPreview: string;
}

export const TRACK_METADATA: Record<LanguageTrack, TrackMetadata> = {
  java: {
    id: 'java',
    label: 'Java 21',
    shortLabel: 'Java',
    eyebrow: 'Trilha Java · Do zero ao Spring Boot',
    heroTitleStart: 'Aprenda Java codando.',
    heroTitleAccent: 'O Copilot revisa cada linha.',
    heroSubtitle:
      'Exercícios por módulo nos níveis Fácil, Médio e Difícil, editor no navegador e feedback do que melhorar logo no enunciado de cada desafio.',
    defaultFileName: 'Main.java',
    defaultRuntimeLabel: 'Java 21',
    defaultExerciseId: 'm03-ex07',
    snippetPreview: `Locale.setDefault(Locale.US);\nfinal double PI = 3.14159;\ndouble area = PI * raio * raio;\nSystem.out.printf("A=%.4f%n", area);`,
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript & TS',
    shortLabel: 'JavaScript',
    eyebrow: 'Trilha JavaScript & TypeScript · Web, Assincronicidade e Tipagem Forte',
    heroTitleStart: 'Domine JavaScript e TypeScript.',
    heroTitleAccent: 'Da lógica ao TypeScript avançado.',
    heroSubtitle:
      '5 módulos progressivos (Fácil, Médio e Difícil) cobrindo escopo e funções, arrays ES6+, Promises/Fetch API, Interfaces/Types e Generics com Utility Types.',
    defaultFileName: 'index.js',
    defaultRuntimeLabel: 'Node 22 / TS 5',
    defaultExerciseId: 'js-m1-ex01',
    snippetPreview: `const entregues = pedidos\n  .filter(({ status }) => status === 'ENTREGUE')\n  .reduce((acc, { valor }) => acc + valor, 0);`,
  },
  appscript: {
    id: 'appscript',
    label: 'JS Dados & Logística',
    shortLabel: 'Apps Script',
    eyebrow: 'Automação e Logística · Google Apps Script com Dados Reais',
    heroTitleStart: 'Automatize planilhas e frotas.',
    heroTitleAccent: 'Apps Script com dados do site.',
    heroSubtitle:
      '5 módulos (30 exercícios) com planilhas e payloads simulados pelo site para treinar getValues/setValues em lote, filtros logísticos, UrlFetchApp, triggers e regras de negócio.',
    defaultFileName: 'Code.gs',
    defaultRuntimeLabel: 'Apps Script V8',
    defaultExerciseId: 'gas-m1-ex01',
    snippetPreview: `const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Monitoramento");\nconst dados = aba.getDataRange().getValues();\n// Processe em memória e grave em lote com setValues()`,
  },
  python: {
    id: 'python',
    label: 'Python',
    shortLabel: 'Python',
    eyebrow: 'Trilha Python · Core, POO, Scraping, Pandas e FastAPI',
    heroTitleStart: 'Escreva Python idiomático.',
    heroTitleAccent: 'De estruturas nativas a Pandas e FastAPI.',
    heroSubtitle:
      '5 módulos progressivos com dados simulados para Scraping (requests + BeautifulSoup), manipulação tabular com Pandas e validação de endpoints com FastAPI e Pydantic.',
    defaultFileName: 'main.py',
    defaultRuntimeLabel: 'Python 3.12',
    defaultExerciseId: 'py-m1-ex01',
    snippetPreview: `class PedidoEntrega(BaseModel):\n    codigo: str\n    peso_kg: float = Field(gt=0)\n    prioridade: Literal["NORMAL", "EXPRESSA"]`,
  },
};

export const EXTRA_MODULES: JavaModule[] = [
  // =========================================================================
  // TRACK: JAVASCRIPT & TYPESCRIPT (101 - 105)
  // =========================================================================
  {
    id: 101,
    track: 'javascript',
    code: 'JS-01',
    title: 'Lógica e Fundamentos (JS)',
    subtitle: 'Variáveis/escopo (let/const/var), primitivos, condicionais, laços e funções',
    lessonsCount: 12,
    durationLabel: '1h 30min',
    category: 'Fundamentos',
    categoryLabel: 'Lógica e Fundamentos',
  },
  {
    id: 102,
    track: 'javascript',
    code: 'JS-02',
    title: 'Estruturas de Dados e ES6+ (JS)',
    subtitle: 'push/pop/splice/slice, map/filter/reduce/find, JSON e Spread/Rest',
    lessonsCount: 14,
    durationLabel: '1h 45min',
    category: 'Moderno & TS',
    categoryLabel: 'Estruturas & ES6+',
  },
  {
    id: 103,
    track: 'javascript',
    code: 'JS-03',
    title: 'Assincronicidade e APIs (JS)',
    subtitle: 'Promises (.then/.catch/.finally), async/await, try/catch e Fetch API',
    lessonsCount: 12,
    durationLabel: '1h 40min',
    category: 'Async & APIs',
    categoryLabel: 'Assincronicidade & APIs',
  },
  {
    id: 104,
    track: 'javascript',
    code: 'JS-04',
    title: 'Fundamentos de TypeScript (TS)',
    subtitle: 'Tipagem básica, any vs unknown, Interfaces vs Type Aliases e funções tipadas',
    lessonsCount: 14,
    durationLabel: '1h 50min',
    category: 'TypeScript',
    categoryLabel: 'TypeScript Básico',
  },
  {
    id: 105,
    track: 'javascript',
    code: 'JS-05',
    title: 'TypeScript Avançado (TS)',
    subtitle: 'Generics (<T>), Utility Types (Partial/Omit/Pick/Record), Unions e Type Guards',
    lessonsCount: 15,
    durationLabel: '2h 05min',
    category: 'TypeScript',
    categoryLabel: 'TypeScript Avançado',
    isProject: true,
  },

  // =========================================================================
  // TRACK: JS DADOS & LOGÍSTICA · GOOGLE APPS SCRIPT (201 - 205)
  // =========================================================================
  {
    id: 201,
    track: 'appscript',
    code: 'GS-01',
    title: 'Fundamentos do Apps Script (GAS)',
    subtitle: 'SpreadsheetApp, Range getValues()/setValues() em lote e limpeza de abas',
    lessonsCount: 10,
    durationLabel: '1h 15min',
    category: 'Planilhas & GAS',
    categoryLabel: 'Fundamentos GAS',
  },
  {
    id: 202,
    track: 'appscript',
    code: 'GS-02',
    title: 'Processamento de Dados Logísticos (Otimização)',
    subtitle: 'Filtros e reduções em matrizes 2D, índices com Map e cálculo de SLA/datas',
    lessonsCount: 12,
    durationLabel: '1h 30min',
    category: 'Dados & Logística',
    categoryLabel: 'Dados & Otimização',
  },
  {
    id: 203,
    track: 'appscript',
    code: 'GS-03',
    title: 'Integração de Sistemas (APIs Externas)',
    subtitle: 'UrlFetchApp.fetch, JSON.parse, webhooks POST e atualizarStatusRastreio()',
    lessonsCount: 12,
    durationLabel: '1h 35min',
    category: 'APIs & Webhooks',
    categoryLabel: 'Integração REST',
    isProject: true,
  },
  {
    id: 204,
    track: 'appscript',
    code: 'GS-04',
    title: 'Automação Contínua e Triggers',
    subtitle: 'onEdit(e), onOpen(), triggers por tempo (ScriptApp) e alertas GmailApp/MailApp',
    lessonsCount: 10,
    durationLabel: '1h 20min',
    category: 'Triggers & Regras',
    categoryLabel: 'Triggers & Alertas',
  },
  {
    id: 205,
    track: 'appscript',
    code: 'GS-05',
    title: 'Lógica de Regras de Negócio',
    subtitle: 'Roteirização por capacidade, divergências de faturas e validação CNPJ/CEP',
    lessonsCount: 12,
    durationLabel: '1h 40min',
    category: 'Triggers & Regras',
    categoryLabel: 'Regras Logísticas',
    isProject: true,
  },

  // =========================================================================
  // TRACK: PYTHON (301 - 305)
  // =========================================================================
  {
    id: 301,
    track: 'python',
    code: 'PY-01',
    title: 'Sintaxe e Estruturas Nativas',
    subtitle: 'Casting, slicing, list/dict/tuple/set, compreensões e try/except/finally',
    lessonsCount: 12,
    durationLabel: '1h 25min',
    category: 'Fundamentos',
    categoryLabel: 'Sintaxe Nativa',
  },
  {
    id: 302,
    track: 'python',
    code: 'PY-02',
    title: 'Funções e Modularização',
    subtitle: '*args/**kwargs, lambda/map/filter, escopo, módulos e with open (TXT/CSV/JSON)',
    lessonsCount: 12,
    durationLabel: '1h 30min',
    category: 'Avançado',
    categoryLabel: 'Funções & Arquivos',
  },
  {
    id: 303,
    track: 'python',
    code: 'PY-03',
    title: 'Orientação a Objetos (POO)',
    subtitle: 'Classes/objetos, herança/polimorfismo, encapsulamento e dunder methods',
    lessonsCount: 14,
    durationLabel: '1h 45min',
    category: 'POO',
    categoryLabel: 'POO em Python',
  },
  {
    id: 304,
    track: 'python',
    code: 'PY-04',
    title: 'Consumo de APIs e Web Scraping',
    subtitle: 'requests (GET/POST), query params/headers e BeautifulSoup em tabelas HTML',
    lessonsCount: 14,
    durationLabel: '1h 50min',
    category: 'APIs & Scraping',
    categoryLabel: 'APIs & Scraping',
  },
  {
    id: 305,
    track: 'python',
    code: 'PY-05',
    title: 'Bibliotecas de Dados e APIs Web',
    subtitle: 'Pandas (DataFrames, groupby, to_datetime) e FastAPI + Pydantic BaseModel',
    lessonsCount: 16,
    durationLabel: '2h 10min',
    category: 'Pandas & FastAPI',
    categoryLabel: 'Dados & FastAPI',
    isProject: true,
  },
];

export const EXTRA_EXERCISES = [
  ...JS_TRACK_EXERCISES,
  ...GAS_TRACK_EXERCISES,
  ...PYTHON_TRACK_EXERCISES,
];

export const RECOMMENDED_MATERIALS: RecommendedMaterial[] = [
  // JavaScript & TS
  {
    id: 'mat-js-1',
    track: 'javascript',
    title: 'JavaScript.info',
    authorOrSource: 'The Modern JavaScript Tutorial',
    description:
      'Guia completo sobre escopo léxico, coerção de tipos, arrays, Promises, async/await e Fetch API.',
  },
  {
    id: 'mat-js-2',
    track: 'javascript',
    title: 'MDN Web Docs (Mozilla)',
    authorOrSource: 'Mozilla Developer Network',
    description:
      'Referência oficial de Array.prototype (map, filter, reduce, splice), JSON e AbortController/Fetch.',
  },
  {
    id: 'mat-js-3',
    track: 'javascript',
    title: 'TypeScript Handbook & Total TypeScript',
    authorOrSource: 'Microsoft & Matt Pocock',
    description:
      'Documentação prática para dominar unknown, Interfaces vs Types, Generics (<T>), Utility Types e Type Guards.',
  },
  {
    id: 'mat-js-4',
    track: 'javascript',
    title: "You Don't Know JS Yet",
    authorOrSource: 'Kyle Simpson (GitHub)',
    description:
      'Aprofundamento gratuito nos mecanismos internos do JavaScript: hoisting, closures e coerção.',
  },

  // Apps Script (Dados & Logística)
  {
    id: 'mat-gas-1',
    track: 'appscript',
    title: 'Google Apps Script · Best Practices',
    authorOrSource: 'Google Developers',
    description:
      'Guia oficial de performance em planilhas: leitura/escrita em lote com getValues()/setValues() e CacheService.',
  },
  {
    id: 'mat-gas-2',
    track: 'appscript',
    title: 'SpreadsheetApp & UrlFetchApp',
    authorOrSource: 'Google Workspace Docs',
    description:
      'Referência completa de matrizes 2D, muteHttpExceptions, webhooks JSON e batch com UrlFetchApp.fetchAll.',
  },
  {
    id: 'mat-gas-3',
    track: 'appscript',
    title: 'Triggers, ScriptApp & LockService',
    authorOrSource: 'Google Apps Script Reference',
    description:
      'Padrões de automação contínua com onEdit(e), onOpen(), triggers por tempo sem duplicidade e prevenção de race condition.',
  },

  // Python
  {
    id: 'mat-py-1',
    track: 'python',
    title: 'Real Python & Documentação Python 3.12',
    authorOrSource: 'Python Software Foundation / Real Python',
    description:
      'Guias sobre compreensões, *args/**kwargs, with open (CSV/JSON), dataclasses, POO e tratamento explícito de exceções.',
  },
  {
    id: 'mat-py-2',
    track: 'python',
    title: 'Requests & BeautifulSoup4',
    authorOrSource: 'Documentação Oficial',
    description:
      'Consumo seguro de APIs REST com timeout/Session e extração estruturada de tabelas HTML com seletores CSS.',
  },
  {
    id: 'mat-py-3',
    track: 'python',
    title: 'Pandas & Documentação Oficial do FastAPI',
    authorOrSource: 'PyData & Sebastián Ramírez',
    description:
      'Manipulação vetorizada de DataFrames, séries temporais (to_datetime) e construção de APIs validadas com Pydantic BaseModel.',
  },
  {
    id: 'mat-py-4',
    track: 'python',
    title: 'Python Fluente (Fluent Python)',
    authorOrSource: 'Luciano Ramalho',
    description:
      'Referência essencial para dominar o modelo de dados do Python, dunder methods (__str__, __repr__, __eq__) e pythonic idioms.',
  },
];
