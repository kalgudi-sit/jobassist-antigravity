import { Router } from 'express';
import { profileRouter } from './profileRoutes';
import { jobRouter } from './jobRoutes';
import { resumeRouter } from './resumeRoutes';
import { communicationRouter } from './communicationRoutes';
import { submissionRouter } from './submissionRoutes';

export const apiRouter = Router();

// API Health Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// Mount domain routes
apiRouter.use('/profile', profileRouter);
apiRouter.use('/jobs', jobRouter);
apiRouter.use('/applications', jobRouter); // Alias for consistency
apiRouter.use('/resume', resumeRouter);
apiRouter.use('/cover-letter', communicationRouter);
apiRouter.use('/recruiters', communicationRouter);
apiRouter.use('/outreach', communicationRouter);
apiRouter.use('/auto-apply', submissionRouter);
