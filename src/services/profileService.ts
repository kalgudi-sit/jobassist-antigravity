import { apiClient } from './apiClient';
import { MasterQAItem, UserProfile } from '../types';

export const profileService = {
  /**
   * Fetches the user master profile from server persistence.
   */
  async get(): Promise<UserProfile> {
    return apiClient<UserProfile>('/api/profile');
  },

  /**
   * Saves or updates the master profile.
   */
  async save(profile: UserProfile): Promise<{ success: boolean; profile: UserProfile }> {
    return apiClient<{ success: boolean; profile: UserProfile }>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  },

  /**
   * Updates the user's Master QA library.
   */
  async saveMasterQA(masterQA: MasterQAItem[]): Promise<{ success: boolean; masterQA: MasterQAItem[] }> {
    return apiClient<{ success: boolean; masterQA: MasterQAItem[] }>('/api/profile/master-qa', {
      method: 'POST',
      body: JSON.stringify({ masterQA })
    });
  }
};
