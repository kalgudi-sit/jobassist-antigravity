import { Router } from 'express';
import { getStoredProfile, saveStoredProfile } from '../storage/repository';
import { UserProfile, MasterQAItem } from '../../src/types';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', (req, res) => {
  const profile = getStoredProfile();
  res.json(profile);
});

// POST or PUT /api/profile
profileRouter.post('/', (req, res) => {
  const profile: UserProfile = req.body;
  if (!profile || !profile.personal) {
    return res.status(400).json({ error: 'Invalid profile data' });
  }
  saveStoredProfile(profile);
  res.json({ success: true, profile });
});

profileRouter.put('/', (req, res) => {
  const profile: UserProfile = req.body;
  if (!profile || !profile.personal) {
    return res.status(400).json({ error: 'Invalid profile data' });
  }
  saveStoredProfile(profile);
  res.json({ success: true, profile });
});

// POST /api/profile/master-qa
profileRouter.post('/master-qa', (req, res) => {
  const { masterQA } = req.body;
  if (!Array.isArray(masterQA)) {
    return res.status(400).json({ error: 'masterQA array is required' });
  }
  const profile = getStoredProfile();
  profile.masterQA = masterQA as MasterQAItem[];
  saveStoredProfile(profile);
  res.json({ success: true, masterQA: profile.masterQA });
});
