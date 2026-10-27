// Workout CSV Importer Module
// Pure functions for parsing and validating workout CSV imports

// ============ MODE PARSING ============
const VALID_MODES = new Set(['focus', 'circuit', 'superset', 'addon', 'manual']);

const MODE_ALIASES = {
  'focus': ['focus', 'focused', 'focussed', 'single'],
  'circuit': ['circuit', 'circ'],
  'superset': ['superset', 'super-set', 'super_set', 'super'],
  'addon': ['addon', 'add-on', 'add_on', 'add on'],
  'manual': ['manual'],
};

/**
 * Parse a mode string, normalizing and validating
 * @param {string} modeStr - The mode string from CSV
 * @returns {string|null} The normalized mode key or null if invalid
 */
export function parseMode(modeStr) {
  if (!modeStr || typeof modeStr !== 'string') return null;
  const normalized = modeStr.trim().toLowerCase().replace(/[-_\s]+/g, '');
  for (const [key, aliases] of Object.entries(MODE_ALIASES)) {
    if (aliases.some(a => a.replace(/[-_\s]+/g, '') === normalized)) {
      return key;
    }
  }
  // Also accept exact valid modes
  if (VALID_MODES.has(normalized)) return normalized;
  return null;
}

// ============ UNIT PARSING ============
const VALID_UNITS = new Set(['reps', 'sec']);

export function parseUnit(unitStr) {
  if (!unitStr || typeof unitStr !== 'string') return null;
  const normalized = unitStr.trim().toLowerCase();
  if (normalized === 'rep' || normalized === 'reps') return 'reps';
  if (normalized === 'sec' || normalized === 'seconds' || normalized === 's') return 'sec';
  return null;
}

/**
 * Parse a rest type string, normalizing and validating
 * @param {string} typeStr - The rest type string from CSV
 * @returns {string|null} The normalized rest type ('normal', 'long', 'interval', 'none') or null if invalid/missing
 */
export function parseRestType(typeStr) {
  if (typeStr === undefined || typeStr === null || typeof typeStr !== 'string') return null;
  const normalized = typeStr.trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (normalized === '' || normalized === 'normal' || normalized === 'short') return 'normal';
  if (normalized === 'long') return 'long';
  if (normalized === 'interval' || normalized === 'periodic' || normalized === 'periodiclong') return 'interval';
  if (normalized === 'none' || normalized === 'off') return 'none';
  return null;
}

// ============ ROW VALIDATION ============
const REQUIRED_FIELDS = ['workout_name', 'mode', 'exercise', 'unit', 'value'];

/**
 * Validate a single row and return an array of error messages
 * @param {Object} row - Parsed CSV row
 * @param {number} rowNum - 1-based row number for error reporting
 * @returns {string[]} Array of error messages, empty if valid
 */
export function validateRow(row, rowNum) {
  const errors = [];
  const positiveWholeNumber = (value) => /^\d+$/.test(String(value).trim()) && Number(value) > 0;
  const nonNegativeWholeNumber = (value) => /^\d+$/.test(String(value).trim()) && Number(value) >= 0;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (row[field] === undefined || row[field] === null || String(row[field]).trim() === '') {
      errors.push(`Row ${rowNum}: Missing required field '${field}'`);
    }
  }

  // Validate mode
  if (row.mode !== undefined && row.mode !== null && String(row.mode).trim() !== '') {
    if (parseMode(String(row.mode)) === null) {
      errors.push(`Row ${rowNum}: Invalid mode '${row.mode}'. Valid modes: focus, circuit, superset, addon, manual`);
    }
  }

  // Validate unit
  if (row.unit !== undefined && row.unit !== null && String(row.unit).trim() !== '') {
    if (parseUnit(String(row.unit)) === null) {
      errors.push(`Row ${rowNum}: Invalid unit '${row.unit}'. Valid units: reps, sec`);
    }
  }

  if (row.value !== undefined && String(row.value).trim() !== '' && !positiveWholeNumber(row.value)) {
    errors.push(`Row ${rowNum}: Field 'value' must be a positive whole number`);
  }

  for (const field of ['round', 'group']) {
    if (row[field] !== undefined && String(row[field]).trim() !== '' && !positiveWholeNumber(row[field])) {
      errors.push(`Row ${rowNum}: Field '${field}' must be a positive whole number`);
    }
  }

  if (row.rest_seconds !== undefined && String(row.rest_seconds).trim() !== '' && !nonNegativeWholeNumber(row.rest_seconds)) {
    errors.push(`Row ${rowNum}: Field 'rest_seconds' must be a non-negative whole number`);
  }

  // Validate rest_type if present
  if (row.rest_type !== undefined && row.rest_type !== null && String(row.rest_type).trim() !== '') {
    if (parseRestType(String(row.rest_type)) === null) {
      errors.push(`Row ${rowNum}: Invalid rest_type '${row.rest_type}'. Valid types: normal, interval, long, none`);
    }
  }

  for (const field of ['long_rest_seconds', 'long_rest_every']) {
    if (row[field] !== undefined && String(row[field]).trim() !== '' && !nonNegativeWholeNumber(row[field])) {
      errors.push(`Row ${rowNum}: Field '${field}' must be a non-negative whole number`);
    }
  }

  if (row.long_rest_every !== undefined && String(row.long_rest_every).trim() !== '' && Number(row.long_rest_every) < 1) {
    errors.push(`Row ${rowNum}: Field 'long_rest_every' must be at least 1`);
  }

  if (parseRestType(row.rest_type) === 'interval') {
    if (String(row.long_rest_seconds || '').trim() === '') {
      errors.push(`Row ${rowNum}: Field 'long_rest_seconds' is required when rest_type is interval`);
    }
    if (String(row.long_rest_every || '').trim() === '') {
      errors.push(`Row ${rowNum}: Field 'long_rest_every' is required when rest_type is interval`);
    }
  }

  return errors;
}

