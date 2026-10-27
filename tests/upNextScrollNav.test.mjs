// Up Next Scroll Navigation Feature Tests
// Run with: node --test tests/upNextScrollNav.test.mjs

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';

/**
 * These are the pure helper functions from App.jsx extracted for testing.
 * They verify the exact behavior needed for Up Next long-rest display.
 */

const isLongRestAfterIndex = (queueIndex, queueLength, restConfig) => {
  const longEvery = Number(restConfig?.longEvery) || 0;
  return (
    restConfig?.type === 'interval' &&
    longEvery > 0 &&
    queueIndex < queueLength - 1 &&
    (queueIndex + 1) % longEvery === 0
  );
};

const isLongRestForIndex = (queue, queueIndex, restConfig) => {
  return queue?.[queueIndex]?.restType === 'long'
    || isLongRestAfterIndex(queueIndex, queue?.length || 0, restConfig);
};

const getRestDurationAfterIndex = (queue, queueIndex, restConfig) => {
  const item = queue?.[queueIndex];
  if (item?.restType === 'none') return 0;
  if (item?.restType !== 'interval' && item && item.restSeconds !== undefined && item.restSeconds !== null) {
    return Math.max(0, Number(item.restSeconds) || 0);
  }
  if (restConfig?.type === 'none') return 0;
  return isLongRestForIndex(queue, queueIndex, restConfig)
    ? Math.max(0, Number(restConfig.long) || 0)
    : Math.max(0, Number(restConfig.short) || 0);
};

/**
 * buildUpcomingTimeline: Build the upcoming timeline from queue[startIdx] onwards.
 * 
 * BUG FIX: When current is at queue[idx], we need to show any LONG REST that comes
 * immediately after completing current BEFORE showing queue[idx+1]. The original
 * implementation started at startIdx and only showed rests AFTER each item, but
 * missed the rest that comes from completing the item BEFORE startIdx.
 * 
 * For Up Next display where startIdx = idx + 1:
 * - If completing queue[idx] leads to a long rest, that rest should appear FIRST
 * - Then queue[idx+1], then rest after idx+1 if applicable, etc.
 */
const buildUpcomingTimeline = (queue, startIdx, restConfig) => {
  const items = [];
  
  // Check if there's a long rest IMMEDIATELY before startIdx (i.e., after completing queue[startIdx-1])
  // This handles the case where current exercise completion leads to a long rest
  if (startIdx > 0 && startIdx < queue.length) {
    const prevIdx = startIdx - 1;
    const restAfterPrev = getRestDurationAfterIndex(queue, prevIdx, restConfig);
    if (restAfterPrev > 0 && isLongRestForIndex(queue, prevIdx, restConfig)) {
      items.push({ type: 'longRest', duration: restAfterPrev, queueIndex: prevIdx, key: `rest-after-prev-${prevIdx}` });
    }
  }
  
  // Build the rest of the timeline starting from startIdx
  for (let i = startIdx; i < queue.length; i++) {
    items.push({ type: 'exercise', item: queue[i], queueIndex: i, key: `exercise-${i}` });
    const restDuration = getRestDurationAfterIndex(queue, i, restConfig);
    const isImportedLongRest = queue[i]?.restType === 'long';
    if (i < queue.length - 1 && restDuration > 0 && (isImportedLongRest || isLongRestAfterIndex(i, queue.length, restConfig))) {
      items.push({ type: 'longRest', duration: restDuration, queueIndex: i, key: `rest-${i}` });
    }
  }
  return items;
};

