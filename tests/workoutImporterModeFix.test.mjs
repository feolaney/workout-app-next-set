import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTemplateCSV, parseImportedWorkout } from '../src/workoutImporter.js';

// ============ BUG FIX VERIFICATION TESTS ============
// These tests verify that each mode-specific template:
// 1. Contains only rows with the selected mode
// 2. Parses successfully
// 3. Parsed workout.mode equals the selected mode
// 4. All queue items have the correct mode

test('add-on template generates and parses as add-on mode', () => {
  const template = generateTemplateCSV({ defaultMode: 'addon', defaultRest: 15 });
  
  // Parse the generated template
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'Template should parse successfully');
  assert.ok(result.success, () => `Parse failed: ${result.errors.join(', ')}`);
  
  if (result.success) {
    // Workout mode should be addon
    assert.equal(result.workout.mode, 'addon', 'Workout mode should be addon');
    
    // All queue items should have mode=addon
    const allAddon = result.workout.queue.every(q => q.mode === 'addon');
    assert.ok(allAddon, 'All queue items should have mode=addon');
    
    // Queue should have addon-appropriate structure (multiple rounds with growing exercises)
    assert.ok(result.workout.queue.length >= 3, 'Add-on template should have at least 3 rows');
  }
});

test('circuit template generates and parses as circuit mode', () => {
  const template = generateTemplateCSV({ defaultMode: 'circuit', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'Circuit template should parse successfully');
  if (result.success) {
    assert.equal(result.workout.mode, 'circuit', 'Workout mode should be circuit');
    const allCircuit = result.workout.queue.every(q => q.mode === 'circuit');
    assert.ok(allCircuit, 'All queue items should have mode=circuit');
  }
});

test('superset template generates and parses as superset mode', () => {
  const template = generateTemplateCSV({ defaultMode: 'superset', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'Superset template should parse successfully');
  if (result.success) {
    assert.equal(result.workout.mode, 'superset', 'Workout mode should be superset');
    const allSuperset = result.workout.queue.every(q => q.mode === 'superset');
    assert.ok(allSuperset, 'All queue items should have mode=superset');
  }
});

test('focus template generates and parses as focus mode', () => {
  const template = generateTemplateCSV({ defaultMode: 'focus', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'Focus template should parse successfully');
  if (result.success) {
    assert.equal(result.workout.mode, 'focus', 'Workout mode should be focus');
    const allFocus = result.workout.queue.every(q => q.mode === 'focus');
    assert.ok(allFocus, 'All queue items should have mode=focus');
  }
});

test('manual template generates and parses as manual mode', () => {
  const template = generateTemplateCSV({ defaultMode: 'manual', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'Manual template should parse successfully');
  if (result.success) {
    assert.equal(result.workout.mode, 'manual', 'Workout mode should be manual');
    const allManual = result.workout.queue.every(q => q.mode === 'manual');
    assert.ok(allManual, 'All queue items should have mode=manual');
  }
});

test('all mode template defaults to focus mode on parse but shows mixed examples', () => {
  const template = generateTemplateCSV({ defaultMode: 'all', defaultRest: 30 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success, 'All-modes template should parse successfully');
  if (result.success) {
    // Since parser only represents one workout, it takes the first row's mode
    assert.equal(result.workout.mode, 'focus', 'Parsed mode is focus (first row)');
    
    // But the template should contain examples of all modes
    assert.ok(template.includes(',focus,'), 'Template should include focus examples');
    assert.ok(template.includes(',circuit,'), 'Template should include circuit examples');
    assert.ok(template.includes(',superset,'), 'Template should include superset examples');
    assert.ok(template.includes(',addon,'), 'Template should include addon examples');
    assert.ok(template.includes(',manual,'), 'Template should include manual examples');
  }
});

test('generated templates contain no rows from other modes', () => {
  const modes = ['focus', 'circuit', 'superset', 'addon', 'manual'];
  
  for (const mode of modes) {
    const template = generateTemplateCSV({ defaultMode: mode, defaultRest: 30 });
    const lines = template.split('\n');
    
    // Check all data rows (skip header, comments, blank lines)
    const dataLines = lines.filter(line => 
      line.trim() && 
      !line.trim().startsWith('#') && 
      !line.trim().startsWith('-') &&
      !line.includes('workout_name,description,mode')
    );
    
    dataLines.forEach(line => {
      const parts = line.split(',');
      assert.equal(
        parts[2], mode,
        `Row should have mode=${mode}, but found mode=${parts[2]}. Line: ${line}`
      );
    });
  }
});
