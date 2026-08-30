import { useState, useCallback } from 'react';
import { JobAnalysis, ProfileMatch } from '../types';
import { jobService } from '../services/jobService';

export interface UseJobScraperReturn {
  urlInput: string;
  jobDescriptionInput: string;
  titleInput: string;
  companyInput: string;
  locationInput: string;
  isScraping: boolean;
  isAnalyzing: boolean;
  error: string | null;
  scrapedSource: string | null;
  setUrlInput: (url: string) => void;
  setJobDescriptionInput: (jd: string) => void;
  setTitleInput: (title: string) => void;
  setCompanyInput: (company: string) => void;
  setLocationInput: (loc: string) => void;
  scrapeUrl: (urlToScrape?: string) => Promise<void>;
  analyzeJob: () => Promise<{ analysis: JobAnalysis; match: ProfileMatch }>;
  resetForm: () => void;
}

export function useJobScraper(): UseJobScraperReturn {
  const [urlInput, setUrlInput] = useState<string>('');
  const [jobDescriptionInput, setJobDescriptionInput] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [companyInput, setCompanyInput] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedSource, setScrapedSource] = useState<string | null>(null);

  const scrapeUrl = useCallback(async (urlToScrape?: string) => {
    const targetUrl = (urlToScrape || urlInput).trim();
    if (!targetUrl) {
      setError('Please provide a valid Job URL.');
      return;
    }

    try {
      setIsScraping(true);
      setError(null);
      const data = await jobService.fetchFromUrl(targetUrl);
      
      if (data.description) {
        setJobDescriptionInput(data.description);
      }
      if (data.title) {
        setTitleInput(data.title);
      }
      if (data.company) {
        setCompanyInput(data.company);
      }
      if (data.location) {
        setLocationInput(data.location);
      }
      setScrapedSource(targetUrl);
    } catch (err: any) {
      console.error('Scraping error:', err);
      setError(err?.message || 'Failed to fetch JD from the provided link. You can paste the job description manually.');
    } finally {
      setIsScraping(false);
    }
  }, [urlInput]);

  const analyzeJob = useCallback(async (): Promise<{ analysis: JobAnalysis; match: ProfileMatch }> => {
    if (!jobDescriptionInput || jobDescriptionInput.trim().length < 20) {
      setError('Please provide a job description with at least 20 characters.');
      throw new Error('Invalid job description length');
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const result = await jobService.analyze({
        jobDescription: jobDescriptionInput,
        title: titleInput,
        company: companyInput,
        location: locationInput,
        url: urlInput
      });
      return result;
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to analyze job description';
      setError(errMsg);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [jobDescriptionInput, titleInput, companyInput, locationInput, urlInput]);

  const resetForm = useCallback(() => {
    setUrlInput('');
    setJobDescriptionInput('');
    setTitleInput('');
    setCompanyInput('');
    setLocationInput('');
    setError(null);
    setScrapedSource(null);
  }, []);

  return {
    urlInput,
    jobDescriptionInput,
    titleInput,
    companyInput,
    locationInput,
    isScraping,
    isAnalyzing,
    error,
    scrapedSource,
    setUrlInput,
    setJobDescriptionInput,
    setTitleInput,
    setCompanyInput,
    setLocationInput,
    scrapeUrl,
    analyzeJob,
    resetForm
  };
}
