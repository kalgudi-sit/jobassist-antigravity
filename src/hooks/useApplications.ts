import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApplicationStatus, JobApplication } from '../types';
import { applicationService } from '../services/applicationService';

export interface UseApplicationsReturn {
  applications: JobApplication[];
  filteredApplications: JobApplication[];
  selectedApplication: JobApplication | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
  setSelectedApplication: (app: JobApplication | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  refreshApplications: () => Promise<void>;
  saveApplication: (app: JobApplication) => Promise<void>;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  selectApplicationById: (id: string) => void;
}

export function useApplications(): UseApplicationsReturn {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await applicationService.getAll();
      setApplications(data);
      if (selectedApplication) {
        const updatedSelected = data.find(a => a.id === selectedApplication.id);
        if (updatedSelected) {
          setSelectedApplication(updatedSelected);
        }
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err?.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [selectedApplication]);

  useEffect(() => {
    refreshApplications();
  }, []);

  const saveApplication = useCallback(async (app: JobApplication) => {
    try {
      setError(null);
      await applicationService.save(app);
      setApplications(prev => {
        const idx = prev.findIndex(a => a.id === app.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = app;
          return copy;
        }
        return [app, ...prev];
      });
      if (selectedApplication?.id === app.id) {
        setSelectedApplication(app);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save application');
      throw err;
    }
  }, [selectedApplication]);

  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    const target = applications.find(a => a.id === id);
    if (!target) return;
    const updated: JobApplication = {
      ...target,
      status,
      updatedAt: new Date().toISOString()
    };
    await saveApplication(updated);
  }, [applications, saveApplication]);

  const deleteApplication = useCallback(async (id: string) => {
    try {
      setError(null);
      await applicationService.delete(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete application');
      throw err;
    }
  }, [selectedApplication]);

  const selectApplicationById = useCallback((id: string) => {
    const found = applications.find(a => a.id === id);
    if (found) {
      setSelectedApplication(found);
    }
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        !searchQuery ||
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.analysis?.prioritySkills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'ALL' ||
        app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  return {
    applications,
    filteredApplications,
    selectedApplication,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    setSelectedApplication,
    setSearchQuery,
    setStatusFilter,
    refreshApplications,
    saveApplication,
    updateApplicationStatus,
    deleteApplication,
    selectApplicationById
  };
}
