import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight, Play, SkipForward, SkipBack, Check, Plus, Minus, X, Dumbbell, Hexagon, GripVertical, History, Shuffle, Target, Layers, TrendingUp, Info, Weight, ArrowUpToLine, Star, Settings, Palette, Trash2, Pencil, Smartphone, ExternalLink, Image as ImageIcon, Mail, Copy } from 'lucide-react';
import WORKOUT_EXERCISE_LIBRARY_CSV from '../support files/workout_exercise_library.csv?raw';
import IOS_HOME_SCREEN_GIF from '../support files/Images/ios_how_to_add_to_homescreen.gif';

// ============ EQUIPMENT TAGS ============
const EQUIP = {
  bodyweight: { key: 'bodyweight', label: 'BW', color: '#888', name: 'BODYWEIGHT' },
  weights: { key: 'weights', label: 'WT', color: '#FF4D8F', icon: Weight, name: 'DUMBBELL' },
  pullup: { key: 'pullup', label: 'BAR', color: '#7C5CFF', icon: ArrowUpToLine, name: 'BAR' },
};

// ============ DEFAULT EXERCISE LIBRARY ============
const CSV_BODY_SECTION_TO_CATEGORY = {
  Upper: 'upper',
  Lower: 'lower',
  Core: 'core',
};

const CSV_EQUIPMENT_TO_KEY = {
  BW: 'bodyweight',
  WT: 'weights',
  BAR: 'pullup',
};

const EQUIPMENT_RENDER_ORDER = ['bodyweight', 'weights', 'pullup'];
const EQUIPMENT_ADVANCED_LABELS = {
  bodyweight: 'BODY WEIGHT',
  weights: 'DUMBBELL',
  pullup: 'BAR',
};
const CATEGORY_ADVANCED_LABELS = {
  upper: 'UPPER BODY',
  lower: 'LOWER BODY',
  core: 'CORE',
};

const LEGACY_EXERCISE_IDS_BY_KEY = {
  [exerciseLookupKey('upper', 'bodyweight', 'Push-up')]: 'u1',
  [exerciseLookupKey('upper', 'bodyweight', 'Diamond Push-up')]: 'u2',
  [exerciseLookupKey('upper', 'bodyweight', 'Pike Push-up')]: 'u3',
  [exerciseLookupKey('upper', 'bodyweight', 'Decline Push-up')]: 'u4',
  [exerciseLookupKey('upper', 'bodyweight', 'Wide Push-up')]: 'u5',
  [exerciseLookupKey('upper', 'bodyweight', 'Bench Dip')]: 'u6',
  [exerciseLookupKey('upper', 'bodyweight', 'Shoulder Taps')]: 'u7',
  [exerciseLookupKey('upper', 'bodyweight', 'Pseudo Planche Push-up')]: 'u8',
  [exerciseLookupKey('upper', 'bodyweight', 'Archer Push-up')]: 'u9',
  [exerciseLookupKey('upper', 'bodyweight', 'Plank to Push-up')]: 'u10',
  [exerciseLookupKey('upper', 'weights', 'Dumbbell Curl')]: 'u-w1',
  [exerciseLookupKey('upper', 'weights', 'Hammer Curl')]: 'u-w2',
  [exerciseLookupKey('upper', 'weights', 'Overhead Press')]: 'u-w3',
  [exerciseLookupKey('upper', 'weights', 'Lateral Raise')]: 'u-w4',
  [exerciseLookupKey('upper', 'weights', 'Front Raise')]: 'u-w5',
  [exerciseLookupKey('upper', 'weights', 'Bent-Over Row')]: 'u-w6',
  [exerciseLookupKey('upper', 'weights', 'Single-Arm Row')]: 'u-w7',
  [exerciseLookupKey('upper', 'weights', 'Tricep Kickback')]: 'u-w8',
  [exerciseLookupKey('upper', 'weights', 'Dumbbell Floor Press')]: 'u-w9',
  [exerciseLookupKey('upper', 'weights', 'Upright Row')]: 'u-w10',
  [exerciseLookupKey('upper', 'weights', 'Arnold Press')]: 'u-w11',
  [exerciseLookupKey('upper', 'weights', 'Renegade Row')]: 'u-w12',
  [exerciseLookupKey('upper', 'pullup', 'Pull-up')]: 'u-p1',
  [exerciseLookupKey('upper', 'pullup', 'Chin-up')]: 'u-p2',
  [exerciseLookupKey('upper', 'pullup', 'Wide-Grip Pull-up')]: 'u-p3',
  [exerciseLookupKey('upper', 'pullup', 'Commando Pull-up')]: 'u-p4',
  [exerciseLookupKey('upper', 'pullup', 'Dead Hang')]: 'u-p5',
  [exerciseLookupKey('upper', 'pullup', 'Negative Pull-up')]: 'u-p6',
  [exerciseLookupKey('upper', 'pullup', 'Scapular Pull-up')]: 'u-p7',
  [exerciseLookupKey('upper', 'pullup', 'Archer Pull-up')]: 'u-p8',
  [exerciseLookupKey('lower', 'bodyweight', 'Bodyweight Squat')]: 'l1',
  [exerciseLookupKey('lower', 'bodyweight', 'Lunge')]: 'l2',
  [exerciseLookupKey('lower', 'bodyweight', 'Reverse Lunge')]: 'l3',
  [exerciseLookupKey('lower', 'bodyweight', 'Bulgarian Split Squat')]: 'l4',
  [exerciseLookupKey('lower', 'bodyweight', 'Jump Squat')]: 'l5',
  [exerciseLookupKey('lower', 'bodyweight', 'Pistol Squat')]: 'l6',
  [exerciseLookupKey('lower', 'bodyweight', 'Calf Raise')]: 'l7',
  [exerciseLookupKey('lower', 'bodyweight', 'Wall Sit')]: 'l8',
  [exerciseLookupKey('lower', 'bodyweight', 'Glute Bridge')]: 'l9',
  [exerciseLookupKey('lower', 'bodyweight', 'Single-Leg Glute Bridge')]: 'l10',
  [exerciseLookupKey('lower', 'bodyweight', 'Step-up')]: 'l11',
  [exerciseLookupKey('lower', 'bodyweight', 'Curtsy Lunge')]: 'l12',
  [exerciseLookupKey('lower', 'bodyweight', 'Broad Jump')]: 'l13',
  [exerciseLookupKey('lower', 'weights', 'Goblet Squat')]: 'l-w1',
  [exerciseLookupKey('lower', 'weights', 'Weighted Lunge')]: 'l-w2',
  [exerciseLookupKey('lower', 'weights', 'Dumbbell Romanian Deadlift')]: 'l-w3',
  [exerciseLookupKey('lower', 'weights', 'Sumo Deadlift')]: 'l-w4',
  [exerciseLookupKey('lower', 'weights', 'Dumbbell Step-up')]: 'l-w5',
  [exerciseLookupKey('lower', 'weights', 'Weighted Calf Raise')]: 'l-w6',
  [exerciseLookupKey('lower', 'weights', 'Weighted Bulgarian Split Squat')]: 'l-w7',
  [exerciseLookupKey('lower', 'weights', 'Farmer Carry')]: 'l-w8',
  [exerciseLookupKey('lower', 'weights', 'Kettlebell Swing')]: 'l-w9',
  [exerciseLookupKey('lower', 'weights', 'Dumbbell Front Squat')]: 'l-w10',
  [exerciseLookupKey('core', 'bodyweight', 'Plank')]: 'c1',
  [exerciseLookupKey('core', 'bodyweight', 'Side Plank')]: 'c2',
  [exerciseLookupKey('core', 'bodyweight', 'Sit-up')]: 'c3',
  [exerciseLookupKey('core', 'bodyweight', 'Crunch')]: 'c4',
  [exerciseLookupKey('core', 'bodyweight', 'Russian Twist')]: 'c5',
  [exerciseLookupKey('core', 'bodyweight', 'Leg Raise')]: 'c6',
  [exerciseLookupKey('core', 'bodyweight', 'Mountain Climber')]: 'c7',
  [exerciseLookupKey('core', 'bodyweight', 'Dead Bug')]: 'c8',
  [exerciseLookupKey('core', 'bodyweight', 'Hollow Body Hold')]: 'c9',
  [exerciseLookupKey('core', 'bodyweight', 'Bicycle Crunch')]: 'c10',
  [exerciseLookupKey('core', 'bodyweight', 'Flutter Kick')]: 'c11',
  [exerciseLookupKey('core', 'bodyweight', 'V-up')]: 'c12',
  [exerciseLookupKey('core', 'bodyweight', 'Bird Dog')]: 'c13',
  [exerciseLookupKey('core', 'bodyweight', 'Superman')]: 'c14',
  [exerciseLookupKey('core', 'weights', 'Weighted Russian Twist')]: 'c-w1',
  [exerciseLookupKey('core', 'weights', 'Weighted Sit-up')]: 'c-w2',
  [exerciseLookupKey('core', 'weights', 'Turkish Get-up')]: 'c-w3',
  [exerciseLookupKey('core', 'weights', 'Weighted Plank')]: 'c-w4',
  [exerciseLookupKey('core', 'weights', 'Woodchopper')]: 'c-w5',
  [exerciseLookupKey('core', 'weights', 'Suitcase Carry')]: 'c-w6',
  [exerciseLookupKey('core', 'pullup', 'Hanging Knee Raise')]: 'c-p1',
  [exerciseLookupKey('core', 'pullup', 'Hanging Leg Raise')]: 'c-p2',
  [exerciseLookupKey('core', 'pullup', 'Toes-to-Bar')]: 'c-p3',
  [exerciseLookupKey('core', 'pullup', 'L-Sit Hang/L-Sit')]: 'c-p4',
  [exerciseLookupKey('core', 'pullup', 'Windshield Wiper')]: 'c-p5',
};

const DEFAULT_EXERCISES = buildDefaultExerciseLibrary(WORKOUT_EXERCISE_LIBRARY_CSV);

const CATEGORIES = [
  { key: 'upper', label: 'UPPER', icon: Dumbbell, color: 'var(--accent)' },
  { key: 'lower', label: 'LOWER', icon: TrendingUp, color: 'var(--favorite)' },
  { key: 'core', label: 'CORE', icon: Hexagon, color: 'var(--accent2)' },
];

const MODIFIERS = [
  { key: 'weights', label: 'DUMBBELL', icon: Weight, color: '#FF4D8F', desc: 'Unlock dumbbell and kettlebell variants' },
  { key: 'pullup', label: 'BAR', icon: ArrowUpToLine, color: '#7C5CFF', desc: 'Unlock pull-up, hanging, and barbell variants' },
];

const MODES = [
  { key: 'focus', label: 'FOCUS SETS', desc: 'Complete all sets of one exercise before moving on', icon: Target },
  { key: 'circuit', label: 'CIRCUIT', desc: 'Cycle through every exercise, then repeat rounds', icon: Shuffle },
  { key: 'superset', label: 'SUPERSETS', desc: 'Group 2-10 exercises, repeat each group, then next', icon: Layers },
  { key: 'addon', label: 'ADD-ON', desc: 'Add one exercise each round until all are included', icon: Plus },
  { key: 'manual', label: 'MANUAL', desc: 'Hand-pick the exact order and repetitions', icon: GripVertical },
];

const MODE_LABELS = MODES.reduce((acc, m) => ({ ...acc, [m.key]: m.label }), {});
const IOS_CUSTOM_ICON_SHORTCUT_URL = 'https://www.icloud.com/shortcuts/bda50f91bc534d649c495f6999fb9cc2';
const FEEDBACK_EMAIL_ADDRESS = 'seat_peppery.1v@icloud.com';
const DEFAULT_SETTINGS = {
  rememberSectionState: true,
  homeScreenPromptSeen: false,
};
const HOME_RECENT_LIMIT = 5;
const HOME_RECENT_LOOKBACK_MS = 3 * 24 * 60 * 60 * 1000;
const RAINBOW_MODE_STORAGE_KEY = 'rainbowModeActive';
const RAINBOW_TAP_THRESHOLD = 20;
const RAINBOW_TAP_RESET_MS = 2500;
const RAINBOW_MESSAGE_SEQUENCE_DELAY_MS = 2600;
const RAINBOW_MODE_THEME_COLOR = '#7C5CFF';
const RAINBOW_ACTIVATION_MESSAGE = 'Kikis, this is for you';
const RAINBOW_ACTIVATED_MESSAGE = 'RAINBOW MODE ACTIVATED';
const RAINBOW_DEACTIVATION_MESSAGE = 'rainbow mode deactivated';
const RAINBOW_MODE_UI_PALETTE = {
  id: 'rainbow-mode-ui',
  name: 'Rainbow Mode UI',
  bg: '#070716',
  surface: '#111136',
  fg: '#FFFFFF',
  accent: '#00F5FF',
  accent2: '#FF38D8',
  warn: '#FF3D8F',
};
const RAINBOW_ACCENT_COLORS = ['#00F5FF', '#B6FF00', '#FFE600', '#FF6FD8', '#FF9F1C', '#73FFF2'];
const RAINBOW_ACCENT_PULSE_MS = 1050;
const RAINBOW_CONFETTI_COLORS = [
  '#FF1744', '#FF6D00', '#FFD600', '#76FF03', '#00E676', '#00E5FF',
  '#2979FF', '#651FFF', '#D500F9', '#FF2EA6', '#FFFFFF', '#FFE600',
];
const RAINBOW_CONFETTI_REPEL_RADIUS_PX = 255;
const RAINBOW_CONFETTI_REPEL_FORCE_PX = 82;
const RAINBOW_CONFETTI_REPEL_IDLE_MS = 650;
const RAINBOW_CONFETTI_COUNT = 68;
const RAINBOW_CONFETTI_PIECES = Array.from({ length: RAINBOW_CONFETTI_COUNT }, (_, index) => {
  const driftDirection = index % 2 === 0 ? 1 : -1;
  const driftX = driftDirection * (16 + (index % 7) * 7);
  const driftY = 34 + (index % 8) * 9;
  const rotation = (index * 47) % 360;
  const width = 5 + (index % 4) * 2;
  const shape = index % 5 === 0 ? 'dot' : index % 3 === 0 ? 'ribbon' : 'rect';
  const height = shape === 'dot' ? width : shape === 'ribbon' ? width * 3.1 : width * 1.9;
  const duration = 18 + (index % 9) * 2;

  return {
    color: RAINBOW_CONFETTI_COLORS[index % RAINBOW_CONFETTI_COLORS.length],
    x: (index * 19 + (index % 6) * 11) % 104 - 2,
    y: (index * 29 + (index % 5) * 13) % 116 - 8,
    width,
    height,
    shape,
    driftX,
    driftY,
    endX: driftX * -0.35,
    endY: driftY + 30,
    rotation,
    midRotation: rotation + 160 + (index % 4) * 28,
    endRotation: rotation + 340 + (index % 5) * 32,
    duration,
    delay: -((index * 1.65) % duration),
    opacity: 0.34 + (index % 5) * 0.07,
  };
});
const RAINBOW_CONFETTI_REST_REPEL = RAINBOW_CONFETTI_PIECES.map(() => ({ x: 0, y: 0, rotation: 0 }));

const APP_VERSION = '2.40';

const APP_VERSION_HISTORY = [
  {
    version: '2.40',
    date: '2026-04-26',
    type: 'UI',
    changes: [
      'Made Favorites drag reordering show a full-row replacement target highlight instead of only a divider line.',
      'Matched the Format step exercise-order drag target styling to the clearer full-row outline and glow.',
    ],
  },
  {
    version: '2.39',
    date: '2026-04-26',
    type: 'Feature / Bug fix',
    changes: [
      'Added a Settings feedback and issues panel with email launch and copy-email actions.',
      'Stabilized Rainbow Mode rendering by keeping root backgrounds static and moving the animated rainbow to a single fixed background layer.',
    ],
  },
  {
    version: '2.38',
    date: '2026-04-26',
    type: 'Bug fix',
    changes: [
      'Prevented Settings and favorite naming modals from closing due to backdrop taps or mobile viewport retargeting.',
    ],
  },
  {
    version: '2.37',
    date: '2026-04-26',
    type: 'UI / Maintenance',
    changes: [
      'Added a Rainbow Mode primary-accent pulse that cycles through vibrant readable party colors.',
      'Updated the release workflow so local commits are summarized into one version-history entry when pushed.',
    ],
  },
  {
    version: '2.36',
    date: '2026-04-26',
    type: 'Feature / UI',
    changes: [
      'Added Rainbow Mode, activated by a hidden secret action and kept separate from the selected color palette.',
      'Added a full-spectrum animated background, vibrant readable Rainbow Mode UI colors, activation and deactivation messages, and floating confetti with pointer and touch repulsion.',
    ],
  },
  {
    version: '2.26',
    date: '2026-04-26',
    type: 'UI',
    changes: [
      'Removed the active color palette card glow and returned the highlight to a static double stroke.',
    ],
  },
  {
    version: '2.25',
    date: '2026-04-26',
    type: 'UI',
    changes: [
      'Made the active color palette card glow smoother and more visible.',
    ],
  },
  {
    version: '2.24',
    date: '2026-04-26',
    type: 'UI',
    changes: [
      'Added a subtle pulsing glow to the active color palette card highlight.',
    ],
  },
  {
    version: '2.23',
    date: '2026-04-26',
    type: 'Bug fix / UI',
    changes: [
      'Made each color preset and custom palette card a single full-card touch target.',
      'Added a separated double-stroke active palette highlight that stays inside each card slot.',
    ],
  },
  {
    version: '2.22',
    date: '2026-04-26',
    type: 'Bug fix / UI',
    changes: [
      'Restored palette background colors across the app, document, root, mobile theme color, and safe-area overscroll areas.',
      'Added palette-derived surfaces, borders, muted text, and readable action text so preset and custom schemes stay legible.',
      'Fixed translucent chip and border colors that were invalid when their source color came from a CSS variable.',
    ],
  },
  {
    version: '2.21',
    date: '2026-04-25',
    type: 'Feature / UI',
    changes: [
      'Added a one-time mobile iOS Home Screen setup prompt that points users to Settings.',
      'Saved the prompt dismissed state in app settings so it only appears once.',
    ],
  },
  {
    version: '2.20',
    date: '2026-04-25',
    type: 'Feature / UI',
    changes: [
      'Changed Home Favorites and Recent sections to show five-item previews with Show All shortcuts.',
      'Moved favorite reordering into the full Favorites screen and added favorite rename and delete confirmation controls.',
    ],
  },
  {
    version: '2.19',
    date: '2026-04-25',
    type: 'Feature',
    changes: [
      'Added drag reordering for saved favorites from the Home favorites dropdown and Favorites screen.',
      'Changed newly saved favorites to appear at the bottom of the favorites list by default.',
    ],
  },
  {
    version: '2.18',
    date: '2026-04-25',
    type: 'Feature / UI',
    changes: [
      'Added an iOS Home Screen install guide in Settings with the animated walkthrough GIF.',
      'Added advanced custom Home Screen icon instructions for the iOS Shortcut workflow.',
    ],
  },
  {
    version: '2.17',
    date: '2026-04-25',
    type: 'Feature',
    changes: [
      'Saved quit workouts as partial history entries that can be continued or restarted from History.',
      'Kept partial workouts out of the Home recent-completed list and updated matching partial entries instead of duplicating them.',
    ],
  },
  {
    version: '2.16',
    date: '2026-04-25',
    type: 'UI',
    changes: [
      'Renamed grouped exercise variant controls from Advanced to Alternatives while keeping standalone advanced bucket labels unchanged.',
    ],
  },
  {
    version: '2.15',
    date: '2026-04-25',
    type: 'Maintenance',
    changes: [
      'Refreshed default exercise library source metadata from the support CSV.',
    ],
  },
  {
    version: '2.14',
    date: '2026-04-25',
    type: 'Maintenance',
    changes: [
      'Updated the default exercise library from the support CSV.',
      'Kept saved custom exercises while honoring CSV removals during library hydration.',
    ],
  },
  {
    version: '2.13',
    date: '2026-04-25',
    type: 'Feature / UI',
    changes: [
      'Added Show All Advanced and Hide All Advanced controls beside each category random picker.',
      'Made the category-level advanced toggle expand or collapse all available advanced groups for that section.',
    ],
  },
  {
    version: '2.12',
    date: '2026-04-25',
    type: 'Feature / UI',
    changes: [
      'Changed exercise info buttons to open an in-app description window with Back and More Details actions.',
      'Loaded exercise descriptions from the support CSV and carried them into workout queues.',
    ],
  },
  {
    version: '2.11',
    date: '2026-04-25',
    type: 'UI',
    changes: [
      'Changed standalone advanced section hide buttons to keep the Advanced label when expanded.',
    ],
  },
  {
    version: '2.10',
    date: '2026-04-25',
    type: 'UI',
    changes: [
      'Gave exercises revealed by Advanced controls a lighter row background so their dropdown association is clearer.',
    ],
  },
  {
    version: '2.9',
    date: '2026-04-24',
    type: 'Feature',
    changes: [
      'Loaded the expanded exercise library from the support CSV while preserving saved custom exercises.',
      'Added Advanced and Hide controls for grouped variants and standalone advanced exercises by section and equipment.',
      'Added source info buttons in exercise selection, setup details, workout info, and active workouts.',
    ],
  },
  {
    version: '2.8',
    date: '2026-04-24',
    type: 'Feature / workflow',
    changes: [
      'Added Continue Workout and Start Over choices after editing a current workout rest settings.',
      'Kept Continue Workout on the current workout position with elapsed time preserved, while Start Over rebuilds from the beginning.',
    ],
  },
  {
    version: '2.7',
    date: '2026-04-24',
    type: 'UI',
    changes: [
      'Kept up-next reps and long-rest times close to workout names on wide screens.',
      'Aligned up-next values in a compact fixed column across the preview rows.',
    ],
  },
  {
    version: '2.6',
    date: '2026-04-24',
    type: 'Feature / UI',
    changes: [
      'Expanded the active workout upcoming preview to show as many smaller upcoming items as fit below the primary up-next card.',
      'Showed the smaller upcoming preview during exercises, short rests, and long rests, including long-rest markers while omitting short rests.',
    ],
  },
  {
    version: '2.5',
    date: '2026-04-24',
    type: 'UI / mobile',
    changes: [
      'Enlarged active workout exercise details on wide desktop screens while keeping the main action controls unchanged.',
      'Added safe-area-aware top spacing so mobile headers avoid notched iPhone status areas.',
    ],
  },
  {
    version: '2.4',
    date: '2026-04-24',
    type: 'Bug fix / mobile',
    changes: [
      'Changed app screen containers from static viewport height to dynamic viewport height on mobile.',
      'Prevented short pages from becoming slightly taller than the visible iPhone screen.',
    ],
  },
  {
    version: '2.3',
    date: '2026-04-24',
    type: 'UI / mobile',
    changes: [
      'Matched the document, root, and mobile overscroll backgrounds to the app background.',
      'Reduced white safe-area and bounce-scroll flashes around the app on mobile browsers.',
    ],
  },
  {
    version: '2.2',
    date: '2026-04-24',
    type: 'Bug fix',
    changes: [
      'Prevented saved history, favorites, rest settings, and custom exercises from being overwritten during app startup.',
      'Kept persisted workout data intact across page refreshes and reloads.',
    ],
  },
  {
    version: '2.1',
    date: '2026-04-24',
    type: 'Feature / workflow',
    changes: [
      'Added app version history in Settings.',
      'Changed the home header version display to show only the app version.',
      'Documented the version bump and history-entry requirement for future changes.',
    ],
  },
];

const SAFE_TOP_16 = 'calc(16px + env(safe-area-inset-top, 0px))';
const SAFE_TOP_20 = 'calc(20px + env(safe-area-inset-top, 0px))';
const SAFE_TOP_24 = 'calc(24px + env(safe-area-inset-top, 0px))';
const UPCOMING_PREVIEW_GAP = 6;
const UPCOMING_PREVIEW_ROW_HEIGHT = 26;
const UPCOMING_TAG_COL_WIDTH = '34px';
const UPCOMING_NAME_COL_WIDTH = 'clamp(140px, 24vw, 300px)';
const UPCOMING_VALUE_COL_WIDTH = '70px';

// ============ COLOR PALETTES ============
// Each palette defines 6 key colors that get applied as CSS variables across the app.
// - bg:      main background
// - surface: card/panel background
// - fg:      primary text color
// - accent:  primary action / branding accent
// - accent2: secondary accent (used for "start workout", rest timer, success)
// - warn:    tertiary accent (weight tags, hot moments)
const PALETTES = [
  { id: 'grind',     name: 'GRIND',      bg: '#0A0A0A', surface: '#121212', fg: '#F5F1E8', accent: '#FF4D2E', accent2: '#00D9B2', warn: '#FF4D8F' },
  { id: 'midnight',  name: 'MIDNIGHT',   bg: '#0B0F1A', surface: '#141A2B', fg: '#E8EEFF', accent: '#5C8AFF', accent2: '#7C5CFF', warn: '#FF6B9D' },
  { id: 'blood',     name: 'BLOOD',      bg: '#0F0506', surface: '#1A0A0C', fg: '#F5E6E8', accent: '#E63946', accent2: '#F77F00', warn: '#FFCA3A' },
  { id: 'forest',    name: 'FOREST',     bg: '#0A1410', surface: '#122019', fg: '#E8F5E9', accent: '#52B788', accent2: '#D4A373', warn: '#E63946' },
  { id: 'concrete',  name: 'CONCRETE',   bg: '#1A1A1A', surface: '#242424', fg: '#E0E0E0', accent: '#FFAB40', accent2: '#40C4FF', warn: '#FF5252' },
  { id: 'sunset',    name: 'SUNSET',     bg: '#1A0B1F', surface: '#2A1433', fg: '#FFF0E8', accent: '#FF6B35', accent2: '#FFD23F', warn: '#EE4266' },
  { id: 'arctic',    name: 'ARCTIC',     bg: '#0E1419', surface: '#172026', fg: '#EAF4FB', accent: '#64DFDF', accent2: '#80FFDB', warn: '#FF8FA3' },
  { id: 'paper',     name: 'PAPER',      bg: '#F5F1E8', surface: '#EDE8DC', fg: '#1A1A1A', accent: '#C1272D', accent2: '#2E5EAA', warn: '#E67E22' },
  { id: 'neon',      name: 'NEON',       bg: '#060012', surface: '#100022', fg: '#EEE9FF', accent: '#FF00A8', accent2: '#00F0FF', warn: '#FFFC00' },
  { id: 'mono',      name: 'MONO',       bg: '#0A0A0A', surface: '#181818', fg: '#F5F5F5', accent: '#FFFFFF', accent2: '#AAAAAA', warn: '#888888' },
];

// Default is GRIND to keep current look
const DEFAULT_PALETTE_ID = 'grind';
const DEFAULT_DARK_TEXT = '#0A0A0A';
const DEFAULT_LIGHT_TEXT = '#F5F1E8';
const DEFAULT_FAVORITE_COLOR = '#FFB800';

// Palette slot definitions used in the custom editor
const PALETTE_SLOTS = [
  { key: 'bg',      label: 'Background',       desc: 'The main app background' },
  { key: 'surface', label: 'Surface',          desc: 'Cards, panels, inputs' },
  { key: 'fg',      label: 'Text',             desc: 'Primary text color' },
  { key: 'accent',  label: 'Primary accent',   desc: 'Main brand color, buttons' },
  { key: 'accent2', label: 'Secondary accent', desc: 'Start action, success, rest timer' },
  { key: 'warn',    label: 'Tertiary accent',  desc: 'Weights tag, highlights' },
];

