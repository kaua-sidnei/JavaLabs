import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateRecurringPatterns,
  analyzeCodeStatic,
  analyzeJavaCodeStatic,
  computeDashboardStats,
  computeModuleProgress,
  filterByTrack,
  filterModules,
  getModuleExercisesByDifficulty,
  migratePersistedState,
} from './labLogic';
import type { Exercise, JavaModule, SubmissionRecord } from '../types/javalab';

const sampleExercise: Exercise = {
  id: 'm03-ex07',
  track: 'java',
  moduleId: 3,
  orderInModule: 7,
  title: 'Área do círculo',
  difficulty: 'Fácil',
  estimatedMinutes: 10,
  prompt:
    'Faça um programa para ler o valor do raio de um círculo e depois mostrar o valor da área deste círculo com quatro casas decimais.',
  formula: 'área = π · raio². Considere π = 3.14159.',
  examples: [{ input: '2.00', expectedOutput: 'A=12.5664' }],
  requirements: [
    'Ler a entrada com Scanner',
    'Aceitar ponto como separador decimal',
    'Saída exatamente no formato A=0.0000',
  ],
  starterCode: '',
  preloadedImprovements: [],
  focusTags: ['Scanner', 'printf', 'Locale.US'],
};

test('analyzeJavaCodeStatic flags missing Locale.US, unformatted println, unclosed Scanner, and magic PI', () => {
  const buggyCode = [
    'import java.util.Scanner;',
    '',
    'public class Main {',
    '    public static void main(String[] args) {',
    '        Scanner sc = new Scanner(System.in);',
    '',
    '        double r = sc.nextDouble();',
    '        double a = 3.14159 * Math.pow(r, 2);',
    '',
    '        System.out.println("A=" + a);',
    '    }',
    '}',
  ].join('\n');

  const result = analyzeJavaCodeStatic(buggyCode, sampleExercise);

  assert.equal(result.findings.some((f) => f.id === 'static-locale-us' && f.line === 5), true);
  assert.equal(result.findings.some((f) => f.id === 'static-decimal-format' && f.line === 10), true);
  assert.equal(result.findings.some((f) => f.id === 'static-scanner-close' && f.line === 5), true);
  assert.equal(result.findings.some((f) => f.id === 'static-single-letter-vars' && f.line === 7), true);
  assert.equal(result.findings.some((f) => f.id === 'static-magic-pi' && f.line === 8), true);
  assert.equal(result.findings.some((f) => f.id === 'static-math-pow' && f.line === 8), true);
  assert.ok(result.qualityScore < 50, `Expected low quality score, got ${result.qualityScore}`);
  assert.equal(result.improvementsForEnunciado.length, 4);
});

test('analyzeJavaCodeStatic gives 100 quality score on clean idiomatic Java solution', () => {
  const cleanCode = [
    'import java.util.Locale;',
    'import java.util.Scanner;',
    '',
    'public class Main {',
    '    public static void main(String[] args) {',
    '        Locale.setDefault(Locale.US);',
    '        try (Scanner sc = new Scanner(System.in)) {',
    '            final double PI = 3.14159;',
    '            double raio = sc.nextDouble();',
    '            double area = PI * raio * raio;',
    '            System.out.printf("A=%.4f%n", area);',
    '        }',
    '    }',
    '}',
  ].join('\n');

  const result = analyzeJavaCodeStatic(cleanCode, sampleExercise);
  assert.equal(result.findings.length, 0);
  assert.equal(result.qualityScore, 100);
});

