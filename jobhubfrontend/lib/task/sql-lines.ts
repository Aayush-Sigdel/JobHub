/** One non-empty editor line per entry, in its original order. */
export function sqlLinesForSubmission(source: string): string[] {
  return source
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);
}
