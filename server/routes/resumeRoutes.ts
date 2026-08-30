import { Router } from 'express';
import { getGeminiClient } from '../config/gemini';
import { getStoredProfile } from '../storage/repository';
import { tailorLatexResume } from '../services/latexTailorService';
import { calculateProfileMatch } from '../services/profileMatchService';
import { DEFAULT_MASTER_TEX } from '../../src/data/defaultProfile';
import { JobAnalysis, ProfileMatch, UserProfile } from '../../src/types';

export const resumeRouter = Router();

// POST /api/resume/tailor-latex
resumeRouter.post('/tailor-latex', async (req, res) => {
  const { masterTex, analysis, match, profile } = req.body;
  const originalTex: string = masterTex || getStoredProfile().masterTexResume || DEFAULT_MASTER_TEX;
  const userProfile: UserProfile = profile || getStoredProfile();
  const targetMatch: ProfileMatch = match || (analysis ? calculateProfileMatch(analysis, userProfile) : {
    overallScore: 90,
    mustHaveScore: 90,
    matches: [],
    gaps: [],
    strongAlignments: [],
    recommendations: []
  });

  const ai = getGeminiClient();
  try {
    const result = await tailorLatexResume(originalTex, analysis, targetMatch, userProfile, ai);
    res.json({ result, tailoring: result });
  } catch (err: any) {
    console.error('[ResumeRoutes] Error in tailor-latex:', err);
    res.status(500).json({ error: err.message });
  }
});
