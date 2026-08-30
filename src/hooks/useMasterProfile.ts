import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { MasterQAItem, UserProfile } from '../types';
import { profileService } from '../services/profileService';
import { DEFAULT_USER_PROFILE } from '../data/defaultProfile';

export interface UseMasterProfileReturn {
  profile: UserProfile;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveSuccess: boolean;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  updateProfile: (updated: UserProfile) => Promise<void>;
  updateMasterTex: (tex: string) => Promise<void>;
  updateMasterQA: (qaList: MasterQAItem[]) => Promise<void>;
  addMasterQAItem: (item: Omit<MasterQAItem, 'id' | 'updatedAt'>) => Promise<void>;
  deleteMasterQAItem: (id: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useMasterProfile(): UseMasterProfileReturn {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileService.get();
      if (data && data.personal) {
        setProfile(data);
      }
    } catch (err: any) {
      console.warn('Failed to load profile from server, using local default:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = useCallback(async (updated: UserProfile) => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);
      await profileService.save(updated);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateMasterTex = useCallback(async (tex: string) => {
    const updated: UserProfile = {
      ...profile,
      masterTexResume: tex
    };
    await updateProfile(updated);
  }, [profile, updateProfile]);

  const updateMasterQA = useCallback(async (qaList: MasterQAItem[]) => {
    try {
      setIsSaving(true);
      setError(null);
      await profileService.saveMasterQA(qaList);
      setProfile(prev => ({
        ...prev,
        masterQA: qaList
      }));
    } catch (err: any) {
      setError(err?.message || 'Failed to save master QA library');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const addMasterQAItem = useCallback(async (item: Omit<MasterQAItem, 'id' | 'updatedAt'>) => {
    const newItem: MasterQAItem = {
      ...item,
      id: `mqa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      updatedAt: new Date().toISOString()
    };
    const current = profile.masterQA || [];
    await updateMasterQA([newItem, ...current]);
  }, [profile.masterQA, updateMasterQA]);

  const deleteMasterQAItem = useCallback(async (id: string) => {
    const current = profile.masterQA || [];
    const filtered = current.filter(item => item.id !== id);
    await updateMasterQA(filtered);
  }, [profile.masterQA, updateMasterQA]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    setProfile,
    updateProfile,
    updateMasterTex,
    updateMasterQA,
    addMasterQAItem,
    deleteMasterQAItem,
    refreshProfile
  };
}
