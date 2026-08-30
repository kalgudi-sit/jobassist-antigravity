import { useState, useCallback, useMemo } from 'react';
import { JobApplication, ResumeTailoringResult, UserProfile } from '../types';
import { resumeService } from '../services/resumeService';
import { computeTexDiff, getDiffSummary } from '../utils/diffUtils';
import { downloadTexFile, createResumeFilename } from '../utils/latexUtils';
import { copyToClipboard } from '../utils/clipboardUtils';

export interface UseResumeTailorReturn {
  activeApplication: JobApplication | null;
  masterTex: string;
  tailoredTex: string;
  tailoringResult: ResumeTailoringResult | null;
  isTailoring: boolean;
  isCopied: boolean;
  error: string | null;
  diffSummary: ReturnType<typeof getDiffSummary>;
  diffLines: ReturnType<typeof computeTexDiff>;
  setMasterTex: (tex: string) => void;
  setTailoredTex: (tex: string) => void;
  runTailoring: (application: JobApplication, profile: UserProfile) => Promise<ResumeTailoringResult>;
  downloadTailoredTex: (fileName?: string) => void;
  copyTailoredTex: () => Promise<boolean>;
  resetToMaster: () => void;
}

export function useResumeTailor(initialApplication?: JobApplication | null, initialProfile?: UserProfile | null): UseResumeTailorReturn {
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(initialApplication || null);
  const [masterTex, setMasterTex] = useState<string>(
    initialProfile?.masterTexResume || initialApplication?.resumeTailoring?.tailoredTex || ''
  );
  const [tailoredTex, setTailoredTex] = useState<string>(
    initialApplication?.resumeTailoring?.tailoredTex || initialProfile?.masterTexResume || ''
  );
  const [tailoringResult, setTailoringResult] = useState<ResumeTailoringResult | null>(
    initialApplication?.resumeTailoring || null
  );
  const [isTailoring, setIsTailoring] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const diffLines = useMemo(() => {
    if (!masterTex || !tailoredTex) return [];
    return computeTexDiff(masterTex, tailoredTex);
  }, [masterTex, tailoredTex]);

  const diffSummary = useMemo(() => {
    return getDiffSummary(diffLines);
  }, [diffLines]);

  const runTailoring = useCallback(async (
    application: JobApplication,
    profile: UserProfile
  ): Promise<ResumeTailoringResult> => {
    setIsTailoring(true);
    setError(null);
    setActiveApplication(application);

    const sourceMasterTex = masterTex || profile.masterTexResume;
    if (sourceMasterTex && sourceMasterTex !== masterTex) {
      setMasterTex(sourceMasterTex);
    }

    try {
      const response = await resumeService.tailorForApplication(application.id, {
        masterTex: sourceMasterTex,
        jobDescription: application.jobDescription,
        profile,
        analysis: application.analysis,
        match: application.match
      });

      const result = response.tailoring || response.result;
      setTailoringResult(result);
      if (result.tailoredTex) {
        setTailoredTex(result.tailoredTex);
      }
      return result;
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to tailor LaTeX resume';
      setError(errMsg);
      throw err;
    } finally {
      setIsTailoring(false);
    }
  }, [masterTex]);

  const downloadTailoredTex = useCallback((customFileName?: string) => {
    const content = tailoredTex || masterTex;
    if (!content) return;
    const name = customFileName || createResumeFilename(
      'Resume',
      activeApplication?.company || 'Target',
      activeApplication?.title || 'Engineer'
    );
    downloadTexFile(content, name);
  }, [tailoredTex, masterTex, activeApplication]);

  const copyTailoredTex = useCallback(async (): Promise<boolean> => {
    const content = tailoredTex || masterTex;
    if (!content) return false;
    const success = await copyToClipboard(content);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
    return success;
  }, [tailoredTex, masterTex]);

  const resetToMaster = useCallback(() => {
    if (masterTex) {
      setTailoredTex(masterTex);
    }
  }, [masterTex]);

  return {
    activeApplication,
    masterTex,
    tailoredTex,
    tailoringResult,
    isTailoring,
    isCopied,
    error,
    diffSummary,
    diffLines,
    setMasterTex,
    setTailoredTex,
    runTailoring,
    downloadTailoredTex,
    copyTailoredTex,
    resetToMaster
  };
}
