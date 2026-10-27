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
 * @returns {string|null} The normalized rest type ('normal', 'long') or null if invalid/missing
 */
export function parseRestType(typeStr) {
  if (typeStr === undefined || typeStr === null || typeof typeStr !== 'string') return null;
  const normalized = typeStr.trim().toLowerCase();
  if (normalized === '' || normalized === 'normal') return 'normal';
  if (normalized === 'long') return 'long';
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
      errors.push(`Row ${rowNum}: Invalid rest_type '${row.rest_type}'. Valid types: normal, long`);
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
    return {
      exId: row.exercise ? row.exercise.trim().toLowerCase().replace(/\s+/g, '-') + '-custom' : null,
      name: row.exercise?.trim() || 'Custom Exercise',
      description: row.exercise_description?.trim() || '',
      mode: parseMode(row.mode),
      round: row.round ? parseInt(row.round, 10) || 1 : 1,
      group: row.group ? parseInt(row.group, 10) || 1 : 1,
      unit: parseUnit(row.unit),
      value: parseInt(row.value, 10),
      restSeconds: row.rest_seconds ? parseInt(row.rest_seconds, 10) : 0,
      restType: parseRestType(row.rest_type) || 'normal',  // default to normal rest
      isCustom: true,  // Mark as custom exercise
      equipment: 'bodyweight',  // Default for custom
    };
  });

  return {
    success: true,
    workout: {
      name: firstWorkoutName,
      description: validRows[0]?.row.description?.trim() || '',
      mode: queue[0]?.mode || 'focus',
      queue,
    },
    errors: [],
  };
}

// ============ TEMPLATE GENERATION ============

/**
 * Generate a CSV template with examples and defaults
 * @param {Object} options - Template options
 * @param {string} options.defaultMode - Default mode for examples
 * @param {number} options.defaultRest - Default rest_seconds for examples
 * @returns {string} CSV text ready for download or editing
 */
export function generateTemplateCSV({ defaultMode = 'focus', defaultRest = 30 } = {}) {
  const validModes = ['focus', 'circuit', 'superset', 'addon', 'manual'];
  const mode = validModes.includes(defaultMode) ? defaultMode : 'focus';
  const rest = Number(defaultRest) >= 0 ? defaultRest : 30;

  const lines = [
    // Header row
    'workout_name,description,mode,round,group,exercise,exercise_description,unit,value,rest_seconds,rest_type',
    '',
    // Help comments
    '# INSTRUCTIONS',
    '- Edit the fields below with your workout details',
    '- Each row = one exercise/action in your workout',
    '- Required fields: workout_name, mode, exercise, unit, value',
    '- mode: focus, circuit, superset, addon, or manual',
    '- unit: reps (repetitions) or sec (seconds/timer)',
    '- value: positive whole number',
    '- rest_seconds (optional): rest after this action, in seconds',
    '- rest_type (optional): normal (default) or long. Only long rests appear in Up Next during active workouts.',
    '- round and group: control workout structure and ordering',
    '',
    '# EXAMPLE WORKOUT - rep-based',
    `My ${mode === 'focus' ? 'Strength' : 'Circuit'} Workout,${mode} day workout,${mode},1,1,Push-up,Standard bodyweight push-up,reps,10,${rest},normal`,
    `My ${mode} Workout,,${mode},1,2,Dumbbell Curl,Dumbbell bicep curl,reps,12,${rest},normal`,
    `My ${mode} Workout,,${mode},1,3,Squat,Bodyweight squat,reps,15,${rest},normal`,
    '',
    '# EXAMPLE WORKOUT - timed/countdown',
    `Timed Core,basic core circuit,circuit,1,1,Plank,Core hold exercise,sec,60,15,normal`,
    `Timed Core,,circuit,1,2,Mountain Climber,Dynamic core movement,sec,45,15,normal`,
    `Timed Core,,circuit,1,3,Dead Bug,Core stability,sec,30,15,normal`,
    '',
    '# EXAMPLE ACTIONS - for circuits/supersets (with periodic long rest)',
    `Full Body,circuit workout,circuit,1,1,Goblet Squat,Goblet style squat,reps,10,20,normal`,
    `Full Body,,circuit,1,2,Push-up,Chest and triceps,reps,8,20,normal`,
    `Full Body,,circuit,1,3,Dumbbell Row,Back exercise,reps,10,20,normal`,
    `Full Body,,circuit,2,1,Goblet Squat,Goblet style squat,reps,10,20,normal`,
    `Full Body,,circuit,2,2,Push-up,Chest and triceps,reps,8,20,normal`,
    `Full Body,,circuit,2,3,Dumbbell Row,Back exercise,reps,10,90,long`,
    '',
    '# EXAMPLE SUPERSET',
    `Superset Demo,,superset,1,1,Push-up,First exercise,reps,10,0,normal`,
    `Superset Demo,,superset,1,1,Dumbbell Row,Second exercise,reps,10,30,normal`,
    '',
    '# EXAMPLE ADD-ON',
    `Add-on Demo,,addon,1,1,Squat,Round one,reps,12,15,normal`,
    `Add-on Demo,,addon,2,1,Squat,Round two existing exercise,reps,12,0,normal`,
    `Add-on Demo,,addon,2,2,Plank,Round two added exercise,sec,30,30,normal`,
    '',
    '# EXAMPLE MANUAL ORDER',
    `Manual Demo,,manual,1,1,Push-up,First in exact order,reps,8,20,normal`,
    `Manual Demo,,manual,1,2,Plank,Second in exact order,sec,30,0,normal`,
  ];

  return lines.join('\n');
}