// ============ CSV PARSING ============

/**
 * Parse CSV text into array of row objects, handling quoted fields with commas
 * @param {string} csvText - Raw CSV text
 * @returns {Array<{row: Object, rowNum: number}>} Parsed rows with line numbers
 */
function parseCSV(csvText) {
  // Handle Windows and Unix line endings
  const lines = csvText.replace(/\r\n/g, '\n').split('\n');

  // Find the first non-empty, non-comment line as the header so users can
  // place notes or blank lines above the CSV schema.
  const headerIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-');
  });
  if (headerIndex === -1) return [];

  const headers = parseCSVLine(lines[headerIndex]);
  if (headers.length === 0) return [];

  const result = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    // Skip blank/comment/help lines. Template help uses # or - prefixes.
    if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('-')) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    result.push({ row, rowNum: i + 1 });
  }

  return result;
}

/**
 * Parse a single CSV line into values, respecting quoted fields
 * Handles: "workout_name,description,mode,...example with commas"
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote
      current += '"';
      i++;
    } else if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Field separator
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Don't forget the last field
  values.push(current);

  return values;
}

/**
 * Parse an entire CSV import, returning workout or errors
 * @param {string} csvText - Raw CSV text
 * @returns {{success: boolean, workout?: Object, errors: string[]}}
 */
export function parseImportedWorkout(csvText) {
  const errors = [];

  // Basic validation
  if (!csvText || typeof csvText !== 'string') {
    return { success: false, errors: ['Invalid or empty CSV input'] };
  }

  const trimmed = csvText.trim();
  if (!trimmed) {
    return { success: false, errors: ['Empty CSV - no workout actions defined'] };
  }

  // Parse CSV
  const parsedRows = parseCSV(trimmed);

  if (parsedRows.length === 0) {
    return { success: false, errors: ['CSV has no valid data rows (header-only or all lines skipped)'] };
  }

  // Collect all validation errors first
  const allErrors = [];
  const validRows = parsedRows.filter(({ row, rowNum }) => {
    const rowErrors = validateRow(row, rowNum);
    if (rowErrors.length > 0) {
      allErrors.push(...rowErrors);
      return false;
    }
    return true;
  });

  if (allErrors.length > 0) {
    return { success: false, errors: allErrors };
  }

  // Build workout object from valid rows
  // Group by workout_name to support multiple workouts in one CSV (future feature, for now single)
  const firstWorkoutName = validRows[0]?.row.workout_name?.trim() || 'Imported Workout';

  const queue = validRows.map(({ row }) => {
    const restType = parseRestType(row.rest_type) || 'normal';
    return {
      exId: row.exercise ? row.exercise.trim().toLowerCase().replace(/\s+/g, '-') + '-custom' : null,
      name: row.exercise?.trim() || 'Custom Exercise',
      description: row.exercise_description?.trim() || '',
      mode: parseMode(row.mode),
      round: row.round ? parseInt(row.round, 10) || 1 : 1,
      group: row.group ? parseInt(row.group, 10) || 1 : 1,
      unit: parseUnit(row.unit),
      value: parseInt(row.value, 10),
      restSeconds: restType === 'none' || restType === 'interval'
        ? (restType === 'none' ? 0 : null)
        : (row.rest_seconds ? parseInt(row.rest_seconds, 10) : 0),
      restType,
      isCustom: true,  // Mark as custom exercise
      equipment: 'bodyweight',  // Default for custom
    };
  });

  const firstRow = validRows[0]?.row || {};
  const firstRestType = parseRestType(firstRow.rest_type) || 'normal';
  const restConfig = firstRestType === 'interval'
    ? {
      type: 'interval',
      short: firstRow.rest_seconds ? parseInt(firstRow.rest_seconds, 10) : 0,
      long: parseInt(firstRow.long_rest_seconds, 10),
      longEvery: parseInt(firstRow.long_rest_every, 10),
    }
    : { type: 'none', short: 0, long: 0, longEvery: 0 };

  return {
    success: true,
    workout: {
      name: firstWorkoutName,
      description: validRows[0]?.row.description?.trim() || '',
      mode: queue[0]?.mode || 'focus',
      queue,
      restConfig,
    },
    errors: [],
  };
}

