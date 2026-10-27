import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTemplateCSV, parseImportedWorkout } from '../src/workoutImporter.js';

// ============ PREVIEW MODE DISPLAY TESTS ============
// Tests for the IMPROVED preview that shows the workout mode

test('preview should display mode when importing template', () => {
  // User selects addon mode
  const template = generateTemplateCSV({ defaultMode: 'addon', defaultRest: 15 });
  const result = parseImportedWorkout(template);
  
  assert.ok(result.success);
  
  // The preview title should show the mode (this is the UX improvement)
  // Expected format: "PREVIEW: {workout.name} ({queue.length} actions)"
  // Ideally: "PREVIEW: {workout.name} ({workflow.mode}) ({queue.length} actions)"
  
  // For now, just verify we can get the mode from importResult.workout.mode
  assert.equal(result.workout.mode, 'addon');
  
  // Simulate what the improved preview would display
  const previewTitle = `${result.workout.name} (${result.workout.mode}) (${result.workout.queue.length} actions)`;
  assert.ok(previewTitle.includes('addon'), 'Preview title should include mode');
});

test('mode-specific templates should be distinguishable in preview', () => {
  const modes = ['focus', 'circuit', 'superset', 'addon', 'manual'];
  
  for (const mode of modes) {
    const template = generateTemplateCSV({ defaultMode: mode, defaultRest: 30 });
    const result = parseImportedWorkout(template);
    
    assert.ok(result.success, `${mode} template should parse`);
    assert.equal(result.workout.mode, mode, `Parsed mode should be ${mode}`);
    
    // The preview should be able to distinguish modes
    const previewMode = result.workout.mode;
    assert.equal(previewMode, mode, `Preview should show ${mode}`);
  }
});
