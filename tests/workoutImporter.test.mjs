import test from 'node:test';
import assert from 'node:assert/strict';
import { parseImportedWorkout, generateTemplateCSV, parseMode, parseUnit, parseRestType, validateRow } from '../src/workoutImporter.js';

// ============ MODE PARSING ============
test('parseMode accepts valid mode keys', () => {
  assert.equal(parseMode('focus'), 'focus');
  assert.equal(parseMode('circuit'), 'circuit');
  assert.equal(parseMode('superset'), 'superset');
  assert.equal(parseMode('addon'), 'addon');
  assert.equal(parseMode('manual'), 'manual');
});

test('parseMode accepts friendly mode aliases', () => {
  assert.equal(parseMode('Focus'), 'focus');
  assert.equal(parseMode('FOCUS'), 'focus');
  assert.equal(parseMode('Circuit'), 'circuit');
  assert.equal(parseMode('SUPERSET'), 'superset');
  assert.equal(parseMode('Add-on'), 'addon');
  assert.equal(parseMode('AddOn'), 'addon');
  assert.equal(parseMode('Manual'), 'manual');
});

test('parseMode rejects unknown modes', () => {
  assert.equal(parseMode('invalid'), null);
  assert.equal(parseMode('circuitry'), null);
  assert.equal(parseMode(''), null);
});

// ============ UNIT PARSING ============
test('parseUnit accepts valid units', () => {
  assert.equal(parseUnit('reps'), 'reps');
  assert.equal(parseUnit('sec'), 'sec');
  assert.equal(parseUnit('REP'), 'reps');
  assert.equal(parseUnit('SEC'), 'sec');
});

test('parseUnit rejects unknown units', () => {
  assert.equal(parseUnit('invalid'), null);
  assert.equal(parseUnit(''), null);
});

// ============ REST TYPE PARSING ============
test('parseRestType accepts normal and long', () => {
  assert.equal(parseRestType('normal'), 'normal');
  assert.equal(parseRestType('long'), 'long');
  assert.equal(parseRestType('Normal'), 'normal');
  assert.equal(parseRestType('LONG'), 'long');
});

test('parseRestType treats empty string as normal', () => {
  assert.equal(parseRestType(''), 'normal');  // '' is normalized to 'normal'
  assert.equal(parseRestType(null), null);
  assert.equal(parseRestType(undefined), null);
});

test('parseRestType rejects invalid types', () => {
  assert.equal(parseRestType('invalid'), null);
  assert.equal(parseRestType('medium'), null);
});

// ============ ROW VALIDATION ============
test('validateRow accepts a valid row with all required fields', () => {
  const validRow = {
    workout_name: 'Test Workout',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '10'
  };
  const errors = validateRow(validRow, 1);
  assert.equal(errors.length, 0);
});

test('validateRow accepts row with optional rest_seconds', () => {
  const row = {
    workout_name: 'Test Workout',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '10',
    rest_seconds: '30'
  };
  const errors = validateRow(row, 1);
  assert.equal(errors.length, 0);
});

test('validateRow accepts row with rest_type=normal', () => {
  const row = {
    workout_name: 'Test Workout',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '10',
    rest_seconds: '30',
    rest_type: 'normal'
  };
  const errors = validateRow(row, 1);
  assert.equal(errors.length, 0);
});

test('validateRow accepts row with rest_type=long', () => {
  const row = {
    workout_name: 'Test Workout',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '10',
    rest_seconds: '90',
    rest_type: 'long'
  };
  const errors = validateRow(row, 1);
  assert.equal(errors.length, 0);
});

test('validateRow rejects invalid rest_type', () => {
  const row = {
    workout_name: 'Test',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '10',
    rest_type: 'invalid'
  };
  const errors = validateRow(row, 1);
  assert.ok(errors.some(e => e.includes('rest_type') && e.includes('Invalid')));
});

test('validateRow detects missing required fields', () => {
  const row = { mode: 'focus', exercise: 'Push-up' };
  const errors = validateRow(row, 3);
  assert.equal(errors.length, 3);
  assert.ok(errors.some(e => e.includes('workout_name')));
  assert.ok(errors.some(e => e.includes('unit')));
  assert.ok(errors.some(e => e.includes('value')));
});

