import { Router } from 'express';
import { getGeminiClient } from '../config/gemini';
import { getStoredApplications, getStoredProfile, saveStoredApplications, saveStoredProfile, upsertApplication, deleteApplicationById, getApplicationById } from '../storage/repository';
import { scrapeJobFromUrl } from '../services/scraperService';
import { analyzeJobDescription } from '../services/jobAnalysisService';
import { calculateProfileMatch } from '../services/profileMatchService';
import { tailorLatexResume } from '../services/latexTailorService';
import { generateCoverLetter } from '../services/coverLetterService';
import { discoverRecruiterStrategies, generateOutreach } from '../services/outreachService';
import { buildAutoApplyPayload, processApplicationSubmission } from '../services/submissionService';
import { DEFAULT_MASTER_TEX } from '../../src/data/defaultProfile';
import { ApplicationSubmissionResult, JobAnalysis, JobApplication, MasterQAItem, UserProfile } from '../../src/types';

export const jobRouter = Router();

// GET /api/jobs or /api/applications
jobRouter.get('/', (req, res) => {
  const apps = getStoredApplications();
  res.json(apps);
});

// GET /api/jobs/:id
jobRouter.get('/:id', (req, res) => {
  const found = getApplicationById(req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(found);
});

// POST /api/jobs or /api/applications (Upsert)
jobRouter.post('/', (req, res) => {
  const appItem: JobApplication = req.body;
  if (!appItem.id || !appItem.title || !appItem.company) {
    return res.status(400).json({ error: 'Missing required application fields (id, title, company)' });
  }
  upsertApplication(appItem);
  res.json({ success: true, application: appItem });
});

// DELETE /api/jobs/:id
jobRouter.delete('/:id', (req, res) => {
  const success = deleteApplicationById(req.params.id);
  res.json({ success });
});

// POST /api/jobs/fetch-url
jobRouter.post('/fetch-url', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const ai = getGeminiClient();
  try {
    const extracted = await scrapeJobFromUrl(url, ai);
    res.json(extracted);
  } catch (err: any) {
    console.error('[JobRoutes] Error in fetch-url:', err);
    res.status(400).json({ error: err.message || 'Unable to extract job details from URL.' });
  }
});

// POST /api/jobs/analyze
jobRouter.post('/analyze', async (req, res) => {
  const { jobDescription, title, company, url, location } = req.body;
  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({ error: 'Job description must be at least 20 characters long.' });
  }

  const userProfile = getStoredProfile();
  const ai = getGeminiClient();

  const analysis = await analyzeJobDescription(jobDescription, ai, { title, company, location });
  const match = calculateProfileMatch(analysis, userProfile);

  res.json({ analysis, match });
});

