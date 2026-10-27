import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTemplateCSV,
  isRunnableImportedWorkout,
  parseImportedWorkout,
} from '../src/workoutImporter.js';

function templateRows(csv) {
  const lines = csv.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith('workout_name,'));
  const headers = lines[headerIndex].split(',');

  return lines
    .slice(headerIndex + 1)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-');
    })
    .map((line) => Object.fromEntries(
      headers.map((header, index) => [header, line.split(',')[index] ?? ''])
    ));
}

const expectedTemplates = {
  focus: {
    name: 'My Focus Workout',
    structure: [
      [1, 1, 'Push-up'],
      [1, 2, 'Plank'],
      [1, 3, 'Dumbbell Curl'],
      [1, 4, 'Squat'],
    ],
  },
  circuit: {
    name: 'My Circuit Workout',
    structure: [
      [1, 1, 'Goblet Squat'],
      [1, 2, 'Push-up'],
      [1, 3, 'Dumbbell Row'],
      [2, 1, 'Goblet Squat'],
      [2, 2, 'Push-up'],
      [2, 3, 'Dumbbell Row'],
    ],
  },
  superset: {
    name: 'My Superset Workout',
    structure: [
      [1, 1, 'Push-up'],
      [1, 1, 'Dumbbell Row'],
      [1, 2, 'Overhead Press'],
      [1, 2, 'Face Pull'],
    ],
  },
  addon: {
    name: 'My Add-on Workout',
    structure: [
      [1, 1, 'Squat'],
      [2, 1, 'Squat'],
      [2, 2, 'Plank'],
      [3, 1, 'Squat'],
      [3, 2, 'Plank'],
      [3, 3, 'Glute Bridge'],
    ],
  },
  manual: {
    name: 'My Manual Workout',
    structure: [
      [1, 1, 'Push-up'],
      [1, 2, 'Dumbbell Row'],
      [1, 3, 'Squat'],
      [1, 4, 'Plank'],
    ],
  },
};

test('every specific mode generates one coherent, importable workout', () => {
  for (const [mode, expected] of Object.entries(expectedTemplates)) {
    const csv = generateTemplateCSV({ defaultMode: mode, defaultRest: 30 });
    const rows = templateRows(csv);
    const result = parseImportedWorkout(csv);

    assert.ok(result.success, `${mode} template must parse: ${result.errors?.join('; ')}`);
    assert.ok(isRunnableImportedWorkout(result), `${mode} template must be runnable`);
    assert.equal(result.workout.name, expected.name);
    assert.deepEqual(new Set(rows.map((row) => row.workout_name)), new Set([expected.name]));
    assert.deepEqual(new Set(rows.map((row) => row.mode)), new Set([mode]));
    assert.deepEqual(
      result.workout.queue.map((item) => [item.round, item.group, item.name]),
      expected.structure,
      `${mode} template must contain only its intended action order and structure`
    );
  }
});

test('add-on template grows from one action without an unrelated prelude', () => {
  const result = parseImportedWorkout(generateTemplateCSV({ defaultMode: 'addon', defaultRest: 15 }));
  assert.ok(result.success);

  const byRound = new Map();
  for (const item of result.workout.queue) {
    const exercises = byRound.get(item.round) ?? [];
    exercises.push(item.name);
    byRound.set(item.round, exercises);
  }

  assert.deepEqual(byRound.get(1), ['Squat']);
  assert.deepEqual(byRound.get(2), ['Squat', 'Plank']);
  assert.deepEqual(byRound.get(3), ['Squat', 'Plank', 'Glute Bridge']);
  assert.ok(!result.workout.queue.some((item) => ['Dumbbell Curl', 'Mountain Climber', 'Dead Bug'].includes(item.name)));
});

test('superset template contains two valid paired groups', () => {
  const result = parseImportedWorkout(generateTemplateCSV({ defaultMode: 'superset' }));
  assert.ok(result.success, result.errors?.join('; '));

  const groups = result.workout.queue.reduce((acc, item) => {
    const key = `${item.round}:${item.group}`;
    acc[key] = [...(acc[key] ?? []), item.name];
    return acc;
  }, {});

  assert.deepEqual(groups, {
    '1:1': ['Push-up', 'Dumbbell Row'],
    '1:2': ['Overhead Press', 'Face Pull'],
  });
});

test('all-modes reference parses but cannot be started as one workout', () => {
  const result = parseImportedWorkout(generateTemplateCSV({ defaultMode: 'all' }));
  assert.ok(result.success, result.errors?.join('; '));
  assert.deepEqual(
    new Set(result.workout.queue.map((item) => item.mode)),
    new Set(['focus', 'circuit', 'superset', 'addon', 'manual'])
  );
  assert.equal(isRunnableImportedWorkout(result), false);
  assert.equal(isRunnableImportedWorkout(null), false);
});
