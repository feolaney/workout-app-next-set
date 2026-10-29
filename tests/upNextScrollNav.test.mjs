import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildUpcomingTimeline,
  getJumpState,
  getPreviewPercent,
  targetKey,
  getLiveIndexInTimeline,
  getUpNextViewModel,
  getTimelineAnchorIndex,
  getTimelineTrailingSpacerRows,
  getTimelineBrowseRow,
  getLiveMarkerPresentation,
} from '../src/upNextNavigation.js';

const intervalRest = { type: 'interval', short: 15, long: 120, longEvery: 2 };
const queue = [
  { exId: 'ex1', name: 'One', reps: 10, unit: 'reps' },
  { exId: 'ex2', name: 'Two', reps: 10, unit: 'reps' },
  { exId: 'ex3', name: 'Three', reps: 10, unit: 'reps' },
  { exId: 'ex4', name: 'Four', reps: 10, unit: 'reps' },
];

test('exercise-phase timeline includes history, live marker, and immediately due long rest', () => {
  const timeline = buildUpcomingTimeline(queue, 1, 'exercise', intervalRest);

  // Timeline includes history (ex0), live marker (at idx 1), longRest after current, then future exercises
  assert.deepEqual(
    timeline.map(item => [item.type, item.queueIndex]),
    [['exercise', 0], ['liveMarker', 1], ['longRest', 1], ['exercise', 2], ['exercise', 3]],
  );
  assert.equal(timeline[2].duration, 120);
  // Verify history is marked
  assert.equal(timeline[0].isHistory, true);
  // Verify live marker
  assert.equal(timeline[1].type, 'liveMarker');
});

test('rest-phase timeline includes history and live marker, omits active rest', () => {
  const timeline = buildUpcomingTimeline(queue, 1, 'rest', intervalRest);

  // In rest phase, the active rest is omitted, but history and live marker remain
  assert.deepEqual(
    timeline.map(item => [item.type, item.queueIndex]),
    [['exercise', 0], ['liveMarker', 1], ['exercise', 2], ['exercise', 3]],
  );
});

test('future interval long rests remain in chronological order', () => {
  const sixItems = Array.from({ length: 6 }, (_, index) => ({
    exId: `ex${index + 1}`,
    name: `Exercise ${index + 1}`,
    reps: 10,
    unit: 'reps',
  }));
  const timeline = buildUpcomingTimeline(
    sixItems,
    0,
    'exercise',
    { type: 'interval', short: 15, long: 90, longEvery: 3 },
  );

  assert.deepEqual(
    timeline.map(item => [item.type, item.queueIndex]),
    [
      ['exercise', 1],
      ['exercise', 2],
      ['longRest', 2],
      ['exercise', 3],
      ['exercise', 4],
      ['exercise', 5],
    ],
  );
});

test('explicit imported long rest keeps its configured duration', () => {
  const imported = [
    { exId: 'a', name: 'A', reps: 8, unit: 'reps', restType: 'long', restSeconds: 75 },
    { exId: 'b', name: 'B', reps: 8, unit: 'reps' },
  ];
  const timeline = buildUpcomingTimeline(imported, 0, 'exercise', { type: 'normal', short: 15, long: 90 });

  assert.deepEqual(timeline.map(item => item.type), ['longRest', 'exercise']);
  assert.equal(timeline[0].duration, 75);
});

test('exercise and long-rest destinations at one queue index stay distinct', () => {
  assert.notEqual(
    targetKey({ type: 'exercise', queueIndex: 1 }),
    targetKey({ type: 'longRest', queueIndex: 1 }),
  );
});

test('exercise jump activates the destination exercise', () => {
  assert.deepEqual(
    getJumpState({ type: 'exercise', queueIndex: 3 }),
    { idx: 3, phase: 'exercise', restRemaining: 0 },
  );
});

test('long-rest jump enters rest at the associated queue position', () => {
  assert.deepEqual(
    getJumpState({ type: 'longRest', queueIndex: 1, duration: 120 }),
    { idx: 1, phase: 'rest', restRemaining: 120 },
  );
});

