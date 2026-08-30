export interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  originalLineNumber?: number;
  tailoredLineNumber?: number;
  originalText?: string;
  tailoredText?: string;
}

/**
 * Computes a line-by-line diff between master and tailored LaTeX resume files.
 */
export function computeTexDiff(originalTex: string, tailoredTex: string): DiffLine[] {
  const origLines = originalTex.split('\n');
  const tailLines = tailoredTex.split('\n');
  const diffs: DiffLine[] = [];

  const maxLen = Math.max(origLines.length, tailLines.length);
  let origIdx = 0;
  let tailIdx = 0;

  while (origIdx < origLines.length || tailIdx < tailLines.length) {
    const oLine = origLines[origIdx];
    const tLine = tailLines[tailIdx];

    if (oLine === tLine) {
      if (oLine !== undefined) {
        diffs.push({
          type: 'unchanged',
          originalLineNumber: origIdx + 1,
          tailoredLineNumber: tailIdx + 1,
          originalText: oLine,
          tailoredText: tLine
        });
      }
      origIdx++;
      tailIdx++;
    } else if (oLine !== undefined && tLine !== undefined) {
      // Check if this is a modified bullet/line
      diffs.push({
        type: 'modified',
        originalLineNumber: origIdx + 1,
        tailoredLineNumber: tailIdx + 1,
        originalText: oLine,
        tailoredText: tLine
      });
      origIdx++;
      tailIdx++;
    } else if (oLine !== undefined) {
      diffs.push({
        type: 'removed',
        originalLineNumber: origIdx + 1,
        originalText: oLine
      });
      origIdx++;
    } else if (tLine !== undefined) {
      diffs.push({
        type: 'added',
        tailoredLineNumber: tailIdx + 1,
        tailoredText: tLine
      });
      tailIdx++;
    }
  }

  return diffs;
}

/**
 * Summarizes diff statistics.
 */
export function getDiffSummary(diffs: DiffLine[]) {
  const modified = diffs.filter(d => d.type === 'modified').length;
  const added = diffs.filter(d => d.type === 'added').length;
  const removed = diffs.filter(d => d.type === 'removed').length;
  const unchanged = diffs.filter(d => d.type === 'unchanged').length;

  return {
    totalLines: diffs.length,
    modified,
    added,
    removed,
    unchanged,
    hasChanges: modified > 0 || added > 0 || removed > 0
  };
}
