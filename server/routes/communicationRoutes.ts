import { Router } from 'express';
import { getGeminiClient } from '../config/gemini';
import { getStoredProfile } from '../storage/repository';
import { generateCoverLetter } from '../services/coverLetterService';
import { calculateProfileMatch } from '../services/profileMatchService';
import { discoverRecruiterStrategies, generateOutreach } from '../services/outreachService';
import { UserProfile } from '../../src/types';

export const communicationRouter = Router();

// POST /api/cover-letter/generate
communicationRouter.post('/cover-letter/generate', async (req, res) => {
  const { analysis, match, profile } = req.body;
  const userProfile: UserProfile = profile || getStoredProfile();
  const targetMatch = match || (analysis ? calculateProfileMatch(analysis, userProfile) : {
    overallScore: 88,
    mustHaveScore: 88,
    matches: [],
    gaps: [],
    strongAlignments: [],
    recommendations: []
  });

  const ai = getGeminiClient();
  try {
    const coverLetter = await generateCoverLetter(analysis, targetMatch, userProfile, ai);
    res.json({ coverLetter });
  } catch (err: any) {
    console.error('[CommunicationRoutes] Error in cover letter:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recruiters/discover
communicationRouter.post('/recruiters/discover', async (req, res) => {
  const { analysis } = req.body;
  const company = analysis?.company || 'Company';
  const role = analysis?.title || 'Software Engineer';
  const location = analysis?.location || 'Bangalore, India';

  const discovery = discoverRecruiterStrategies(company, role, location);
  res.json(discovery);
});

// POST /api/outreach/generate
communicationRouter.post('/outreach/generate', async (req, res) => {
  const { analysis, candidateName, candidateTitle, profile, match } = req.body;
  const userProfile: UserProfile = profile || getStoredProfile();
  const targetMatch = match || (analysis ? calculateProfileMatch(analysis, userProfile) : {
    overallScore: 88,
    mustHaveScore: 88,
    matches: [],
    gaps: [],
    strongAlignments: [],
    recommendations: []
  });

  const ai = getGeminiClient();
  try {
    const outreach = await generateOutreach(
      analysis,
      candidateName,
      candidateTitle,
      userProfile,
      targetMatch,
      ai
    );
    res.json({ outreach });
  } catch (err: any) {
    console.error('[CommunicationRoutes] Error in outreach generate:', err);
    res.status(500).json({ error: err.message });
  }
});
