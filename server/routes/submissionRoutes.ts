import { Router } from 'express';
import { getGeminiClient } from '../config/gemini';
import { getStoredProfile } from '../storage/repository';
import { buildAutoApplyPayload } from '../services/submissionService';
import { JobApplication, UserProfile } from '../../src/types';

export const submissionRouter = Router();

// POST /api/auto-apply/generate-payload
submissionRouter.post('/generate-payload', async (req, res) => {
  const { application, profile } = req.body;
  if (!application) {
    return res.status(400).json({ error: 'Application data is required' });
  }

  const userProfile: UserProfile = profile || getStoredProfile();
  const ai = getGeminiClient();

  try {
    const autoApply = await buildAutoApplyPayload(application as JobApplication, userProfile, ai);
    res.json({ autoApply });
  } catch (err: any) {
    console.error('[SubmissionRoutes] Error in generate-payload:', err);
    res.status(500).json({ error: err.message });
  }
});