test('analyzeCodeStatic detects Apps Script, JS/TS, and Python scraping/API pitfalls', () => {
  const gasEx: Exercise = {
    ...sampleExercise,
    id: 'gas-m1-ex05',
    track: 'appscript',
    fileName: 'Code.gs',
  };
  const gasBuggy = [
    'function atualizar() {',
    '  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Monitoramento");',
    '  const dados = aba.getDataRange().getValues();',
    '  for (let i = 1; i < dados.length; i++) {',
    '    aba.getRange(i + 1, 4).setValue("OK");',
    '  }',
    '  UrlFetchApp.fetch("https://api.exemplo/1");',
    '  ScriptApp.newTrigger("atualizar").timeBased().everyHours(1).create();',
    '}',
  ].join('\n');
  const gasRes = analyzeCodeStatic(gasBuggy, gasEx);
  assert.equal(gasRes.findings.some((f) => f.id === 'static-gas-loop-io' && f.line === 5), true);
  assert.equal(gasRes.findings.some((f) => f.id === 'static-gas-mute-http'), true);
  assert.equal(gasRes.findings.some((f) => f.id === 'static-gas-duplicate-trigger'), true);

  const jsEx: Exercise = { ...sampleExercise, id: 'js-m3-ex03', track: 'javascript', fileName: 'index.js' };
  const jsRes = analyzeCodeStatic(
    'var x = JSON.parse(raw); if (x == 1 || x === NaN) { fetch("/api"); }',
    jsEx
  );
  assert.equal(jsRes.findings.some((f) => f.id === 'static-js-var'), true);
  assert.equal(jsRes.findings.some((f) => f.id === 'static-js-eqeq'), true);
  assert.equal(jsRes.findings.some((f) => f.id === 'static-js-nan'), true);
  assert.equal(jsRes.findings.some((f) => f.id === 'static-js-json-try'), true);
  assert.equal(jsRes.findings.some((f) => f.id === 'static-js-fetch-ok'), true);

  const pyEx: Exercise = { ...sampleExercise, id: 'py-m4-ex02', track: 'python', fileName: 'main.py' };
  const pyRes = analyzeCodeStatic(
    'def f(lista=[]):\n    resp = requests.get("https://x.com")\n    preco = soup.select_one(".p").text\n    try:\n        open("a.txt")\n    except:\n        pass',
    pyEx
  );
  assert.equal(pyRes.findings.some((f) => f.id === 'static-py-mutable-default'), true);
  assert.equal(pyRes.findings.some((f) => f.id === 'static-py-requests-timeout'), true);
  assert.equal(pyRes.findings.some((f) => f.id === 'static-py-bs4-none'), true);
  assert.equal(pyRes.findings.some((f) => f.id === 'static-py-bare-except'), true);
  assert.equal(pyRes.findings.some((f) => f.id === 'static-py-open-without-with'), true);
});

test('migratePersistedState preserves Java 21 progress and resets old JS/GAS/Python tracks', () => {
  const legacyRaw = JSON.stringify({
    activeTrack: 'python',
    solvedIds: ['m01-ex01', 'm03-ex07', 'js-m101-ex01', 'gas-m204-ex01', 'py-m301-ex01'],
    submissions: [
      { id: 's-java', track: 'java', exerciseId: 'm03-ex07' },
      { id: 's-py', track: 'python', exerciseId: 'py-m301-ex01' },
    ],
    codeByExercise: {
      'm03-ex07': '// java custom code',
      'js-m101-ex01': '// old js code',
    },
    customExercises: [
      { id: 'ai-java-03-1', track: 'java' },
      { id: 'ai-python-301-1', track: 'python' },
    ],
    currentExerciseId: 'py-m301-ex01',
    currentExerciseByTrack: {
      java: 'm05-ex01',
      javascript: 'js-m101-ex01',
      appscript: 'gas-m204-ex01',
      python: 'py-m301-ex01',
    },
  });

  const migrated = migratePersistedState(legacyRaw, {
    isLegacyVersion: true,
    validExerciseIds: new Set(['m01-ex01', 'm03-ex07', 'm05-ex01', 'js-m1-ex01', 'gas-m1-ex01', 'py-m1-ex01']),
    defaultByTrack: {
      java: 'm03-ex07',
      javascript: 'js-m1-ex01',
      appscript: 'gas-m1-ex01',
      python: 'py-m1-ex01',
    },
    initialSolvedJavaIds: ['m01-ex01'],
    initialJavaSubmissions: [],
  });

  assert.deepEqual(migrated.solvedIds, ['m01-ex01', 'm03-ex07']);
  assert.equal(migrated.submissions.length, 1);
  assert.equal(migrated.submissions[0].id, 's-java');
  assert.equal(migrated.codeByExercise['m03-ex07'], '// java custom code');
  assert.equal(migrated.codeByExercise['js-m101-ex01'], undefined);
  assert.equal(migrated.customExercises.length, 1);
  assert.equal(migrated.currentExerciseByTrack.java, 'm05-ex01');
  assert.equal(migrated.currentExerciseByTrack.javascript, 'js-m1-ex01');
  assert.equal(migrated.currentExerciseByTrack.appscript, 'gas-m1-ex01');
  assert.equal(migrated.currentExerciseByTrack.python, 'py-m1-ex01');
  assert.equal(migrated.currentExerciseId, 'py-m1-ex01');
});

