import { apiClient } from './apiClient';
import { ApplicationSubmissionResult, AutoApplyPayload, MasterQAItem, UserProfile } from '../types';

export const submissionService = {
  /**
   * Builds the 1-Click AutoApply payload and browser bookmarklet / injection scripts.
   */
  async buildAutoApply(
    applicationId: string,
    params?: { profile?: UserProfile }
  ): Promise<{ autoApply: AutoApplyPayload }> {
    return apiClient<{ autoApply: AutoApplyPayload }>(
      `/api/jobs/${applicationId}/auto-apply`,
      {
        method: 'POST',
        body: JSON.stringify(params || {}),
        timeoutMs: 40000
      }
    );
  },

  /**
   * Submits application against portal questions using master Q&A or flags pending inputs.
   */
  async submitApplication(
    applicationId: string,
    params?: { profile?: UserProfile }
  ): Promise<{ result: ApplicationSubmissionResult }> {
    return apiClient<{ result: ApplicationSubmissionResult }>(
      `/api/jobs/${applicationId}/submit-application`,
      {
        method: 'POST',
        body: JSON.stringify(params || {}),
        timeoutMs: 25000
      }
    );
  },

  /**
   * Resolves pending application questions and optionally saves them into the Master QA library.
   */
  async answerPendingQuestions(
    applicationId: string,
    params: {
      answers: Array<{
        question: string;
        answer: string;
        category?: string;
        saveToMasterList?: boolean;
      }>;
      profile?: UserProfile;
    }
  ): Promise<{ result: ApplicationSubmissionResult; newMasterQAItems: MasterQAItem[] }> {
    return apiClient<{ result: ApplicationSubmissionResult; newMasterQAItems: MasterQAItem[] }>(
      `/api/jobs/${applicationId}/answer-pending-questions`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        timeoutMs: 25000
      }
    );
  }
};