// Resolve a palette by ID from either presets or user-saved customs
function resolvePalette(activeId, customPalettes) {
  const preset = PALETTES.find(p => p.id === activeId);
  if (preset) return preset;
  const custom = (customPalettes || []).find(p => p.id === activeId);
  if (custom) return custom;
  return PALETTES[0]; // fallback to GRIND
}

function normalizeHexColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const shortHex = /^#([0-9a-f]{3})$/i.exec(trimmed);
  if (shortHex) {
    return '#' + shortHex[1].split('').map(ch => ch + ch).join('').toUpperCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex, null);
  if (!normalized) return null;
  const value = parseInt(normalized.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(colorA, colorB) {
  const lighter = Math.max(relativeLuminance(colorA), relativeLuminance(colorB));
  const darker = Math.min(relativeLuminance(colorA), relativeLuminance(colorB));
  return (lighter + 0.05) / (darker + 0.05);
}

function readableOnColor(backgroundColor) {
  const background = normalizeHexColor(backgroundColor, PALETTES[0].bg);
  return contrastRatio(background, DEFAULT_DARK_TEXT) >= contrastRatio(background, DEFAULT_LIGHT_TEXT)
    ? DEFAULT_DARK_TEXT
    : DEFAULT_LIGHT_TEXT;
}

function readableOnToken(colorToken) {
  if (colorToken === 'var(--accent)') return 'var(--on-accent)';
  if (colorToken === 'var(--accent2)') return 'var(--on-accent2)';
  if (colorToken === 'var(--warn)') return 'var(--on-warn)';
  if (colorToken === 'var(--favorite)') return 'var(--on-favorite)';
  return readableOnColor(colorToken);
}

function alphaColorToken(colorToken, alphaHex = '22') {
  const normalized = normalizeHexColor(colorToken, null);
  const cleanAlpha = /^[0-9a-f]{2}$/i.test(alphaHex) ? alphaHex.toUpperCase() : '22';
  if (normalized) return `${normalized}${cleanAlpha}`;
  const opacityPercent = Math.round((parseInt(cleanAlpha, 16) / 255) * 100);
  return `color-mix(in srgb, ${colorToken} ${opacityPercent}%, transparent)`;
}

function mixHex(baseColor, targetColor, amount) {
  const base = hexToRgb(baseColor);
  const target = hexToRgb(targetColor);
  if (!base || !target) return baseColor;
  const weight = Math.max(0, Math.min(1, amount));
  return rgbToHex({
    r: base.r + (target.r - base.r) * weight,
    g: base.g + (target.g - base.g) * weight,
    b: base.b + (target.b - base.b) * weight,
  });
}

function buildPaletteVars(palette) {
  const bg = normalizeHexColor(palette.bg, PALETTES[0].bg);
  const surface = normalizeHexColor(palette.surface, PALETTES[0].surface);
  const fg = normalizeHexColor(palette.fg, PALETTES[0].fg);
  const accent = normalizeHexColor(palette.accent, PALETTES[0].accent);
  const accent2 = normalizeHexColor(palette.accent2, PALETTES[0].accent2);
  const warn = normalizeHexColor(palette.warn, PALETTES[0].warn);
  const favorite = (
    contrastRatio(DEFAULT_FAVORITE_COLOR, bg) >= 3 &&
    contrastRatio(DEFAULT_FAVORITE_COLOR, surface) >= 3
  ) ? DEFAULT_FAVORITE_COLOR : accent;
  const darkBackground = relativeLuminance(bg) < 0.5;
  const surfaceLift = darkBackground ? 0.08 : 0.05;
  const surfaceStrongLift = darkBackground ? 0.15 : 0.1;

  return {
    '--bg': bg,
    '--surface': surface,
    '--surface-muted': mixHex(surface, fg, surfaceLift),
    '--surface-strong': mixHex(surface, fg, surfaceStrongLift),
    '--field-bg': darkBackground ? mixHex(bg, '#000000', 0.35) : mixHex(surface, fg, 0.04),
    '--fg': fg,
    '--muted': mixHex(bg, fg, darkBackground ? 0.42 : 0.5),
    '--muted-strong': mixHex(bg, fg, darkBackground ? 0.62 : 0.68),
    '--subtle': mixHex(bg, fg, darkBackground ? 0.28 : 0.34),
    '--border': mixHex(bg, fg, darkBackground ? 0.14 : 0.18),
    '--border-strong': mixHex(bg, fg, darkBackground ? 0.26 : 0.3),
    '--accent': accent,
    '--accent2': accent2,
    '--warn': warn,
    '--favorite': favorite,
    '--on-bg': readableOnColor(bg),
    '--on-surface': readableOnColor(surface),
    '--on-accent': readableOnColor(accent),
    '--on-accent2': readableOnColor(accent2),
    '--on-warn': readableOnColor(warn),
    '--on-favorite': readableOnColor(favorite),
    '--color-scheme': darkBackground ? 'dark' : 'light',
  };
}

function buildRainbowModePaletteVars() {
  const base = buildPaletteVars(RAINBOW_MODE_UI_PALETTE);
  const favorite = '#FFE600';
  return {
    ...base,
    '--on-accent': DEFAULT_DARK_TEXT,
    '--surface-muted': '#191A4D',
    '--surface-strong': '#292A78',
    '--field-bg': '#080821',
    '--muted': '#B7C8FF',
    '--muted-strong': '#E6FBFF',
    '--subtle': '#8FA3FF',
    '--border': '#3444CC',
    '--border-strong': '#00E5FF',
    '--favorite': favorite,
    '--on-favorite': readableOnColor(favorite),
  };
}

function applyDocumentPalette(paletteVars, rainbowModeActive = false) {
  if (typeof document === 'undefined') return;
  Object.entries(paletteVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  const bg = paletteVars['--bg'];
  const documentBg = rainbowModeActive ? RAINBOW_MODE_THEME_COLOR : bg;
  document.documentElement.style.backgroundColor = documentBg;
  document.documentElement.classList.remove('rainbow-mode-bg');
  document.body.style.backgroundColor = documentBg;
  document.body.classList.remove('rainbow-mode-bg');
  const appRoot = document.getElementById('root');
  if (appRoot) {
    appRoot.style.backgroundColor = documentBg;
    appRoot.classList.remove('rainbow-mode-bg');
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', documentBg);
}

function buildFeedbackMailtoUrl() {
  const subject = encodeURIComponent('Next Set feedback / issue');
  const body = encodeURIComponent([
    'Feedback, feature request, or issue:',
    '',
    '',
    'If this is an issue, please include screenshots if possible, the device/browser you are using, what happened, what you expected to happen, and any steps that help reproduce it.',
  ].join('\n'));
  return `mailto:${FEEDBACK_EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
}

async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to the selection-based copy path below.
    }
  }
  if (typeof document === 'undefined') return false;

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.top = '-1000px';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

function getBrowserStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeParseStorageValue(rawValue, fallback) {
  if (rawValue == null) return fallback;
  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

const storage = {
  async get(key, fallback) {
    try {
      const browserStorage = getBrowserStorage();
      if (!browserStorage) return fallback;
      return safeParseStorageValue(browserStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  },
  async set(key, value) {
    try {
      const browserStorage = getBrowserStorage();
      if (!browserStorage) return;
      // Store the same JSON payload shape the app already expects on read.
      browserStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('storage set failed', e);
    }
  },
};

function parseCsvRows(csvText) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(field);
      if (row.some(value => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += ch;
  }

  row.push(field);
  if (row.some(value => value.trim() !== '')) rows.push(row);
  return rows;
}

function csvToRecords(csvText) {
  const [headers, ...rows] = parseCsvRows(csvText);
  if (!headers) return [];
  const cleanHeaders = headers.map(header => header.trim());
  return rows.map(row => cleanHeaders.reduce((record, header, i) => {
    record[header] = (row[i] || '').trim();
    return record;
  }, {}));
}

function normalizeExerciseName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\([^)]*\)/g, '')
    .replace(/[/-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\bpush ups\b/g, 'push up')
    .replace(/\bpull ups\b/g, 'pull up')
    .replace(/\bchin ups\b/g, 'chin up')
    .replace(/\bsquats\b/g, 'squat')
    .replace(/\blunges\b/g, 'lunge')
    .replace(/\braises\b/g, 'raise')
    .replace(/\brows\b/g, 'row')
    .replace(/\bcurls\b/g, 'curl')
    .replace(/\btwists\b/g, 'twist')
    .replace(/\bclimbers\b/g, 'climber')
    .replace(/\bkicks\b/g, 'kick')
    .replace(/\bsit ups\b/g, 'sit up')
    .replace(/\bv ups\b/g, 'v up')
    .replace(/\bcarries\b/g, 'carry')
    .replace(/\bdeadlifts\b/g, 'deadlift')
    .replace(/\bbridges\b/g, 'bridge')
    .replace(/\bjumps\b/g, 'jump')
    .replace(/\bwipers\b/g, 'wiper')
    .replace(/\s+/g, ' ')
    .trim();
}

function exerciseLookupKey(category, equipment, name) {
  return `${category}|${equipment}|${normalizeExerciseName(name)}`;
}

function slugifyExerciseId(name) {
  return normalizeExerciseName(name).replace(/\s+/g, '-').replace(/^-|-$/g, '');
}

function makeExerciseGroupKey(category, equipment, group) {
  return `${category}:${equipment}:${slugifyExerciseId(group)}`;
}

function makeAdvancedBucketKey(category, equipment) {
  return `${category}:${equipment}`;
}

function isAdvancedDifficulty(difficulty) {
  return /\badvanced\b/i.test(difficulty || '');
}

function inferExerciseUnit(name) {
  const normalized = normalizeExerciseName(name);
  const timedExact = new Set([
    'plank',
    'high plank',
    'side plank',
    'reverse plank',
    'rkc plank',
    'weighted plank',
    'hollow body hold',
    'dumbbell hollow hold',
    'wall sit',
    'dead hang',
    'active hang',
    'l sit hang l sit',
    'l sit drills',
    'handstand hold against wall',
    'bear crawl hold',
  ]);
  if (timedExact.has(normalized)) return 'sec';
  if (/\bhold\b|\bcarry\b/.test(normalized)) return 'sec';
  return 'reps';
}

function inferExerciseRepConfig(name, category, equipment, difficulty) {
  const unit = inferExerciseUnit(name);
  const normalized = normalizeExerciseName(name);
  const advanced = isAdvancedDifficulty(difficulty);

  if (unit === 'sec') {
    if (normalized.includes('plank')) return { unit, min: 15, max: 120, default: 45 };
    if (normalized.includes('wall sit')) return { unit, min: 20, max: 120, default: 45 };
    if (normalized.includes('carry')) return { unit, min: 20, max: 90, default: 45 };
    if (normalized.includes('hang') || normalized.includes('hold')) return { unit, min: 10, max: 90, default: 30 };
    return { unit, min: 15, max: 90, default: 30 };
  }

  if (equipment === 'bodyweight') {
    if (category === 'core') return { unit, min: 10, max: 30, default: advanced ? 12 : 20 };
    if (category === 'lower') return { unit, min: 10, max: 30, default: advanced ? 10 : 16 };
    return { unit, min: 8, max: normalized === 'push up' ? 50 : 30, default: advanced ? 10 : 15 };
  }

  if (equipment === 'pullup') return { unit, min: 5, max: advanced ? 15 : 20, default: advanced ? 6 : 8 };
  return { unit, min: 5, max: 20, default: advanced ? 10 : 12 };
}

function buildDefaultExerciseLibrary(csvText) {
  const records = csvToRecords(csvText);
  const usedIds = new Set();
  const rawExercises = records.map((record, idx) => {
    const category = CSV_BODY_SECTION_TO_CATEGORY[record['Body Section']];
    const equipment = CSV_EQUIPMENT_TO_KEY[record['Equipment Type']];
    const name = record.Exercise;
    if (!category || !equipment || !name) return null;

    const lookupKey = exerciseLookupKey(category, equipment, name);
    const idBase = LEGACY_EXERCISE_IDS_BY_KEY[lookupKey] || `csv-${category[0]}-${equipment[0]}-${slugifyExerciseId(name)}`;
    let id = idBase;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${idBase}-${suffix}`;
      suffix++;
    }
    usedIds.add(id);

    const exerciseGroup = record['Exercise Group'] || '';
    const groupKey = exerciseGroup ? makeExerciseGroupKey(category, equipment, exerciseGroup) : '';
    const difficulty = record.Difficulty || '';
    const repConfig = inferExerciseRepConfig(name, category, equipment, difficulty);

    return {
      id,
      name,
      category,
      equipment,
      ...repConfig,
      difficulty,
      exerciseGroup,
      groupKey,
      source: record.Source || '',
      sourceQuality: record['Source Quality'] || '',
      sourceUrl: record['Direct URL'] || '',
      notes: record.Notes || '',
      description: record.Description || '',
      csvOrder: idx,
    };
  }).filter(Boolean);

  const groupCounts = rawExercises.reduce((counts, ex) => {
    if (!ex.groupKey) return counts;
    counts.set(ex.groupKey, (counts.get(ex.groupKey) || 0) + 1);
    return counts;
  }, new Map());
  const seenGroups = new Set();

  return rawExercises.reduce((library, ex) => {
    const groupSize = ex.groupKey ? groupCounts.get(ex.groupKey) || 0 : 0;
    const hasGroupVariants = groupSize >= 2;
    const groupPrimary = hasGroupVariants && !seenGroups.has(ex.groupKey);
    if (groupPrimary) seenGroups.add(ex.groupKey);
    const standaloneAdvanced = !ex.exerciseGroup && isAdvancedDifficulty(ex.difficulty);

    library[ex.category].push({
      ...ex,
      groupSize,
      hasGroupVariants,
      groupPrimary,
      standaloneAdvanced,
      advancedBucketKey: standaloneAdvanced ? makeAdvancedBucketKey(ex.category, ex.equipment) : '',
    });
    return library;
  }, { upper: [], lower: [], core: [] });
}

function cloneExerciseLibrary(library) {
  return {
    upper: (library?.upper || []).map(ex => ({ ...ex })),
    lower: (library?.lower || []).map(ex => ({ ...ex })),
    core: (library?.core || []).map(ex => ({ ...ex })),
  };
}

function isSavedCustomExercise(exercise) {
  return Boolean(exercise?.custom || String(exercise?.id || '').startsWith('custom-'));
}

function mergeDefaultExerciseLibrary(storedLibrary) {
  const merged = cloneExerciseLibrary(DEFAULT_EXERCISES);
  if (!storedLibrary) return merged;

  Object.keys(merged).forEach(category => {
    const defaultsById = new Map(merged[category].map(ex => [ex.id, ex]));
    const defaultsByLookup = new Map(merged[category].map(ex => [exerciseLookupKey(ex.category, ex.equipment, ex.name), ex]));
    const customExercises = [];
    const knownIds = new Set(merged[category].map(ex => ex.id));

    (storedLibrary[category] || []).forEach(storedEx => {
      if (!storedEx) return;
      if (isSavedCustomExercise(storedEx)) {
        if (!knownIds.has(storedEx.id)) {
          customExercises.push({ ...storedEx, custom: true });
          knownIds.add(storedEx.id);
        }
        return;
      }

      const defaultById = defaultsById.get(storedEx.id);
      if (defaultById) {
        Object.assign(defaultById, { ...storedEx, ...defaultById });
        return;
      }

      const lookup = exerciseLookupKey(storedEx.category || category, storedEx.equipment || 'bodyweight', storedEx.name);
      if (defaultsByLookup.has(lookup)) return;
    });

    merged[category].push(...customExercises);
  });

  return merged;
}

function flattenLibrary(library) {
  return [...(library?.upper || []), ...(library?.lower || []), ...(library?.core || [])];
}

function enrichExerciseFromLibrary(exercise, library) {
  if (!exercise || !library) return exercise;
  const all = flattenLibrary(library);
  const byId = all.find(item => item.id === exercise.id);
  if (byId) return { ...exercise, ...byId };
  const byLookup = all.find(item => (
    exerciseLookupKey(item.category, item.equipment, item.name) ===
    exerciseLookupKey(exercise.category, exercise.equipment, exercise.name)
  ));
  return byLookup ? { ...exercise, ...byLookup } : exercise;
}

function enrichExercisesWithLibrary(exercises, library) {
  return (exercises || []).map(ex => enrichExerciseFromLibrary(ex, library));
}

function enrichModeConfigWithExercises(modeConfig, exercises) {
  const cfg = modeConfig || {};
  if (!cfg.manualQueue) return cfg;
  const exercisesById = new Map((exercises || []).map(ex => [ex.id, ex]));
  return {
    ...cfg,
    manualQueue: cfg.manualQueue.map(item => {
      const ex = exercisesById.get(item.exId);
      if (!ex) return item;
      return {
        ...item,
        sourceUrl: item.sourceUrl || ex.sourceUrl,
        description: item.description || ex.description,
        difficulty: item.difficulty || ex.difficulty,
        exerciseGroup: item.exerciseGroup || ex.exerciseGroup,
      };
    }),
  };
}

function isPartialHistoryEntry(entry) {
  return entry?.status === 'partial' || Boolean(entry?.partial);
}

function normalizeExerciseSets(exerciseSets, exerciseIds = []) {
  const ids = exerciseIds.length ? exerciseIds : Object.keys(exerciseSets || {});
  return ids
    .filter(id => (exerciseSets || {})[id] !== undefined)
    .sort()
    .reduce((sets, id) => ({ ...sets, [id]: exerciseSets[id] }), {});
}

function normalizeManualQueue(manualQueue = []) {
  return manualQueue.map(item => ({
    exId: item.exId,
    reps: item.reps,
    unit: item.unit,
  }));
}

function makeHistoryWorkoutKey(entry) {
  const exerciseIds = (entry?.exercises || []).map(ex => ex.id);
  const cfg = entry?.modeConfig || {};
  const mode = entry?.mode || '';
  return JSON.stringify({
    mode,
    categories: [...(entry?.categories || [])].sort(),
    modifiers: [...(entry?.modifiers || [])].sort(),
    exerciseIds,
    sets: ['focus', 'circuit', 'superset'].includes(mode) ? (cfg.sets || null) : null,
    supersetSize: mode === 'superset' ? (cfg.supersetSize || null) : null,
    exerciseSets: normalizeExerciseSets(cfg.exerciseSets, exerciseIds),
    manualQueue: mode === 'manual' ? normalizeManualQueue(cfg.manualQueue) : [],
  });
}

function stripPartialHistoryState(entry) {
  if (!entry) return entry;
  const { status, partial, partialKey, ...rest } = entry;
  return rest;
}

function getPartialResumeState(entry, queueLength = 0) {
  const partial = entry?.partial || {};
  const maxIdx = Math.max(0, queueLength - 1);
  const rawIdx = Number(partial.idx);
  const idx = queueLength > 0 ? Math.min(Math.max(Number.isFinite(rawIdx) ? rawIdx : 0, 0), maxIdx) : 0;
  const elapsed = Math.max(0, Number(partial.elapsed) || 0);
  const restRemaining = Math.max(0, Number(partial.restRemaining) || 0);
  const phase = partial.phase === 'rest' && restRemaining > 0 ? 'rest' : 'exercise';
  return { idx, phase, elapsed, restRemaining: phase === 'rest' ? restRemaining : 0 };
}

function getPartialCompletedCount(entry) {
  const total = Math.max(0, Number(entry?.totalItems) || 0);
  if (total === 0) return 0;
  const partial = entry?.partial || {};
  const rawIdx = Number(partial.idx);
  const idx = Math.min(Math.max(Number.isFinite(rawIdx) ? rawIdx : 0, 0), total - 1);
  const completed = partial.phase === 'rest' ? idx + 1 : idx;
  return Math.min(Math.max(completed, 0), total);
}

function partialProgressLabel(entry) {
  const total = Math.max(0, Number(entry?.totalItems) || 0);
  if (!total) return 'Partial';
  return `${getPartialCompletedCount(entry)}/${total} sets complete`;
}

function isHomeRecentWorkout(entry, now = Date.now()) {
  if (!entry || isPartialHistoryEntry(entry)) return false;
  const date = Number(entry.date);
  if (!Number.isFinite(date)) return false;
  const age = now - date;
  return age >= 0 && age <= HOME_RECENT_LOOKBACK_MS;
}

function upsertPartialHistoryEntry(history, partialEntry) {
  const key = partialEntry.partialKey || makeHistoryWorkoutKey(partialEntry);
  return [
    partialEntry,
    ...(history || []).filter(entry => !(isPartialHistoryEntry(entry) && (entry.partialKey || makeHistoryWorkoutKey(entry)) === key)),
  ].slice(0, 100);
}

function removeMatchingPartialHistory(history, completedEntry) {
  const key = makeHistoryWorkoutKey(completedEntry);
  return (history || []).filter(entry => !(isPartialHistoryEntry(entry) && (entry.partialKey || makeHistoryWorkoutKey(entry)) === key));
}