test('validateRow rejects negative rest_seconds', () => {
  const row = {
    workout_name: 'Test',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '10',
    rest_seconds: '-5'
  };
  const errors = validateRow(row, 5);
  assert.ok(errors.some(e => e.includes('rest_seconds') && e.includes('negative')));
});

test('validateRow rejects zero or negative value', () => {
  const row = {
    workout_name: 'Test',
    mode: 'focus',
    exercise: 'Push-up',
    unit: 'reps',
    value: '0'
  };
  const errors = validateRow(row, 5);
  assert.ok(errors.some(e => e.includes('positive')));
});

// ============ CSV PARSING ============
test('parseImportedWorkout parses a valid rep-based workout', () => {
  const csv = `workout_name,description,mode,round,group,exercise,exercise_description,unit,value,rest_seconds
My Chest Workout,Focus day,Focus,,1,Push-up,Standard push-up,reps,12,30
My Chest Workout,,Focus,,2,Dumbbell Curl,,reps,10,45`;

  const result = parseImportedWorkout(csv);
  assert.ok(result.success);
  if (result.success) {
    assert.equal(result.workout.name, 'My Chest Workout');
    assert.equal(result.workout.queue.length, 2);
    assert.equal(result.workout.queue[0].name, 'Push-up');
    assert.equal(result.workout.queue[0].value, 12);
    assert.equal(result.workout.queue[0].unit, 'reps');
    assert.equal(result.workout.queue[0].restSeconds, 30);
    assert.equal(result.workout.queue[1].restSeconds, 45);
  }
});

test('parseImportedWorkout parses a valid timed workout', () => {
  const csv = `workout_name,mode,exercise,unit,value,rest_seconds
Timed Core,circuit,Plank,sec,60,15
Timed Core,circuit,Mountain Climber,sec,45,15`;

  const result = parseImportedWorkout(csv);
  assert.ok(result.success);
  if (result.success) {
    assert.equal(result.workout.queue.length, 2);
    assert.equal(result.workout.queue[0].value, 60);
    assert.equal(result.workout.queue[0].unit, 'sec');
  }
});

test('parseImportedWorkout preserves grouping and order', () => {
  const csv = `workout_name,mode,round,group,exercise,unit,value
Circuit Training,circuit,1,1,Squat,reps,10
Circuit Training,circuit,1,1,Push-up,reps,8
Circuit Training,circuit,1,2,Plank,sec,30
Circuit Training,circuit,2,1,Squat,reps,10`;

  const result = parseImportedWorkout(csv);
  assert.ok(result.success);
  if (result.success) {
    assert.equal(result.workout.queue.length, 4);
    assert.equal(result.workout.queue[0].round, 1);
    assert.equal(result.workout.queue[0].group, 1);
    assert.equal(result.workout.queue[2].round, 1);
    assert.equal(result.workout.queue[2].group, 2);
  }
});

test('parseImportedWorkout parses quoted values with commas', () => {
  const csv = `workout_name,description,mode,exercise,unit,value
"Chest, Shoulders, Tris",Upper push focus,Focus,Push-up,reps,12`;

  const result = parseImportedWorkout(csv);
  assert.ok(result.success);
  if (result.success) {
    assert.ok(result.workout.name.includes('Shoulders'));
  }
});

test('parseImportedWorkout rejects empty CSV', () => {
  const result = parseImportedWorkout('');
  assert.ok(!result.success);
  assert.ok(result.errors.some(e => e.includes('empty') || e.includes('no actions')));
});

test('parseImportedWorkout rejects CSV with only headers', () => {
  const csv = `workout_name,mode,exercise,unit,value`;
  const result = parseImportedWorkout(csv);
  assert.ok(!result.success);
});

test('parseImportedWorkout rejects unknown mode', () => {
  const csv = `workout_name,mode,exercise,unit,value
Bad Workout,invalid_mode,Push-up,reps,10`;
  const result = parseImportedWorkout(csv);
  assert.ok(!result.success);
  assert.ok(result.errors.some(e => e.includes('mode')));
});