describe('Up Next Long Rest Bug Fix', () => {
  const restConfig = { type: 'interval', short: 15, long: 120, longEvery: 2 };

  describe('Fixed buildUpcomingTimeline', () => {
    test('at idx=0: long rest after idx=1 should show in upcoming', () => {
      const queue = [
        { exId: 'ex1', name: 'Current', reps: 10, unit: 'reps' },     // idx 0 (current)
        { exId: 'ex2', name: 'Next', reps: 10, unit: 'reps' },         // idx 1
        { exId: 'ex3', name: 'Following', reps: 10, unit: 'reps' },    // idx 2
        { exId: 'ex4', name: 'Last', reps: 10, unit: 'reps' },         // idx 3
      ];
      // Up Next uses startIdx = idx + 1 = 1
      const timeline = buildUpcomingTimeline(queue, 1, restConfig);
      
      console.log('Timeline from idx=1:', timeline.map(x => x.type));
      
      // Should be: [{longRest after ex1}, {ex2}, {ex3}, {ex4}] - but wait, long rest is after idx 1
      // Let me re-check: long rest after idx 1 means (1+1) % 2 === 0, yes!
      // So at startIdx=1, we check rest after startIdx-1=0: (0+1) % 2 !== 0, no long rest
      // Then we build from i=1: add ex2, check rest after ex2: (1+1) % 2 === 0, yes! add long rest
      
      // Expected: [{ex2}, {longRest}, {ex3}, {ex4}]
      assert.strictEqual(timeline.length, 4);
      assert.strictEqual(timeline[0].type, 'exercise');
      assert.strictEqual(timeline[1].type, 'longRest');
    });

    test('at idx=1: long rest after completing current should show FIRST', () => {
      const queue = [
        { exId: 'ex1', name: 'Previous', reps: 10, unit: 'reps' },     // idx 0
        { exId: 'ex2', name: 'Current', reps: 10, unit: 'reps' },       // idx 1 (current - completing this leads to long rest)
        { exId: 'ex3', name: 'Next', reps: 10, unit: 'reps' },          // idx 2
        { exId: 'ex4', name: 'Following', reps: 10, unit: 'reps' },     // idx 3
      ];
      // Up Next uses startIdx = idx + 1 = 2
      const timeline = buildUpcomingTimeline(queue, 2, restConfig);
      
      console.log('Timeline from idx=2:', timeline.map(x => x.type));
      
      // Check rest after startIdx-1=1: (1+1) % 2 === 0, yes! long rest after ex2
      // Expected: [{longRest after ex2}, {ex3}, {ex4}]
      assert.strictEqual(timeline.length, 3, 'Should have 3 items');
      assert.strictEqual(timeline[0].type, 'longRest', 'First item should be long rest');
      assert.strictEqual(timeline[0].queueIndex, 1, 'Long rest should be after queue index 1');
      assert.strictEqual(timeline[1].type, 'exercise');
      assert.strictEqual(timeline[1].item.exId, 'ex3');
    });

    test('at idx=2: no long rest before, normal flow', () => {
      const queue = [
        { exId: 'ex1', name: 'A', reps: 10, unit: 'reps' },
        { exId: 'ex2', name: 'B', reps: 10, unit: 'reps' },
        { exId: 'ex3', name: 'C', reps: 10, unit: 'reps' },          // idx 2 (current)
        { exId: 'ex4', name: 'D', reps: 10, unit: 'reps' },          // idx 3
      ];
      // Up Next uses startIdx = idx + 1 = 3
      const timeline = buildUpcomingTimeline(queue, 3, restConfig);
      
      console.log('Timeline from idx=3:', timeline.map(x => x.type));
      
      // Check rest after startIdx-1=2: (2+1) % 2 !== 0, no long rest
      // Expected: [{ex4}]
      assert.strictEqual(timeline.length, 1);
      assert.strictEqual(timeline[0].type, 'exercise');
      assert.strictEqual(timeline[0].item.exId, 'ex4');
    });

    test('interval every 3: long rest appears at correct positions', () => {
      const restConfig3 = { type: 'interval', short: 15, long: 90, longEvery: 3 };
      const queue = [
        { exId: 'ex1', name: 'A', reps: 10, unit: 'reps' },     // idx 0
        { exId: 'ex2', name: 'B', reps: 10, unit: 'reps' },     // idx 1
        { exId: 'ex3', name: 'C', reps: 10, unit: 'reps' },     // idx 2 (completing this leads to long rest: (2+1) % 3 === 0)
        { exId: 'ex4', name: 'D', reps: 10, unit: 'reps' },     // idx 3
        { exId: 'ex5', name: 'E', reps: 10, unit: 'reps' },     // idx 4
        { exId: 'ex6', name: 'F', reps: 10, unit: 'reps' },     // idx 5
        { exId: 'ex7', name: 'G', reps: 10, unit: 'reps' },     // idx 6 (completing this leads to long rest: (5+1) % 3 === 0)
      ];
      // At idx=2 (current), startIdx=3
      const timeline = buildUpcomingTimeline(queue, 3, restConfig3);
      
      console.log('Timeline from idx=3 (every 3):', timeline.map(t => t.type === 'longRest' ? 'LR' : t.item?.name));
      
      // Check rest after startIdx-1=2: (2+1) % 3 === 0, yes! long rest after ex3
      // From i=3: ex4, (3+1) % 3 !== 0 no long rest
      // From i=4: ex5, (4+1) % 3 !== 0 no long rest  
      // From i=5: ex6, (5+1) % 3 === 0 yes! long rest
      // From i=6: ex7, (6+1) % 3 !== 0 no long rest, but 6 is last so no more
      // Expected: [{longRest after ex3}, {ex4}, {ex5}, {ex6}, {longRest}, {ex7}]
      assert.strictEqual(timeline.length, 6);
      assert.strictEqual(timeline[0].type, 'longRest');
      assert.strictEqual(timeline[1].item.exId, 'ex4');
      assert.strictEqual(timeline[3].item.exId, 'ex6');
      assert.strictEqual(timeline[4].type, 'longRest');
      assert.strictEqual(timeline[5].item.exId, 'ex7');
    });

    test('imported long rest with restType=long', () => {
      const queue = [
        { exId: 'ex1', name: 'A', reps: 10, unit: 'reps' },
        { exId: 'ex2', name: 'B', reps: 10, unit: 'reps', restType: 'long' },    // idx 1 - imported long rest after this
        { exId: 'ex3', name: 'C', reps: 10, unit: 'reps' },
      ];
      // At idx=0 (current), startIdx=1
      const timeline = buildUpcomingTimeline(queue, 1, restConfig);
      
      console.log('Timeline with imported long rest:', timeline.map(t => t.type === 'longRest' ? 'LR' : t.item?.name));
      
      // Check rest after startIdx-1=0: no interval schedule (type=interval but need to check)
      // Actually restConfig is interval type, but ex1 is not at an interval boundary (0+1) % 2 !== 0
      // From i=1: ex2, ex2.restType === 'long' -> add long rest
      // Expected: [{ex2}, {longRest}, {ex3}]
      assert.strictEqual(timeline.length, 3);
      assert.strictEqual(timeline[0].type, 'exercise');
      assert.strictEqual(timeline[1].type, 'longRest');
    });
  });
});
