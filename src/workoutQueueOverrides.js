export function updateFutureExerciseValues(queue, startIndex, reps) {
  const current = queue[startIndex];
  if (!current) return queue;

  return queue.map((item, index) => (
    index >= startIndex && item.exId === current.exId
      ? { ...item, reps }
      : item
  ));
}
