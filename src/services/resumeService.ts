import { apiClient } from './apiClient';
import { JobAnalysis, ProfileMatch, ResumeTailoringResult, UserProfile } from '../types';

export const resumeService = {
  /**
   * Directly tailors LaTeX code for a target Job Application.
   */
  async tailorForApplication(
    applicationId: string,
    params: {
      masterTex?: string;
      jobDescription?: string;
      profile?: UserProfile;
      analysis?: JobAnalysis;
      match?: ProfileMatch;
    }
  ): Promise<{ tailoring: ResumeTailoringResult; result: ResumeTailoringResult }> {
    return apiClient<{ tailoring: ResumeTailoringResult; result: ResumeTailoringResult }>(
      `/api/jobs/${applicationId}/tailor-resume`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        timeoutMs: 60000
      }
    );
  },

  /**
   * General LaTeX tailoring endpoint without specific application binding.
   */
  async tailorStandalone(params: {
    masterTex?: string;
    analysis: JobAnalysis;
    match?: ProfileMatch;
    profile?: UserProfile;
  }): Promise<{ tailoring: ResumeTailoringResult; result: ResumeTailoringResult }> {
    return apiClient<{ tailoring: ResumeTailoringResult; result: ResumeTailoringResult }>(
      '/api/resume/tailor-latex',
      {
        method: 'POST',
        body: JSON.stringify(params),
        timeoutMs: 60000
      }
    );
  }
};
