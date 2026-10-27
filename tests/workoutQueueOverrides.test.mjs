import test from 'node:test';
import assert from 'node:assert/strict';
import { updateFutureExerciseValues } from '../src/workoutQueueOverrides.js';

test('changes the current and future matching exercise values without changing prior sets', () => {
  const queue = [
    { exId: 'push-up', reps: 15 },
    { exId: 'push-up', reps: 15 },
    { exId: 'push-up', reps: 15 },
    { exId: 'squat', reps: 16 },
  ];

  assert.deepEqual(updateFutureExerciseValues(queue, 1, 20), [
    { exId: 'push-up', reps: 15 },
    { exId: 'push-up', reps: 20 },
    { exId: 'push-up', reps: 20 },
    { exId: 'squat', reps: 16 },
  ]);
});
