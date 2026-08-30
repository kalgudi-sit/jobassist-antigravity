/**
 * Utility functions for validating and exporting LaTeX resume files (.tex).
 */

/**
 * Downloads a string as a clean `.tex` file.
 */
export function downloadTexFile(texContent: string, fileName: string = 'tailored_resume.tex'): void {
  const sanitizedName = fileName.endsWith('.tex') ? fileName : `${fileName}.tex`;
  const blob = new Blob([texContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizedName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates LaTeX document integrity (checks documentclass, begin/end document pairs).
 */
export function validateLatexIntegrity(tex: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!tex || tex.trim().length === 0) {
    issues.push('LaTeX file is empty.');
    return { isValid: false, issues };
  }

  if (!tex.includes('\\documentclass')) {
    issues.push('Missing \\documentclass declaration.');
  }

  if (!tex.includes('\\begin{document}')) {
    issues.push('Missing \\begin{document} block.');
  }

  if (!tex.includes('\\end{document}')) {
    issues.push('Missing \\end{document} closing block.');
  }

  // Count braces balance
  const openBraces = (tex.match(/\{/g) || []).length;
  const closeBraces = (tex.match(/\}/g) || []).length;
  if (Math.abs(openBraces - closeBraces) > 2) {
    issues.push(`Possible unbalanced curly braces ({: ${openBraces}, }: ${closeBraces})`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Sanitizes a filename for file export.
 */
export function createResumeFilename(candidateName: string, company: string, role: string): string {
  const clean = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const cName = clean(candidateName || 'Resume');
  const comp = clean(company || 'Target');
  const r = clean(role || 'Role');
  return `${cName}_${comp}_${r}_tailored.tex`;
}
