import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTemplateCSV, parseImportedWorkout } from '../src/workoutImporter.js';

// ============ END-TO-END MODE SELECTION TESTS ============
// These tests verify the complete flow: user selects a mode → 
// template is generated → template is parsed → preview shows correct mode

test('user selects add-on mode and preview shows add-on workout structure', () => {
  // Simulate user selecting addon mode and clicking Generate Template
  const template = generateTemplateCSV({ defaultMode: 'addon', defaultRest: 15 });
  
  // Verify template contains only addon mode data rows
  const lines = template.split('\n');
  const dataLines = lines.filter(line => 
    line.trim() && 
    !line.trim().startsWith('#') && 
    !line.trim().startsWith('-') &&
    !line.includes('workout_name,description,mode')
  );
  
  dataLines.forEach(line => {
    assert.ok(line.includes(',addon,'), `All data rows should have addon mode: ${line}`);
  });
  
  // Parse the template (simulates what ImportScreen does)
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'Template should parse successfully');
  assert.equal(result.workout.mode, 'addon', 'Parsed workout mode should be addon');
  
  // Verify all queue items have addon mode
  result.workout.queue.forEach((item, i) => {
    assert.equal(item.mode, 'addon', `Queue item ${i} should have mode=addon`);
  });
  
  // Verify addon structure: round 1 has 1 exercise, round 2 has 2 exercises, etc.
  const round1Count = result.workout.queue.filter(q => q.round === 1).length;
  const round2Count = result.workout.queue.filter(q => q.round === 2).length;
  
  assert.ok(round1Count >= 1, 'Add-on should have at least 1 exercise in round 1');
  assert.ok(round2Count >= 2 || round2Count === 0, 'Add-on round 2 should have 2 exercises if present');
});

test('user selects circuit mode and preview shows only circuit rows', () => {
  const template = generateTemplateCSV({ defaultMode: 'circuit', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success);
  assert.equal(result.workout.mode, 'circuit');
  
  // All queue items should be circuit
  result.workout.queue.forEach((item, i) => {
    assert.equal(item.mode, 'circuit', `Queue item ${i} should have mode=circuit`);
  });
});

test('user selects superset mode and preview shows only superset rows', () => {
  const template = generateTemplateCSV({ defaultMode: 'superset', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success);
  assert.equal(result.workout.mode, 'superset');
  
  result.workout.queue.forEach((item, i) => {
    assert.equal(item.mode, 'superset', `Queue item ${i} should have mode=superset`);
  });
});

test('user selects manual mode and preview shows only manual rows', () => {
  const template = generateTemplateCSV({ defaultMode: 'manual', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success);
  assert.equal(result.workout.mode, 'manual');
  
  result.workout.queue.forEach((item, i) => {
    assert.equal(item.mode, 'manual', `Queue item ${i} should have mode=manual`);
  });
});

test('user selects focus mode and preview shows only focus rows', () => {
  const template = generateTemplateCSV({ defaultMode: 'focus', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success);
  assert.equal(result.workout.mode, 'focus');
  
  result.workout.queue.forEach((item, i) => {
    assert.equal(item.mode, 'focus', `Queue item ${i} should have mode=focus`);
  });
});

test('when importing addon template, selectedExercises and mode are set correctly', () => {
  // This simulates the onImport handler in App.jsx lines 1830-1880
  
  const template = generateTemplateCSV({ defaultMode: 'addon', defaultRest: 15 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success);
  
  // Simulate what the onImport handler does:
  // setMode(workout.mode || 'manual')
  const selectedMode = result.workout.mode || 'manual';
  assert.equal(selectedMode, 'addon', 'Mode should be set to addon');
  
  // The queue items have the correct mode
  result.workout.queue.forEach(item => {
    assert.equal(item.mode, 'addon', 'Queue item mode should be addon');
  });
});