test('computeModuleProgress, computeDashboardStats, and filterByTrack compute accurate totals', () => {
  const modules: JavaModule[] = [
    {
      id: 1,
      track: 'java',
      code: '01',
      title: 'Conceitos de programação',
      subtitle: 'Algoritmos',
      lessonsCount: 7,
      durationLabel: '24 min',
      category: 'Fundamentos',
      categoryLabel: 'Fundamentos',
    },
    {
      id: 2,
      track: 'java',
      code: '02',
      title: 'Introdução à linguagem Java',
      subtitle: 'JDK',
      lessonsCount: 13,
      durationLabel: '40 min',
      category: 'Fundamentos',
      categoryLabel: 'Fundamentos',
    },
    {
      id: 204,
      track: 'appscript',
      code: 'GS-04',
      title: 'Monitoramento de Frota',
      subtitle: 'Apps Script',
      lessonsCount: 12,
      durationLabel: '1h 30min',
      category: 'Planilhas & GAS',
      categoryLabel: 'Projeto Logística',
    },
  ];

  assert.equal(filterByTrack(modules, 'appscript').length, 1);
  assert.equal(filterByTrack(modules, 'java').length, 2);

  const exercises: Exercise[] = [
    { ...sampleExercise, id: 'm01-1', moduleId: 1, difficulty: 'Fácil', orderInModule: 1 },
    { ...sampleExercise, id: 'm01-2', moduleId: 1, difficulty: 'Médio', orderInModule: 2 },
    { ...sampleExercise, id: 'm02-1', moduleId: 2, difficulty: 'Difícil', orderInModule: 1 },
  ];

  const solvedIds = new Set(['m01-1', 'm01-2']);

  const m1 = computeModuleProgress(1, exercises, solvedIds);
  assert.equal(m1.status, 'Concluído');
  assert.equal(m1.percent, 100);

  const m2 = computeModuleProgress(2, exercises, solvedIds);
  assert.equal(m2.status, 'Não iniciado');
  assert.equal(m2.percent, 0);

  const submissions: SubmissionRecord[] = [
    {
      id: 'sub-1',
      track: 'java',
      timestamp: '2026-11-17T10:00:00Z',
      moduleId: 1,
      moduleTitle: 'Conceitos',
      exerciseId: 'm01-1',
      exerciseTitle: 'Teste',
      difficulty: 'Fácil',
      passed: true,
      testsPassed: 2,
      testsTotal: 2,
      qualityScore: 80,
      code: '',
      findings: [],
      improvementsForEnunciado: [],
    },
    {
      id: 'sub-2',
      track: 'java',
      timestamp: '2026-11-17T10:05:00Z',
      moduleId: 1,
      moduleTitle: 'Conceitos',
      exerciseId: 'm01-2',
      exerciseTitle: 'Teste 2',
      difficulty: 'Médio',
      passed: true,
      testsPassed: 2,
      testsTotal: 2,
      qualityScore: 90,
      code: '',
      findings: [],
      improvementsForEnunciado: [],
    },
  ];

  const stats = computeDashboardStats(filterByTrack(modules, 'java'), exercises, solvedIds, submissions);
  assert.equal(stats.solvedCount, 2);
  assert.equal(stats.totalExercises, 3);
  assert.equal(stats.completedModules, 1);
  assert.equal(stats.averageCopilotScore, 85);
  assert.equal(stats.overallProgressPercent, 67);
});