export function isRunnableImportedWorkout(result) {
  if (!result?.success || !result.workout?.queue?.length) return false;
  const modes = new Set(result.workout.queue.map((item) => item.mode));
  return modes.size === 1;
}

// ============ TEMPLATE GENERATION ============

/**
 * Generate a CSV template with examples and defaults
 * @param {Object} options - Template options
 * @param {string} options.defaultMode - Default mode for examples ('all' to include all modes)
 * @param {number} options.defaultRest - Default rest_seconds for examples
 * @param {string} options.defaultRestType - normal, interval, or none
 * @param {number} options.defaultLongRest - Long rest duration for interval examples
 * @param {number} options.defaultLongEvery - Number of actions between long rests
 * @returns {string} CSV text ready for download or editing
 */
export function generateTemplateCSV({ defaultMode = 'focus', defaultRest = 30, defaultRestType = 'normal', defaultLongRest = 90, defaultLongEvery = 3 } = {}) {
  const validModes = ['all', 'focus', 'circuit', 'superset', 'addon', 'manual'];
  const mode = validModes.includes(defaultMode) ? defaultMode : 'focus';
  const rest = Number(defaultRest) >= 0 ? defaultRest : 30;
  const restType = ['normal', 'interval', 'none'].includes(defaultRestType) ? defaultRestType : 'normal';
  const longRest = Number(defaultLongRest) > 0 ? defaultLongRest : 90;
  const longEvery = Number(defaultLongEvery) > 0 ? defaultLongEvery : 3;
  const restFields = (seconds = rest) => {
    if (restType === 'none') return '0,none,,';
    if (restType === 'interval') return `${seconds},interval,${longRest},${longEvery}`;
    return `${seconds},normal,,`;
  };
  const fields = (seconds) => restFields(seconds);

  // Determine which modes to include in examples
  const includeAllModes = mode === 'all';

  // Mode-specific workout names for coherent templates
  const modeWorkoutNames = {
    'focus': 'My Focus Workout',
    'circuit': 'My Circuit Workout',
    'superset': 'My Superset Workout',
    'addon': 'My Add-on Workout',
    'manual': 'My Manual Workout'
  };

  // Generate mode-specific coherent templates
  const generateFocusTemplate = () => [
    '',
    '# EXAMPLE FOCUS WORKOUT - strength and endurance focus',
    `${modeWorkoutNames.focus},focus on strength and core,focus,1,1,Push-up,Standard bodyweight push-up,reps,10,${fields()}`,
    `${modeWorkoutNames.focus},,focus,1,2,Plank,Core hold,sec,45,${fields(15)}`,
    `${modeWorkoutNames.focus},,focus,1,3,Dumbbell Curl,Bicep focus,reps,12,${fields()}`,
    `${modeWorkoutNames.focus},,focus,1,4,Squat,Leg focus,reps,15,${fields(15)}`
  ];

  const generateCircuitTemplate = () => [
    '',
    '# EXAMPLE CIRCUIT WORKOUT - repeat circuit rounds',
    `${modeWorkoutNames.circuit},full body circuit,circuit,1,1,Goblet Squat,Round one exercise one,reps,10,${fields(20)}`,
    `${modeWorkoutNames.circuit},,circuit,1,2,Push-up,Round one exercise two,reps,8,${fields(20)}`,
    `${modeWorkoutNames.circuit},,circuit,1,3,Dumbbell Row,Round one exercise three,reps,10,${fields(20)}`,
    `${modeWorkoutNames.circuit},,circuit,2,1,Goblet Squat,Round two repeats order,reps,10,${fields(20)}`,
    `${modeWorkoutNames.circuit},,circuit,2,2,Push-up,Round two continues,reps,8,${fields(20)}`,
    `${modeWorkoutNames.circuit},,circuit,2,3,Dumbbell Row,Round two completes,reps,10,${fields(20)}`
  ];

  const generateSupersetTemplate = () => [
    '',
    '# EXAMPLE SUPERSET WORKOUT - paired exercises in same group',
    `${modeWorkoutNames.superset},upper body supersets,superset,1,1,Push-up,Superset pair A,reps,10,${fields(0)}`,
    `${modeWorkoutNames.superset},,superset,1,1,Dumbbell Row,Superset pair B - rest after pair,reps,10,${fields(30)}`,
    `${modeWorkoutNames.superset},,superset,1,2,Overhead Press,Superset pair C,reps,8,${fields(0)}`,
    `${modeWorkoutNames.superset},,superset,1,2,Face Pull,Superset pair D - rest after pair,reps,12,${fields(30)}`
  ];

  const generateAddonTemplate = () => [
    '',
    '# EXAMPLE ADD-ON WORKOUT - progressive rounds, one action at a time',
    `${modeWorkoutNames.addon},progressive add-on structure,addon,1,1,Squat,Round one single action,reps,12,${fields(15)}`,
    `${modeWorkoutNames.addon},,addon,2,1,Squat,Round two repeats and adds,reps,12,${fields(0)}`,
    `${modeWorkoutNames.addon},,addon,2,2,Plank,Round two new exercise,sec,30,${fields(30)}`,
    `${modeWorkoutNames.addon},,addon,3,1,Squat,Round three repeats existing,reps,12,${fields(0)}`,
    `${modeWorkoutNames.addon},,addon,3,2,Plank,Round three existing,sec,30,${fields(0)}`,
    `${modeWorkoutNames.addon},,addon,3,3,Glute Bridge,Round three new exercise,reps,15,${fields(30)}`
  ];

  const generateManualTemplate = () => [
    '',
    '# EXAMPLE MANUAL WORKOUT - exact order, one round',
    `${modeWorkoutNames.manual},custom order manual,manual,1,1,Push-up,First in exact order,reps,8,${fields(20)}`,
    `${modeWorkoutNames.manual},,manual,1,2,Dumbbell Row,Second in exact order,reps,10,${fields(15)}`,
    `${modeWorkoutNames.manual},,manual,1,3,Squat,Third in exact order,reps,12,${fields(0)}`,
    `${modeWorkoutNames.manual},,manual,1,4,Plank,Last in exact order,sec,45,${fields(30)}`
  ];

  const lines = [
    // Header row
    'workout_name,description,mode,round,group,exercise,exercise_description,unit,value,rest_seconds,rest_type,long_rest_seconds,long_rest_every',
    '',
    // Help comments
    '# INSTRUCTIONS',
    '- Edit the fields below with your workout details',
    '- Each row = one exercise/action in your workout',
    '- Required fields: workout_name, mode, exercise, unit, value',
    `- mode: ${includeAllModes ? 'focus, circuit, superset, addon, or manual (examples shown for each mode)' : mode}`,
    '- unit: reps (repetitions) or sec (seconds/timer)',
    '- value: positive whole number',
    '- rest_seconds: normal rest after this action, in seconds',
    '- rest_type: normal (default), interval (normal plus periodic long rest), long, or none',
    '- interval also requires long_rest_seconds and long_rest_every on each row',
    '- Only long rests appear in Up Next during active workouts',
    '- round and group: control workout structure and ordering',
    '',
    includeAllModes ? '# EXAMPLE WORKOUTS FOR ALL MODES (review each section)' : '# YOUR WORKOUT'
  ];

  // Add mode-specific content
  if (includeAllModes) {
    // All mode: include examples for all modes (reference template)
    lines.push(...generateFocusTemplate(), ...generateCircuitTemplate(), ...generateSupersetTemplate(), ...generateAddonTemplate(), ...generateManualTemplate());
  } else {
    // Specific mode: only that mode's coherent template
    switch (mode) {
      case 'focus':
        lines.push(...generateFocusTemplate());
        break;
      case 'circuit':
        lines.push(...generateCircuitTemplate());
        break;
      case 'superset':
        lines.push(...generateSupersetTemplate());
        break;
      case 'addon':
        lines.push(...generateAddonTemplate());
        break;
      case 'manual':
        lines.push(...generateManualTemplate());
        break;
    }
  }

  return lines.join('\n');
}