function openExerciseSource(exercise) {
  const url = exercise?.sourceUrl || exercise?.directUrl;
  if (!url || typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ============ MUSCLE GROUP CLASSIFIER ============
// Classifies exercises as push/pull/legs/core for "opposing muscle" superset pairing.
// Pattern-matches against exercise name so we don't have to tag every item by hand.
function classifyMuscle(ex) {
  if (ex.category === 'core') return 'core';
  if (ex.category === 'lower') return 'legs';
  // upper body: split push vs pull by name patterns
  const name = ex.name.toLowerCase();
  const pullPatterns = /pull|chin|row|curl|hang|scapular|commando|archer pull/;
  const pushPatterns = /push|dip|press|raise|tricep|shoulder tap|plank to|pseudo/;
  if (pullPatterns.test(name)) return 'pull';
  if (pushPatterns.test(name)) return 'push';
  return 'push'; // default for upper body fallback
}

// Fisher-Yates shuffle (unbiased)
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sort exercises grouped by category (upper → lower → core),
// shuffled within each category
function shuffleByCategory(exercises) {
  const order = ['upper', 'lower', 'core'];
  const byCategory = {};
  exercises.forEach(ex => {
    if (!byCategory[ex.category]) byCategory[ex.category] = [];
    byCategory[ex.category].push(ex);
  });
  const result = [];
  order.forEach(cat => {
    if (byCategory[cat]) {
      shuffleArr(byCategory[cat]).forEach(ex => result.push(ex));
    }
  });
  return result;
}

// Interleave opposing muscle groups (push/pull first, then fit legs/core in between)
// This is best-effort: if you only have pushes, it just shuffles them.
function shuffleByOpposing(exercises) {
  const buckets = { push: [], pull: [], legs: [], core: [] };
  exercises.forEach(ex => buckets[classifyMuscle(ex)].push(ex));
  Object.keys(buckets).forEach(k => { buckets[k] = shuffleArr(buckets[k]); });

  const result = [];
  // alternate push/pull as long as both have items
  while (buckets.push.length > 0 || buckets.pull.length > 0) {
    if (buckets.push.length > 0) result.push(buckets.push.shift());
    if (buckets.pull.length > 0) result.push(buckets.pull.shift());
  }
  // now weave in legs and core between every other pair
  const extras = shuffleArr([...buckets.legs, ...buckets.core]);
  if (extras.length === 0) return result;
  if (result.length === 0) return extras;
  // insert an extra every 2 items in result
  const final = [];
  for (let i = 0; i < result.length; i++) {
    final.push(result[i]);
    if (i % 2 === 1 && extras.length > 0) {
      final.push(extras.shift());
    }
  }
  // append any remaining
  while (extras.length > 0) final.push(extras.shift());
  return final;
}

function shouldShowHomeScreenInstallPrompt() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isIos = /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
  if (isIos) return true;

  const isKnownNonIosMobile = /Android|Windows Phone|IEMobile|Opera Mini/i.test(ua);
  const isMobileViewport = typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches
    && window.innerWidth <= 900;
  const isMobile = /Mobi|Mobile/i.test(ua) || isMobileViewport;

  return isMobile && !isKnownNonIosMobile;
}

export default function WorkoutApp() {
  const [screen, setScreen] = useState('home');
  const [library, setLibrary] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [mode, setMode] = useState(null);
  const [modeConfig, setModeConfig] = useState({});
  const [restConfig, setRestConfig] = useState({ type: 'fixed', short: 30, long: 90, longEvery: 4 });
  const [queue, setQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [activeInitialElapsed, setActiveInitialElapsed] = useState(0);
  const [activeInitialPhase, setActiveInitialPhase] = useState('exercise');
  const [activeInitialRestRemaining, setActiveInitialRestRemaining] = useState(0);
  const [editResume, setEditResume] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [storageHydrated, setStorageHydrated] = useState(false);
  // Home screen collapse state - lifted here so it survives navigation
  const [favCollapsed, setFavCollapsed] = useState(true);
  const [recentCollapsed, setRecentCollapsed] = useState(true);
  const [collapseHydrated, setCollapseHydrated] = useState(false);
  // App-wide settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  // Color palette state
  const [activePaletteId, setActivePaletteId] = useState(DEFAULT_PALETTE_ID);
  const [customPalettes, setCustomPalettes] = useState([]);
  const [paletteHydrated, setPaletteHydrated] = useState(false);
  // Hidden visual mode state
  const [rainbowModeActive, setRainbowModeActive] = useState(false);
  const [rainbowModeHydrated, setRainbowModeHydrated] = useState(false);
  const appShellRef = useRef(null);

  useEffect(() => {
    (async () => {
      const storedLib = await storage.get('library', null);
      const lib = mergeDefaultExerciseLibrary(storedLib);
      setLibrary(lib);
      const hist = await storage.get('history', []);
      setHistory(hist);
      const favs = await storage.get('favorites', []);
      setFavorites(favs);
      const rest = await storage.get('restConfig', null);
      if (rest) setRestConfig(rest);
      const loadedSettings = await storage.get('settings', DEFAULT_SETTINGS);
      setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
      setSettingsHydrated(true);
      // Only apply stored collapse state if rememberSectionState is ON
      const willRemember = loadedSettings.rememberSectionState !== false;
      if (willRemember) {
        const collapse = await storage.get('homeCollapse', { favorites: true, recent: true });
        setFavCollapsed(collapse.favorites !== false);
        setRecentCollapsed(collapse.recent !== false);
      }
      setCollapseHydrated(true);
      // Palette hydration
      const storedPaletteId = await storage.get('activePaletteId', DEFAULT_PALETTE_ID);
      const storedCustoms = await storage.get('customPalettes', []);
      setActivePaletteId(storedPaletteId);
      setCustomPalettes(storedCustoms);
      setPaletteHydrated(true);
      const storedRainbowModeActive = await storage.get(RAINBOW_MODE_STORAGE_KEY, false);
      setRainbowModeActive(storedRainbowModeActive === true);
      setRainbowModeHydrated(true);
      setStorageHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!storageHydrated || !library) return;
    storage.set('library', library);
  }, [library, storageHydrated]);
  useEffect(() => {
    if (!storageHydrated) return;
    storage.set('restConfig', restConfig);
  }, [restConfig, storageHydrated]);
  useEffect(() => {
    if (!storageHydrated) return;
    storage.set('history', history);
  }, [history, storageHydrated]);
  useEffect(() => {
    if (!storageHydrated) return;
    storage.set('favorites', favorites);
  }, [favorites, storageHydrated]);
  useEffect(() => {
    if (!settingsHydrated) return;
    storage.set('settings', settings);
  }, [settings, settingsHydrated]);
  useEffect(() => {
    if (!paletteHydrated) return;
    storage.set('activePaletteId', activePaletteId);
  }, [activePaletteId, paletteHydrated]);
  useEffect(() => {
    if (!paletteHydrated) return;
    storage.set('customPalettes', customPalettes);
  }, [customPalettes, paletteHydrated]);
  useEffect(() => {
    if (!rainbowModeHydrated) return;
    storage.set(RAINBOW_MODE_STORAGE_KEY, rainbowModeActive);
  }, [rainbowModeActive, rainbowModeHydrated]);
  // Only persist collapse state after hydration AND when the setting is on
  useEffect(() => {
    if (!collapseHydrated) return;
    if (!settings.rememberSectionState) return;
    storage.set('homeCollapse', { favorites: favCollapsed, recent: recentCollapsed });
  }, [favCollapsed, recentCollapsed, collapseHydrated, settings.rememberSectionState]);

  // When rememberSectionState is OFF, force both sections collapsed on every arrival at home
  useEffect(() => {
    if (screen === 'home' && !settings.rememberSectionState) {
      setFavCollapsed(true);
      setRecentCollapsed(true);
    }
  }, [screen, settings.rememberSectionState]);

  const activePalette = resolvePalette(activePaletteId, customPalettes);
  const paletteVars = buildPaletteVars(activePalette);
  const effectivePaletteVars = rainbowModeActive ? buildRainbowModePaletteVars() : paletteVars;

  useEffect(() => {
    applyDocumentPalette(effectivePaletteVars, rainbowModeActive);
  }, [activePalette, rainbowModeActive]);

  useEffect(() => {
    if (!rainbowModeActive || typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let colorIndex = 0;
    const applyRainbowAccent = () => {
      if (!appShellRef.current) return;
      const color = RAINBOW_ACCENT_COLORS[colorIndex % RAINBOW_ACCENT_COLORS.length];
      colorIndex += 1;
      appShellRef.current.style.setProperty('--accent', color);
    };

    applyRainbowAccent();
    const timer = window.setInterval(applyRainbowAccent, RAINBOW_ACCENT_PULSE_MS);
    return () => window.clearInterval(timer);
  }, [rainbowModeActive]);

  if (!library) {
    return (
      <div
        ref={appShellRef}
        style={{ ...effectivePaletteVars, minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'monospace' }}
      >
        LOADING...
      </div>
    );
  }

  const goHome = () => {
    setScreen('home');
    setSelectedCategories([]);
    setSelectedModifiers([]);
    setSelectedExercises([]);
    setMode(null);
    setModeConfig({});
    setQueue([]);
    setQueueIdx(0);
    setActiveInitialElapsed(0);
    setActiveInitialPhase('exercise');
    setActiveInitialRestRemaining(0);
    setEditResume(null);
  };

  const startWorkoutFromEntry = (entry, { continuePartial = false } = {}) => {
    const hydratedExercises = enrichExercisesWithLibrary(entry.exercises || [], library);
    const hydratedModeConfig = enrichModeConfigWithExercises(entry.modeConfig, hydratedExercises);
    const q = buildQueue(hydratedExercises, entry.mode, hydratedModeConfig);
    const resume = continuePartial && isPartialHistoryEntry(entry) ? getPartialResumeState(entry, q.length) : null;
    setEditResume(null);
    setSelectedCategories(entry.categories || []);
    setSelectedModifiers(entry.modifiers || []);
    setSelectedExercises(hydratedExercises);
    setMode(entry.mode);
    setModeConfig(hydratedModeConfig);
    setQueue(q);
    setQueueIdx(resume ? resume.idx : 0);
    setActiveInitialElapsed(resume ? resume.elapsed : 0);
    setActiveInitialPhase(resume ? resume.phase : 'exercise');
    setActiveInitialRestRemaining(resume ? resume.restRemaining : 0);
    setScreen('active');
  };

  const rerunFromHistory = (entry) => {
    startWorkoutFromEntry(entry, { continuePartial: false });
  };

  const continueFromHistory = (entry) => {
    startWorkoutFromEntry(entry, { continuePartial: true });
  };

  // Signature for matching a workout against favorites - based on mode + exercise IDs in order
  const makeSignature = (entry) => {
    if (!entry || !entry.exercises) return '';
    const exIds = entry.exercises.map(e => e.id).join(',');
    return `${entry.mode}|${exIds}|${JSON.stringify(entry.modeConfig?.exerciseSets || {})}`;
  };

  // Find a favorite that matches this workout entry (returns the fav or null)
  const findMatchingFavorite = (entry) => {
    const sig = makeSignature(entry);
    return favorites.find(f => makeSignature(f) === sig) || null;
  };

  // Add a favorite with a name
  const addFavorite = (entry, name) => {
    const template = stripPartialHistoryState(entry);
    const fav = {
      ...template,
      favoritedAt: Date.now(),
      name: (name || '').trim() || 'Untitled workout',
      favId: 'fav-' + Date.now(),
    };
    setFavorites(prev => [...prev, fav]);
  };

  // Remove a favorite by matching signature
  const removeFavorite = (entry) => {
    const sig = makeSignature(entry);
    setFavorites(prev => prev.filter(f => makeSignature(f) !== sig));
  };

  const renameFavorite = (entry, name) => {
    const nextName = (name || '').trim();
    if (!nextName) return;
    const sig = makeSignature(entry);
    setFavorites(prev => prev.map(f => (
      (entry.favId && f.favId === entry.favId) || makeSignature(f) === sig
        ? { ...f, name: nextName }
        : f
    )));
  };

  const reorderFavorites = (nextFavorites) => {
    setFavorites(nextFavorites);
  };

  const removeHistoryEntry = (targetEntry, targetIndex) => {
    setHistory(prev => {
      if (prev[targetIndex] === targetEntry) {
        return prev.filter((_, i) => i !== targetIndex);
      }

      const refIndex = prev.findIndex(entry => entry === targetEntry);
      if (refIndex >= 0) {
        return prev.filter((_, i) => i !== refIndex);
      }

      const fallbackIndex = prev.findIndex(entry => (
        entry.date === targetEntry?.date
        && entry.mode === targetEntry?.mode
        && (entry.partialKey || '') === (targetEntry?.partialKey || '')
        && (entry.status || '') === (targetEntry?.status || '')
      ));

      return fallbackIndex >= 0 ? prev.filter((_, i) => i !== fallbackIndex) : prev;
    });
  };

  // Build a workout entry from current active state (for starring mid-workout)
  const currentWorkoutAsEntry = () => ({
    date: Date.now(),
    mode,
    modeConfig,
    categories: selectedCategories,
    modifiers: selectedModifiers,
    exercises: selectedExercises,
    totalItems: queue.length,
  });

  const savePartialWorkoutAndExit = ({ idx: activeIdx = queueIdx, phase = 'exercise', elapsed = 0, restRemaining = 0 } = {}) => {
    if (!queue.length) {
      goHome();
      return;
    }

    const now = Date.now();
    const boundedIdx = Math.min(Math.max(activeIdx, 0), queue.length - 1);
    const baseEntry = {
      date: now,
      mode,
      modeConfig,
      categories: selectedCategories,
      modifiers: selectedModifiers,
      exercises: selectedExercises,
      totalItems: queue.length,
    };
    const partialKey = makeHistoryWorkoutKey(baseEntry);
    const partialEntry = {
      ...baseEntry,
      status: 'partial',
      partialKey,
      partial: {
        idx: boundedIdx,
        phase: phase === 'rest' ? 'rest' : 'exercise',
        elapsed: Math.max(0, elapsed),
        restRemaining: Math.max(0, restRemaining),
        updatedAt: now,
      },
    };

    setHistory(prev => upsertPartialHistoryEntry(prev, partialEntry));
    goHome();
  };

  const startEditingActiveWorkout = ({ idx: activeIdx = queueIdx, phase = 'exercise', elapsed = 0 } = {}) => {
    const resumeIdx = phase === 'rest' ? activeIdx + 1 : activeIdx;
    const boundedIdx = queue.length > 0 ? Math.min(Math.max(resumeIdx, 0), queue.length - 1) : 0;
    setEditResume({ idx: boundedIdx, elapsed });
    setScreen('categories');
  };

  const applyWorkoutSetup = ({ startIdx = 0, initialElapsed = 0 } = {}) => {
    const q = buildQueue(selectedExercises, mode, modeConfig);
    setQueue(q);
    setQueueIdx(q.length > 0 ? Math.min(Math.max(startIdx, 0), q.length - 1) : 0);
    setActiveInitialElapsed(initialElapsed);
    setActiveInitialPhase('exercise');
    setActiveInitialRestRemaining(0);
    setEditResume(null);
    setScreen('active');
  };

  // Add/replace custom palette (by id); returns the saved palette
  const saveCustomPalette = (palette) => {
    setCustomPalettes(prev => {
      const existing = prev.findIndex(p => p.id === palette.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = palette;
        return copy;
      }
      // Cap at 3 — if we're at 3, remove oldest
      const trimmed = prev.length >= 3 ? prev.slice(0, 2) : prev;
      return [palette, ...trimmed];
    });
  };

  const deleteCustomPalette = (id) => {
    setCustomPalettes(prev => prev.filter(p => p.id !== id));
    // If we deleted the active one, fall back to default
    if (activePaletteId === id) setActivePaletteId(DEFAULT_PALETTE_ID);
  };

  return (
    <div
      ref={appShellRef}
      style={{ ...effectivePaletteVars, minHeight: '100dvh', background: rainbowModeActive ? undefined : 'var(--bg)', color: 'var(--fg)', fontFamily: '"JetBrains Mono", "Fira Code", monospace', position: 'relative', overflow: 'hidden' }}
    >
      <GlobalStyles />
      {rainbowModeActive && <RainbowModeBackground />}
      {rainbowModeActive && <RainbowConfettiLayer />}
      {screen === 'colorSettings' && (
        <ColorSettingsScreen
          activePaletteId={activePaletteId}
          setActivePaletteId={setActivePaletteId}
          customPalettes={customPalettes}
          saveCustomPalette={saveCustomPalette}
          deleteCustomPalette={deleteCustomPalette}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'home' && (
        <HomeScreen
          onStart={() => {
            setEditResume(null);
            setActiveInitialElapsed(0);
            setActiveInitialPhase('exercise');
            setActiveInitialRestRemaining(0);
            setScreen('categories');
          }}
          onHistory={() => setScreen('history')}
          onFavorites={() => setScreen('favorites')}
          onColorSettings={() => setScreen('colorSettings')}
          onRerun={rerunFromHistory}
          history={history}
          favorites={favorites}
          findMatchingFavorite={findMatchingFavorite}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
          favCollapsed={favCollapsed}
          setFavCollapsed={setFavCollapsed}
          recentCollapsed={recentCollapsed}
          setRecentCollapsed={setRecentCollapsed}
          settings={settings}
          settingsHydrated={settingsHydrated}
          setSettings={setSettings}
          library={library}
          rainbowModeActive={rainbowModeActive}
          onRainbowModeActivate={() => setRainbowModeActive(true)}
          onRainbowModeDeactivate={() => setRainbowModeActive(false)}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen
          history={history}
          library={library}
          onBack={() => setScreen('home')}
          onRerun={rerunFromHistory}
          onContinuePartial={continueFromHistory}
          onClear={() => setHistory([])}
          onDeleteEntry={removeHistoryEntry}
          findMatchingFavorite={findMatchingFavorite}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
        />
      )}
      {screen === 'favorites' && (
        <FavoritesScreen
          favorites={favorites}
          library={library}
          onBack={() => setScreen('home')}
          onRerun={rerunFromHistory}
          removeFavorite={removeFavorite}
          renameFavorite={renameFavorite}
          reorderFavorites={reorderFavorites}
        />
      )}
      {screen === 'categories' && (
        <CategoryScreen
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedModifiers={selectedModifiers}
          setSelectedModifiers={setSelectedModifiers}
          onBack={goHome}
          onNext={() => setScreen('exercises')}
        />
      )}
      {screen === 'exercises' && (
        <ExerciseScreen
          library={library}
          setLibrary={setLibrary}
          categories={selectedCategories}
          modifiers={selectedModifiers}
          selected={selectedExercises}
          setSelected={setSelectedExercises}
          onBack={() => setScreen('categories')}
          onNext={() => setScreen('mode')}
        />
      )}
      {screen === 'mode' && (
        <ModeScreen
          mode={mode}
          setMode={setMode}
          modeConfig={modeConfig}
          setModeConfig={setModeConfig}
          exercises={selectedExercises}
          setExercises={setSelectedExercises}
          onBack={() => setScreen('exercises')}
          onNext={() => setScreen('rest')}
        />
      )}
      {screen === 'rest' && (
        <RestScreen
          restConfig={restConfig}
          setRestConfig={setRestConfig}
          onBack={() => setScreen('mode')}
          editingCurrentWorkout={!!editResume}
          onNext={() => applyWorkoutSetup({ startIdx: 0, initialElapsed: 0 })}
          onContinue={() => applyWorkoutSetup({ startIdx: editResume?.idx || 0, initialElapsed: editResume?.elapsed || 0 })}
          onStartOver={() => applyWorkoutSetup({ startIdx: 0, initialElapsed: 0 })}
        />
      )}
      {screen === 'active' && (
        <ActiveWorkout
          queue={queue}
          idx={queueIdx}
          setIdx={setQueueIdx}
          restConfig={restConfig}
          initialElapsed={activeInitialElapsed}
          initialPhase={activeInitialPhase}
          initialRestRemaining={activeInitialRestRemaining}
          onExit={savePartialWorkoutAndExit}
          onEdit={startEditingActiveWorkout}
          currentEntry={currentWorkoutAsEntry()}
          findMatchingFavorite={findMatchingFavorite}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
          onComplete={() => {
            const entry = {
              date: Date.now(),
              mode,
              modeConfig,
              categories: selectedCategories,
              modifiers: selectedModifiers,
              exercises: selectedExercises,
              totalItems: queue.length,
            };
            setHistory(prev => [entry, ...removeMatchingPartialHistory(prev, entry)].slice(0, 100));
            setScreen('done');
          }}
        />
      )}
      {screen === 'done' && <DoneScreen onHome={goHome} queueLen={queue.length} />}
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;700&family=Bebas+Neue&display=swap');
      :root {
        --bg: #0E0E0E;
        --surface: #121212;
        --surface-muted: #202020;
        --surface-strong: #333333;
        --field-bg: #050505;
        --fg: #F5F1E8;
        --muted: #888888;
        --muted-strong: #AAAAAA;
        --subtle: #666666;
        --border: #222222;
        --border-strong: #333333;
        --accent: #FF4D2E;
        --accent2: #00D9B2;
        --warn: #FF4D8F;
        --favorite: #FFB800;
        --on-bg: #F5F1E8;
        --on-surface: #F5F1E8;
        --on-accent: #0A0A0A;
        --on-accent2: #0A0A0A;
        --on-warn: #0A0A0A;
        --on-favorite: #0A0A0A;
        --color-scheme: dark;
      }
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      html {
        margin: 0;
        min-height: 100%;
        background: var(--bg);
        color-scheme: var(--color-scheme);
      }
      body {
        margin: 0;
        min-height: 100dvh;
        background: var(--bg);
        color: var(--fg);
        overscroll-behavior: none;
      }
      #root {
        min-height: 100dvh;
        background: var(--bg);
      }
      button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
      .display { font-family: 'Archivo Black', sans-serif; letter-spacing: -0.02em; }
      .stencil { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      @keyframes rainbow-bg-flow {
        0% { background-position: 50% 50%, 0% 18%, 100% 84%, 0% 50%, 12% 50%; }
        20% { background-position: 50% 50%, 82% 8%, 18% 62%, 46% 14%, 38% 24%; }
        40% { background-position: 50% 50%, 100% 76%, 8% 22%, 100% 46%, 76% 68%; }
        60% { background-position: 50% 50%, 30% 100%, 88% 10%, 58% 100%, 100% 36%; }
        80% { background-position: 50% 50%, 6% 42%, 38% 100%, 18% 72%, 54% 90%; }
        100% { background-position: 50% 50%, 0% 18%, 100% 84%, 0% 50%, 12% 50%; }
      }
      @keyframes rainbow-mode-message {
        0% { opacity: 0; transform: translateY(14px) scale(0.98); }
        18% { opacity: 1; transform: translateY(0) scale(1); }
        76% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-10px) scale(1); }
      }
      @keyframes rainbow-confetti-float {
        0% {
          opacity: 0;
          transform: translate3d(0, -24px, 0) rotate(var(--confetti-rotation));
        }
        14% {
          opacity: var(--confetti-opacity);
        }
        52% {
          opacity: var(--confetti-opacity);
          transform: translate3d(var(--confetti-drift-x), var(--confetti-drift-y), 0) rotate(var(--confetti-mid-rotation));
        }
        100% {
          opacity: 0.1;
          transform: translate3d(var(--confetti-end-x), var(--confetti-end-y), 0) rotate(var(--confetti-end-rotation));
        }
      }
      .rainbow-mode-bg {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          linear-gradient(rgba(4,4,10,0.2), rgba(4,4,10,0.2)),
          radial-gradient(circle at 18% 18%, rgba(255,255,255,0.28), transparent 24%),
          radial-gradient(circle at 82% 76%, rgba(255,255,255,0.2), transparent 28%),
          conic-gradient(from 0.08turn at 50% 50%, #ff0000, #ff2b00, #ff5c00, #ff8c00, #ffbf00, #ffff00, #b7ff00, #73ff00, #2bff00, #00ff22, #00ff66, #00ffaa, #00ffff, #00b7ff, #0073ff, #002bff, #3300ff, #7300ff, #b700ff, #ff00ff, #ff00b7, #ff0073, #ff002b, #ff0000),
          linear-gradient(120deg, #ff0000 0%, #ff1c00 3%, #ff4000 6%, #ff6600 9%, #ff8c00 12%, #ffb300 15%, #ffde00 18%, #ffff00 21%, #caff00 24%, #99ff00 27%, #66ff00 30%, #33ff00 33%, #00ff00 36%, #00ff38 39%, #00ff73 42%, #00ffaa 45%, #00ffe1 48%, #00ffff 51%, #00caff 54%, #0099ff 57%, #0066ff 60%, #0033ff 63%, #0000ff 66%, #3300ff 69%, #6600ff 72%, #9900ff 75%, #cc00ff 78%, #ff00ff 81%, #ff00cc 84%, #ff0099 87%, #ff0066 90%, #ff0038 94%, #ff0000 100%);
        background-size: 100% 100%, 180% 180%, 220% 220%, 340% 340%, 460% 460%;
        animation: rainbow-bg-flow 8s ease-in-out infinite;
      }
      .rainbow-mode-activated-message {
        animation: rainbow-mode-message 2.6s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .rainbow-confetti-layer {
        position: fixed;
        inset: -12dvh -8vw;
        pointer-events: none;
        overflow: hidden;
        z-index: 1;
      }
      .rainbow-confetti-piece {
        position: absolute;
        left: var(--confetti-x);
        top: var(--confetti-y);
        width: var(--confetti-width);
        height: var(--confetti-height);
        border-radius: 2px;
        opacity: 0;
        transform-origin: center;
        animation: rainbow-confetti-float var(--confetti-duration) ease-in-out infinite;
        animation-delay: var(--confetti-delay);
        will-change: transform, opacity;
      }
      .rainbow-confetti-face {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--confetti-color);
        box-shadow: 0 0 14px color-mix(in srgb, var(--confetti-color) 46%, transparent);
        transform: translate3d(var(--confetti-repel-x, 0px), var(--confetti-repel-y, 0px), 0) rotate(var(--confetti-repel-rotation, 0deg));
        transition: transform 180ms ease-out;
        will-change: transform;
      }
      .rainbow-confetti-piece[data-shape="dot"] {
        border-radius: 999px;
      }
      .rainbow-confetti-piece[data-shape="ribbon"] {
        border-radius: 999px;
      }
      @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
      @keyframes slide-up { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes settings-callout-ring {
        0% { transform: scale(0.88); opacity: 1; }
        70% { transform: scale(1.24); opacity: 0.18; }
        100% { transform: scale(1.32); opacity: 0; }
      }
      @keyframes welcome-card-in {
        0% { transform: translateY(18px) scale(0.96); opacity: 0; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes title-in-top {
        0% { transform: translateX(-110%); opacity: 0; }
        60% { transform: translateX(8px); opacity: 1; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes title-in-bottom {
        0% { transform: translateX(110%); opacity: 0; }
        60% { transform: translateX(-8px); opacity: 1; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes home-title-tap-shake {
        0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        20% { transform: translate3d(-2px, 1px, 0) rotate(-0.4deg); }
        40% { transform: translate3d(2px, -1px, 0) rotate(0.4deg); }
        60% { transform: translate3d(-1px, 0, 0) rotate(-0.25deg); }
        80% { transform: translate3d(1px, 0, 0) rotate(0.2deg); }
      }
      .slide-in { animation: slide-up 0.4s ease-out both; }
      .fade-in { animation: fade-in 0.25s ease-out both; }
      .title-slide-top { animation: title-in-top 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .title-slide-bottom { animation: title-in-bottom 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both; }
      .home-title-tap-shake { animation: home-title-tap-shake 180ms ease-in-out both; }
      @media (prefers-reduced-motion: reduce) {
        .rainbow-mode-bg {
          animation: none;
          background-position: 50% 50%;
        }
        .rainbow-confetti-piece {
          animation: none;
          opacity: 0.28;
        }
        .home-title-tap-shake {
          animation: none;
        }
      }
      .active-workout-screen {
        --active-header-meta-size: 11px;
        --active-content-x: 24px;
        --active-content-y: 20px;
        --active-meta-size: 11px;
        --active-equip-size: 10px;
        --active-title-size: clamp(40px, 9vw, 78px);
        --active-title-margin: 24px;
        --active-rep-size: clamp(72px, 18vw, 140px);
        --active-unit-size: 32px;
        --active-rep-margin: 40px;
        --active-rest-label-size: 11px;
        --active-rest-title-size: clamp(44px, 10vw, 72px);
        --active-rest-timer-size: clamp(80px, 22vw, 160px);
        --active-rest-ring-size: 220px;
        --active-timer-target-size: clamp(72px, 18vw, 140px);
        --active-timer-unit-size: 32px;
        --active-timer-prep-label-size: 11px;
        --active-timer-prep-size: clamp(120px, 32vw, 220px);
        --active-timer-running-label-size: 11px;
        --active-timer-running-size: clamp(100px, 26vw, 180px);
        --active-timer-running-unit-size: 28px;
        --active-timer-overtime-label-size: 11px;
        --active-timer-overtime-size: clamp(64px, 16vw, 110px);
        --active-timer-overtime-unit-size: 22px;
        --active-timer-note-size: 10px;
        --active-timer-button-font: 16px;
      }
      @media (min-width: 1100px) and (min-height: 720px) {
        .active-workout-screen {
          --active-header-meta-size: clamp(12px, 0.8vw, 14px);
          --active-content-x: 24px;
          --active-content-y: clamp(24px, 3vh, 44px);
          --active-meta-size: clamp(13px, 0.95vw, 16px);
          --active-equip-size: clamp(11px, 0.75vw, 13px);
          --active-title-size: clamp(86px, 6.4vw, 132px);
          --active-title-margin: 32px;
          --active-rep-size: clamp(150px, 10.5vw, 220px);
          --active-unit-size: clamp(38px, 2.5vw, 52px);
          --active-rep-margin: 52px;
          --active-rest-label-size: clamp(13px, 0.95vw, 16px);
          --active-rest-title-size: clamp(80px, 6vw, 124px);
          --active-rest-timer-size: clamp(170px, 11vw, 260px);
          --active-rest-ring-size: clamp(260px, 18vw, 340px);
          --active-timer-target-size: clamp(150px, 10.5vw, 220px);
          --active-timer-unit-size: clamp(38px, 2.5vw, 52px);
          --active-timer-prep-label-size: clamp(13px, 0.95vw, 16px);
          --active-timer-prep-size: clamp(220px, 16vw, 320px);
          --active-timer-running-label-size: clamp(13px, 0.95vw, 16px);
          --active-timer-running-size: clamp(180px, 13vw, 280px);
          --active-timer-running-unit-size: clamp(34px, 2.2vw, 46px);
          --active-timer-overtime-label-size: clamp(13px, 0.95vw, 16px);
          --active-timer-overtime-size: clamp(120px, 8vw, 180px);
          --active-timer-overtime-unit-size: clamp(28px, 1.8vw, 38px);
          --active-timer-note-size: 12px;
          --active-timer-button-font: 18px;
        }
      }
      input[type="range"] {
        -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: var(--surface-strong);
        border-radius: 2px; outline: none;
      }
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: var(--accent);
        border-radius: 2px; cursor: pointer; border: 2px solid var(--bg);
      }
      input[type="range"]::-moz-range-thumb {
        width: 24px; height: 24px; background: var(--accent); border-radius: 2px; cursor: pointer; border: 2px solid var(--bg);
      }
    `}</style>
  );
}

function GrainOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.08,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }} />
  );
}

function RainbowModeBackground() {
  return <div className="rainbow-mode-bg" aria-hidden="true" />;
}

function RainbowConfettiLayer() {
  const [repelOffsets, setRepelOffsets] = useState(RAINBOW_CONFETTI_REST_REPEL);
  const pointerRef = useRef(null);
  const frameRef = useRef(null);
  const clearRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const resetRepel = () => {
      pointerRef.current = null;
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setRepelOffsets(RAINBOW_CONFETTI_REST_REPEL);
    };

    const scheduleRepel = (x, y) => {
      pointerRef.current = { x, y };
      if (clearRef.current) window.clearTimeout(clearRef.current);
      clearRef.current = window.setTimeout(() => {
        clearRef.current = null;
        resetRepel();
      }, RAINBOW_CONFETTI_REPEL_IDLE_MS);

      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const pointer = pointerRef.current;
        if (!pointer) return;

        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;
        const radius = Math.min(RAINBOW_CONFETTI_REPEL_RADIUS_PX, Math.max(width, height) * 0.34);

        setRepelOffsets(RAINBOW_CONFETTI_PIECES.map((piece, index) => {
          const pieceX = (piece.x / 100) * width;
          const pieceY = (piece.y / 100) * height;
          const dx = pieceX - pointer.x;
          const dy = pieceY - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > radius) return RAINBOW_CONFETTI_REST_REPEL[index];

          const fallbackAngle = ((index * 137) % 360) * (Math.PI / 180);
          const unitX = distance > 0 ? dx / distance : Math.cos(fallbackAngle);
          const unitY = distance > 0 ? dy / distance : Math.sin(fallbackAngle);
          const force = Math.pow(1 - distance / radius, 2) * RAINBOW_CONFETTI_REPEL_FORCE_PX;
          const rotationDirection = index % 2 === 0 ? 1 : -1;

          return {
            x: unitX * force,
            y: unitY * force,
            rotation: rotationDirection * force * 0.72,
          };
        }));
      });
    };

    const handlePointerMove = (event) => {
      scheduleRepel(event.clientX, event.clientY);
    };

    const handleTouchMove = (event) => {
      const touch = event.touches && event.touches[0];
      if (touch) scheduleRepel(touch.clientX, touch.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('pointerleave', resetRepel);
    window.addEventListener('pointercancel', resetRepel);
    window.addEventListener('touchend', resetRepel);
    window.addEventListener('touchcancel', resetRepel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointerleave', resetRepel);
      window.removeEventListener('pointercancel', resetRepel);
      window.removeEventListener('touchend', resetRepel);
      window.removeEventListener('touchcancel', resetRepel);
      if (clearRef.current) window.clearTimeout(clearRef.current);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="rainbow-confetti-layer" aria-hidden="true">
      {RAINBOW_CONFETTI_PIECES.map((piece, index) => {
        const repel = repelOffsets[index] || RAINBOW_CONFETTI_REST_REPEL[index];
        return (
          <span
            key={`${piece.color}-${index}`}
            className="rainbow-confetti-piece"
            data-shape={piece.shape}
            style={{
              '--confetti-x': `${piece.x}%`,
              '--confetti-y': `${piece.y}%`,
              '--confetti-width': `${piece.width}px`,
              '--confetti-height': `${piece.height}px`,
              '--confetti-color': piece.color,
              '--confetti-drift-x': `${piece.driftX}px`,
              '--confetti-drift-y': `${piece.driftY}px`,
              '--confetti-end-x': `${piece.endX}px`,
              '--confetti-end-y': `${piece.endY}px`,
              '--confetti-rotation': `${piece.rotation}deg`,
              '--confetti-mid-rotation': `${piece.midRotation}deg`,
              '--confetti-end-rotation': `${piece.endRotation}deg`,
              '--confetti-duration': `${piece.duration}s`,
              '--confetti-delay': `${piece.delay}s`,
              '--confetti-opacity': `${piece.opacity}`,
              '--confetti-repel-x': `${repel.x}px`,
              '--confetti-repel-y': `${repel.y}px`,
              '--confetti-repel-rotation': `${repel.rotation}deg`,
            }}
          >
            <span className="rainbow-confetti-face" />
          </span>
        );
      })}
    </div>
  );
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  if (hours < 24) return hours + 'h ago';
  if (days < 7) return days + 'd ago';
  return new Date(ts).toLocaleDateString();
}

// 10 punchy two-word variants that cycle through the home screen
const TITLE_VARIANTS = [
  { top: 'GRIND', bottom: 'MODE' },
  { top: 'BEAST', bottom: 'MODE' },
  { top: 'LOCK', bottom: 'IN' },
  { top: 'NO', bottom: 'EXCUSES' },
  { top: 'GET', bottom: 'AFTER IT' },
  { top: 'CRUSH', bottom: 'IT' },
  { top: 'SEND', bottom: 'IT' },
  { top: 'NO', bottom: 'DAYS OFF' },
  { top: 'STAY', bottom: 'HUNGRY' },
  { top: 'EARN', bottom: 'IT' },
];

// "Workout complete" screen variants: big two-word headline + short tagline
const DONE_VARIANTS = [
  { top: 'NICE', bottom: 'WORK.', tag: 'Go hydrate.' },
  { top: 'WELL', bottom: 'DONE.', tag: 'Stretch it out.' },
  { top: 'WORK', bottom: 'PUT IN.', tag: 'Future you says thanks.' },
  { top: 'THAT\'S', bottom: 'A REP.', tag: 'Grab some water.' },
  { top: 'GET', bottom: 'SOME.', tag: 'Fuel up.' },
  { top: 'STACKED', bottom: 'IT.', tag: 'Rest up.' },
  { top: 'ANOTHER', bottom: 'ONE DOWN.', tag: 'Momentum wins.' },
  { top: 'EARNED', bottom: 'IT.', tag: 'Protein and water.' },
  { top: 'BIG', bottom: 'MOVES.', tag: 'Cool down properly.' },
  { top: 'LOCKED', bottom: 'IN.', tag: 'Breathe. Recover.' },
];

// Pick a random index different from the current one (avoids repeats)
function pickDifferentIdx(current, length) {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  if (next === current) next = (next + 1) % length;
  return next;
}

function AnimatedTitle() {
  // Start on a random variant so users see different things at app launch
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * TITLE_VARIANTS.length));
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIdx(i => pickDifferentIdx(i, TITLE_VARIANTS.length));
      setNonce(n => n + 1);
    }, 7000);
    return () => clearTimeout(timer);
  }, [nonce]);

  const variant = TITLE_VARIANTS[idx];

  return (
    <div style={{ overflow: 'hidden' }}>
      <div
        key={`top-${nonce}`}
        className="display title-slide-top"
        style={{
          fontSize: 'clamp(56px, 14vw, 120px)', lineHeight: 0.85,
          color: 'var(--fg)', whiteSpace: 'nowrap',
        }}
      >
        {variant.top}
      </div>
      <div
        key={`bot-${nonce}`}
        className="display title-slide-bottom"
        style={{
          fontSize: 'clamp(56px, 14vw, 120px)', lineHeight: 0.85,
          color: 'var(--accent)', marginBottom: '8px', whiteSpace: 'nowrap',
        }}
      >
        {variant.bottom}
      </div>
    </div>
  );
}

function ColorSettingsScreen({ activePaletteId, setActivePaletteId, customPalettes, saveCustomPalette, deleteCustomPalette, onBack }) {
  // Editor state - null means "browsing", otherwise it's the palette being edited
  const [editing, setEditing] = React.useState(null);

  // Handler for opening a new custom palette for editing
  const startNewCustom = () => {
    // Base the starting values on the currently active palette so the editor doesn't look empty
    const base = [...PALETTES, ...customPalettes].find(p => p.id === activePaletteId) || PALETTES[0];
    setEditing({
      id: 'custom-' + Date.now(),
      name: '',
      bg: base.bg,
      surface: base.surface,
      fg: base.fg,
      accent: base.accent,
      accent2: base.accent2,
      warn: base.warn,
      isNew: true,
    });
  };

  // Handler for editing an existing custom
  const startEditCustom = (palette) => {
    setEditing({ ...palette, isNew: false });
  };

  const handleSave = (palette) => {
    saveCustomPalette(palette);
    // Auto-activate newly saved palette
    setActivePaletteId(palette.id);
    setEditing(null);
  };

  const handleDelete = (id) => {
    deleteCustomPalette(id);
    setEditing(null);
  };

  if (editing) {
    return (
      <CustomPaletteEditor
        palette={editing}
        onChange={setEditing}
        onSave={handleSave}
        onDelete={editing.isNew ? null : () => handleDelete(editing.id)}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const canAddMoreCustoms = customPalettes.length < 3;

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <div style={{ padding: `${SAFE_TOP_20} 24px 12px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', padding: '4px 0' }}>
            <ChevronLeft size={18} />
            <span className="mono" style={{ fontSize: '11px' }}>BACK</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Palette size={28} color="var(--accent)" />
          <div className="display" style={{ fontSize: 'clamp(36px, 10vw, 56px)', lineHeight: 0.9, color: 'var(--fg)' }}>
            COLORS
          </div>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)', marginTop: '8px' }}>
          Tap to apply. Hold or tap edit on customs.
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 24px 24px', overflowY: 'auto' }}>
        {/* Presets */}
        <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', marginBottom: '10px', letterSpacing: '0.1em' }}>
          // PRESETS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '24px' }}>
          {PALETTES.map(p => (
            <PaletteCard
              key={p.id}
              palette={p}
              active={p.id === activePaletteId}
              onTap={() => setActivePaletteId(p.id)}
            />
          ))}
        </div>

        {/* Customs */}
        <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', marginBottom: '10px', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between' }}>
          <span>// CUSTOM ({customPalettes.length}/3)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '12px' }}>
          {customPalettes.map(p => (
            <PaletteCard
              key={p.id}
              palette={p}
              active={p.id === activePaletteId}
              onTap={() => setActivePaletteId(p.id)}
              onEdit={() => startEditCustom(p)}
            />
          ))}
          {canAddMoreCustoms && (
            <button
              onClick={startNewCustom}
              style={{
                padding: '18px', background: 'var(--surface)',
                border: '1px dashed #FF4D2E66', borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: 'var(--accent)', fontSize: '13px', fontWeight: 700,
              }}
            >
              <Plus size={16} /> NEW CUSTOM PALETTE
            </button>
          )}
          {!canAddMoreCustoms && (
            <div className="mono" style={{ padding: '12px', fontSize: '10px', color: 'var(--subtle)', textAlign: 'center', lineHeight: 1.5 }}>
              Max of 3 custom palettes.<br/>Delete one to add another.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaletteCard({ palette, active, onTap, onEdit }) {
  const selectPalette = () => {
    if (onTap) onTap();
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectPalette();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={selectPalette}
      onKeyDown={handleKeyDown}
      style={{
        padding: '4px',
        border: active ? `1px solid ${palette.accent}` : '1px solid transparent',
        borderRadius: '4px',
        position: 'relative',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
    >
      <div
        style={{
          background: palette.bg,
          border: active ? `2px solid ${palette.accent}` : '1px solid var(--border)',
          borderRadius: '2px', padding: active ? '13px' : '14px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', textAlign: 'left', padding: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div className="stencil" style={{
              fontSize: '20px', color: palette.fg, lineHeight: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {palette.name || 'UNTITLED'}
            </div>
            {active && (
              <span className="mono" style={{
                fontSize: '9px', padding: '2px 6px',
                background: palette.accent, color: readableOnColor(palette.accent),
                borderRadius: '2px', fontWeight: 700,
              }}>ACTIVE</span>
            )}
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{
                fontSize: '10px', color: palette.fg, opacity: 0.6,
                padding: '4px 8px', border: `1px solid ${alphaColorToken(palette.fg, '33')}`, borderRadius: '2px',
              }}
            >
              EDIT
            </button>
          )}
        </div>

        {/* Swatches - preview showing all 6 colors plus sample UI */}
        <div style={{
          display: 'flex', gap: '4px', width: '100%', height: '32px', padding: 0,
        }}>
          <div style={{ flex: 2, background: palette.surface, borderRadius: '2px' }} />
          <div style={{ flex: 1, background: palette.fg, borderRadius: '2px' }} />
          <div style={{ flex: 1, background: palette.accent, borderRadius: '2px' }} />
          <div style={{ flex: 1, background: palette.accent2, borderRadius: '2px' }} />
          <div style={{ flex: 1, background: palette.warn, borderRadius: '2px' }} />
        </div>

        {/* Mini sample UI preview using this palette's colors */}
        <div style={{
          background: palette.surface, borderRadius: '2px', padding: '8px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
            <div className="stencil" style={{ fontSize: '11px', color: palette.accent, lineHeight: 1 }}>SAMPLE</div>
            <div className="mono" style={{ fontSize: '9px', color: palette.fg, opacity: 0.7 }}>Aa Text 123</div>
          </div>
          <div style={{
            padding: '4px 8px', background: palette.accent, color: readableOnColor(palette.accent),
            borderRadius: '2px', fontSize: '9px', fontWeight: 900,
            fontFamily: 'Archivo Black, sans-serif',
          }}>
            GO
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomPaletteEditor({ palette, onChange, onSave, onDelete, onCancel }) {
  const [editingSlot, setEditingSlot] = React.useState(null); // which slot color picker is open for
  const [nameError, setNameError] = React.useState(false);

  const updateSlot = (key, value) => {
    onChange({ ...palette, [key]: value });
  };

  const handleSave = () => {
    if (!palette.name || !palette.name.trim()) {
      setNameError(true);
      return;
    }
    onSave({ ...palette, name: palette.name.trim() });
  };

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, background: palette.bg }}>
      <div style={{ padding: `${SAFE_TOP_20} 24px 12px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: palette.fg, opacity: 0.6, padding: '4px 0' }}>
            <ChevronLeft size={18} />
            <span className="mono" style={{ fontSize: '11px' }}>CANCEL</span>
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              style={{ color: palette.warn, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              className="mono"
            >
              <Trash2 size={12} /> DELETE
            </button>
          )}
        </div>
        <div className="display" style={{ fontSize: 'clamp(32px, 9vw, 48px)', lineHeight: 0.9, color: palette.fg, marginBottom: '8px' }}>
          {palette.isNew ? 'NEW PALETTE' : 'EDIT PALETTE'}
        </div>
        <div className="mono" style={{ fontSize: '11px', color: palette.fg, opacity: 0.6 }}>
          Tap a color to change it. Preview updates live.
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 24px 24px', overflowY: 'auto' }}>
        {/* Name input */}
        <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6, marginBottom: '6px', letterSpacing: '0.1em' }}>
          // NAME
        </div>
        <input
          value={palette.name || ''}
          onChange={e => { onChange({ ...palette, name: e.target.value }); setNameError(false); }}
          placeholder="e.g. NIGHT RUN"
          maxLength={20}
          style={{
            width: '100%', padding: '12px', background: palette.surface, color: palette.fg,
            border: `1px solid ${nameError ? palette.warn : alphaColorToken(palette.fg, '33')}`,
            fontFamily: 'inherit', fontSize: '16px', fontWeight: 700,
            borderRadius: '2px', marginBottom: nameError ? '4px' : '20px',
            textTransform: 'uppercase',
          }}
        />
        {nameError && (
          <div className="mono" style={{ fontSize: '10px', color: palette.warn, marginBottom: '16px' }}>
            Please enter a name before saving.
          </div>
        )}

        {/* Color slots */}
        <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6, marginBottom: '10px', letterSpacing: '0.1em' }}>
          // COLORS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {PALETTE_SLOTS.map(slot => (
            <button
              key={slot.key}
              onClick={() => setEditingSlot(slot.key)}
              style={{
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px',
                background: palette.surface, border: `1px solid ${palette.fg}22`,
                borderRadius: '2px', textAlign: 'left',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '2px',
                background: palette[slot.key],
                border: `1px solid ${alphaColorToken(palette.fg, '33')}`, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: palette.fg }}>{slot.label}</div>
                <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6 }}>
                  {slot.desc}
                </div>
              </div>
              <div className="mono" style={{
                fontSize: '10px', color: palette.fg, opacity: 0.5,
                padding: '3px 6px', background: palette.bg, borderRadius: '2px',
              }}>
                {palette[slot.key].toUpperCase()}
              </div>
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6, marginBottom: '10px', letterSpacing: '0.1em' }}>
          // PREVIEW
        </div>
        <PaletteCard palette={palette} active={true} onTap={() => {}} />
      </div>

      {/* Save bar */}
      <div style={{ padding: '16px 24px 24px', borderTop: `1px solid ${palette.fg}22`, background: palette.bg }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '20px', background: palette.accent, color: palette.bg,
            fontSize: '16px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            letterSpacing: '0.02em', borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span>SAVE PALETTE</span>
          <Check size={20} strokeWidth={3} />
        </button>
      </div>

      {editingSlot && (
        <ColorPickerModal
          slot={PALETTE_SLOTS.find(s => s.key === editingSlot)}
          value={palette[editingSlot]}
          palette={palette}
          onChange={(v) => updateSlot(editingSlot, v)}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  );
}

function ColorPickerModal({ slot, value, palette, onChange, onClose }) {
  return (
    <div
      onClick={onClose}
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-end', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: palette.surface, border: `2px solid ${palette.accent}`, borderRadius: '2px',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div className="stencil" style={{ fontSize: '22px', color: palette.accent }}>{slot.label.toUpperCase()}</div>
            <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6, marginTop: '2px' }}>
              {slot.desc}
            </div>
          </div>
          <button onClick={onClose} style={{ color: palette.fg, opacity: 0.5 }}><X size={18} /></button>
        </div>

        {/* Big preview of current value */}
        <div style={{
          height: '80px', background: value, borderRadius: '2px',
          border: `1px solid ${palette.fg}22`, marginBottom: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="mono" style={{
            fontSize: '14px', fontWeight: 700,
            color: value, filter: 'invert(1) grayscale(1) contrast(100)',
            mixBlendMode: 'difference',
          }}>
            {value.toUpperCase()}
          </div>
        </div>

        {/* Native color picker */}
        <label style={{ display: 'block', marginBottom: '12px' }}>
          <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6, marginBottom: '6px' }}>
            // PICKER
          </div>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{
              width: '100%', height: '48px', background: palette.bg,
              border: `1px solid ${palette.fg}22`, borderRadius: '2px', cursor: 'pointer',
            }}
          />
        </label>

        {/* Hex input */}
        <label style={{ display: 'block', marginBottom: '16px' }}>
          <div className="mono" style={{ fontSize: '10px', color: palette.fg, opacity: 0.6, marginBottom: '6px' }}>
            // HEX
          </div>
          <input
            type="text"
            value={value}
            onChange={e => {
              let v = e.target.value;
              if (!v.startsWith('#')) v = '#' + v;
              onChange(v);
            }}
            style={{
              width: '100%', padding: '10px', background: palette.bg, color: palette.fg,
              border: `1px solid ${palette.fg}22`, fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px', borderRadius: '2px', textTransform: 'uppercase',
            }}
          />
        </label>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px', background: palette.accent, color: palette.bg,
            fontFamily: 'Archivo Black, sans-serif', fontSize: '13px', borderRadius: '2px',
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onStart, onHistory, onFavorites, onColorSettings, onRerun, history, favorites, findMatchingFavorite, addFavorite, removeFavorite, favCollapsed, setFavCollapsed, recentCollapsed, setRecentCollapsed, settings, settingsHydrated, setSettings, library, rainbowModeActive, onRainbowModeActivate, onRainbowModeDeactivate }) {
  const [infoFor, setInfoFor] = useState(null);
  const [namingEntry, setNamingEntry] = useState(null); // entry being named for favoriting
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showHomeScreenPrompt, setShowHomeScreenPrompt] = useState(false);
  const [rainbowMessage, setRainbowMessage] = useState({ nonce: 0, text: '', emphasis: 'normal' });
  const rainbowTapCountRef = useRef(0);
  const rainbowTapResetRef = useRef(null);
  const rainbowActivationRef = useRef(null);
  const rainbowTitleRef = useRef(null);

  const recentNow = Date.now();
  const recent = history.filter(entry => isHomeRecentWorkout(entry, recentNow)).slice(0, HOME_RECENT_LIMIT);
  const favs = favorites.slice(0, 5);
  const hasFavorites = favorites.length > 0;

  useEffect(() => {
    if (!settingsHydrated) return undefined;
    if (settingsOpen) return undefined;
    if (settings.homeScreenPromptSeen) {
      setShowHomeScreenPrompt(false);
      return undefined;
    }
    if (!shouldShowHomeScreenInstallPrompt()) return undefined;

    const timer = window.setTimeout(() => setShowHomeScreenPrompt(true), 500);
    return () => window.clearTimeout(timer);
  }, [settingsHydrated, settings.homeScreenPromptSeen, settingsOpen]);

  useEffect(() => {
    return () => {
      if (rainbowTapResetRef.current) window.clearTimeout(rainbowTapResetRef.current);
      if (rainbowActivationRef.current) window.clearTimeout(rainbowActivationRef.current);
    };
  }, []);

  const triggerRainbowTitleFeedback = () => {
    if (!rainbowTitleRef.current) return;
    rainbowTitleRef.current.classList.remove('home-title-tap-shake');
    void rainbowTitleRef.current.offsetWidth;
    rainbowTitleRef.current.classList.add('home-title-tap-shake');
  };

  const handleRainbowTitleTap = () => {
    triggerRainbowTitleFeedback();

    if (rainbowTapResetRef.current) {
      window.clearTimeout(rainbowTapResetRef.current);
      rainbowTapResetRef.current = null;
    }

    rainbowTapCountRef.current += 1;

    if (rainbowTapCountRef.current >= RAINBOW_TAP_THRESHOLD) {
      rainbowTapCountRef.current = 0;
      if (rainbowActivationRef.current) {
        window.clearTimeout(rainbowActivationRef.current);
        rainbowActivationRef.current = null;
      }

      if (rainbowModeActive) {
        setRainbowMessage(prev => ({ nonce: prev.nonce + 1, text: RAINBOW_DEACTIVATION_MESSAGE, emphasis: 'normal' }));
        onRainbowModeDeactivate();
        return;
      }

      setRainbowMessage(prev => ({ nonce: prev.nonce + 1, text: RAINBOW_ACTIVATION_MESSAGE, emphasis: 'normal' }));
      rainbowActivationRef.current = window.setTimeout(() => {
        rainbowActivationRef.current = null;
        setRainbowMessage(prev => ({ nonce: prev.nonce + 1, text: RAINBOW_ACTIVATED_MESSAGE, emphasis: 'strong' }));
        onRainbowModeActivate();
      }, RAINBOW_MESSAGE_SEQUENCE_DELAY_MS);
      return;
    }

    rainbowTapResetRef.current = window.setTimeout(() => {
      rainbowTapCountRef.current = 0;
      rainbowTapResetRef.current = null;
    }, RAINBOW_TAP_RESET_MS);
  };

  const handleStarToggle = (entry) => {
    const existing = findMatchingFavorite(entry);
    if (existing) {
      removeFavorite(entry);
    } else {
      setNamingEntry(entry);
    }
  };

  const saveFavoriteName = (name) => {
    if (namingEntry) addFavorite(namingEntry, name);
    setNamingEntry(null);
  };

  const dismissHomeScreenPrompt = () => {
    setShowHomeScreenPrompt(false);
    setSettings(prev => ({ ...prev, homeScreenPromptSeen: true }));
  };

  const openSettings = () => {
    setSettingsOpen(true);
    if (settingsHydrated && !settings.homeScreenPromptSeen && shouldShowHomeScreenInstallPrompt()) {
      setSettings(prev => ({ ...prev, homeScreenPromptSeen: true }));
    }
  };

  const openSettingsFromPrompt = () => {
    dismissHomeScreenPrompt();
    setSettingsOpen(true);
  };

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', padding: `${SAFE_TOP_24} 24px 24px`, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '4px' }}>// NO EXCUSES</div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)' }}>v{APP_VERSION}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {favorites.length > 0 && (
            <button onClick={onFavorites} style={{
              padding: '10px 12px', background: 'var(--surface)', border: `1px solid ${alphaColorToken('var(--favorite)', '33')}`,
              borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--favorite)',
            }}>
              <Star size={14} fill="var(--favorite)" />
              <span className="mono" style={{ fontSize: '11px' }}>{favorites.length}</span>
            </button>
          )}
          <button onClick={onHistory} style={{
            padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-strong)',
          }}>
            <History size={14} />
            <span className="mono" style={{ fontSize: '11px' }}>HISTORY</span>
          </button>
          <button onClick={openSettings} style={{
            padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '2px', display: 'flex', alignItems: 'center', color: 'var(--muted-strong)',
          }}>
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          ref={rainbowTitleRef}
          onClick={handleRainbowTitleTap}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            rainbowTitleRef.current?.classList.remove('home-title-tap-shake');
          }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation', willChange: 'transform' }}
        >
          <AnimatedTitle />
        </div>
        {rainbowMessage.nonce > 0 && (
          <div
            key={rainbowMessage.nonce}
            className="display rainbow-mode-activated-message"
            aria-live="polite"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              color: '#FFFFFF',
              textAlign: 'center',
              fontSize: rainbowMessage.emphasis === 'strong' ? 'clamp(48px, 16vw, 190px)' : 'clamp(32px, 10vw, 92px)',
              lineHeight: rainbowMessage.emphasis === 'strong' ? 0.82 : 0.95,
              overflowWrap: 'break-word',
              textShadow: '0 5px 28px rgba(0,0,0,0.62), 0 0 28px rgba(255,255,255,0.38)',
            }}
          >
            {rainbowMessage.text}
          </div>
        )}
        <div className="mono" style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '16px', maxWidth: '320px', lineHeight: 1.5 }}>
          Build your workout. Pick your format. Do the work.
        </div>
      </div>

      {hasFavorites && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            width: '100%', padding: '6px 0', marginBottom: favCollapsed ? 0 : '8px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <button
              onClick={() => setFavCollapsed(v => !v)}
              style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--favorite)' }}
            >
              <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={10} fill="var(--favorite)" /> FAVORITES
                <span style={{ color: 'var(--subtle)', marginLeft: '4px' }}>({favorites.length})</span>
              </div>
              <ChevronDown
                size={14}
                style={{ transition: 'transform 0.2s', transform: favCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
              />
            </button>
            <button
              onClick={onFavorites}
              className="mono"
              style={{
                padding: '5px 7px', background: 'var(--surface-muted)', border: `1px solid ${alphaColorToken('var(--favorite)', '44')}`,
                borderRadius: '2px', color: 'var(--favorite)', fontSize: '9px', fontWeight: 900,
                letterSpacing: '0.05em', flexShrink: 0,
              }}
            >
              SHOW ALL FAVORITES
            </button>
          </div>
          {!favCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {favs.map((entry, i) => (
                <RecentWorkoutCard
                  key={entry.favId || entry.date}
                  entry={entry}
                  opacity={1 - i * 0.08}
                  isFavorite
                  onRun={() => onRerun(entry)}
                  onInfo={() => setInfoFor(entry)}
                  findMatchingFavorite={findMatchingFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '100%', padding: '6px 0', marginBottom: recentCollapsed ? 0 : '8px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <button
              onClick={() => setRecentCollapsed(v => !v)}
              style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--subtle)' }}
            >
              <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                // RECENT
                <span style={{ marginLeft: '6px', color: 'var(--subtle)' }}>({recent.length})</span>
              </div>
              <ChevronDown
                size={14}
                style={{ transition: 'transform 0.2s', transform: recentCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
              />
            </button>
            <button
              onClick={onHistory}
              className="mono"
              style={{
                padding: '5px 7px', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)',
                borderRadius: '2px', color: 'var(--muted)', fontSize: '9px', fontWeight: 900,
                letterSpacing: '0.05em', flexShrink: 0,
              }}
            >
              SHOW ALL HISTORY
            </button>
          </div>
          {!recentCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recent.map((entry, i) => (
                <RecentWorkoutCard
                  key={entry.date}
                  entry={entry}
                  opacity={1 - i * 0.3}
                  onRun={() => onRerun(entry)}
                  onInfo={() => setInfoFor(entry)}
                  onStarToggle={() => handleStarToggle(entry)}
                  findMatchingFavorite={findMatchingFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <button onClick={onStart} style={{
        padding: '24px', background: 'var(--accent)', color: 'var(--on-accent)', fontSize: '20px', fontWeight: 900,
        letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: '2px', fontFamily: 'Archivo Black, sans-serif',
      }}>
        <span>BUILD NEW WORKOUT</span>
        <Play size={24} fill="var(--on-accent)" />
      </button>

      {infoFor && <WorkoutInfoModal entry={infoFor} library={library} onClose={() => setInfoFor(null)} onRun={() => { onRerun(infoFor); setInfoFor(null); }} />}
      {namingEntry && (
        <NameFavoriteModal
          entry={namingEntry}
          onCancel={() => setNamingEntry(null)}
          onSave={saveFavoriteName}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onOpenColorSettings={() => {
            setSettingsOpen(false);
            onColorSettings();
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {showHomeScreenPrompt && (
        <HomeScreenInstallPrompt
          onDismiss={dismissHomeScreenPrompt}
          onOpenSettings={openSettingsFromPrompt}
        />
      )}
    </div>
  );
}

function HomeScreenInstallPrompt({ onDismiss, onOpenSettings }) {
  return (
    <div
      className="fade-in"
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,0.58)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: `${SAFE_TOP_24} 22px 24px`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 'calc(env(safe-area-inset-top) + 14px)', right: '16px',
          width: '58px', height: '58px', borderRadius: '999px',
          border: '2px solid var(--accent)', boxShadow: '0 0 28px var(--accent)',
          animation: 'settings-callout-ring 1.25s ease-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 'calc(env(safe-area-inset-top) + 24px)', right: '26px',
          width: '38px', height: '38px', borderRadius: '2px', background: 'var(--surface)',
          border: '1px solid var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--accent)',
        }}
      >
        <Settings size={18} />
      </div>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(100%, 360px)', background: 'rgba(14,14,14,0.96)',
          border: '2px solid var(--accent)', borderRadius: '2px', padding: '22px',
          boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
          animation: 'welcome-card-in 0.46s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        <div className="display" style={{ fontSize: 'clamp(46px, 13vw, 68px)', lineHeight: 0.85, color: 'var(--fg)', marginBottom: '12px' }}>
          WELCOME
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--muted-strong)', lineHeight: 1.55, marginBottom: '18px' }}>
          Go to Settings to learn how to add this to your phone's Home Screen.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.75fr', gap: '8px' }}>
          <button
            onClick={onOpenSettings}
            style={{
              padding: '13px 12px', background: 'var(--accent)', color: 'var(--on-accent)',
              borderRadius: '2px', fontFamily: 'Archivo Black, sans-serif',
              fontSize: '12px',
            }}
          >
            OPEN SETTINGS
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: '13px 12px', background: 'var(--surface-muted)', color: 'var(--muted)',
              border: '1px solid var(--border-strong)', borderRadius: '2px',
              fontSize: '11px', fontWeight: 900,
            }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ settings, setSettings, onOpenColorSettings, onClose }) {
  const [settingsView, setSettingsView] = useState('main');
  const guideOpen = settingsView === 'homescreen' || settingsView === 'iconSetup';
  const title = settingsView === 'version'
    ? 'APP VERSION HISTORY'
    : settingsView === 'feedback'
      ? 'FEEDBACK / ISSUES'
      : settingsView === 'homescreen'
        ? 'ADD TO HOME SCREEN'
        : settingsView === 'iconSetup'
          ? 'CUSTOM ICON SETUP'
          : 'SETTINGS';

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const goBack = () => {
    setSettingsView(settingsView === 'iconSetup' ? 'homescreen' : 'main');
  };

  return (
    <div
      className="fade-in"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100,
        display: 'flex', alignItems: guideOpen ? 'stretch' : 'flex-end', padding: guideOpen ? 0 : '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '2px',
          padding: guideOpen ? `${SAFE_TOP_20} 20px 20px` : '20px',
          maxHeight: guideOpen ? '100dvh' : '80vh',
          minHeight: guideOpen ? '100dvh' : 'auto',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settingsView !== 'main' ? (
              <button onClick={goBack} style={{ color: 'var(--muted)', padding: '2px' }}>
                <ChevronLeft size={18} />
              </button>
            ) : (
              <Settings size={18} color="var(--accent)" />
            )}
            <div className="stencil" style={{ fontSize: '22px', color: 'var(--accent)' }}>
              {title}
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--subtle)' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {settingsView === 'version' ? (
            <VersionHistoryList />
          ) : settingsView === 'feedback' ? (
            <FeedbackIssuesPanel />
          ) : settingsView === 'homescreen' ? (
            <IosHomeScreenGuide onAdvanced={() => setSettingsView('iconSetup')} />
          ) : settingsView === 'iconSetup' ? (
            <AdvancedHomeScreenIconGuide />
          ) : (
            <>
              <SettingsToggle
                label="Remember section layout"
                description="Keep Favorites and Recent collapse states between visits. When off, both start collapsed every time."
                checked={!!settings.rememberSectionState}
                onToggle={() => toggle('rememberSectionState')}
              />

              <SettingsAction
                icon={<Palette size={18} color="var(--accent)" />}
                label="Customize colors"
                description="Choose a palette or build your own."
                onClick={onOpenColorSettings}
              />

              <SettingsAction
                icon={<Smartphone size={18} color="var(--accent)" />}
                label="Add to iOS Home Screen"
                description="Animated iOS setup guide for an app-like bookmark."
                onClick={() => setSettingsView('homescreen')}
              />

              <SettingsAction
                icon={<Mail size={18} color="var(--accent)" />}
                label="Submit feedback / issues"
                description="Send feedback, feature ideas, or issue details by email."
                onClick={() => setSettingsView('feedback')}
              />

              <SettingsAction
                icon={<Info size={18} color="var(--accent)" />}
                label="App version history"
                description="See released versions and what changed."
                onClick={() => setSettingsView('version')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GuideStep({ number, title, children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', gap: '12px',
      padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px',
    }}>
      <div className="display" style={{
        width: '34px', height: '34px', background: 'var(--accent)', color: 'var(--on-accent)',
        borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', lineHeight: 1,
      }}>
        {number}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg)', marginBottom: '4px' }}>
          {title}
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function IosHomeScreenGuide({ onAdvanced }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="mono" style={{
          fontSize: '10px', padding: '4px 8px', background: alphaColorToken('var(--accent)', '22'),
          color: 'var(--accent)', borderRadius: '2px', fontWeight: 900, letterSpacing: '0.08em',
        }}>
          iOS SAFARI
        </span>
        <span className="mono" style={{
          fontSize: '10px', padding: '4px 8px', background: 'var(--surface-strong)',
          color: 'var(--muted)', borderRadius: '2px', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          ANDROID: USE YOUR DEVICE INSTRUCTIONS
        </span>
      </div>

      <div>
        <div className="display" style={{ fontSize: 'clamp(38px, 11vw, 64px)', lineHeight: 0.86, color: 'var(--fg)', marginBottom: '8px' }}>
          MAKE IT FEEL LIKE AN APP
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, maxWidth: '520px' }}>
          On iPhone, add this site to your Home Screen from Safari. The bookmark opens like a lightweight app.
        </div>
      </div>

      <div style={{
        background: 'var(--field-bg)', border: '1px solid var(--border)', borderRadius: '2px',
        padding: '10px', display: 'flex', justifyContent: 'center',
      }}>
        <img
          src={IOS_HOME_SCREEN_GIF}
          alt="iOS steps to add this app bookmark to the Home Screen"
          style={{
            width: '100%', maxWidth: '430px', maxHeight: '46dvh',
            objectFit: 'contain', borderRadius: '2px', display: 'block',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <GuideStep number="1" title="Open in Safari">
          Use Safari on iOS, then open the Share sheet.
        </GuideStep>
        <GuideStep number="2" title="Add to Home Screen">
          Choose Add to Home Screen, then tap Add.
        </GuideStep>
        <GuideStep number="3" title="Launch from the icon">
          Open it from your Home Screen for the app-style experience.
        </GuideStep>
      </div>

      <button onClick={onAdvanced} style={{
        width: '100%', padding: '16px', background: 'var(--surface-muted)', color: 'var(--accent)',
        border: `1px solid ${alphaColorToken('var(--accent)', '55')}`, borderRadius: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <ImageIcon size={18} />
          <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif', letterSpacing: '0.02em', textAlign: 'left' }}>
            ADVANCED HOMESCREEN BOOKMARK IMAGE SETUP
          </span>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function AdvancedHomeScreenIconGuide() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' }}>
      <div>
        <div className="display" style={{ fontSize: 'clamp(36px, 10vw, 58px)', lineHeight: 0.86, color: 'var(--fg)', marginBottom: '8px' }}>
          CUSTOM ICON
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, maxWidth: '560px' }}>
          Optional iOS Shortcut workflow for choosing a bookmark image from Photos.
        </div>
      </div>

      <a
        href={IOS_CUSTOM_ICON_SHORTCUT_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--on-accent)',
          borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          textDecoration: 'none',
        }}
      >
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '14px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif', letterSpacing: '0.02em' }}>
            INSTALL THE IOS SHORTCUT
          </span>
          <span className="mono" style={{ display: 'block', fontSize: '10px', marginTop: '4px', opacity: 0.8, wordBreak: 'break-word' }}>
            {IOS_CUSTOM_ICON_SHORTCUT_URL}
          </span>
        </span>
        <ExternalLink size={18} />
      </a>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <GuideStep number="1" title="Install the Shortcut">
          Open the iCloud link above and add the iOS Shortcut.
        </GuideStep>
        <GuideStep number="2" title="Have an image ready">
          Save the icon image you want in the Photos app.
        </GuideStep>
        <GuideStep number="3" title="Run it from Safari">
          Open this app in Safari, open Share, then scroll to Customize Web App Icon.
        </GuideStep>
        <GuideStep number="4" title="Add the bookmark">
          Pick your image, then use the Home Screen guide to add the bookmark.
        </GuideStep>
      </div>
    </div>
  );
}

function FeedbackIssuesPanel() {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const copyEmail = async () => {
    const ok = await copyTextToClipboard(FEEDBACK_EMAIL_ADDRESS);
    if (!ok) return;
    setCopied(true);
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' }}>
      <div>
        <div className="display" style={{ fontSize: 'clamp(36px, 10vw, 58px)', lineHeight: 0.86, color: 'var(--fg)', marginBottom: '8px' }}>
          SEND A NOTE
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, maxWidth: '560px' }}>
          Use this email for feedback, enhancement ideas, feature requests, or issues you run into. If you are reporting a problem, include screenshots if possible, your device and browser, what happened, what you expected, and any steps that help reproduce it.
        </div>
      </div>

      <div style={{
        padding: '14px', background: 'var(--field-bg)', border: '1px solid var(--border)', borderRadius: '2px',
      }}>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', letterSpacing: '0.08em', marginBottom: '6px' }}>
          // EMAIL
        </div>
        <div className="mono" style={{ fontSize: '14px', color: 'var(--fg)', wordBreak: 'break-all' }}>
          {FEEDBACK_EMAIL_ADDRESS}
        </div>
      </div>

      <a
        href={buildFeedbackMailtoUrl()}
        style={{
          width: '100%', padding: '16px', background: 'var(--accent)', color: 'var(--on-accent)',
          borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          textDecoration: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Mail size={18} />
          <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif', letterSpacing: '0.02em' }}>
            SEND EMAIL
          </span>
        </span>
        <ExternalLink size={18} />
      </a>

      <button
        onClick={copyEmail}
        style={{
          width: '100%', padding: '16px', background: 'var(--surface-muted)', color: copied ? 'var(--favorite)' : 'var(--muted-strong)',
          border: `1px solid ${copied ? alphaColorToken('var(--favorite)', '66') : 'var(--border-strong)'}`,
          borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif', letterSpacing: '0.02em' }}>
            {copied ? 'EMAIL COPIED' : 'COPY EMAIL ADDRESS'}
          </span>
        </span>
      </button>
    </div>
  );
}

function SettingsAction({ icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '14px', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: '2px',
        display: 'flex', alignItems: 'center', gap: '14px',
        textAlign: 'left', marginBottom: '8px',
      }}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg)', marginBottom: '2px' }}>
          {label}
        </div>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
      <ChevronRight size={18} color="var(--subtle)" />
    </button>
  );
}

function VersionHistoryList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {APP_VERSION_HISTORY.map(entry => (
        <div
          key={entry.version}
          style={{
            padding: '14px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: '2px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
            <div className="stencil" style={{ fontSize: '18px', color: 'var(--accent)' }}>v{entry.version}</div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', flexShrink: 0 }}>{entry.date}</div>
          </div>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '10px' }}>
            {entry.type}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entry.changes.map(change => (
              <div key={change} style={{ display: 'flex', gap: '8px', color: 'var(--muted-strong)', fontSize: '12px', lineHeight: 1.4 }}>
                <span className="mono" style={{ color: 'var(--accent)', flexShrink: 0 }}>//</span>
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsToggle({ label, description, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', padding: '14px', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: '2px',
        display: 'flex', alignItems: 'center', gap: '14px',
        textAlign: 'left', marginBottom: '8px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg)', marginBottom: '2px' }}>
          {label}
        </div>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
      <div style={{
        width: '40px', height: '22px', borderRadius: '20px',
        background: checked ? 'var(--accent)' : 'var(--surface-strong)',
        position: 'relative', transition: 'all 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: '2px', left: checked ? '20px' : '2px',
          width: '18px', height: '18px', borderRadius: '18px',
          background: checked ? 'var(--on-accent)' : 'var(--subtle)', transition: 'all 0.2s',
        }} />
      </div>
    </button>
  );
}

function NameFavoriteModal({ entry, onCancel, onSave, initialName = '', title = 'NAME THIS WORKOUT', saveLabel = 'SAVE' }) {
  const [name, setName] = React.useState(initialName);
  const modeLabel = MODE_LABELS[entry.mode] || (entry.mode && entry.mode.toUpperCase());
  const defaultPlaceholder = `${modeLabel} · ${entry.exercises?.length || 0} exercises`;

  return (
    <div
      className="fade-in"
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: 'var(--surface)', border: '2px solid var(--favorite)', borderRadius: '2px',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Star size={18} fill="var(--favorite)" color="var(--favorite)" />
          <div className="stencil" style={{ fontSize: '22px', color: 'var(--favorite)' }}>{title}</div>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.5 }}>
          Give it a name so you can find it later.
        </div>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSave(name); }}
          placeholder={defaultPlaceholder}
          maxLength={50}
          style={{
            width: '100%', padding: '14px', background: 'var(--field-bg)', color: 'var(--fg)',
            border: '1px solid var(--border-strong)', fontFamily: 'inherit', fontSize: '15px',
            borderRadius: '2px', marginBottom: '16px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '14px', background: 'var(--surface-muted)', color: 'var(--muted)',
            fontFamily: 'Archivo Black, sans-serif', fontSize: '13px', borderRadius: '2px',
          }}>CANCEL</button>
          <button onClick={() => onSave(name)} style={{
            flex: 2, padding: '14px', background: 'var(--favorite)', color: 'var(--on-favorite)',
            fontFamily: 'Archivo Black, sans-serif', fontSize: '13px', borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <Star size={14} fill="var(--on-favorite)" /> {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecentWorkoutCard({ entry, opacity, onRun, onInfo, onStarToggle, findMatchingFavorite, isFavorite }) {
  const cats = entry.categories || [];
  const mods = entry.modifiers || [];
  const modeLabel = MODE_LABELS[entry.mode] || (entry.mode && entry.mode.toUpperCase());
  const when = relativeTime(entry.date);
  const partial = isPartialHistoryEntry(entry);
  // Determine if this entry is starred (either it's a favorite itself or matches one)
  const starred = isFavorite || (findMatchingFavorite && !!findMatchingFavorite(entry));
  // Show name on top if favorite (either the direct name or matched fav name)
  const matchedFav = findMatchingFavorite ? findMatchingFavorite(entry) : null;
  const displayName = entry.name || (matchedFav && matchedFav.name);
  const borderColor = partial ? 'var(--accent2)' : (starred ? alphaColorToken('var(--favorite)', '55') : 'var(--border)');

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${borderColor}`, borderRadius: '2px',
      opacity, display: 'flex', alignItems: 'stretch', transition: 'opacity 0.2s',
    }}>
      <button
        onClick={onRun}
        style={{ flex: 1, padding: '12px 14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}
      >
        {displayName && (
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--favorite)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="stencil" style={{ fontSize: displayName ? '14px' : '18px', color: 'var(--accent)', lineHeight: 1 }}>{modeLabel}</div>
          {partial && (
            <div className="mono" style={{ fontSize: '9px', color: 'var(--accent2)', fontWeight: 900, letterSpacing: '0.08em' }}>* PARTIAL</div>
          )}
          <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)' }}>· {when}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
          {cats.map(c => {
            const cat = CATEGORIES.find(x => x.key === c);
            if (!cat) return null;
            return (
              <span key={c} className="mono" style={{
                fontSize: '9px', padding: '2px 6px', background: alphaColorToken(cat.color, '22'),
                color: cat.color, borderRadius: '2px', fontWeight: 700, letterSpacing: '0.05em',
              }}>{cat.label}</span>
            );
          })}
          {mods.map(m => {
            const mod = MODIFIERS.find(x => x.key === m);
            if (!mod) return null;
            return (
              <span key={m} className="mono" style={{
                fontSize: '9px', padding: '2px 6px', background: alphaColorToken(mod.color, '22'),
                color: mod.color, borderRadius: '2px', fontWeight: 700, letterSpacing: '0.05em',
              }}>+ {mod.label}</span>
            );
          })}
          <span className="mono" style={{ fontSize: '9px', color: 'var(--subtle)' }}>{entry.totalItems} sets</span>
          {partial && (
            <span className="mono" style={{ fontSize: '9px', color: 'var(--accent2)' }}>{partialProgressLabel(entry)}</span>
          )}
        </div>
      </button>
      {onStarToggle && (
        <button
          onClick={onStarToggle}
          style={{ padding: '12px 12px', borderLeft: '1px solid var(--border)', color: starred ? 'var(--favorite)' : 'var(--subtle)', display: 'flex', alignItems: 'center' }}
        >
          <Star size={16} fill={starred ? 'var(--favorite)' : 'transparent'} />
        </button>
      )}
      <button
        onClick={onInfo}
        style={{ padding: '12px 14px', borderLeft: '1px solid var(--border)', color: 'var(--subtle)', display: 'flex', alignItems: 'center' }}
      >
        <Info size={16} />
      </button>
    </div>
  );
}

function DraggableFavoriteList({ favorites, onReorder, onRun, onInfo, onEdit, onDelete, findMatchingFavorite, gap = '8px' }) {
  const [dragState, setDragState] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const listRef = useRef(null);

  const getTargetIndex = (clientY) => {
    const rows = Array.from(listRef.current?.querySelectorAll('[data-favorite-row]') || []);
    if (rows.length === 0) return 0;
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return rows.length - 1;
  };

  const startDrag = (event, srcIdx) => {
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    if (clientY == null) return;
    event.preventDefault();
    setDragState({ srcIdx, targetIdx: srcIdx });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const handleMove = (event) => {
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      if (clientY == null) return;
      if (event.cancelable) event.preventDefault();
      const targetIdx = getTargetIndex(clientY);
      setDragState(prev => prev ? { ...prev, targetIdx } : null);
    };

    const handleEnd = () => {
      setDragState(current => {
        if (current && current.srcIdx !== current.targetIdx) {
          const next = [...favorites];
          const [moved] = next.splice(current.srcIdx, 1);
          next.splice(current.targetIdx, 0, moved);
          onReorder(next);
        }
        return null;
      });
    };

    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    document.addEventListener('mouseup', handleEnd);

    return () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [dragState ? dragState.srcIdx : null, favorites, onReorder]);

  return (
    <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap, touchAction: dragState ? 'none' : 'auto' }}>
      {favorites.map((entry, i) => {
        const isDragging = dragState && dragState.srcIdx === i;
        const isDropTarget = dragState && !isDragging && dragState.targetIdx === i;
        const rowId = entry.favId || entry.date;
        const confirmingDelete = confirmDeleteId === rowId;

        return (
          <div
            key={rowId}
            data-favorite-row
            style={{
              display: 'flex', alignItems: 'stretch', gap: '6px', position: 'relative',
              opacity: isDragging ? 0.55 : 1,
              transform: isDropTarget ? 'translateY(-1px)' : 'translateY(0)',
              transition: dragState ? 'none' : 'opacity 0.15s, transform 0.15s ease',
              zIndex: isDropTarget ? 2 : 1,
            }}
          >
            {isDropTarget && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute', inset: '-4px', border: '2px solid var(--favorite)',
                  borderRadius: '4px', background: alphaColorToken('var(--favorite)', '12'),
                  boxShadow: `0 0 0 3px ${alphaColorToken('var(--favorite)', '24')}, 0 0 18px ${alphaColorToken('var(--favorite)', '33')}`,
                  pointerEvents: 'none', zIndex: 3,
                }}
              />
            )}
            <button
              type="button"
              onMouseDown={e => startDrag(e, i)}
              onTouchStart={e => startDrag(e, i)}
              aria-label="Drag favorite"
              style={{
                width: '34px', flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '2px', color: isDragging ? 'var(--favorite)' : 'var(--subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                touchAction: 'none', cursor: 'grab',
              }}
            >
              <GripVertical size={18} />
            </button>
            <div style={{
              flex: 1, minWidth: 0,
              transform: confirmingDelete ? 'translateX(-6px)' : 'translateX(0)',
              transition: 'transform 0.18s ease',
            }}>
              <RecentWorkoutCard
                entry={entry}
                opacity={1}
                isFavorite
                onRun={() => onRun(entry)}
                onInfo={() => onInfo(entry)}
                findMatchingFavorite={findMatchingFavorite}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '4px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => onEdit(entry)}
                aria-label="Edit favorite name"
                style={{
                  width: '34px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px',
                  color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmingDelete) {
                    setConfirmDeleteId(null);
                    onDelete(entry);
                  } else {
                    setConfirmDeleteId(rowId);
                  }
                }}
                onBlur={() => setTimeout(() => setConfirmDeleteId(current => current === rowId ? null : current), 120)}
                aria-label={confirmingDelete ? 'Confirm delete favorite' : 'Delete favorite'}
                className="mono"
                style={{
                  width: confirmingDelete ? '74px' : '34px',
                  background: confirmingDelete ? 'var(--warn)' : 'var(--surface)',
                  border: `1px solid ${confirmingDelete ? 'var(--warn)' : 'var(--border)'}`,
                  borderRadius: '2px', color: confirmingDelete ? 'var(--on-warn)' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 900, letterSpacing: '0.04em',
                  transition: 'width 0.18s ease, background 0.18s ease, color 0.18s ease',
                }}
              >
                {confirmingDelete ? 'DELETE?' : <Trash2 size={15} />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryWorkoutList({ history, onRun, onInfo, onStarToggle, onDelete, findMatchingFavorite }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {history.map((entry, i) => {
        const rowId = `${entry.date || 'history'}-${entry.partialKey || entry.status || entry.mode || 'complete'}-${i}`;
        const confirmingDelete = confirmDeleteId === rowId;

        return (
          <div
            key={rowId}
            style={{ display: 'flex', alignItems: 'stretch', gap: '4px' }}
          >
            <div style={{
              flex: 1, minWidth: 0,
              transform: confirmingDelete ? 'translateX(-6px)' : 'translateX(0)',
              transition: 'transform 0.18s ease',
            }}>
              <RecentWorkoutCard
                entry={entry}
                opacity={1}
                onRun={() => onRun(entry)}
                onInfo={() => onInfo(entry)}
                onStarToggle={() => onStarToggle(entry)}
                findMatchingFavorite={findMatchingFavorite}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirmingDelete) {
                  setConfirmDeleteId(null);
                  onDelete(entry, i);
                } else {
                  setConfirmDeleteId(rowId);
                }
              }}
              onBlur={() => setTimeout(() => setConfirmDeleteId(current => current === rowId ? null : current), 120)}
              aria-label={confirmingDelete ? 'Confirm delete history workout' : 'Delete history workout'}
              className="mono"
              style={{
                width: confirmingDelete ? '74px' : '34px',
                background: confirmingDelete ? 'var(--warn)' : 'var(--surface)',
                border: `1px solid ${confirmingDelete ? 'var(--warn)' : 'var(--border)'}`,
                borderRadius: '2px', color: confirmingDelete ? 'var(--on-warn)' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 900, letterSpacing: '0.04em',
                transition: 'width 0.18s ease, background 0.18s ease, color 0.18s ease',
                flexShrink: 0,
              }}
            >
              {confirmingDelete ? 'DELETE?' : <Trash2 size={15} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function WorkoutInfoModal({ entry, library, onClose, onRun, onContinue, onStartOver }) {
  const cats = entry.categories || [];
  const mods = entry.modifiers || [];
  const exercises = enrichExercisesWithLibrary(entry.exercises || [], library);
  const modeLabel = MODE_LABELS[entry.mode] || (entry.mode && entry.mode.toUpperCase());
  const partial = isPartialHistoryEntry(entry);

  return (
    <div
      onClick={onClose}
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'flex-end', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '2px',
          padding: '20px', maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)' }}>
            // {new Date(entry.date).toLocaleString()}{partial ? ' · * PARTIAL' : ''}
          </div>
          <button onClick={onClose} style={{ color: 'var(--subtle)' }}><X size={18} /></button>
        </div>

        <div className="display" style={{ fontSize: '32px', lineHeight: 0.9, color: 'var(--accent)', marginBottom: '4px' }}>
          {modeLabel}
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
          {entry.totalItems} total sets · {exercises.length} exercises{partial ? ` · ${partialProgressLabel(entry)}` : ''}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {cats.map(c => {
            const cat = CATEGORIES.find(x => x.key === c);
            if (!cat) return null;
            return (
              <span key={c} className="stencil" style={{
                fontSize: '14px', padding: '4px 10px', background: alphaColorToken(cat.color, '22'),
                color: cat.color, borderRadius: '2px',
              }}>{cat.label}</span>
            );
          })}
          {mods.map(m => {
            const mod = MODIFIERS.find(x => x.key === m);
            if (!mod) return null;
            return (
              <span key={m} className="stencil" style={{
                fontSize: '14px', padding: '4px 10px', background: alphaColorToken(mod.color, '22'),
                color: mod.color, borderRadius: '2px',
              }}>+ {mod.label}</span>
            );
          })}
        </div>

        <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '8px' }}>// EXERCISES</div>
        <div style={{ marginBottom: '20px' }}>
          {exercises.map(ex => {
            const reps = (entry.modeConfig && entry.modeConfig.exerciseSets && entry.modeConfig.exerciseSets[ex.id]) || ex.default || ex.defaultReps;
            const equip = EQUIP[ex.equipment] || EQUIP.bodyweight;
            return (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="mono" style={{
                  fontSize: '9px', padding: '2px 5px', background: alphaColorToken(equip.color, '22'),
                  color: equip.color, borderRadius: '2px', fontWeight: 700, minWidth: '30px', textAlign: 'center',
                }}>{equip.label}</span>
                <div style={{ flex: 1, fontSize: '13px' }}>{ex.name}</div>
              <SourceInfoButton exercise={ex} size={13} color="var(--subtle)" activeColor={equip.color} />
                <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>{reps} {ex.unit}</div>
              </div>
            );
          })}
        </div>

        {partial ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onStartOver || onRun} style={{
              flex: 1, padding: '18px 12px', background: 'var(--surface-muted)', color: 'var(--muted)',
              fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
              borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <SkipBack size={16} /> START OVER
            </button>
            <button onClick={onContinue || onRun} style={{
              flex: 1, padding: '18px 12px', background: 'var(--accent)', color: 'var(--on-accent)',
              fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
              borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <Play size={16} fill="var(--on-accent)" /> CONTINUE
            </button>
          </div>
        ) : (
          <button onClick={onRun} style={{
            width: '100%', padding: '20px', background: 'var(--accent)', color: 'var(--on-accent)',
            fontSize: '16px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}>
            <Play size={18} fill="var(--on-accent)" /> RUN AGAIN
          </button>
        )}
      </div>
    </div>
  );
}

function PartialWorkoutActionModal({ entry, onCancel, onContinue, onStartOver }) {
  const modeLabel = MODE_LABELS[entry.mode] || (entry.mode && entry.mode.toUpperCase());

  return (
    <div
      onClick={onCancel}
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 180, display: 'flex', alignItems: 'flex-end', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: 'var(--surface)', border: '2px solid var(--accent2)', borderRadius: '2px',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--accent2)', letterSpacing: '0.1em', marginBottom: '6px' }}>* PARTIAL</div>
            <div className="display" style={{ fontSize: '32px', lineHeight: 0.9, color: 'var(--accent)', marginBottom: '6px' }}>
              {modeLabel}
            </div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>{partialProgressLabel(entry)}</div>
          </div>
          <button onClick={onCancel} style={{ color: 'var(--subtle)' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onStartOver} style={{
            flex: 1, padding: '18px 12px', background: 'var(--surface-muted)', color: 'var(--muted)',
            fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <SkipBack size={16} /> START OVER
          </button>
          <button onClick={onContinue} style={{
            flex: 1, padding: '18px 12px', background: 'var(--accent)', color: 'var(--on-accent)',
            fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <Play size={16} fill="var(--on-accent)" /> CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ history, library, onBack, onRerun, onContinuePartial, onClear, onDeleteEntry, findMatchingFavorite, addFavorite, removeFavorite }) {
  const [infoFor, setInfoFor] = useState(null);
  const [partialActionFor, setPartialActionFor] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [namingEntry, setNamingEntry] = useState(null);

  const handleStarToggle = (entry) => {
    const existing = findMatchingFavorite(entry);
    if (existing) {
      removeFavorite(entry);
    } else {
      setNamingEntry(entry);
    }
  };

  const startOverEntry = (entry) => {
    setPartialActionFor(null);
    setInfoFor(null);
    onRerun(entry);
  };

  const continuePartialEntry = (entry) => {
    setPartialActionFor(null);
    setInfoFor(null);
    onContinuePartial(entry);
  };

  const handleRunEntry = (entry) => {
    if (isPartialHistoryEntry(entry)) {
      setPartialActionFor(entry);
      return;
    }
    onRerun(entry);
  };

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <div style={{ padding: `${SAFE_TOP_20} 24px 12px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', padding: '4px 0' }}>
            <ChevronLeft size={18} />
            <span className="mono" style={{ fontSize: '11px' }}>HOME</span>
          </button>
          {history.length > 0 && (
            <button
              onClick={() => confirmClear ? (onClear(), setConfirmClear(false)) : setConfirmClear(true)}
              style={{ color: confirmClear ? 'var(--accent)' : 'var(--subtle)', fontSize: '11px' }}
              className="mono"
            >
              {confirmClear ? 'TAP AGAIN TO CONFIRM' : 'CLEAR'}
            </button>
          )}
        </div>
        <div className="display" style={{ fontSize: 'clamp(36px, 10vw, 56px)', lineHeight: 0.9, color: 'var(--fg)' }}>
          HISTORY
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)', marginTop: '8px' }}>
          {history.length} {history.length === 1 ? 'session' : 'sessions'} logged
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 24px 24px', overflowY: 'auto' }}>
        {history.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--subtle)' }}>
            <div className="mono" style={{ fontSize: '12px' }}>// NOTHING HERE YET</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>Finish or quit a workout and it'll show up.</div>
          </div>
        ) : (
          <HistoryWorkoutList
            history={history}
            onRun={handleRunEntry}
            onInfo={setInfoFor}
            onStarToggle={handleStarToggle}
            onDelete={onDeleteEntry}
            findMatchingFavorite={findMatchingFavorite}
          />
        )}
      </div>

      {infoFor && (
        <WorkoutInfoModal
          entry={infoFor}
          library={library}
          onClose={() => setInfoFor(null)}
          onRun={() => { onRerun(infoFor); setInfoFor(null); }}
          onContinue={() => continuePartialEntry(infoFor)}
          onStartOver={() => startOverEntry(infoFor)}
        />
      )}
      {partialActionFor && (
        <PartialWorkoutActionModal
          entry={partialActionFor}
          onCancel={() => setPartialActionFor(null)}
          onContinue={() => continuePartialEntry(partialActionFor)}
          onStartOver={() => startOverEntry(partialActionFor)}
        />
      )}
      {namingEntry && (
        <NameFavoriteModal
          entry={namingEntry}
          onCancel={() => setNamingEntry(null)}
          onSave={(name) => { addFavorite(namingEntry, name); setNamingEntry(null); }}
        />
      )}
    </div>
  );
}

function FavoritesScreen({ favorites, library, onBack, onRerun, removeFavorite, renameFavorite, reorderFavorites }) {
  const [infoFor, setInfoFor] = useState(null);
  const [editingFavorite, setEditingFavorite] = useState(null);

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <div style={{ padding: `${SAFE_TOP_20} 24px 12px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', padding: '4px 0' }}>
            <ChevronLeft size={18} />
            <span className="mono" style={{ fontSize: '11px' }}>HOME</span>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Star size={28} fill="var(--favorite)" color="var(--favorite)" />
          <div className="display" style={{ fontSize: 'clamp(36px, 10vw, 56px)', lineHeight: 0.9, color: 'var(--favorite)' }}>
            FAVORITES
          </div>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)', marginTop: '8px' }}>
          {favorites.length} saved {favorites.length === 1 ? 'workout' : 'workouts'}
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 24px 24px', overflowY: 'auto' }}>
        {favorites.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--subtle)' }}>
            <div className="mono" style={{ fontSize: '12px' }}>// NOTHING HERE YET</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>Tap the star on any workout to favorite it.</div>
          </div>
        ) : (
          <DraggableFavoriteList
            favorites={favorites}
            onReorder={reorderFavorites}
            onRun={onRerun}
            onInfo={setInfoFor}
            onEdit={setEditingFavorite}
            onDelete={removeFavorite}
          />
        )}
      </div>

      {infoFor && <WorkoutInfoModal entry={infoFor} library={library} onClose={() => setInfoFor(null)} onRun={() => { onRerun(infoFor); setInfoFor(null); }} />}
      {editingFavorite && (
        <NameFavoriteModal
          entry={editingFavorite}
          initialName={editingFavorite.name || ''}
          title="EDIT FAVORITE NAME"
          saveLabel="UPDATE"
          onCancel={() => setEditingFavorite(null)}
          onSave={(name) => {
            renameFavorite(editingFavorite, name);
            setEditingFavorite(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryScreen({ selectedCategories, setSelectedCategories, selectedModifiers, setSelectedModifiers, onBack, onNext }) {
  const toggleCat = (key) => {
    setSelectedCategories(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const toggleMod = (key) => {
    setSelectedModifiers(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <Header step={1} total={4} title="TARGETS" onBack={onBack} />
      <div style={{ padding: '0 24px 24px', flex: 1, overflowY: 'auto' }}>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--subtle)', marginBottom: '16px' }}>
          // MUSCLE GROUPS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '32px' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const on = selectedCategories.includes(cat.key);
            const activeTextColor = readableOnToken(cat.color);
            return (
              <button
                key={cat.key}
                onClick={() => toggleCat(cat.key)}
                style={{
                  padding: '18px 10px', aspectRatio: '1', display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-start', justifyContent: 'space-between', textAlign: 'left',
                  background: on ? cat.color : 'var(--surface)', color: on ? activeTextColor : 'var(--fg)',
                  border: on ? `2px solid ${cat.color}` : '2px solid var(--border)',
                  borderRadius: '2px', transition: 'all 0.15s',
                }}
              >
                <Icon size={24} strokeWidth={on ? 2.5 : 1.5} />
                <div>
                  <div className="stencil" style={{ fontSize: '18px', lineHeight: 1, marginBottom: '2px' }}>{cat.label}</div>
                  <div className="mono" style={{ fontSize: '9px', opacity: 0.7 }}>
                    {on ? '✓ ON' : 'TAP'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mono" style={{ fontSize: '12px', color: 'var(--subtle)', marginBottom: '8px' }}>
          // EQUIPMENT AVAILABLE
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)', marginBottom: '12px', lineHeight: 1.5 }}>
          Toggle these to unlock more exercise variants in each group.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MODIFIERS.map(mod => {
            const Icon = mod.icon;
            const on = selectedModifiers.includes(mod.key);
            const activeTextColor = readableOnToken(mod.color);
            return (
              <button
                key={mod.key}
                onClick={() => toggleMod(mod.key)}
                style={{
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
                  background: on ? mod.color : 'var(--surface)', color: on ? activeTextColor : 'var(--fg)',
                  border: on ? `2px solid ${mod.color}` : '2px solid var(--border)',
                  borderRadius: '2px', transition: 'all 0.15s',
                }}
              >
                <Icon size={22} strokeWidth={on ? 2.5 : 1.5} />
                <div style={{ flex: 1 }}>
                  <div className="stencil" style={{ fontSize: '18px', lineHeight: 1, marginBottom: '2px' }}>{mod.label}</div>
                  <div className="mono" style={{ fontSize: '10px', opacity: 0.75 }}>{mod.desc}</div>
                </div>
                <div style={{
                  width: '36px', height: '20px', borderRadius: '20px',
                  background: on ? activeTextColor : 'var(--surface-strong)', position: 'relative', transition: 'all 0.2s',
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: on ? '18px' : '2px',
                    width: '16px', height: '16px', borderRadius: '16px',
                    background: on ? mod.color : 'var(--subtle)', transition: 'all 0.2s',
                  }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <BottomBar disabled={selectedCategories.length === 0} onNext={onNext} label="PICK EXERCISES" />
    </div>
  );
}

function CategoryRandomPicker({ catKey, catColor, maxCount, value, onValueChange, onRandom, hasAdvancedControls = false, advancedOpen = false, onToggleAdvanced }) {
  // If no exercises in this category, don't render
  if (maxCount === 0) return null;
  // Clamp value to valid range
  const safeValue = Math.max(1, Math.min(maxCount, value));
  const min = 1;
  const max = maxCount;
  const activeTextColor = readableOnToken(catColor);

  return (
    <div style={{
      padding: '10px 12px', marginBottom: '10px',
      background: 'var(--surface)', border: `1px solid ${alphaColorToken(catColor, '33')}`, borderRadius: '2px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--muted)', flex: 1 }}>
          PICK <span style={{ color: catColor, fontWeight: 700 }}>{safeValue}</span> AT RANDOM
        </div>
        {hasAdvancedControls && (
          <button onClick={onToggleAdvanced} style={{
            padding: '6px 10px', background: advancedOpen ? 'var(--surface-muted)' : 'var(--bg)',
            color: catColor, border: `1px solid ${alphaColorToken(catColor, '66')}`,
            fontSize: '10px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            letterSpacing: '0.03em', borderRadius: '2px', display: 'flex',
            alignItems: 'center', gap: '5px',
          }}>
            <ChevronDown
              size={12}
              style={{ transition: 'transform 0.2s', transform: advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
            {advancedOpen ? 'HIDE ALL ALTERNATIVES' : 'SHOW ALL ALTERNATIVES'}
          </button>
        )}
        <button onClick={onRandom} style={{
          padding: '6px 12px', background: catColor, color: activeTextColor,
          fontSize: '11px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
          letterSpacing: '0.05em', borderRadius: '2px', display: 'flex',
          alignItems: 'center', gap: '5px',
        }}>
          <Shuffle size={12} strokeWidth={2.5} /> RANDOM
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={safeValue}
        onChange={e => onValueChange(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: catColor }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <div className="mono" style={{ fontSize: '9px', color: 'var(--subtle)' }}>{min}</div>
        <div className="mono" style={{ fontSize: '9px', color: 'var(--subtle)' }}>{max}</div>
      </div>
    </div>
  );
}

function ExerciseScreen({ library, setLibrary, categories, modifiers, selected, setSelected, onBack, onNext }) {
  const [addingTo, setAddingTo] = useState(null);
  const [newName, setNewName] = useState('');
  const [newMin, setNewMin] = useState(10);
  const [newMax, setNewMax] = useState(30);
  const [newDefault, setNewDefault] = useState(15);
  const [newEquip, setNewEquip] = useState('bodyweight');
  const [newUnit, setNewUnit] = useState('reps');
  // Per-category random-pick counts (how many to randomly select)
  const [randomCounts, setRandomCounts] = useState({});
  const [expandedExerciseGroups, setExpandedExerciseGroups] = useState({});
  const [expandedAdvancedBuckets, setExpandedAdvancedBuckets] = useState({});

  const allowedEquip = new Set(['bodyweight', ...modifiers]);

  const isExerciseVisibleInPicker = (ex) => {
    if (!allowedEquip.has(ex.equipment)) return false;
    if (ex.standaloneAdvanced) return !!expandedAdvancedBuckets[ex.advancedBucketKey];
    if (ex.hasGroupVariants && !ex.groupPrimary) return !!expandedExerciseGroups[ex.groupKey];
    return true;
  };

  const getSelectableExercisesForCategory = (catKey) => (
    library[catKey].filter(ex => isExerciseVisibleInPicker(ex))
  );

  const toggleExerciseGroup = (groupKey) => {
    setExpandedExerciseGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const toggleAdvancedBucket = (bucketKey) => {
    setExpandedAdvancedBuckets(prev => ({ ...prev, [bucketKey]: !prev[bucketKey] }));
  };

  const getCategoryAdvancedKeys = (catKey) => {
    const groupKeys = new Set();
    const bucketKeys = new Set();

    library[catKey].forEach(ex => {
      if (!allowedEquip.has(ex.equipment)) return;
      if (ex.hasGroupVariants && ex.groupKey) groupKeys.add(ex.groupKey);
      if (ex.standaloneAdvanced && ex.advancedBucketKey) bucketKeys.add(ex.advancedBucketKey);
    });

    return { groupKeys: [...groupKeys], bucketKeys: [...bucketKeys] };
  };

  const hasCategoryAdvancedControls = (catKey) => {
    const { groupKeys, bucketKeys } = getCategoryAdvancedKeys(catKey);
    return groupKeys.length > 0 || bucketKeys.length > 0;
  };

  const isAnyCategoryAdvancedOpen = (catKey) => {
    const { groupKeys, bucketKeys } = getCategoryAdvancedKeys(catKey);
    return (
      groupKeys.some(groupKey => !!expandedExerciseGroups[groupKey]) ||
      bucketKeys.some(bucketKey => !!expandedAdvancedBuckets[bucketKey])
    );
  };

  const toggleAllAdvancedForCategory = (catKey) => {
    const { groupKeys, bucketKeys } = getCategoryAdvancedKeys(catKey);
    const shouldHide = isAnyCategoryAdvancedOpen(catKey);

    setExpandedExerciseGroups(prev => {
      const next = { ...prev };
      groupKeys.forEach(groupKey => { next[groupKey] = !shouldHide; });
      return next;
    });
    setExpandedAdvancedBuckets(prev => {
      const next = { ...prev };
      bucketKeys.forEach(bucketKey => { next[bucketKey] = !shouldHide; });
      return next;
    });
  };

  const toggle = (ex) => {
    setSelected(prev => {
      const exists = prev.find(e => e.id === ex.id);
      return exists ? prev.filter(e => e.id !== ex.id) : [...prev, { ...ex }];
    });
  };

  // Randomly pick N exercises from this category's available pool,
  // REPLACING any currently-selected exercises in that category
  const randomizePicksForCategory = (catKey, n) => {
    const pool = getSelectableExercisesForCategory(catKey);
    if (pool.length === 0) return;
    const count = Math.min(n, pool.length);
    const shuffled = shuffleArr(pool).slice(0, count);
    setSelected(prev => {
      // Keep selections from other categories, replace this one
      const otherCats = prev.filter(e => e.category !== catKey);
      return [...otherCats, ...shuffled.map(ex => ({ ...ex }))];
    });
  };

  const addCustom = (catKey) => {
    if (!newName.trim()) return;
    const ex = {
      id: 'custom-' + Date.now(), name: newName.trim(), category: catKey,
      equipment: newEquip, unit: newUnit,
      min: parseInt(newMin) || 5, max: parseInt(newMax) || 30, default: parseInt(newDefault) || 15,
      custom: true,
    };
    setLibrary(prev => ({ ...prev, [catKey]: [...prev[catKey], ex] }));
    setNewName(''); setAddingTo(null);
  };

  const removeCustom = (ex) => {
    setLibrary(prev => ({ ...prev, [ex.category]: prev[ex.category].filter(e => e.id !== ex.id) }));
    setSelected(prev => prev.filter(e => e.id !== ex.id));
  };

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <Header step={2} total={4} title="EXERCISES" onBack={onBack} />
      <div style={{ padding: '0 24px 24px', flex: 1, overflowY: 'auto' }}>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--subtle)', marginBottom: '16px' }}>
          // {selected.length} SELECTED
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {Object.values(EQUIP).filter(e => allowedEquip.has(e.key)).map(e => (
            <div key={e.key} className="mono" style={{
              fontSize: '9px', padding: '3px 8px', background: alphaColorToken(e.color, '22'),
              color: e.color, borderRadius: '2px', fontWeight: 700, letterSpacing: '0.05em',
            }}>{e.label} {e.name}</div>
          ))}
        </div>

        {categories.map(catKey => {
          const cat = CATEGORIES.find(c => c.key === catKey);
          const Icon = cat.icon;
          const visibleExs = getSelectableExercisesForCategory(catKey);
          const hasAdvancedControls = hasCategoryAdvancedControls(catKey);
          const advancedOpen = isAnyCategoryAdvancedOpen(catKey);
          return (
            <div key={catKey} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: `2px solid ${cat.color}`, paddingBottom: '8px' }}>
                <Icon size={18} color={cat.color} />
                <div className="stencil" style={{ fontSize: '20px', color: cat.color }}>{cat.label}</div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', marginLeft: 'auto' }}>{visibleExs.length} available</div>
              </div>

              {/* Random picker for this category */}
              <CategoryRandomPicker
                catKey={catKey}
                catColor={cat.color}
                maxCount={visibleExs.length}
                value={randomCounts[catKey] ?? Math.min(5, visibleExs.length)}
                onValueChange={v => setRandomCounts(p => ({ ...p, [catKey]: v }))}
                onRandom={() => randomizePicksForCategory(catKey, randomCounts[catKey] ?? Math.min(5, visibleExs.length))}
                hasAdvancedControls={hasAdvancedControls}
                advancedOpen={advancedOpen}
                onToggleAdvanced={() => toggleAllAdvancedForCategory(catKey)}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {EQUIPMENT_RENDER_ORDER.filter(equipKey => allowedEquip.has(equipKey)).map(equipKey => {
                  const equip = EQUIP[equipKey] || EQUIP.bodyweight;
                  const equipmentExercises = library[catKey].filter(ex => ex.equipment === equipKey && allowedEquip.has(ex.equipment));
                  const mainRows = equipmentExercises.filter(ex => !ex.standaloneAdvanced && isExerciseVisibleInPicker(ex));
                  const advancedRows = equipmentExercises.filter(ex => ex.standaloneAdvanced);
                  const bucketKey = makeAdvancedBucketKey(catKey, equipKey);
                  const advancedExpanded = !!expandedAdvancedBuckets[bucketKey];
                  if (mainRows.length === 0 && advancedRows.length === 0) return null;

                  return (
                    <div key={equipKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="mono" style={{ fontSize: '10px', color: equip.color, letterSpacing: '0.08em', marginTop: '2px' }}>
                        // {EQUIPMENT_ADVANCED_LABELS[equipKey]}
                      </div>
                      {mainRows.map(ex => (
                        <ExercisePickerRow
                          key={ex.id}
                          exercise={ex}
                          selected={!!selected.find(e => e.id === ex.id)}
                          revealed={ex.hasGroupVariants && !ex.groupPrimary}
                          groupExpanded={!!expandedExerciseGroups[ex.groupKey]}
                          onToggle={() => toggle(ex)}
                          onToggleGroup={() => toggleExerciseGroup(ex.groupKey)}
                          onRemoveCustom={() => removeCustom(ex)}
                        />
                      ))}
                      {advancedRows.length > 0 && (
                        <button
                          onClick={() => toggleAdvancedBucket(bucketKey)}
                          style={{
                            padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: advancedExpanded ? equip.color : 'var(--surface)',
                            color: advancedExpanded ? readableOnToken(equip.color) : equip.color,
                            border: `1px dashed ${alphaColorToken(equip.color, '66')}`, borderRadius: '2px',
                            fontFamily: 'Archivo Black, sans-serif', fontSize: '11px', letterSpacing: '0.03em',
                          }}
                        >
                          <span>{advancedExpanded ? 'HIDE ADVANCED' : 'ADVANCED'} {CATEGORY_ADVANCED_LABELS[catKey]} {EQUIPMENT_ADVANCED_LABELS[equipKey]}</span>
                          <ChevronDown
                            size={16}
                            style={{ transition: 'transform 0.2s', transform: advancedExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          />
                        </button>
                      )}
                      {advancedExpanded && advancedRows.map(ex => (
                        <ExercisePickerRow
                          key={ex.id}
                          exercise={ex}
                          selected={!!selected.find(e => e.id === ex.id)}
                          revealed
                          groupExpanded={!!expandedExerciseGroups[ex.groupKey]}
                          onToggle={() => toggle(ex)}
                          onToggleGroup={() => toggleExerciseGroup(ex.groupKey)}
                          onRemoveCustom={() => removeCustom(ex)}
                        />
                      ))}
                    </div>
                  );
                })}
                {addingTo === catKey ? (
                  <div style={{ padding: '12px', background: 'var(--surface)', border: `1px dashed ${cat.color}`, borderRadius: '2px' }}>
                    <input
                      autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="Exercise name"
                      style={{ width: '100%', padding: '8px', background: 'var(--field-bg)', color: 'var(--fg)', border: '1px solid var(--border-strong)', marginBottom: '8px', fontFamily: 'inherit', borderRadius: '2px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <select value={newEquip} onChange={e => setNewEquip(e.target.value)} style={{ flex: 1, padding: '8px', background: 'var(--field-bg)', color: 'var(--fg)', border: '1px solid var(--border-strong)', fontFamily: 'inherit', borderRadius: '2px', fontSize: '11px' }}>
                        <option value="bodyweight">Bodyweight</option>
                        {allowedEquip.has('weights') && <option value="weights">Dumbbell</option>}
                        {allowedEquip.has('pullup') && <option value="pullup">Bar</option>}
                      </select>
                      <select value={newUnit} onChange={e => setNewUnit(e.target.value)} style={{ padding: '8px', background: 'var(--field-bg)', color: 'var(--fg)', border: '1px solid var(--border-strong)', fontFamily: 'inherit', borderRadius: '2px', fontSize: '11px' }}>
                        <option value="reps">reps</option>
                        <option value="sec">sec</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', fontSize: '11px' }}>
                      <label style={{ flex: 1, color: 'var(--muted)' }}>
                        MIN
                        <input type="number" value={newMin} onChange={e => setNewMin(e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--field-bg)', color: 'var(--fg)', border: '1px solid var(--border-strong)', fontFamily: 'inherit', borderRadius: '2px', marginTop: '2px' }} />
                      </label>
                      <label style={{ flex: 1, color: 'var(--muted)' }}>
                        DEFAULT
                        <input type="number" value={newDefault} onChange={e => setNewDefault(e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--field-bg)', color: 'var(--fg)', border: '1px solid var(--border-strong)', fontFamily: 'inherit', borderRadius: '2px', marginTop: '2px' }} />
                      </label>
                      <label style={{ flex: 1, color: 'var(--muted)' }}>
                        MAX
                        <input type="number" value={newMax} onChange={e => setNewMax(e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--field-bg)', color: 'var(--fg)', border: '1px solid var(--border-strong)', fontFamily: 'inherit', borderRadius: '2px', marginTop: '2px' }} />
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => addCustom(catKey)} style={{ flex: 1, padding: '8px', background: cat.color, color: readableOnToken(cat.color), fontWeight: 700, borderRadius: '2px' }}>ADD</button>
                      <button onClick={() => setAddingTo(null)} style={{ padding: '8px 12px', color: 'var(--subtle)' }}><X size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(catKey)}
                    style={{ padding: '10px', color: cat.color, border: `1px dashed ${alphaColorToken(cat.color, '44')}`, borderRadius: '2px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> ADD CUSTOM
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <BottomBar disabled={selected.length === 0} onNext={onNext} label="CHOOSE FORMAT" />
    </div>
  );
}

function SourceInfoButton({ exercise, size = 14, color = 'var(--subtle)', activeColor = 'var(--accent)', style = {} }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasDetails = !!(exercise?.description || exercise?.sourceUrl || exercise?.directUrl);
  if (!hasDetails) return null;

  return (
    <>
      <button
        type="button"
        aria-label={`Open details for ${exercise.name}`}
        title={`Open details for ${exercise.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setDetailsOpen(true);
        }}
        style={{
          width: `${size + 14}px`,
          height: `${size + 14}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          borderRadius: '2px',
          flexShrink: 0,
          ...style,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = activeColor; }}
        onMouseLeave={e => { e.currentTarget.style.color = color; }}
      >
        <Info size={size} />
      </button>
      {detailsOpen && (
        <ExerciseDescriptionModal
          exercise={exercise}
          accentColor={activeColor}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}

function ExerciseDescriptionModal({ exercise, accentColor = 'var(--accent)', onClose }) {
  const sourceUrl = exercise?.sourceUrl || exercise?.directUrl;
  const description = exercise?.description || 'No description is available for this exercise yet.';
  const accentTextColor = readableOnToken(accentColor);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fade-in"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 260,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: `calc(20px + env(safe-area-inset-top, 0px)) 20px 20px`,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          height: 'min(760px, calc(100dvh - 56px))',
          background: 'var(--surface)', border: `2px solid ${accentColor}`, borderRadius: '2px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <div className="mono" style={{ fontSize: '10px', color: accentColor, marginBottom: '8px', letterSpacing: '0.1em' }}>
            // EXERCISE DETAILS
          </div>
          <div className="stencil" style={{ fontSize: '28px', color: 'var(--fg)', lineHeight: 1 }}>
            {exercise.name}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{
            fontSize: '15px', lineHeight: 1.65, color: 'var(--fg)',
            whiteSpace: 'pre-wrap',
          }}>
            {description}
          </div>
        </div>

        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '16px 12px', background: 'var(--surface-muted)', color: 'var(--muted-strong)',
              fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
              letterSpacing: '0.02em', borderRadius: '2px',
            }}
          >
            BACK
          </button>
          <button
            onClick={() => openExerciseSource(exercise)}
            disabled={!sourceUrl}
            style={{
              padding: '16px 12px', background: sourceUrl ? accentColor : 'var(--surface-muted)',
              color: sourceUrl ? accentTextColor : 'var(--subtle)',
              fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
              letterSpacing: '0.02em', borderRadius: '2px', opacity: sourceUrl ? 1 : 0.6,
            }}
          >
            MORE DETAILS
          </button>
        </div>
      </div>
    </div>
  );
}

function ExercisePickerRow({ exercise, selected, revealed = false, groupExpanded, onToggle, onToggleGroup, onRemoveCustom }) {
  const equip = EQUIP[exercise.equipment] || EQUIP.bodyweight;
  const canExpandGroup = exercise.hasGroupVariants && exercise.groupPrimary;
  const background = selected ? 'var(--fg)' : (revealed ? 'var(--surface-muted)' : 'var(--surface)');
  const borderColor = selected ? 'var(--fg)' : (revealed ? 'var(--border-strong)' : 'var(--border)');
  const selectedText = 'var(--bg)';
  const activeEquipText = readableOnToken(equip.color);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'stretch', overflow: 'hidden',
        background,
        color: selected ? selectedText : 'var(--fg)',
        border: `1px solid ${borderColor}`,
        borderRadius: '2px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          padding: '12px 8px 12px 14px', display: 'flex', alignItems: 'center', gap: '12px',
          flex: 1, minWidth: 0, textAlign: 'left',
        }}
      >
        <div style={{
          width: '18px', height: '18px', border: `2px solid ${selected ? selectedText : 'var(--subtle)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px',
          flexShrink: 0,
        }}>
          {selected && <Check size={12} strokeWidth={3} />}
        </div>
        <div style={{ fontWeight: 600, fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {exercise.name}
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '8px', flexShrink: 0 }}>
        <span className="mono" style={{
          fontSize: '9px', padding: '2px 6px',
          background: selected ? selectedText : 'var(--surface-strong)',
          color: equip.color,
          borderRadius: '2px', fontWeight: 700, letterSpacing: '0.05em',
        }}>{equip.label}</span>
        {canExpandGroup && (
          <button
            type="button"
            onClick={onToggleGroup}
            className="mono"
            style={{
              padding: '5px 7px', background: groupExpanded ? equip.color : 'var(--surface-strong)',
              color: groupExpanded ? activeEquipText : equip.color,
              borderRadius: '2px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}
          >
            {groupExpanded ? 'HIDE' : 'ALTERNATIVES'}
            <ChevronDown
              size={11}
              style={{ transition: 'transform 0.2s', transform: groupExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        )}
        <SourceInfoButton exercise={exercise} size={14} color={selected ? selectedText : 'var(--subtle)'} activeColor={equip.color} />
        {exercise.custom && (
          <button
            type="button"
            onClick={onRemoveCustom}
            style={{ padding: '4px', opacity: 0.5, color: selected ? selectedText : 'var(--fg)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ModeScreen({ mode, setMode, modeConfig, setModeConfig, exercises, setExercises, onBack, onNext }) {
  // Track previous mode so we know what to seed from when switching to manual
  const prevModeRef = React.useRef(mode);

  useEffect(() => {
    if (mode && mode !== 'manual') {
      setModeConfig(prev => {
        const next = { ...prev };
        if (!next.sets) next.sets = 3;
        if (!next.supersetSize) next.supersetSize = 2;
        const filled = { ...(next.exerciseSets || {}) };
        exercises.forEach(e => {
          if (filled[e.id] === undefined) filled[e.id] = e.default || e.defaultReps || 10;
        });
        next.exerciseSets = filled;
        return next;
      });
    }
    // When switching INTO manual, seed the queue from the previous non-manual mode config
    // (only if manualQueue is empty, so we don't wipe user's manual edits on every re-entry)
    if (mode === 'manual') {
      const prev = prevModeRef.current;
      setModeConfig(cfg => {
        const hasExistingQueue = cfg.manualQueue && cfg.manualQueue.length > 0;
        if (hasExistingQueue) return cfg; // preserve user's existing manual edits

        // If user had a real mode configured with exercises, seed from it
        if (prev && prev !== 'manual' && exercises && exercises.length > 0) {
          const built = buildQueue(exercises, prev, cfg);
          // Enrich with min/max and fresh unique IDs for the manual queue
          const seeded = built.map((item, i) => {
            const libEx = exercises.find(e => e.id === item.exId);
            return {
              id: 'q-' + Date.now() + '-' + i + '-' + Math.random(),
              exId: item.exId,
              name: item.name,
              reps: item.reps,
              unit: item.unit,
              equipment: item.equipment,
              sourceUrl: item.sourceUrl,
              description: item.description,
              difficulty: item.difficulty,
              exerciseGroup: item.exerciseGroup,
              min: libEx ? libEx.min : undefined,
              max: libEx ? libEx.max : undefined,
            };
          });
          return { ...cfg, manualQueue: seeded };
        }

        // Otherwise just make sure it's initialized as empty array
        return { ...cfg, manualQueue: [] };
      });
    }
    prevModeRef.current = mode;
  }, [mode]);

  const canProceed = mode && (mode !== 'manual' || (modeConfig.manualQueue && modeConfig.manualQueue.length > 0));

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <Header step={3} total={4} title="FORMAT" onBack={onBack} />
      <div style={{ padding: '0 24px 24px', flex: 1, overflowY: 'auto' }}>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--subtle)', marginBottom: '16px' }}>
          // HOW DO YOU WANT TO RUN IT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {MODES.map(m => {
            const Icon = m.icon;
            const on = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  padding: '14px 16px', textAlign: 'left', background: on ? 'var(--accent)' : 'var(--surface)',
                  color: on ? 'var(--on-accent)' : 'var(--fg)', border: `2px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '2px', display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}
              >
                <Icon size={22} strokeWidth={on ? 2.5 : 1.5} style={{ marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div className="stencil" style={{ fontSize: '18px', marginBottom: '2px', lineHeight: 1 }}>{m.label}</div>
                  <div className="mono" style={{ fontSize: '11px', opacity: 0.75, lineHeight: 1.4 }}>{m.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {mode && mode !== 'manual' && (
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '2px', marginBottom: '16px' }}>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '12px' }}>// CONFIG</div>
            {(mode === 'focus' || mode === 'circuit') && (
              <NumberField
                label={mode === 'focus' ? 'SETS PER EXERCISE' : 'ROUNDS'}
                value={modeConfig.sets || 3}
                onChange={v => setModeConfig(p => ({ ...p, sets: v }))}
                min={1} max={10}
              />
            )}
            {mode === 'superset' && (
              <>
                <NumberField
                  label="EXERCISES PER GROUP"
                  value={modeConfig.supersetSize || 2}
                  onChange={v => setModeConfig(p => ({ ...p, supersetSize: v }))}
                  min={2} max={10}
                />
                <NumberField
                  label="SETS PER GROUP"
                  value={modeConfig.sets || 3}
                  onChange={v => setModeConfig(p => ({ ...p, sets: v }))}
                  min={1} max={10}
                />
              </>
            )}
            {mode === 'addon' && (
              <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Round 1: exercise 1. Round 2: exercises 1, 2. Round 3: 1, 2, 3. And so on, until all {exercises.length} are hit in the final round.
              </div>
            )}
          </div>
        )}

        {mode && mode !== 'manual' && (
          <OrderList
            exercises={exercises}
            setExercises={setExercises}
            mode={mode}
            supersetSize={modeConfig.supersetSize || 2}
          />
        )}

        {mode && mode !== 'manual' && (
          <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '2px' }}>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '16px' }}>// REPS PER EXERCISE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {exercises.map(ex => (
                <RepSlider
                  key={ex.id}
                  exercise={ex}
                  value={(modeConfig.exerciseSets && modeConfig.exerciseSets[ex.id]) || ex.default}
                  onChange={v => setModeConfig(p => ({ ...p, exerciseSets: { ...p.exerciseSets, [ex.id]: v } }))}
                />
              ))}
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <ManualBuilder
            exercises={exercises}
            queue={modeConfig.manualQueue || []}
            setQueue={q => setModeConfig(p => ({ ...p, manualQueue: q }))}
          />
        )}
      </div>
      <BottomBar disabled={!canProceed} onNext={onNext} label="REST SETTINGS" />
    </div>
  );
}

function OrderList({ exercises, setExercises, mode, supersetSize = 2 }) {
  const [dragState, setDragState] = React.useState(null);
  // dragState shape: { srcIdx, targetIdx, y, offsetY }
  const listRef = React.useRef(null);
  const rowHeightRef = React.useRef(50); // measured row height including divider

  const doShuffle = (variant) => {
    if (variant === 'random') setExercises(shuffleArr(exercises));
    else if (variant === 'category') setExercises(shuffleByCategory(exercises));
    else if (variant === 'opposing') setExercises(shuffleByOpposing(exercises));
  };

  const shuffleOptions = [
    { key: 'random', label: 'PURE RANDOM', desc: 'Any exercise, any order' },
    { key: 'category', label: 'BY CATEGORY', desc: 'Upper → lower → core' },
  ];
  if (mode === 'superset') {
    shuffleOptions.push({ key: 'opposing', label: 'OPPOSING MUSCLES', desc: 'Push / pull / legs / core pairing' });
  }

  const catColor = (cat) => {
    const c = CATEGORIES.find(x => x.key === cat);
    return c ? c.color : '#888';
  };

  const showGroupDividers = mode === 'superset';

  // ========= Drag handlers =========
  const onPointerDown = (e, srcIdx) => {
    e.preventDefault();
    // Try to measure actual row height from the list
    if (listRef.current) {
      const rows = listRef.current.querySelectorAll('[data-row]');
      if (rows.length > 1) {
        const r0 = rows[0].getBoundingClientRect();
        const r1 = rows[1].getBoundingClientRect();
        rowHeightRef.current = r1.top - r0.top;
      } else if (rows.length === 1) {
        rowHeightRef.current = rows[0].getBoundingClientRect().height + 8;
      }
    }
    const listRect = listRef.current.getBoundingClientRect();
    setDragState({
      srcIdx,
      targetIdx: srcIdx,
      y: e.clientY - listRect.top,
      listTop: listRect.top,
    });
  };

  // Native document-level handlers (attached via useEffect below).
  // Using native listeners because React's synthetic event system attaches
  // touchmove as passive on some browsers, which makes preventDefault a no-op
  // and lets the page scroll when dragging downward.
  React.useEffect(() => {
    if (!dragState) return;

    const handleMove = (e) => {
      // Support both touch and mouse during drag
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      if (clientY == null) return;
      // Block scroll while dragging
      if (e.cancelable) e.preventDefault();

      if (!listRef.current) return;
      const listRect = listRef.current.getBoundingClientRect();
      const relY = clientY - listRect.top;
      const clampedY = Math.max(0, Math.min(listRect.height, relY));
      const rowH = rowHeightRef.current;
      let targetIdx = Math.floor(clampedY / rowH);
      targetIdx = Math.max(0, Math.min(exercises.length - 1, targetIdx));
      setDragState(prev => prev ? { ...prev, y: clampedY, targetIdx } : null);
    };

    const handleEnd = () => {
      setDragState(current => {
        if (current && current.srcIdx !== current.targetIdx) {
          const n = [...exercises];
          const [moved] = n.splice(current.srcIdx, 1);
          n.splice(current.targetIdx, 0, moved);
          setExercises(n);
        }
        return null;
      });
    };

    // passive: false is crucial — lets preventDefault actually stop scrolling
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    document.addEventListener('mouseup', handleEnd);

    return () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      document.removeEventListener('mouseup', handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragState ? dragState.srcIdx : null, exercises]);

  return (
    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '2px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>
          // ORDER ({exercises.length})
        </div>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)' }}>
          HOLD HANDLE TO DRAG
        </div>
      </div>

      {/* Shuffle buttons row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        {shuffleOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => doShuffle(opt.key)}
            style={{
              padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shuffle size={14} color="var(--accent)" />
              <div>
                <div className="stencil" style={{ fontSize: '14px', color: 'var(--fg)', lineHeight: 1 }}>{opt.label}</div>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--subtle)', marginTop: '2px' }}>{opt.desc}</div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700 }}>ROLL →</div>
          </button>
        ))}
      </div>

      {/* Ordered list - the draggable container */}
      <div
        ref={listRef}
        style={{
          display: 'flex', flexDirection: 'column', position: 'relative',
          // Disable browser gestures during drag so page doesn't scroll
          touchAction: dragState ? 'none' : 'auto',
        }}
      >
        {exercises.map((ex, i) => {
          const equip = EQUIP[ex.equipment] || EQUIP.bodyweight;
          const isGroupEnd = showGroupDividers && (i + 1) % supersetSize === 0 && i < exercises.length - 1;
          const isDragging = dragState && dragState.srcIdx === i;
          const isDropTarget = dragState && !isDragging && dragState.targetIdx === i;

          // Display index (accounts for where dragged item will slot in visually)
          let displayIdx = i;
          if (dragState && !isDragging) {
            const { srcIdx, targetIdx } = dragState;
            if (srcIdx < targetIdx) {
              // item moved down, rows srcIdx+1..targetIdx shift up by 1
              if (i > srcIdx && i <= targetIdx) displayIdx = i - 1;
            } else {
              // item moved up, rows targetIdx..srcIdx-1 shift down by 1
              if (i >= targetIdx && i < srcIdx) displayIdx = i + 1;
            }
          }

          return (
            <React.Fragment key={ex.id}>
              <div
                data-row
                style={{
                  padding: '10px 0', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative',
                  borderBottom: isGroupEnd ? 'none' : '1px solid var(--border)',
                  background: isDragging ? 'var(--surface-muted)' : 'transparent',
                  opacity: isDragging ? 0.55 : 1,
                  transform: isDropTarget ? 'translateY(-1px)' : 'translateY(0)',
                  transition: dragState ? 'none' : 'background 0.15s, transform 0.15s ease',
                  zIndex: isDropTarget ? 2 : 1,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {isDropTarget && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute', inset: '-4px', border: '2px solid var(--accent)',
                      borderRadius: '4px', background: alphaColorToken('var(--accent)', '12'),
                      boxShadow: `0 0 0 3px ${alphaColorToken('var(--accent)', '24')}, 0 0 18px ${alphaColorToken('var(--accent)', '33')}`,
                      pointerEvents: 'none', zIndex: 3,
                    }}
                  />
                )}
                <div className="mono" style={{
                  fontSize: '10px', color: 'var(--subtle)', width: '22px', flexShrink: 0,
                }}>{String(displayIdx + 1).padStart(2, '0')}</div>
                <div style={{
                  width: '3px', height: '28px', background: catColor(ex.category),
                  borderRadius: '2px', flexShrink: 0,
                }} />
                <span className="mono" style={{
                  fontSize: '9px', padding: '2px 5px', background: alphaColorToken(equip.color, '22'),
                  color: equip.color, borderRadius: '2px', fontWeight: 700, flexShrink: 0,
                }}>{equip.label}</span>
                <div style={{
                  flex: 1, fontSize: '13px', minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{ex.name}</div>

                {/* Drag handle - press and hold to reorder */}
                <div
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onPointerDown({ clientY: e.touches[0].clientY, preventDefault: () => {} }, i);
                  }}
                  onMouseDown={(e) => onPointerDown(e, i)}
                  style={{
                    width: '44px', height: '40px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'grab', touchAction: 'none',
                    color: isDragging ? 'var(--accent)' : 'var(--subtle)',
                    background: isDragging ? 'var(--bg)' : 'transparent',
                    borderRadius: '2px', flexShrink: 0,
                  }}
                >
                  <GripVertical size={20} strokeWidth={2} />
                </div>
              </div>
              {isGroupEnd && (
                <div style={{
                  height: '2px', background: 'var(--accent)', opacity: 0.4, margin: '4px 0',
                  borderRadius: '2px',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function RepSlider({ exercise, value, onChange }) {
  const min = exercise.min || 5;
  const max = exercise.max || 30;
  const equip = EQUIP[exercise.equipment] || EQUIP.bodyweight;
  const span = max - min;
  const presets = [min, Math.round(min + span / 3), Math.round(min + (2 * span) / 3), max];
  const currentValue = value || exercise.default || min;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <span className="mono" style={{
            fontSize: '9px', padding: '2px 5px', background: alphaColorToken(equip.color, '22'),
            color: equip.color, borderRadius: '2px', fontWeight: 700, flexShrink: 0,
          }}>{equip.label}</span>
          <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exercise.name}</div>
          <SourceInfoButton exercise={exercise} size={12} color="var(--subtle)" activeColor={equip.color} />
        </div>
        <div className="display" style={{ fontSize: '20px', color: 'var(--accent)', lineHeight: 1, flexShrink: 0, marginLeft: '8px' }}>
          {currentValue}<span className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', marginLeft: '3px', fontWeight: 400 }}>{exercise.unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ marginBottom: '8px' }}
      />
      <div style={{ display: 'flex', gap: '4px' }}>
        {presets.map((v, i) => (
          <button key={v + '-' + i} onClick={() => onChange(v)} style={{
            flex: 1, padding: '5px 4px', background: currentValue === v ? 'var(--accent)' : 'var(--surface)',
            color: currentValue === v ? 'var(--on-accent)' : 'var(--muted)', fontSize: '10px', borderRadius: '2px',
            fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
          }}>{v}</button>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 1, max = 99 }) {
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
      <div className="mono" style={{ fontSize: '11px', color: 'var(--muted-strong)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {atMin ? (
          <div style={{ width: '32px', height: '32px' }} />
        ) : (
          <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: '32px', height: '32px', background: 'var(--surface-muted)', borderRadius: '2px' }}><Minus size={14} /></button>
        )}
        <div className="display" style={{ minWidth: '40px', textAlign: 'center', fontSize: '20px', color: 'var(--accent)' }}>{value}</div>
        {atMax ? (
          <div style={{ width: '32px', height: '32px' }} />
        ) : (
          <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: '32px', height: '32px', background: 'var(--surface-muted)', borderRadius: '2px' }}><Plus size={14} /></button>
        )}
      </div>
    </div>
  );
}

function ManualBuilder({ exercises, queue, setQueue }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const addItem = (ex) => {
    const item = {
      id: 'q-' + Date.now() + '-' + Math.random(),
      exId: ex.id, name: ex.name, reps: ex.default || ex.defaultReps || 10,
      unit: ex.unit, equipment: ex.equipment, sourceUrl: ex.sourceUrl,
      description: ex.description, difficulty: ex.difficulty, exerciseGroup: ex.exerciseGroup,
      min: ex.min, max: ex.max,
    };
    setQueue([...queue, item]);
    setPickerOpen(false);
  };

  const removeAt = (i) => setQueue(queue.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const n = [...queue];
    const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setQueue(n);
  };
  const updateReps = (i, newReps) => {
    const n = [...queue];
    n[i] = { ...n[i], reps: Math.max(1, newReps) };
    setQueue(n);
  };

  return (
    <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>
          // QUEUE ({queue.length} ITEMS)
        </div>
        {queue.length > 0 && (
          <button
            onClick={() => {
              if (confirmReset) {
                setQueue([]);
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
              }
            }}
            onBlur={() => setConfirmReset(false)}
            className="mono"
            style={{
              fontSize: '10px',
              color: confirmReset ? 'var(--accent)' : 'var(--subtle)',
              padding: '4px 8px',
              border: `1px solid ${confirmReset ? 'var(--accent)' : 'var(--border-strong)'}`,
              borderRadius: '2px',
              letterSpacing: '0.05em',
            }}
          >
            {confirmReset ? 'TAP AGAIN TO RESET' : 'RESET'}
          </button>
        )}
      </div>
      {queue.length === 0 && (
        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)', padding: '20px 0', textAlign: 'center' }}>
          Empty queue. Add exercises below.
        </div>
      )}
      {queue.map((item, i) => {
        const equip = EQUIP[item.equipment] || EQUIP.bodyweight;
        return (
          <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', width: '22px' }}>{String(i + 1).padStart(2, '0')}</div>
              <span className="mono" style={{
                fontSize: '9px', padding: '2px 5px', background: alphaColorToken(equip.color, '22'),
                color: equip.color, borderRadius: '2px', fontWeight: 700,
              }}>{equip.label}</span>
              <div style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1, padding: '4px', color: 'var(--muted)' }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === queue.length - 1} style={{ opacity: i === queue.length - 1 ? 0.3 : 1, padding: '4px', color: 'var(--muted)' }}>↓</button>
              <button onClick={() => removeAt(i)} style={{ padding: '4px', color: 'var(--accent)' }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '30px' }}>
              <input
                type="range"
                min={item.min || 5}
                max={item.max || 30}
                value={item.reps}
                onChange={e => updateReps(i, parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <div className="mono" style={{ fontSize: '11px', minWidth: '50px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{item.reps} {item.unit}</div>
            </div>
          </div>
        );
      })}
      <button
        onClick={() => setPickerOpen(true)}
        style={{ marginTop: '12px', width: '100%', padding: '12px', background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 700, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <Plus size={16} /> ADD TO QUEUE
      </button>

      {pickerOpen && (
        <div
          onClick={() => setPickerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--surface)', borderTop: '2px solid var(--accent)', padding: '20px', maxHeight: '70vh', overflowY: 'auto', borderRadius: '2px 2px 0 0' }}>
            <div className="stencil" style={{ fontSize: '24px', color: 'var(--accent)', marginBottom: '16px' }}>PICK EXERCISE</div>
            {exercises.map(ex => {
              const equip = EQUIP[ex.equipment] || EQUIP.bodyweight;
              return (
                <button key={ex.id} onClick={() => addItem(ex)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px',
                  textAlign: 'left', color: 'var(--fg)', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: '2px', marginBottom: '6px',
                }}>
                  <span className="mono" style={{
                    fontSize: '9px', padding: '2px 5px', background: alphaColorToken(equip.color, '22'),
                    color: equip.color, borderRadius: '2px', fontWeight: 700,
                  }}>{equip.label}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{ex.name}</div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--muted)' }}>{ex.default || ex.defaultReps} {ex.unit}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RestScreen({ restConfig, setRestConfig, onBack, onNext, editingCurrentWorkout = false, onContinue, onStartOver }) {
  return (
    <div className="slide-in" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <Header step={4} total={4} title="REST" onBack={onBack} />
      <div style={{ padding: '0 24px 24px', flex: 1, overflowY: 'auto' }}>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--subtle)', marginBottom: '20px' }}>
          // HOW MUCH BREATHER BETWEEN SETS
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { k: 'fixed', l: 'FIXED' },
            { k: 'interval', l: 'WITH LONG REST' },
            { k: 'none', l: 'NONE' },
          ].map(t => {
            const on = restConfig.type === t.k;
            return (
              <button key={t.k} onClick={() => setRestConfig(p => ({ ...p, type: t.k }))} style={{
                flex: 1, padding: '14px 8px', background: on ? 'var(--accent)' : 'var(--surface)',
                color: on ? 'var(--on-accent)' : 'var(--fg)', border: `2px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '2px', fontWeight: 700, fontSize: '11px',
              }}>{t.l}</button>
            );
          })}
        </div>

        {restConfig.type !== 'none' && (
          <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '2px', marginBottom: '16px' }}>
            <TimeField
              label="REST BETWEEN SETS"
              value={restConfig.short}
              onChange={v => setRestConfig(p => ({ ...p, short: v }))}
            />
            {restConfig.type === 'interval' && (
              <>
                <div style={{ height: '1px', background: 'var(--surface-strong)', margin: '16px 0' }} />
                <TimeField
                  label="LONG REST"
                  value={restConfig.long}
                  onChange={v => setRestConfig(p => ({ ...p, long: v }))}
                />
                <NumberField
                  label="LONG REST EVERY X SETS"
                  value={restConfig.longEvery}
                  onChange={v => setRestConfig(p => ({ ...p, longEvery: v }))}
                  min={2} max={20}
                />
              </>
            )}
          </div>
        )}

        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)', padding: '12px', background: 'var(--surface)', borderRadius: '2px', lineHeight: 1.6 }}>
          TIP: You can always hit DONE to skip the rest timer early, or hit +15 to extend.
        </div>
      </div>
      {editingCurrentWorkout ? (
        <EditWorkoutActionBar onContinue={onContinue} onStartOver={onStartOver} />
      ) : (
        <BottomBar disabled={false} onNext={onNext} label="START WORKOUT" primary />
      )}
    </div>
  );
}

function EditWorkoutActionBar({ onContinue, onStartOver }) {
  return (
    <div style={{ padding: '16px 24px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <button
        onClick={onStartOver}
        style={{
          padding: '18px 12px', background: 'var(--surface-muted)', color: 'var(--muted-strong)',
          fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
          letterSpacing: '0.02em', borderRadius: '2px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <Play size={16} fill="var(--muted-strong)" />
        START OVER
      </button>
      <button
        onClick={onContinue}
        style={{
          padding: '18px 12px', background: 'var(--accent2)', color: 'var(--on-accent2)',
          fontSize: '13px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
          letterSpacing: '0.02em', borderRadius: '2px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <Check size={18} strokeWidth={3} />
        CONTINUE
      </button>
    </div>
  );
}

function TimeField({ label, value, onChange }) {
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customInput, setCustomInput] = React.useState('');
  const presets = [10, 15, 30, 60, 90, 120];
  // Slider range: 5s min (never less), 120s max (past that, use CUSTOM)
  const sliderMin = 5;
  const sliderMax = 120;
  // For display: if value exceeds slider max, slider caps at max but value shows correctly
  const sliderValue = Math.min(value, sliderMax);
  const isOverMax = value > sliderMax;

  const saveCustom = () => {
    const n = parseInt(customInput, 10);
    if (!isNaN(n) && n >= 1) {
      onChange(n);
    }
    setCustomOpen(false);
    setCustomInput('');
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <div className="mono" style={{ fontSize: '11px', color: 'var(--muted-strong)', marginBottom: '8px' }}>{label}</div>

      {/* Big value display */}
      <div className="display" style={{ textAlign: 'center', fontSize: '32px', color: 'var(--accent)', marginBottom: '10px' }}>
        {value}<span style={{ fontSize: '14px', color: 'var(--muted)', marginLeft: '4px' }}>sec</span>
      </div>

      {/* Slider - steps of 1 second for fine control */}
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={1}
        value={sliderValue}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        style={{ width: '100%', marginBottom: '6px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div className="mono" style={{ fontSize: '9px', color: 'var(--subtle)' }}>{sliderMin}s</div>
        <div className="mono" style={{ fontSize: '9px', color: isOverMax ? 'var(--accent)' : 'var(--subtle)' }}>
          {isOverMax ? `${value}s (CUSTOM)` : `${sliderMax}s`}
        </div>
      </div>

      {/* Preset chips + custom */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {presets.map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, padding: '6px 2px', background: value === v ? 'var(--accent)' : 'var(--surface)',
            color: value === v ? 'var(--on-accent)' : 'var(--muted)', fontSize: '10px', borderRadius: '2px', fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
          }}>{v}</button>
        ))}
        <button
          onClick={() => { setCustomInput(String(value)); setCustomOpen(true); }}
          style={{
            flex: 1.2, padding: '6px 2px',
            background: isOverMax ? 'var(--accent)' : 'var(--surface)',
            color: isOverMax ? 'var(--on-accent)' : 'var(--accent)',
            fontSize: '9px', borderRadius: '2px', fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            border: isOverMax ? 'none' : '1px solid #FF4D2E44',
          }}
        >CUSTOM</button>
      </div>

      {customOpen && (
        <div
          onClick={() => setCustomOpen(false)}
          className="fade-in"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'flex-start', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: '2px',
              padding: '20px',
            }}
          >
            <div className="stencil" style={{ fontSize: '22px', color: 'var(--accent)', marginBottom: '10px' }}>
              CUSTOM REST
            </div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.5 }}>
              Enter rest time in seconds.
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
              <input
                autoFocus
                type="number"
                min={1}
                inputMode="numeric"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveCustom(); }}
                style={{
                  flex: 1, padding: '14px', background: 'var(--field-bg)', color: 'var(--fg)',
                  border: '1px solid var(--border-strong)', fontFamily: 'inherit', fontSize: '24px',
                  borderRadius: '2px', textAlign: 'center', fontWeight: 700,
                }}
              />
              <div className="mono" style={{ fontSize: '14px', color: 'var(--muted)' }}>sec</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCustomOpen(false)} style={{
                flex: 1, padding: '14px', background: 'var(--surface-muted)', color: 'var(--muted)',
                fontFamily: 'Archivo Black, sans-serif', fontSize: '13px', borderRadius: '2px',
              }}>CANCEL</button>
              <button onClick={saveCustom} style={{
                flex: 2, padding: '14px', background: 'var(--accent)', color: 'var(--on-accent)',
                fontFamily: 'Archivo Black, sans-serif', fontSize: '13px', borderRadius: '2px',
              }}>SET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildQueue(exercises, mode, cfg) {
  const q = [];
  const getReps = (ex) => (cfg.exerciseSets && cfg.exerciseSets[ex.id]) || ex.default || ex.defaultReps || 10;
  const queueFields = (ex) => ({
    exId: ex.id,
    name: ex.name,
    unit: ex.unit,
    equipment: ex.equipment,
    sourceUrl: ex.sourceUrl,
    description: ex.description,
    difficulty: ex.difficulty,
    exerciseGroup: ex.exerciseGroup,
  });

  if (mode === 'manual') {
    const manualQueue = cfg.manualQueue || [];
    return manualQueue.map((item, i) => ({
      ...item, round: 1, setNum: i + 1, totalSets: manualQueue.length, positionLabel: `SET ${i + 1}/${manualQueue.length}`,
    }));
  }

  if (mode === 'focus') {
    exercises.forEach(ex => {
      const sets = cfg.sets || 3;
      for (let s = 0; s < sets; s++) {
        q.push({
          ...queueFields(ex), reps: getReps(ex),
          round: s + 1, setNum: q.length + 1, positionLabel: `SET ${s + 1}/${sets}`,
        });
      }
    });
  }

  if (mode === 'circuit') {
    const rounds = cfg.sets || 3;
    for (let r = 0; r < rounds; r++) {
      exercises.forEach(ex => {
        q.push({
          ...queueFields(ex), reps: getReps(ex),
          round: r + 1, setNum: q.length + 1, positionLabel: `ROUND ${r + 1}/${rounds}`,
        });
      });
    }
  }

  if (mode === 'superset') {
    const size = cfg.supersetSize || 2;
    const sets = cfg.sets || 3;
    const groups = [];
    for (let i = 0; i < exercises.length; i += size) {
      groups.push(exercises.slice(i, i + size));
    }
    groups.forEach((group, gi) => {
      for (let s = 0; s < sets; s++) {
        group.forEach(ex => {
          q.push({
            ...queueFields(ex), reps: getReps(ex),
            round: s + 1, setNum: q.length + 1, groupLabel: 'Group ' + (gi + 1),
            positionLabel: `ROUND ${s + 1}/${sets} GROUP ${gi + 1}/${groups.length}`,
          });
        });
      }
    });
  }

  if (mode === 'addon') {
    const rounds = exercises.length;
    for (let round = 1; round <= rounds; round++) {
      for (let i = 0; i < round; i++) {
        const ex = exercises[i];
        q.push({
          ...queueFields(ex), reps: getReps(ex),
          round, setNum: q.length + 1, positionLabel: `ROUND ${round}/${rounds}`,
        });
      }
    }
  }

  return q.map((item, i) => ({ ...item, totalSets: q.length }));
}

function isLongRestAfterIndex(queueIndex, queueLength, restConfig) {
  const longEvery = Number(restConfig?.longEvery) || 0;
  return (
    restConfig?.type === 'interval' &&
    longEvery > 0 &&
    queueIndex < queueLength - 1 &&
    (queueIndex + 1) % longEvery === 0
  );
}

function buildUpcomingTimeline(queue, startIdx, restConfig) {
  const items = [];
  for (let i = startIdx; i < queue.length; i++) {
    items.push({ type: 'exercise', item: queue[i], queueIndex: i, key: `exercise-${i}` });
    if (isLongRestAfterIndex(i, queue.length, restConfig)) {
      items.push({ type: 'longRest', duration: restConfig.long, queueIndex: i, key: `long-rest-${i}` });
    }
  }
  return items;
}

function WorkoutMenu({ onClose, currentEntry, findMatchingFavorite, onFavoriteToggle, onEdit }) {
  const isFavorited = currentEntry && findMatchingFavorite && !!findMatchingFavorite(currentEntry);

  return (
    <div
      onClick={onClose}
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '56px 20px 0' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: '2px',
          minWidth: '240px', overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', letterSpacing: '0.1em' }}>// MENU</div>
          <button onClick={onClose} style={{ color: 'var(--subtle)', padding: '2px' }}><X size={14} /></button>
        </div>

        <button
          onClick={onFavoriteToggle}
          style={{
            width: '100%', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px',
            color: isFavorited ? 'var(--favorite)' : 'var(--fg)', textAlign: 'left',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Star size={18} fill={isFavorited ? 'var(--favorite)' : 'transparent'} color={isFavorited ? 'var(--favorite)' : 'var(--muted-strong)'} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {isFavorited ? 'Unfavorite' : 'Favorite workout'}
            </div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', marginTop: '2px' }}>
              {isFavorited ? 'Remove from favorites' : 'Save this one for later'}
            </div>
          </div>
        </button>

        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              width: '100%', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px',
              color: 'var(--fg)', textAlign: 'left',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Pencil size={18} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>
                Edit current workout
              </div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', marginTop: '2px' }}>
                Change exercises, format, or rest
              </div>
            </div>
          </button>
        )}

        <div style={{ padding: '10px 14px' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--subtle)', letterSpacing: '0.05em' }}>
            More options coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveWorkout({ queue, idx, setIdx, restConfig, initialElapsed = 0, initialPhase = 'exercise', initialRestRemaining = 0, onExit, onEdit, onComplete, currentEntry, findMatchingFavorite, addFavorite, removeFavorite }) {
  const safeInitialRestRemaining = Math.max(0, Number(initialRestRemaining) || 0);
  const safeInitialPhase = initialPhase === 'rest' && safeInitialRestRemaining > 0 ? 'rest' : 'exercise';
  const [phase, setPhase] = useState(safeInitialPhase);
  const [restRemaining, setRestRemaining] = useState(safeInitialPhase === 'rest' ? safeInitialRestRemaining : 0);
  const [elapsed, setElapsed] = useState(initialElapsed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [namingEntry, setNamingEntry] = useState(null);
  const startRef = useRef(Date.now() - initialElapsed * 1000);
  const intervalRef = useRef(null);
  const contentRef = useRef(null);

  const current = queue[idx];
  const next = queue[idx + 1];
  const upcomingAfterNext = buildUpcomingTimeline(queue, idx + 1, restConfig).slice(1);
  // Is the current/pending rest a long rest?
  const isLongRest = isLongRestAfterIndex(idx, queue.length, restConfig);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase === 'rest' && restRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setRestRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            advance();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [phase]);

  const advance = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (idx >= queue.length - 1) {
      onComplete();
      return;
    }
    setIdx(idx + 1);
    setPhase('exercise');
    setRestRemaining(0);
  };

  const completeSet = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // If already resting, the button is "SKIP REST" — advance to next exercise
    if (phase === 'rest') {
      advance();
      return;
    }
    if (idx >= queue.length - 1) {
      onComplete();
      return;
    }
    if (restConfig.type === 'none') {
      advance();
      return;
    }
    const isLong = isLongRestAfterIndex(idx, queue.length, restConfig);
    const duration = isLong ? restConfig.long : restConfig.short;
    setRestRemaining(duration);
    setPhase('rest');
  };

  const skipBack = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (idx > 0) {
      setIdx(idx - 1);
      setPhase('exercise');
      setRestRemaining(0);
    }
  };

  const skipForward = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (idx < queue.length - 1) {
      setIdx(idx + 1);
      setPhase('exercise');
      setRestRemaining(0);
    }
  };

  const addRest = (s) => setRestRemaining(r => Math.max(0, r + s));

  if (!current) return null;

  const quitWorkout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onExit({ idx, phase, elapsed, restRemaining });
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ':' + String(sec).padStart(2, '0');
  };

  const progress = ((idx + (phase === 'rest' ? 1 : 0)) / queue.length) * 100;

  return (
    <div className="active-workout-screen" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <div style={{ padding: `${SAFE_TOP_16} 20px 16px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={quitWorkout} style={{ padding: '8px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <X size={18} />
          <span className="mono" style={{ fontSize: '11px' }}>QUIT</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mono" style={{ fontSize: 'var(--active-header-meta-size)', color: 'var(--muted)' }}>
            {idx + 1} / {queue.length} · {fmtTime(elapsed)}
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--muted-strong)',
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <WorkoutMenu
          onClose={() => setMenuOpen(false)}
          currentEntry={currentEntry}
          findMatchingFavorite={findMatchingFavorite}
          onFavoriteToggle={() => {
            if (!currentEntry) return;
            const existing = findMatchingFavorite(currentEntry);
            if (existing) {
              removeFavorite(currentEntry);
              setMenuOpen(false);
            } else {
              setMenuOpen(false);
              setNamingEntry(currentEntry);
            }
          }}
          onEdit={() => {
            setMenuOpen(false);
            onEdit({ idx, phase, elapsed });
          }}
        />
      )}

      {namingEntry && (
        <NameFavoriteModal
          entry={namingEntry}
          onCancel={() => setNamingEntry(null)}
          onSave={(name) => { addFavorite(namingEntry, name); setNamingEntry(null); }}
        />
      )}

      <div ref={contentRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--active-content-y) var(--active-content-x)', position: 'relative' }}>
        {phase === 'exercise' ? (
          <ExerciseView current={current} next={next} upcomingItems={upcomingAfterNext} contentRef={contentRef} />
        ) : (
          <RestView remaining={restRemaining} next={next} upcomingItems={upcomingAfterNext} contentRef={contentRef} isLongRest={isLongRest} />
        )}
      </div>

      <div style={{ padding: '0 24px' }}>
        <button
          onClick={completeSet}
          style={{
            width: '100%', padding: '28px', background: phase === 'rest' ? 'var(--accent2)' : 'var(--accent)',
            color: phase === 'rest' ? 'var(--on-accent2)' : 'var(--on-accent)', fontSize: '28px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            letterSpacing: '0.02em', borderRadius: '2px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px',
          }}
        >
          <Check size={28} strokeWidth={3} />
          {phase === 'rest' ? 'SKIP REST' : (idx === queue.length - 1 ? 'FINISH' : 'DONE')}
        </button>
      </div>

      <div style={{ padding: '16px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={skipBack} disabled={idx === 0} style={{ padding: '10px 14px', opacity: idx === 0 ? 0.3 : 1, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SkipBack size={16} />
            <span className="mono" style={{ fontSize: '10px' }}>BACK</span>
          </button>
          {phase === 'rest' && (
            <button onClick={() => addRest(15)} style={{ padding: '10px 14px', background: 'var(--surface-muted)', color: 'var(--accent2)', borderRadius: '2px', fontSize: '11px', fontWeight: 700 }}>
              +15s
            </button>
          )}
          <button onClick={skipForward} disabled={idx >= queue.length - 1} style={{ padding: '10px 14px', opacity: idx >= queue.length - 1 ? 0.3 : 1, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="mono" style={{ fontSize: '10px' }}>SKIP</span>
            <SkipForward size={16} />
          </button>
        </div>
        <div style={{ height: '3px', background: 'var(--surface-muted)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: progress + '%', background: 'var(--accent)', transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
}

function ExerciseView({ current, next, upcomingItems = [], contentRef }) {
  const equip = EQUIP[current.equipment] || EQUIP.bodyweight;
  const isTimed = current.unit === 'sec';

  // Timer state: 'idle' (pre-start), 'prep' (3-2-1 countdown), 'running' (counting down), 'overtime' (counting up after 0)
  const [timerPhase, setTimerPhase] = React.useState('idle');
  const [timerValue, setTimerValue] = React.useState(current.reps);
  const [prepValue, setPrepValue] = React.useState(3);

  // Reset timer when the exercise changes
  React.useEffect(() => {
    setTimerPhase('idle');
    setTimerValue(current.reps);
    setPrepValue(3);
  }, [current.exId, current.setNum, current.reps]);

  // 3-2-1 prep countdown
  React.useEffect(() => {
    if (timerPhase !== 'prep') return;
    if (prepValue <= 0) {
      setTimerPhase('running');
      setTimerValue(current.reps);
      return;
    }
    const t = setTimeout(() => setPrepValue(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timerPhase, prepValue, current.reps]);

  // Main countdown
  React.useEffect(() => {
    if (timerPhase !== 'running') return;
    if (timerValue <= 0) {
      setTimerPhase('overtime');
      setTimerValue(0);
      return;
    }
    const t = setTimeout(() => setTimerValue(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timerPhase, timerValue]);

  // Overtime count-up
  React.useEffect(() => {
    if (timerPhase !== 'overtime') return;
    const t = setTimeout(() => setTimerValue(v => v + 1), 1000);
    return () => clearTimeout(t);
  }, [timerPhase, timerValue]);

  const startTimer = () => {
    setPrepValue(3);
    setTimerPhase('prep');
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div className="mono" style={{ fontSize: 'var(--active-meta-size)', color: 'var(--accent)' }}>
          // NOW {current.positionLabel ? '· ' + current.positionLabel : ''}
        </div>
        <span className="mono" style={{
          fontSize: 'var(--active-equip-size)', padding: '2px 7px', background: alphaColorToken(equip.color, '22'),
          color: equip.color, borderRadius: '2px', fontWeight: 700, letterSpacing: '0.05em',
        }}>{equip.label}</span>
        <SourceInfoButton
          exercise={current}
          size={16}
          color="var(--subtle)"
          activeColor={equip.color}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
      </div>
      <div className="display" style={{
        fontSize: 'var(--active-title-size)', lineHeight: 0.9, color: 'var(--fg)', marginBottom: 'var(--active-title-margin)',
        wordBreak: 'break-word',
      }}>
        {current.name.toUpperCase()}
      </div>

      {/* Number display - switches between target, prep countdown, live countdown, overtime */}
      {isTimed ? (
        <TimedDisplay
          phase={timerPhase}
          prepValue={prepValue}
          timerValue={timerValue}
          target={current.reps}
          onStart={startTimer}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: 'var(--active-rep-margin)' }}>
          <div className="display" style={{ fontSize: 'var(--active-rep-size)', color: 'var(--accent)', lineHeight: 0.9 }}>
            {current.reps}
          </div>
          <div className="stencil" style={{ fontSize: 'var(--active-unit-size)', color: 'var(--muted)' }}>
            {current.unit.toUpperCase()}
          </div>
        </div>
      )}

      <UpNextStack
        next={next}
        upcomingItems={upcomingItems}
        contentRef={contentRef}
        label="// UP NEXT"
        labelColor="var(--subtle)"
        borderColor="var(--border)"
        nameColor="var(--muted-strong)"
      />
    </>
  );
}

function formatPreviewDuration(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;
}

function UpNextStack({ next, upcomingItems = [], contentRef, label, labelColor, borderColor, nameColor, nameWeight = 400 }) {
  const cardRef = React.useRef(null);
  const [layout, setLayout] = React.useState({ top: 0, left: 0, width: 0, count: 0 });
  const nextEquip = next ? (EQUIP[next.equipment] || EQUIP.bodyweight) : EQUIP.bodyweight;

  const measureLayout = React.useCallback(() => {
    const card = cardRef.current;
    const content = contentRef?.current;
    if (!card || !content || upcomingItems.length === 0) {
      setLayout(prev => prev.count === 0 ? prev : { ...prev, count: 0 });
      return;
    }

    const cardRect = card.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const available = contentRect.bottom - cardRect.bottom - UPCOMING_PREVIEW_GAP - 2;
    const count = Math.max(0, Math.min(upcomingItems.length, Math.floor(available / UPCOMING_PREVIEW_ROW_HEIGHT)));
    const nextLayout = {
      top: Math.round(cardRect.bottom - contentRect.top + UPCOMING_PREVIEW_GAP),
      left: Math.round(cardRect.left - contentRect.left),
      width: Math.round(cardRect.width),
      count,
    };

    setLayout(prev => (
      prev.top === nextLayout.top &&
      prev.left === nextLayout.left &&
      prev.width === nextLayout.width &&
      prev.count === nextLayout.count
        ? prev
        : nextLayout
    ));
  }, [contentRef, next?.exId, next?.setNum, next?.name, upcomingItems.length]);

  React.useLayoutEffect(() => {
    measureLayout();
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const card = cardRef.current;
    const content = contentRef?.current;
    let frame = window.requestAnimationFrame(measureLayout);
    const onResize = () => measureLayout();
    window.addEventListener('resize', onResize);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measureLayout);
      if (content) observer.observe(content);
      if (card) observer.observe(card);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      if (observer) observer.disconnect();
    };
  }, [contentRef, measureLayout]);

  if (!next) return null;

  const visibleItems = upcomingItems.slice(0, layout.count);
  const primaryGridColumns = `${UPCOMING_TAG_COL_WIDTH} minmax(0, ${UPCOMING_NAME_COL_WIDTH}) ${UPCOMING_VALUE_COL_WIDTH}`;
  const previewGridColumns = `14px ${UPCOMING_TAG_COL_WIDTH} minmax(0, ${UPCOMING_NAME_COL_WIDTH}) ${UPCOMING_VALUE_COL_WIDTH}`;

  return (
    <>
      <div ref={cardRef} style={{ padding: '14px 16px', background: 'var(--surface)', border: `1px solid ${borderColor}`, borderRadius: '2px' }}>
        <div className="mono" style={{ fontSize: '10px', color: labelColor, marginBottom: '4px' }}>{label}</div>
        <div style={{ display: 'grid', gridTemplateColumns: primaryGridColumns, alignItems: 'center', columnGap: '8px', width: 'fit-content', maxWidth: '100%' }}>
          <span className="mono" style={{
            width: '100%', fontSize: '9px', padding: '2px 5px', background: alphaColorToken(nextEquip.color, '22'),
            color: nextEquip.color, borderRadius: '2px', fontWeight: 700, textAlign: 'center',
          }}>{nextEquip.label}</span>
          <div style={{ fontSize: '14px', color: nameColor, fontWeight: nameWeight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.name}</div>
          <div className="mono" style={{ fontSize: '12px', color: 'var(--accent)', textAlign: 'right', whiteSpace: 'nowrap' }}>{next.reps} {next.unit}</div>
        </div>
      </div>

      {visibleItems.length > 0 && layout.width > 0 && (
        <div
          style={{
            position: 'absolute',
            top: `${layout.top}px`,
            left: `${layout.left}px`,
            width: `${layout.width}px`,
            height: `${visibleItems.length * UPCOMING_PREVIEW_ROW_HEIGHT}px`,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {visibleItems.map((upcoming, i) => {
            const isRest = upcoming.type === 'longRest';
            const item = upcoming.item;
            const eq = item ? (EQUIP[item.equipment] || EQUIP.bodyweight) : null;
            const tagColor = isRest ? 'var(--accent2)' : eq.color;
            const opacity = Math.max(0.18, 0.56 - i * 0.07);
            return (
              <div key={upcoming.key} style={{
                height: `${UPCOMING_PREVIEW_ROW_HEIGHT}px`,
                display: 'grid', gridTemplateColumns: previewGridColumns, alignItems: 'center', columnGap: '6px', width: 'fit-content', maxWidth: '100%',
                padding: '3px 12px', opacity,
              }}>
                <span className="mono" style={{ fontSize: '9px', color: 'var(--subtle)', width: '14px', flexShrink: 0 }}>
                  {i + 2}
                </span>
                <span className="mono" style={{
                  width: '100%', fontSize: '8px', padding: '1px 4px', background: isRest ? alphaColorToken('var(--fg)', '10') : alphaColorToken(tagColor, '22'),
                  color: tagColor, borderRadius: '2px', fontWeight: 700, textAlign: 'center',
                }}>{isRest ? 'REST' : eq.label}</span>
                <div style={{
                  fontSize: '11px', color: isRest ? 'var(--accent2)' : 'var(--muted)', minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{isRest ? 'Long rest' : item.name}</div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--subtle)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {isRest ? formatPreviewDuration(upcoming.duration) : `${item.reps} ${item.unit}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function TimedDisplay({ phase, prepValue, timerValue, target, onStart }) {
  if (phase === 'idle') {
    // Show target + START TIMER button
    return (
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
          <div className="display" style={{ fontSize: 'var(--active-timer-target-size)', color: 'var(--accent)', lineHeight: 0.9 }}>
            {target}
          </div>
          <div className="stencil" style={{ fontSize: 'var(--active-timer-unit-size)', color: 'var(--muted)' }}>SEC</div>
        </div>
        <button onClick={onStart} style={{
          width: '100%', padding: '16px', background: 'var(--accent2)', color: 'var(--on-accent2)',
          fontSize: 'var(--active-timer-button-font)', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
          letterSpacing: '0.02em', borderRadius: '2px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <Play size={18} fill="var(--on-accent2)" /> START TIMER
        </button>
      </div>
    );
  }

  if (phase === 'prep') {
    return (
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 'var(--active-timer-prep-label-size)', color: 'var(--accent2)', marginBottom: '8px' }}>// GET READY</div>
        <div className="display" style={{
          fontSize: 'var(--active-timer-prep-size)', color: 'var(--accent2)', lineHeight: 1,
        }}>
          {prepValue === 0 ? 'GO' : prepValue}
        </div>
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 'var(--active-timer-running-label-size)', color: 'var(--accent)', marginBottom: '8px' }}>// COUNTDOWN</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '10px' }}>
          <div className="display" style={{
            fontSize: 'var(--active-timer-running-size)', color: 'var(--accent)', lineHeight: 0.9,
          }}>
            {timerValue}
          </div>
          <div className="stencil" style={{ fontSize: 'var(--active-timer-running-unit-size)', color: 'var(--muted)' }}>SEC</div>
        </div>
      </div>
    );
  }

  // overtime
  return (
    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 'var(--active-timer-overtime-label-size)', color: 'var(--accent2)', marginBottom: '8px' }}>// OVERTIME · KEEP GOING</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
        <div className="display" style={{ fontSize: 'var(--active-timer-overtime-size)', color: 'var(--accent2)', lineHeight: 0.9 }}>
          +{timerValue}
        </div>
        <div className="stencil" style={{ fontSize: 'var(--active-timer-overtime-unit-size)', color: 'var(--accent2)', opacity: 0.7 }}>SEC</div>
      </div>
      <div className="mono" style={{ fontSize: 'var(--active-timer-note-size)', color: 'var(--subtle)', marginTop: '6px' }}>
        TARGET {target}s HIT · BONUS TIME
      </div>
    </div>
  );
}

function RestView({ remaining, next, upcomingItems = [], contentRef, isLongRest = false }) {
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <>
      <div className="mono" style={{ fontSize: 'var(--active-rest-label-size)', color: 'var(--accent2)', marginBottom: '12px' }}>
        // {isLongRest ? 'LONG REST' : 'REST'}
      </div>
      <div className="display" style={{ fontSize: 'var(--active-rest-title-size)', lineHeight: 0.9, color: 'var(--muted)', marginBottom: '24px' }}>
        BREATHER
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', position: 'relative' }}>
        <div style={{
          position: 'absolute', width: 'var(--active-rest-ring-size)', height: 'var(--active-rest-ring-size)', borderRadius: '50%',
          border: '2px solid var(--accent2)', animation: 'pulse-ring 2s ease-out infinite',
        }} />
        <div className="display" style={{ fontSize: 'var(--active-rest-timer-size)', color: 'var(--accent2)', lineHeight: 1 }}>
          {mins > 0 ? mins + ':' + String(secs).padStart(2, '0') : secs}
        </div>
      </div>
      <UpNextStack
        next={next}
        upcomingItems={upcomingItems}
        contentRef={contentRef}
        label="// COMING UP"
        labelColor="var(--accent2)"
        borderColor="var(--accent2)"
        nameColor="var(--fg)"
        nameWeight={600}
      />
    </>
  );
}

function DoneScreen({ onHome, queueLen }) {
  const [idx, setIdx] = React.useState(() => Math.floor(Math.random() * DONE_VARIANTS.length));
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIdx(i => pickDifferentIdx(i, DONE_VARIANTS.length));
      setNonce(n => n + 1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [nonce]);

  const variant = DONE_VARIANTS[idx];

  return (
    <div className="slide-in" style={{ minHeight: '100dvh', padding: `${SAFE_TOP_24} 24px 24px`, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '16px' }}>
          // SESSION COMPLETE
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            key={`done-top-${nonce}`}
            className="display title-slide-top"
            style={{
              fontSize: 'clamp(64px, 16vw, 120px)', lineHeight: 0.85,
              color: 'var(--fg)', whiteSpace: 'nowrap',
            }}
          >
            {variant.top}
          </div>
          <div
            key={`done-bot-${nonce}`}
            className="display title-slide-bottom"
            style={{
              fontSize: 'clamp(64px, 16vw, 120px)', lineHeight: 0.85,
              color: 'var(--accent2)', whiteSpace: 'nowrap',
            }}
          >
            {variant.bottom}
          </div>
        </div>
        <div key={`done-tag-${nonce}`} className="mono fade-in" style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '20px' }}>
          {queueLen} sets logged. {variant.tag}
        </div>
      </div>
      <button onClick={onHome} style={{
        padding: '24px', background: 'var(--fg)', color: 'var(--bg)', fontSize: '18px', fontWeight: 900,
        fontFamily: 'Archivo Black, sans-serif', borderRadius: '2px',
      }}>
        HOME
      </button>
    </div>
  );
}

function Header({ step, total, title, onBack }) {
  return (
    <div style={{ padding: `${SAFE_TOP_20} 24px 12px` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', padding: '4px 0' }}>
          <ChevronLeft size={18} />
          <span className="mono" style={{ fontSize: '11px' }}>BACK</span>
        </button>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--subtle)' }}>STEP {step} / {total}</div>
      </div>
      <div className="display" style={{ fontSize: 'clamp(36px, 10vw, 56px)', lineHeight: 0.9, color: 'var(--fg)' }}>
        {title}
      </div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: '3px', background: i < step ? 'var(--accent)' : 'var(--surface-strong)', borderRadius: '2px' }} />
        ))}
      </div>
    </div>
  );
}

function BottomBar({ disabled, onNext, label, primary }) {
  const dockRef = React.useRef(null);
  const [atBottom, setAtBottom] = React.useState(true);

  React.useEffect(() => {
    if (!dockRef.current) return;

    // Find the nearest scrollable ancestor (the content div with overflowY: auto)
    const findScrollable = (el) => {
      let node = el.parentElement;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        if (/(auto|scroll|overlay)/.test(style.overflowY)) return node;
        node = node.parentElement;
      }
      return window;
    };

    const scrollParent = findScrollable(dockRef.current);

    const checkScroll = () => {
      if (!dockRef.current) return;
      // Compare how close the user is to the bottom of their scroll container
      let distanceFromBottom;
      if (scrollParent === window) {
        distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      } else {
        distanceFromBottom = scrollParent.scrollHeight - scrollParent.clientHeight - scrollParent.scrollTop;
      }
      // "At bottom" = within 80px of the end (so the user doesn't need the FAB)
      setAtBottom(distanceFromBottom < 80);
    };

    checkScroll(); // run once on mount
    scrollParent.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    // Also re-check when content changes size (e.g. opening random picker, adding items)
    const resizeObserver = new ResizeObserver(checkScroll);
    if (scrollParent !== window) resizeObserver.observe(scrollParent);

    return () => {
      scrollParent.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      resizeObserver.disconnect();
    };
  }, [disabled]);

  const bgColor = disabled ? 'var(--surface-muted)' : (primary ? 'var(--accent2)' : 'var(--accent)');
  const fgColor = disabled ? 'var(--subtle)' : (primary ? 'var(--on-accent2)' : 'var(--on-accent)');
  // Show FAB when user has scrolled up (not at bottom) AND button is enabled
  const showFab = !atBottom && !disabled;

  return (
    <>
      {/* Docked bar — always present at bottom of viewport */}
      <div ref={dockRef} style={{ padding: '16px 24px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <button
          onClick={onNext}
          disabled={disabled}
          style={{
            width: '100%', padding: '20px', background: bgColor, color: fgColor,
            fontSize: '16px', fontWeight: 900, fontFamily: 'Archivo Black, sans-serif',
            letterSpacing: '0.02em', borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: disabled ? 0.5 : 1, transition: 'all 0.2s',
          }}
        >
          <span>{label}</span>
          {!disabled && <Play size={20} fill={fgColor} />}
        </button>
      </div>

      {/* Floating FAB — shows when user hasn't scrolled to the bottom.
          NOTE: position:fixed only works if no ancestor has a transform.
          We removed the transform from .slide-in so this works. */}
      <button
        onClick={onNext}
        aria-label={label}
        style={{
          position: 'fixed', right: '20px', bottom: '28px', zIndex: 1000,
          width: '60px', height: '60px', borderRadius: '50%',
          background: bgColor, color: fgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          cursor: 'pointer',
          boxShadow: showFab ? (primary
            ? '0 8px 24px rgba(0, 217, 178, 0.4), 0 2px 6px rgba(0,0,0,0.4)'
            : '0 8px 24px rgba(255, 77, 46, 0.4), 0 2px 6px rgba(0,0,0,0.4)'
          ) : 'none',
          transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
          opacity: showFab ? 1 : 0,
          transform: showFab ? 'scale(1)' : 'scale(0.6)',
          pointerEvents: showFab ? 'auto' : 'none',
        }}
      >
        <Play size={24} fill={fgColor} />
      </button>
    </>
  );
}
