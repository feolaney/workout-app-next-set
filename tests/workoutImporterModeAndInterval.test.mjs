import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTemplateCSV, parseImportedWorkout } from '../src/workoutImporter.js';

// ============ MODE FILTERING TESTS ============
test('generateTemplateCSV filters examples to selected mode only', () => {
  const template = generateTemplateCSV({ defaultMode: 'circuit', defaultRest: 30 });
  const lines = template.split('\n');
  
  // All data rows should have mode=circuit
  const dataLines = lines.filter(line => 
    line.trim() && 
    !line.trim().startsWith('#') && 
    !line.trim().startsWith('-') &&
    !line.includes('workout_name,description,mode') // skip header
  );
  
  dataLines.forEach(line => {
    assert.ok(line.includes(',circuit,'), `Line should contain circuit mode: ${line}`);
  });
});

test('generateTemplateCSV includes all modes when mode=all is passed', () => {
  const template = generateTemplateCSV({ defaultMode: 'all', defaultRest: 30 });
  const lines = template.split('\n');
  
  // Should include examples of different modes
  assert.ok(lines.some(line => line.includes(',focus,')), 'Should include focus mode examples');
  assert.ok(lines.some(line => line.includes(',circuit,')), 'Should include circuit mode examples');
  assert.ok(lines.some(line => line.includes(',superset,')), 'Should include superset mode examples');
  assert.ok(lines.some(line => line.includes(',addon,')), 'Should include addon mode examples');
  assert.ok(lines.some(line => line.includes(',manual,')), 'Should include manual mode examples');
});

test('mode-specific templates omit unrelated example sections', () => {
  const template = generateTemplateCSV({ defaultMode: 'focus' });
  assert.ok(template.includes('# EXAMPLE WORKOUT - rep-based'));
  assert.ok(template.includes('# EXAMPLE WORKOUT - timed/countdown'));
  assert.ok(!template.includes('# EXAMPLE ACTIONS - for circuits/supersets'));
  assert.ok(!template.includes('# EXAMPLE SUPERSET'));
  assert.ok(!template.includes('# EXAMPLE ADD-ON'));
  assert.ok(!template.includes('# EXAMPLE MANUAL ORDER'));
});

test('generateTemplateCSV includes long_rest_seconds and long_rest_every for interval mode', () => {
  const template = generateTemplateCSV({ 
    defaultMode: 'focus', 
    defaultRest: 30, 
    defaultRestType: 'interval',
    defaultLongRest: 120,
    defaultLongEvery: 5
  });
  
  // Check that interval rows contain the interval-specific columns
  assert.ok(template.includes(',interval,'), 'Should include interval rest type');
  assert.ok(template.includes(',120,'), 'Should include long_rest_seconds=120');
  assert.ok(template.includes(',5'), 'Should include long_rest_every=5');
  
  // Parse the template and verify the values are correct
  const result = parseImportedWorkout(template);
  assert.equal(result.success, true);
  if (result.success) {
    const intervalRows = result.workout.queue.filter(item => item.restType === 'interval');
    assert.ok(intervalRows.length > 0, 'Should have at least one interval row');
    assert.equal(result.workout.restConfig.type, 'interval');
    assert.equal(result.workout.restConfig.long, 120);
    assert.equal(result.workout.restConfig.longEvery, 5);
  }
});

test('generateTemplateCSV excludes interval columns for normal and none rest types', () => {
  const normalTemplate = generateTemplateCSV({ 
    defaultMode: 'focus', 
    defaultRest: 30, 
    defaultRestType: 'normal'
  });
  
  const noneTemplate = generateTemplateCSV({ 
    defaultMode: 'focus',
    defaultRestType: 'none'
  });
  
  // Normal should not have interval-specific data (empty columns after rest_type)
  const normalLines = normalTemplate.split('\n').filter(l => 
    l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('-') &&
    !l.includes('workout_name,description,mode')
  );
  
  // None should have empty interval columns
  const noneLines = noneTemplate.split('\n').filter(l => 
    l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('-') &&
    !l.includes('workout_name,description,mode')
  );
  
  normalLines.forEach(line => {
    const parts = line.split(',');
    assert.equal(parts.length, 13, 'Should have the full template schema');
    assert.equal(parts[10], 'normal');
    assert.equal(parts[11], '', 'Normal rest should not include long-rest duration');
    assert.equal(parts[12], '', 'Normal rest should not include long-rest frequency');
  });

  noneLines.forEach(line => {
    const parts = line.split(',');
    assert.equal(parts.length, 13, 'Should have the full template schema');
    assert.equal(parts[10], 'none');
    assert.equal(parts[11], '', 'No-rest rows should not include long-rest duration');
    assert.equal(parts[12], '', 'No-rest rows should not include long-rest frequency');
  });
});
