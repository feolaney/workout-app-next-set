export function isLongRestAfterIndex(queueIndex, queueLength, restConfig) {
  const longEvery = Number(restConfig?.longEvery) || 0;
  return (
    restConfig?.type === 'interval'
    && longEvery > 0
    && queueIndex >= 0
    && queueIndex < queueLength - 1
    && (queueIndex + 1) % longEvery === 0
  );
}

export function isLongRestForIndex(queue, queueIndex, restConfig) {
  return queue?.[queueIndex]?.restType === 'long'
    || isLongRestAfterIndex(queueIndex, queue?.length || 0, restConfig);
}

export function getRestDurationAfterIndex(queue, queueIndex, restConfig) {
  const item = queue?.[queueIndex];
  if (!item || item.restType === 'none') return 0;
  if (item.restType !== 'interval' && item.restSeconds !== undefined && item.restSeconds !== null) {
    return Math.max(0, Number(item.restSeconds) || 0);
  }
  if (restConfig?.type === 'none') return 0;
  return isLongRestForIndex(queue, queueIndex, restConfig)
    ? Math.max(0, Number(restConfig?.long) || 0)
    : Math.max(0, Number(restConfig?.short) || 0);
}

function longRestTarget(queue, queueIndex, restConfig) {
  if (queueIndex < 0 || queueIndex >= queue.length - 1) return null;
  const duration = getRestDurationAfterIndex(queue, queueIndex, restConfig);
  if (duration <= 0 || !isLongRestForIndex(queue, queueIndex, restConfig)) return null;
  return {
    type: 'longRest',
    duration,
    queueIndex,
    key: `longRest-${queueIndex}`,
  };
}

export function buildUpcomingTimeline(queue, currentIdx, phase, restConfig) {
  if (!Array.isArray(queue) || queue.length === 0) return [];
  const safeIdx = Math.max(-1, Math.min(Number(currentIdx) || 0, queue.length - 1));
  const items = [];

  // Keep the complete completed-exercise history so the user can browse back
  // as far as the workout itself allows.
  const historyStart = 0;
  for (let queueIndex = historyStart; queueIndex < safeIdx; queueIndex += 1) {
    items.push({
      type: 'exercise',
      item: queue[queueIndex],
      queueIndex,
      isHistory: true,
      key: `history-${queueIndex}`,
    });
  }

  // Add live marker if we have history
  if (historyStart < safeIdx) {
    items.push({
      type: 'liveMarker',
      queueIndex: safeIdx,
      key: `live-${safeIdx}`,
    });
  }

  // Add the immediate rest after current (if in exercise phase and applicable)
  if (phase !== 'rest') {
    const immediateRest = longRestTarget(queue, safeIdx, restConfig);
    if (immediateRest) items.push(immediateRest);
  }

  // Add future entries
  for (let queueIndex = safeIdx + 1; queueIndex < queue.length; queueIndex += 1) {
    items.push({
      type: 'exercise',
      item: queue[queueIndex],
      queueIndex,
      isHistory: false,
      key: `exercise-${queueIndex}`,
    });
    const rest = longRestTarget(queue, queueIndex, restConfig);
    if (rest) items.push(rest);
  }

  return items;
}

export function targetKey(target) {
  if (!target || !Number.isInteger(target.queueIndex)) return null;
  return `${target.type}:${target.queueIndex}`;
}

export function getJumpState(target) {
  if (!target || !Number.isInteger(target.queueIndex)) return null;
  if (target.type === 'longRest') {
    return {
      idx: target.queueIndex,
      phase: 'rest',
      restRemaining: Math.max(0, Number(target.duration) || 0),
    };
  }
  return { idx: target.queueIndex, phase: 'exercise', restRemaining: 0 };
}

export function getPreviewPercent(target, queueLength) {
  if (!target || !Number.isInteger(target.queueIndex) || queueLength <= 0) return null;
  return Math.max(0, Math.min(100, ((target.queueIndex + 1) / queueLength) * 100));
}

export function getLiveIndexInTimeline(timeline, currentIdx) {
  if (!Array.isArray(timeline) || !Number.isInteger(currentIdx)) return null;
  return timeline.findIndex(item => item.type === 'liveMarker' && item.queueIndex === currentIdx);
}

export function getTimelineAnchorIndex({ liveIndex, primaryIndex } = {}) {
  if (Number.isInteger(liveIndex) && liveIndex >= 0) return liveIndex;
  return Number.isInteger(primaryIndex) && primaryIndex >= 0 ? primaryIndex : -1;
}

export function getTimelineTrailingSpacerRows({ viewportRows, rowCount, anchorIndex } = {}) {
  if (![viewportRows, rowCount, anchorIndex].every(Number.isInteger)) return 0;
  return Math.max(0, viewportRows - (rowCount - anchorIndex));
}

export function getTimelineBrowseRow({ rows, scrollTop, rowHeight, anchorIndex } = {}) {
  if (!Array.isArray(rows) || rows.length === 0 || !(rowHeight > 0)) return null;
  const rowIndex = Math.max(0, Math.min(rows.length - 1, Math.round((Number(scrollTop) || 0) / rowHeight)));
  if (rowIndex === anchorIndex || rows[rowIndex]?.type === 'liveMarker') return null;
  return rows[rowIndex] || null;
}

export function getLiveMarkerPresentation({ isScrolling, isBrowsing } = {}) {
  const emphasized = Boolean(isScrolling || isBrowsing);
  return { showLabel: emphasized, emphasized };
}

export function getUpNextViewModel(timeline) {
  const rows = Array.isArray(timeline) ? timeline : [];
  const liveIndex = rows.findIndex(item => item.type === 'liveMarker');
  const searchStart = liveIndex >= 0 ? liveIndex + 1 : 0;
  const primaryIndex = rows.findIndex((item, index) => (
    index >= searchStart && (item.type === 'exercise' || item.type === 'longRest')
  ));

  return {
    rows,
    liveIndex,
    primaryIndex,
    primary: primaryIndex >= 0 ? rows[primaryIndex] : null,
  };
}