test('preview percent marks destination without changing live progress', () => {
  assert.equal(getPreviewPercent({ type: 'exercise', queueIndex: 2 }, 4), 75);
  assert.equal(getPreviewPercent({ type: 'longRest', queueIndex: 1 }, 4), 50);
  assert.equal(getPreviewPercent(null, 4), null);
});

test('live index is correctly identified in timeline', () => {
  const timeline = buildUpcomingTimeline(queue, 2, 'exercise', intervalRest);
  const liveIdx = getLiveIndexInTimeline(timeline, 2);
  assert.equal(liveIdx, 2); // history ex0, liveMarker at idx 1, history ex1, liveMarker at idx 2
  assert.equal(timeline[liveIdx].type, 'liveMarker');
  assert.equal(timeline[liveIdx].queueIndex, 2);
});

test('getLiveIndexInTimeline returns null for missing live marker', () => {
  const timeline = buildUpcomingTimeline(queue, 0, 'exercise', intervalRest);
  const liveIdx = getLiveIndexInTimeline(timeline, 5);
  assert.equal(liveIdx, -1);
});

test('history entries are correctly labeled for multiple past items', () => {
  const timeline = buildUpcomingTimeline(queue, 3, 'exercise', intervalRest);
  // Should show ex0, ex1, ex2 as history, live marker at 3
  const historyItems = timeline.filter(item => item.isHistory === true);
  assert.equal(historyItems.length, 3);
  assert.deepEqual(historyItems.map(h => h.queueIndex), [0, 1, 2]);
});

test('target keys are unique per type and queueIndex', () => {
  assert.notEqual(
    targetKey({ type: 'exercise', queueIndex: 1 }),
    targetKey({ type: 'longRest', queueIndex: 1 }),
  );
  assert.equal(
    targetKey({ type: 'exercise', queueIndex: 1 }),
    targetKey({ type: 'exercise', queueIndex: 1 }),
  );
});

test('long-rest entry appears after completed exercise when due', () => {
  const timeline = buildUpcomingTimeline(queue, 0, 'exercise', intervalRest);
  // After completing ex0, the next long rest (after ex1) should appear
  // Timeline: ex0, liveMarker, ex1, longRest(1), ex2, ex3
  const longRestIdx = timeline.findIndex(item => item.type === 'longRest');
  assert.notEqual(longRestIdx, -1);
  assert.equal(timeline[longRestIdx].queueIndex, 1);
  assert.equal(timeline[longRestIdx].duration, 120);
});

test('browsing past origin is supported by bidirectional timeline', () => {
  // Build timeline from idx 2, should include history (0, 1), liveMarker(2), future(3)
  const timeline = buildUpcomingTimeline(queue, 2, 'exercise', intervalRest);
  // User can browse to history item (queueIndex 0 or 1)
  const browseTarget = timeline.find(item => item.queueIndex === 0 && item.isHistory === true);
  assert.notEqual(browseTarget, undefined);
  assert.deepEqual(getJumpState(browseTarget), { idx: 0, phase: 'exercise', restRemaining: 0 });
});

test('jump to long-rest destination enters rest mode', () => {
  const timeline = buildUpcomingTimeline(queue, 0, 'exercise', intervalRest);
  const longRest = timeline.find(item => item.type === 'longRest');
  assert.notEqual(longRest, undefined);
  const jumpState = getJumpState(longRest);
  assert.deepEqual(jumpState, { idx: 1, phase: 'rest', restRemaining: 120 });
});

test('view model keeps a live marker out of the primary Up Next card', () => {
  const timeline = buildUpcomingTimeline(queue, 2, 'exercise', intervalRest);
  const view = getUpNextViewModel(timeline);

  assert.deepEqual([view.primary.type, view.primary.queueIndex], ['exercise', 3]);
  assert.equal(view.rows.some(row => row.type === 'liveMarker'), true);
  assert.equal(view.rows.every(row => row.type === 'liveMarker' || row.item || row.type === 'longRest'), true);
});

