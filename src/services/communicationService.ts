import { apiClient } from './apiClient';
import { CoverLetter, JobAnalysis, OutreachPackage, ProfileMatch, RecruiterDiscoveryResult, UserProfile } from '../types';

export const communicationService = {
  /**
   * Generates a tailored, authentic cover letter for a job application.
   */
  async generateCoverLetter(
    applicationId: string,
    params?: { jobDescription?: string; profile?: UserProfile }
  ): Promise<{ coverLetter: CoverLetter }> {
    return apiClient<{ coverLetter: CoverLetter }>(
      `/api/jobs/${applicationId}/generate-cover-letter`,
      {
        method: 'POST',
        body: JSON.stringify(params || {}),
        timeoutMs: 45000
      }
    );
  },

  /**
   * Discovers recruiter search strategies and profiles for an application.
   */
  async discoverRecruiters(
    applicationId: string,
    params?: { company?: string; role?: string; location?: string }
  ): Promise<{ discovery: RecruiterDiscoveryResult }> {
    return apiClient<{ discovery: RecruiterDiscoveryResult }>(
      `/api/jobs/${applicationId}/discover-recruiters`,
      {
        method: 'POST',
        body: JSON.stringify(params || {}),
        timeoutMs: 25000
      }
    );
  },

  /**
   * Generates multi-channel recruiter outreach messages (LinkedIn Note, InMail, Cold Email).
   */
  async generateOutreach(
    applicationId: string,
    params: {
      company?: string;
      role?: string;
      candidateName?: string;
      candidateTitle?: string;
      profile?: UserProfile;
    }
  ): Promise<{ outreach: OutreachPackage }> {
    return apiClient<{ outreach: OutreachPackage }>(
      `/api/jobs/${applicationId}/generate-outreach`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        timeoutMs: 45000
      }
    );
  }
};