test('parseImportedWorkout collects all errors from multiple rows', () => {
  const csv = `workout_name,mode,exercise,unit,value
Bad Workout,invalid,Squat,reps,10
,Focus,Push-up,reps,-5
Bad Workout,circuit,Plank,sec,0`;

  const result = parseImportedWorkout(csv);
  assert.ok(!result.success);
  // Should have errors from all rows
  assert.ok(result.errors.length >= 3);
});

// ============ TEMPLATE GENERATION ============
test('generateTemplateCSV produces a valid template with defaults', () => {
  const template = generateTemplateCSV({ defaultMode: 'focus', defaultRest: 30 });
  assert.ok(template.includes('workout_name,description,mode'));
  assert.ok(template.includes('reps'));
  assert.ok(template.includes('30'));
});

test('generateTemplateCSV includes example actions', () => {
  const template = generateTemplateCSV({ defaultMode: 'circuit', defaultRest: 15 });
  assert.ok(template.split('\n').length > 5); // header + comments + examples
});

test('generated template is directly importable and includes the main flow examples', () => {
  const template = generateTemplateCSV({ defaultMode: 'superset', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  assert.equal(result.success, true);
  assert.ok(result.workout.queue.some(item => item.mode === 'superset'));
  assert.ok(result.workout.queue.some(item => item.unit === 'sec'));
});

test('parseImportedWorkout ignores blank and help lines before and between data rows', () => {
  const csv = `
# Paste your workout below

workout_name,mode,exercise,unit,value
Example,single,Push-up,reps,10
- This line is help text, not a data row

Example,circ,Plank,seconds,30`;
  const result = parseImportedWorkout(csv);
  assert.equal(result.success, true);
  assert.equal(result.workout.queue.length, 2);
  assert.equal(result.workout.queue[1].unit, 'sec');
});

test('parseImportedWorkout rejects fractional and partially numeric values', () => {
  const csv = `workout_name,mode,exercise,unit,value,rest_seconds
Bad,focus,Push-up,reps,10.5,20x`;
  const result = parseImportedWorkout(csv);
  assert.equal(result.success, false);
  assert.ok(result.errors.some(error => error.includes("Field 'value'")));
  assert.ok(result.errors.some(error => error.includes("Field 'rest_seconds'")));
});

test('parseImportedWorkout parses rest_type correctly', () => {
  const csv = `workout_name,mode,exercise,unit,value,rest_seconds,rest_type
Workout,focus,Push-up,reps,10,15,normal
Workout,focus,Plank,sec,60,90,long`;
  const result = parseImportedWorkout(csv);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.workout.queue[0].restType, 'normal');
    assert.equal(result.workout.queue[0].restSeconds, 15);
    assert.equal(result.workout.queue[1].restType, 'long');
    assert.equal(result.workout.queue[1].restSeconds, 90);
  }
});

test('regression: imported 15-second rest defaults to normal and is NOT displayed as long rest', () => {
  // This is the exact scenario from the bug report:
  // CSV uses rest_seconds=15 on every row in an addon workout
  // This should represent NORMAL rest, not long rest
  const csv = `workout_name,mode,round,group,exercise,unit,value,rest_seconds
Addon Workout,addon,1,1,Squat,reps,12,15
Addon Workout,addon,2,1,Squat,reps,12,15
Addon Workout,addon,2,2,Plank,sec,30,15`;
  const result = parseImportedWorkout(csv);
  assert.equal(result.success, true);
  if (result.success) {
    // All rows should have restType=normal (default)
    assert.equal(result.workout.queue[0].restType, 'normal');
    assert.equal(result.workout.queue[1].restType, 'normal');
    assert.equal(result.workout.queue[2].restType, 'normal');
    // All still have their restSeconds value
    assert.equal(result.workout.queue[0].restSeconds, 15);
    assert.equal(result.workout.queue[1].restSeconds, 15);
    assert.equal(result.workout.queue[2].restSeconds, 15);
  }
});
