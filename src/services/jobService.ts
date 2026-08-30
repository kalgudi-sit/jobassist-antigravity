import { apiClient } from './apiClient';
import { JobAnalysis, ProfileMatch } from '../types';

export interface ScrapedJobData {
  title?: string;
  company?: string;
  location?: string;
  description: string;
  sourceUrl?: string;
}

export const jobService = {
  /**
   * Scrapes job posting details from a public career URL.
   */
  async fetchFromUrl(url: string): Promise<ScrapedJobData> {
    return apiClient<ScrapedJobData>('/api/jobs/fetch-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
      timeoutMs: 30000
    });
  },

  /**
   * Performs deep requirement extraction and profile matching on a job description.
   */
  async analyze(params: {
    jobDescription: string;
    title?: string;
    company?: string;
    location?: string;
    url?: string;
  }): Promise<{ analysis: JobAnalysis; match: ProfileMatch }> {
    return apiClient<{ analysis: JobAnalysis; match: ProfileMatch }>('/api/jobs/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
      timeoutMs: 45000
    });
  }
};
