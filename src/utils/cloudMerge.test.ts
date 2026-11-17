import assert from 'node:assert/strict';
import test from 'node:test';
import { EXERCISES, TRACK_METADATA } from '../data/curriculum.ts';
import type { LanguageTrack, SubmissionRecord } from '../types/javalab.ts';
import {
  clampScore,
  FIREBASE_CONSTRAINTS,
  isValidFirebaseId,
  mergeLocalAndCloudState,
  sanitizeFirebaseId,
  truncateCode,
  type CloudActivityRecord,
} from './cloudMerge.ts';
import type { PersistedLabState } from './labLogic.ts';

const DEFAULTS_BY_TRACK: Record<LanguageTrack, string> = {
  java: TRACK_METADATA.java.defaultExerciseId,
  javascript: TRACK_METADATA.javascript.defaultExerciseId,
  appscript: TRACK_METADATA.appscript.defaultExerciseId,
  python: TRACK_METADATA.python.defaultExerciseId,
};

test('clampScore e truncateCode respeitam os limites do blueprint', () => {
  assert.equal(clampScore(-15), 0);
  assert.equal(clampScore(140), 100);
  assert.equal(clampScore(87.6), 88);
  assert.equal(clampScore(Number.NaN), 0);

  const oversized = 'a'.repeat(FIREBASE_CONSTRAINTS.MAX_CODE_LEN + 500);
  assert.equal(truncateCode(oversized).length, FIREBASE_CONSTRAINTS.MAX_CODE_LEN);

  assert.equal(isValidFirebaseId('m03-ex07'), true);
  assert.equal(isValidFirebaseId('js-m1-ex01'), true);
  assert.equal(isValidFirebaseId('bad/id$1'), false);
  assert.equal(sanitizeFirebaseId('bad/id', 'fallback-id'), 'bad-id');
});

test('mergeLocalAndCloudState une progresso local e remoto mantendo maior pontuacao e Java 21', () => {
  const localSubmission: SubmissionRecord = {
    id: 'sub-local-1',
    track: 'java',
    timestamp: '2026-11-17T10:00:00.000Z',
    moduleId: 1,
    moduleTitle: 'Conceitos',
    exerciseId: 'm01-ex01',
    exerciseTitle: 'Intro',
    difficulty: 'Fácil',
    passed: true,
    testsPassed: 2,
    testsTotal: 2,
    qualityScore: 92,
    code: 'System.out.println("ok");',
    findings: [],
    improvementsForEnunciado: [],
  };

  const localState: PersistedLabState = {
    activeTrack: 'java',
    solvedIds: ['m01-ex01'],
    submissions: [localSubmission],
    codeByExercise: {
      'm03-ex07': '// rascunho local java',
    },
    customExercises: [],
    currentExerciseId: 'm03-ex07',
    currentExerciseByTrack: { ...DEFAULTS_BY_TRACK },
  };

  const cloudProgress: Record<string, CloudActivityRecord> = {
    'm01-ex01': {
      userId: 'user-123',
      id_atividade: 'm01-ex01',
      track: 'java',
      pontuacao: 70,
      resolvido: true,
      codigo_salvo: 'System.out.println("old");',
      concluido_em: '2026-11-16T08:00:00.000Z',
      atualizado_em: '2026-11-16T08:00:00.000Z',
    },
    'js-m1-ex01': {
      userId: 'user-123',
      id_atividade: 'js-m1-ex01',
      track: 'javascript',
      pontuacao: 95,
      resolvido: true,
      codigo_salvo: 'const limite = 10;',
      concluido_em: '2026-11-16T09:00:00.000Z',
      atualizado_em: '2026-11-16T09:00:00.000Z',
    },
  };

  const cloudSubmission: SubmissionRecord = {
    id: 'sub-cloud-2',
    track: 'javascript',
    timestamp: '2026-11-17T12:00:00.000Z',
    moduleId: 101,
    moduleTitle: 'JS-01',
    exerciseId: 'js-m1-ex01',
    exerciseTitle: 'Escopo',
    difficulty: 'Fácil',
    passed: true,
    testsPassed: 2,
    testsTotal: 2,
    qualityScore: 95,
    code: 'const limite = 10;',
    findings: [],
    improvementsForEnunciado: [],
  };

  const result = mergeLocalAndCloudState({
    localState,
    cloudState: null,
    cloudProgress,
    cloudSubmissions: [cloudSubmission],
    exerciseCatalog: EXERCISES,
    defaultsByTrack: DEFAULTS_BY_TRACK,
  });

  // União de atividades concluídas
  assert.ok(result.mergedState.solvedIds.includes('m01-ex01'));
  assert.ok(result.mergedState.solvedIds.includes('js-m1-ex01'));

  // Maior pontuação preservada
  assert.equal(result.bestScores['m01-ex01'], 92);
  assert.equal(result.bestScores['js-m1-ex01'], 95);

  // Preserva rascunho local e preenche código ausente vindo da nuvem
  assert.equal(result.mergedState.codeByExercise['m03-ex07'], '// rascunho local java');
  assert.equal(result.mergedState.codeByExercise['js-m1-ex01'], 'const limite = 10;');

  // Fila de upload contém itens locais novos ou atualizados, mas não reenvia itens já iguais na nuvem
  const uploadIds = result.progressToUpload.map((p) => p.id_atividade);
  assert.ok(uploadIds.includes('m01-ex01'));
  assert.ok(uploadIds.includes('m03-ex07'));
  assert.equal(uploadIds.includes('js-m1-ex01'), false);

  // Submissões ordenadas da mais recente para a mais antiga
  assert.equal(result.mergedState.submissions[0].id, 'sub-cloud-2');
  assert.equal(result.mergedState.submissions[1].id, 'sub-local-1');
  assert.deepEqual(
    result.submissionsToUpload.map((s) => s.id),
    ['sub-local-1']
  );
});