test('filterModules and getModuleExercisesByDifficulty filter cleanly', () => {
  const modules: JavaModule[] = [
    {
      id: 1,
      track: 'java',
      code: '01',
      title: 'Conceitos de programação',
      subtitle: 'Algoritmos',
      lessonsCount: 7,
      durationLabel: '24 min',
      category: 'Fundamentos',
      categoryLabel: 'Fundamentos',
    },
    {
      id: 7,
      track: 'java',
      code: '07',
      title: 'Introdução à POO',
      subtitle: 'Classes e objetos',
      lessonsCount: 12,
      durationLabel: '1h 29min',
      category: 'POO',
      categoryLabel: 'Orientação a objetos',
    },
  ];

  assert.equal(filterModules(modules, 'POO', '').length, 1);
  assert.equal(filterModules(modules, 'Todos', 'algoritmos').length, 1);

  const exercises: Exercise[] = [
    { ...sampleExercise, id: 'a', moduleId: 7, difficulty: 'Fácil', orderInModule: 1 },
    { ...sampleExercise, id: 'b', moduleId: 7, difficulty: 'Médio', orderInModule: 2 },
    { ...sampleExercise, id: 'c', moduleId: 7, difficulty: 'Difícil', orderInModule: 3 },
  ];

  assert.equal(getModuleExercisesByDifficulty(exercises, 7, 'Difícil').length, 1);
  assert.equal(getModuleExercisesByDifficulty(exercises, 7, 'Difícil')[0].id, 'c');
});

test('aggregateRecurringPatterns ranks most frequent high-severity patterns first', () => {
  const submissions: SubmissionRecord[] = [
    {
      id: 's1',
      track: 'java',
      timestamp: '2026-11-17T09:00:00Z',
      moduleId: 3,
      moduleTitle: 'Estrutura sequencial',
      exerciseId: 'm03-ex07',
      exerciseTitle: 'Área do círculo',
      difficulty: 'Fácil',
      passed: false,
      testsPassed: 0,
      testsTotal: 3,
      qualityScore: 35,
      code: '',
      findings: [
        {
          id: 'f1',
          severity: 'ERRO',
          title: 'Saída sem 4 casas',
          line: 10,
          explanation: 'Use printf',
          category: 'Formatação de saída',
        },
        {
          id: 'f2',
          severity: 'DICA',
          title: 'Nomes curtos',
          line: 7,
          explanation: 'Use nomes claros',
          category: 'Nomes de variáveis',
        },
      ],
      improvementsForEnunciado: [],
    },
    {
      id: 's2',
      track: 'java',
      timestamp: '2026-11-17T09:10:00Z',
      moduleId: 3,
      moduleTitle: 'Estrutura sequencial',
      exerciseId: 'm03-ex07',
      exerciseTitle: 'Área do círculo',
      difficulty: 'Fácil',
      passed: false,
      testsPassed: 0,
      testsTotal: 3,
      qualityScore: 40,
      code: '',
      findings: [
        {
          id: 'f3',
          severity: 'ERRO',
          title: 'Saída sem 4 casas',
          line: 10,
          explanation: 'Use printf',
          category: 'Formatação de saída',
        },
      ],
      improvementsForEnunciado: [],
    },
  ];

  const patterns = aggregateRecurringPatterns(submissions);
  assert.equal(patterns[0].category, 'Formatação de saída');
  assert.equal(patterns[0].occurrences, 2);
});

