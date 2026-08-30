import { apiClient } from './apiClient';
import { JobApplication } from '../types';

export const applicationService = {
  /**
   * Fetches all job applications from the repository.
   */
  async getAll(): Promise<JobApplication[]> {
    return apiClient<JobApplication[]>('/api/applications');
  },

  /**
   * Fetches a single job application by ID.
   */
  async getById(id: string): Promise<JobApplication> {
    return apiClient<JobApplication>(`/api/applications/${id}`);
  },

  /**
   * Upserts (creates or updates) a job application.
   */
  async save(application: JobApplication): Promise<{ success: boolean; application: JobApplication }> {
    return apiClient<{ success: boolean; application: JobApplication }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(application)
    });
  },

  /**
   * Deletes an application by ID.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient<{ success: boolean }>(`/api/applications/${id}`, {
      method: 'DELETE'
    });
  }
};