test('timeline exposes the complete exercise history rather than only three items', () => {
  const longQueue = Array.from({ length: 8 }, (_, index) => ({
    exId: `ex${index}`,
    name: `Exercise ${index}`,
    reps: 10,
    unit: 'reps',
  }));

  const timeline = buildUpcomingTimeline(longQueue, 6, 'exercise', { type: 'none' });
  assert.deepEqual(
    timeline.filter(item => item.type === 'exercise' && item.isHistory).map(item => item.queueIndex),
    [0, 1, 2, 3, 4, 5],
  );
});

test('natural progression anchors the live marker so the position line stays visually stable', () => {
  const timeline = buildUpcomingTimeline(queue, 2, 'exercise', intervalRest);
  const view = getUpNextViewModel(timeline);

  assert.equal(view.liveIndex, 2);
  assert.equal(view.primaryIndex, 3);
  assert.equal(getTimelineAnchorIndex(view), view.liveIndex);
});

test('the first set falls back to the primary row when no live marker exists', () => {
  const timeline = buildUpcomingTimeline(queue, 0, 'exercise', intervalRest);
  const view = getUpNextViewModel(timeline);

  assert.equal(view.liveIndex, -1);
  assert.equal(getTimelineAnchorIndex(view), view.primaryIndex);
});

test('scrolling to the automatic anchor never creates a browse selection', () => {
  const timeline = buildUpcomingTimeline(queue, 2, 'exercise', intervalRest);
  const view = getUpNextViewModel(timeline);

  assert.equal(getTimelineBrowseRow({ rows: view.rows, scrollTop: 52, rowHeight: 26, anchorIndex: 2 }), null);
  assert.equal(getTimelineBrowseRow({ rows: view.rows, scrollTop: 0, rowHeight: 26, anchorIndex: 2 }), view.rows[0]);
  assert.equal(getTimelineBrowseRow({ rows: view.rows, scrollTop: 78, rowHeight: 26, anchorIndex: 2 }), view.rows[3]);
});

test('live marker stays subtle while idle and calls attention during navigation', () => {
  assert.deepEqual(getLiveMarkerPresentation({ isScrolling: false, isBrowsing: false }), {
    showLabel: false,
    emphasized: false,
  });
  assert.deepEqual(getLiveMarkerPresentation({ isScrolling: true, isBrowsing: false }), {
    showLabel: true,
    emphasized: true,
  });
  assert.deepEqual(getLiveMarkerPresentation({ isScrolling: false, isBrowsing: true }), {
    showLabel: true,
    emphasized: true,
  });
});

test('timeline adds trailing space when needed to keep the live marker pinned', () => {
  assert.equal(getTimelineTrailingSpacerRows({ viewportRows: 5, rowCount: 6, anchorIndex: 3 }), 2);
  assert.equal(getTimelineTrailingSpacerRows({ viewportRows: 4, rowCount: 6, anchorIndex: 4 }), 2);
  assert.equal(getTimelineTrailingSpacerRows({ viewportRows: 3, rowCount: 8, anchorIndex: 3 }), 0);
});

test('scroll reset keeps the live marker at the top after natural progression', () => {
  const queue = Array.from({ length: 10 }, (_, index) => ({
    exId: `ex${index}`,
    name: `Exercise ${index}`,
    reps: 10,
    unit: 'reps',
  }));

  const timelineAtNewPos = buildUpcomingTimeline(queue, 5, 'exercise', { type: 'none' });
  const view = getUpNextViewModel(timelineAtNewPos);

  assert.equal(view.primary?.type, 'exercise');
  assert.equal(view.primary?.queueIndex, 6);
  assert.equal(view.liveIndex, 5);
  assert.equal(view.primaryIndex, 6);
  assert.equal(getTimelineAnchorIndex(view), 5);
});