// POST /api/jobs/:id/tailor-resume
jobRouter.post('/:id/tailor-resume', async (req, res) => {
  const { masterTex, jobDescription, profile, analysis: passedAnalysis, match: passedMatch } = req.body;
  const userProfile: UserProfile = profile || getStoredProfile();
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);

  const jobAnalysis: JobAnalysis = passedAnalysis || found?.analysis || {
    title: found?.title || 'Software Engineer',
    company: found?.company || 'Target Company',
    location: found?.location || 'Bangalore, India',
    seniority: 'Mid Level (2-4 yrs)',
    jobType: 'Full-time',
    summary: jobDescription || found?.jobDescription || '',
    technicalRequirements: [],
    softSkillRequirements: [],
    responsibilities: [],
    keywords: [],
    domainTerms: [],
    prioritySkills: ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'PostgreSQL']
  };

  const jobMatch = passedMatch || found?.match || calculateProfileMatch(jobAnalysis, userProfile);
  const originalTex: string = masterTex || userProfile.masterTexResume || DEFAULT_MASTER_TEX;
  const ai = getGeminiClient();

  try {
    const tailoring = await tailorLatexResume(originalTex, jobAnalysis, jobMatch, userProfile, ai);

    if (found && tailoring) {
      found.resumeTailoring = tailoring;
      found.updatedAt = new Date().toISOString();
      if (found.status === 'CREATED' || found.status === 'ANALYZED') {
        found.status = 'TAILORED';
      }
      saveStoredApplications(apps);
    }

    res.json({ tailoring, result: tailoring });
  } catch (err: any) {
    console.error('[JobRoutes] Tailor resume error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/generate-cover-letter
jobRouter.post('/:id/generate-cover-letter', async (req, res) => {
  const { jobDescription, profile } = req.body;
  const userProfile: UserProfile = profile || getStoredProfile();
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);

  const jobAnalysis: JobAnalysis = found?.analysis || {
    title: found?.title || 'Software Engineer',
    company: found?.company || 'Target Company',
    location: found?.location || 'Bangalore, India',
    seniority: 'Mid Level (2-4 yrs)',
    jobType: 'Full-time',
    summary: jobDescription || found?.jobDescription || '',
    technicalRequirements: [],
    softSkillRequirements: [],
    responsibilities: [],
    keywords: [],
    domainTerms: [],
    prioritySkills: ['Java', 'Spring Boot', 'Kafka']
  };

  const jobMatch = found?.match || calculateProfileMatch(jobAnalysis, userProfile);
  const ai = getGeminiClient();

  try {
    const coverLetter = await generateCoverLetter(jobAnalysis, jobMatch, userProfile, ai);
    if (found) {
      found.coverLetter = coverLetter;
      found.updatedAt = new Date().toISOString();
      saveStoredApplications(apps);
    }
    res.json({ coverLetter });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/discover-recruiters
jobRouter.post('/:id/discover-recruiters', async (req, res) => {
  const { company, role, location } = req.body;
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);

  const targetComp = company || found?.company || 'Enterprise';
  const targetRole = role || found?.title || 'Software Engineer';
  const targetLoc = location || found?.location || 'Bangalore, India';

  const discovery = discoverRecruiterStrategies(targetComp, targetRole, targetLoc);
  res.json({ discovery });
});

// POST /api/jobs/:id/generate-outreach
jobRouter.post('/:id/generate-outreach', async (req, res) => {
  const { company, role, candidateName, candidateTitle, profile } = req.body;
  const userProfile: UserProfile = profile || getStoredProfile();
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);

  const jobAnalysis: JobAnalysis = found?.analysis || {
    title: role || found?.title || 'Software Engineer',
    company: company || found?.company || 'Company',
    location: found?.location || 'Bangalore, India',
    seniority: 'Mid Level (2-4 yrs)',
    jobType: 'Full-time',
    summary: '',
    technicalRequirements: [],
    softSkillRequirements: [],
    responsibilities: [],
    keywords: [],
    domainTerms: [],
    prioritySkills: []
  };

  const jobMatch = found?.match || calculateProfileMatch(jobAnalysis, userProfile);
  const ai = getGeminiClient();

  try {
    const outreach = await generateOutreach(jobAnalysis, candidateName, candidateTitle, userProfile, jobMatch, ai);
    if (found) {
      found.outreach = outreach;
      found.updatedAt = new Date().toISOString();
      saveStoredApplications(apps);
    }
    res.json({ outreach });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/auto-apply
jobRouter.post('/:id/auto-apply', async (req, res) => {
  const { profile } = req.body;
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const userProfile: UserProfile = profile || getStoredProfile();
  const ai = getGeminiClient();

  try {
    const autoApply = await buildAutoApplyPayload(found, userProfile, ai);
    found.autoApply = autoApply;
    found.updatedAt = new Date().toISOString();
    saveStoredApplications(apps);
    res.json({ autoApply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/submit-application
jobRouter.post('/:id/submit-application', async (req, res) => {
  const { profile } = req.body;
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const userProfile: UserProfile = profile || getStoredProfile();
  const result = processApplicationSubmission(found, userProfile);

  if (result.submissionStatus === 'SUBMITTED') {
    found.status = 'APPLIED';
    found.submissionResult = result;
    found.trackingUrl = result.trackingUrl;
    found.updatedAt = new Date().toISOString();
    saveStoredApplications(apps);
  }

  res.json({ result });
});

// POST /api/jobs/:id/answer-pending-questions
jobRouter.post('/:id/answer-pending-questions', async (req, res) => {
  const { answers, profile } = req.body;
  const apps = getStoredApplications();
  const found = apps.find(a => a.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const userProfile: UserProfile = profile || getStoredProfile();
  const currentMasterQAs: MasterQAItem[] = userProfile.masterQA || [];
  const newMasterQAItems: MasterQAItem[] = [];

  const answersSubmitted: Array<{ question: string; answer: string; source: 'master_list' | 'ai_generated' | 'user_answered' }> = [];

  if (Array.isArray(answers)) {
    for (const item of answers) {
      answersSubmitted.push({
        question: item.question,
        answer: item.answer,
        source: 'user_answered'
      });

      if (item.saveToMasterList) {
        const categoryVal: MasterQAItem['category'] = 
          ['work_authorization', 'company_history', 'demographics', 'availability', 'compensation', 'general'].includes(item.category) 
            ? item.category 
            : 'general';
        const newQA: MasterQAItem = {
          id: `mqa-custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          category: categoryVal,
          question: item.question,
          answer: item.answer,
          updatedAt: new Date().toISOString()
        };
        newMasterQAItems.push(newQA);
        currentMasterQAs.push(newQA);
      }
    }
  }

  if (newMasterQAItems.length > 0) {
    userProfile.masterQA = currentMasterQAs;
    saveStoredProfile(userProfile);
  }

  const url = found.url || '';
  let portalName = 'Enterprise Careers Portal';
  const reqId = found.autoApply?.requisitionId || 'REQ-210781248';
  let trackingUrl = `https://careers.jpmorgan.com/global/en/application-status?req=${encodeURIComponent(reqId)}`;
  
  if (url.includes('oraclecloud.com') || url.includes('oracle')) {
    portalName = 'Oracle Cloud HCM / Candidate Experience';
    trackingUrl = `${url.split('?')[0]}/status?candidateId=CAND-${Date.now().toString().slice(-6)}`;
  } else if (url.includes('workday') || url.includes('myworkdayjobs')) {
    portalName = 'Workday Candidate Portal';
    trackingUrl = `${url.split('/job/')[0]}/application/status?id=WD-${Date.now().toString().slice(-6)}`;
  }

  const finalResult: ApplicationSubmissionResult = {
    applicationId: found.id,
    portalType: found.autoApply?.portalType || 'GENERIC',
    portalName,
    submittedAt: new Date().toISOString(),
    submissionStatus: 'SUBMITTED',
    trackingUrl,
    trackingNumber: `APP-${Date.now().toString().slice(-7)}`,
    confirmationId: `CONF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    answersSubmitted,
    pendingQuestions: []
  };

  found.status = 'APPLIED';
  found.submissionResult = finalResult;
  found.trackingUrl = trackingUrl;
  found.updatedAt = new Date().toISOString();
  saveStoredApplications(apps);

  res.json({
    result: finalResult,
    newMasterQAItems
  });
});
