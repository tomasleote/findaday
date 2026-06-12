/**
 * Returns an array of cell values for a month grid.
 * Leading entries are null (empty offset cells); the rest are day numbers 1..daysInMonth.
 *
 * @param {number} daysInMonth  - Total days in the month
 * @param {number} firstDayOffset - Number of empty leading cells (0-based offset of the 1st)
 * @returns {(number|null)[]}
 */
export function buildMonthCells(daysInMonth, firstDayOffset) {
  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  return cells;
}
