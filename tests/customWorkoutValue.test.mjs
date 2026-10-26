import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCustomWorkoutValue } from '../src/customWorkoutValue.js';

test('accepts a positive whole-number custom workout value', () => {
  assert.equal(parseCustomWorkoutValue('75'), 75);
});

test('rejects blank, fractional, zero, and negative custom workout values', () => {
  ['', '12.5', '0', '-4'].forEach(value => {
    assert.equal(parseCustomWorkoutValue(value), null);
  });
});
