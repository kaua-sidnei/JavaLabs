import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_MODULES, EXERCISES, RECOMMENDED_MATERIALS, TRACK_METADATA } from './curriculum';
import { EXTRA_EXERCISES, EXTRA_MODULES } from './extraTracks';

test('Java 21 preserves 24 modules and 73 exercises alongside 15 redefined extra modules (90 exercises)', () => {
  const javaModules = ALL_MODULES.filter((m) => m.track === 'java');
  const javaExercises = EXERCISES.filter((ex) => ex.track === 'java');
  assert.equal(javaModules.length, 24);
  assert.equal(javaExercises.length, 73);

  assert.equal(EXTRA_MODULES.length, 15);
  assert.equal(EXTRA_EXERCISES.length, 90);

  for (const track of ['javascript', 'appscript', 'python'] as const) {
    const mods = EXTRA_MODULES.filter((m) => m.track === track);
    assert.equal(mods.length, 5, `Expected 5 modules for track ${track}`);
    for (const mod of mods) {
      const modExs = EXTRA_EXERCISES.filter((ex) => ex.moduleId === mod.id);
      assert.equal(modExs.length, 6, `Module ${mod.code} should have 6 exercises`);
      assert.equal(
        modExs.filter((ex) => ex.difficulty === 'Fácil').length,
        2,
        `Module ${mod.code} should have 2 Fácil`
      );
      assert.equal(
        modExs.filter((ex) => ex.difficulty === 'Médio').length,
        2,
        `Module ${mod.code} should have 2 Médio`
      );
      assert.equal(
        modExs.filter((ex) => ex.difficulty === 'Difícil').length,
        2,
        `Module ${mod.code} should have 2 Difícil`
      );
    }
  }
});

test('all exercise IDs are unique, defaults exist, and GAS + Python M4/M5 carry datasetTable', () => {
  const ids = EXERCISES.map((ex) => ex.id);
  assert.equal(new Set(ids).size, ids.length, 'Exercise IDs must be globally unique');

  for (const track of ['java', 'javascript', 'appscript', 'python'] as const) {
    const defaultId = TRACK_METADATA[track].defaultExerciseId;
    assert.ok(
      EXERCISES.some((ex) => ex.id === defaultId && ex.track === track),
      `Default exercise ${defaultId} missing for track ${track}`
    );
  }

  for (const track of ['javascript', 'appscript', 'python'] as const) {
    assert.ok(
      RECOMMENDED_MATERIALS.some((m) => m.track === track),
      `Recommended materials missing for track ${track}`
    );
  }

  const gasExercises = EXTRA_EXERCISES.filter((ex) => ex.track === 'appscript');
  assert.equal(gasExercises.length, 30);
  for (const ex of gasExercises) {
    assert.ok(ex.datasetTable, `GAS exercise ${ex.id} must include datasetTable`);
    assert.ok(ex.datasetTable.columns.length >= 2);
    assert.ok(ex.datasetTable.rows.length >= 2);
  }

  const pyDataExercises = EXTRA_EXERCISES.filter(
    (ex) => ex.track === 'python' && (ex.moduleId === 304 || ex.moduleId === 305)
  );
  assert.equal(pyDataExercises.length, 12);
  for (const ex of pyDataExercises) {
    assert.ok(ex.datasetTable, `Python data/scraping exercise ${ex.id} must include datasetTable`);
    assert.ok(ex.datasetTable.columns.length >= 2);
    assert.ok(ex.datasetTable.rows.length >= 2);
  }

  for (const ex of EXTRA_EXERCISES) {
    assert.ok(ex.preloadedImprovements.length > 0, `${ex.id} missing preloadedImprovements`);
    assert.ok(ex.examples.length > 0, `${ex.id} missing examples`);
    assert.ok(ex.requirements.length > 0, `${ex.id} missing requirements`);
  }
});
