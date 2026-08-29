import React, { useState, useEffect } from 'react';
import { 
  JobApplication, 
  UserProfile, 
  ApplicationStatus,
  JobAnalysis,
  ProfileMatch,
  ResumeTailoringResult,
  CoverLetter,
  RecruiterDiscoveryResult,
  OutreachPackage
} from './types';
import { DEFAULT_USER_PROFILE, SAMPLE_APPLICATIONS } from './data/defaultProfile';
import { Navbar } from './components/Navbar';
import { ApplicationList } from './components/ApplicationList';
import { ApplicationDetailView } from './components/ApplicationDetailView';
import { JobInputModal } from './components/JobInputModal';
import { MasterProfileModal } from './components/MasterProfileModal';
import { WorkflowGuideModal } from './components/WorkflowGuideModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [applications, setApplications] = useState<JobApplication[]>(SAMPLE_APPLICATIONS);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Filter & Search
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Loading flags
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [isTailoringResume, setIsTailoringResume] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isDiscoveringRecruiters, setIsDiscoveringRecruiters] = useState(false);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);

  // Initialize from server if available
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/jobs')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.personal) {
            setProfile(profileData);
          }
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (Array.isArray(jobsData) && jobsData.length > 0) {
            setApplications(jobsData);
          }
        }
      } catch (err) {
        console.log('Using initial default state:', err);
      }
    }
    loadInitialData();
  }, []);

  const selectedApp = applications.find(a => a.id === selectedApplicationId) || null;

  // Handle creating & analyzing a new job
  const handleAnalyzeNewJob = async (jobInput: {
    title: string;
    company: string;
    location: string;
    url?: string;
    jobDescription: string;
  }) => {
    setIsAnalyzingJob(true);
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobInput)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze job');
      }

      const newApp: JobApplication = {
        id: data.id || `job-${Date.now()}`,
        title: jobInput.title,
        company: jobInput.company,
        location: jobInput.location,
        url: jobInput.url,
        jobDescription: jobInput.jobDescription,
        status: 'ANALYZED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysis: data.analysis,
        match: data.match
      };

      setApplications(prev => [newApp, ...prev]);
      setSelectedApplicationId(newApp.id);
      setIsJobModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error analyzing job description. Please check server logs.');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Handle Tailoring LaTeX Resume for active application
  const handleTailorResume = async () => {
    if (!selectedApp) return;
    setIsTailoringResume(true);
    try {
      const res = await fetch(`/api/jobs/${selectedApp.id}/tailor-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterTex: profile.masterTexResume,
          jobDescription: selectedApp.jobDescription,
          profile: profile
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to tailor LaTeX resume');
      }

      const tailoringResult: ResumeTailoringResult = data.tailoring;

      setApplications(prev => prev.map(app => {
        if (app.id === selectedApp.id) {
          return {
            ...app,
            resumeTailoring: tailoringResult,
            status: app.status === 'CREATED' || app.status === 'ANALYZED' ? 'TAILORED' : app.status,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      }));
    } catch (err: any) {
      alert(err.message || 'Error tailoring LaTeX resume.');
    } finally {
      setIsTailoringResume(false);
    }
  };

  // Handle Cover Letter Generation
  const handleGenerateCoverLetter = async () => {
    if (!selectedApp) return;
    setIsGeneratingCoverLetter(true);
    try {
      const res = await fetch(`/api/jobs/${selectedApp.id}/generate-cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: selectedApp.jobDescription,
          profile: profile
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      const coverLetter: CoverLetter = data.coverLetter;

      setApplications(prev => prev.map(app => {
        if (app.id === selectedApp.id) {
          return {
            ...app,
            coverLetter,
            status: app.status === 'TAILORED' ? 'READY_TO_APPLY' : app.status,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      }));
    } catch (err: any) {
      alert(err.message || 'Error generating cover letter.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Save manual cover letter edits
  const handleSaveCoverLetter = (content: string) => {
    if (!selectedApp || !selectedApp.coverLetter) return;
    const updatedCover: CoverLetter = {
      ...selectedApp.coverLetter,
      content,
      wordCount: content.trim().split(/\s+/).length
    };

    setApplications(prev => prev.map(app => {
      if (app.id === selectedApp.id) {
        return {
          ...app,
          coverLetter: updatedCover,
          updatedAt: new Date().toISOString()
        };
      }
      return app;
    }));
  };

  // Handle Recruiter Discovery
  const handleDiscoverRecruiters = async () => {
    if (!selectedApp) return;
    setIsDiscoveringRecruiters(true);
    try {
      const res = await fetch(`/api/jobs/${selectedApp.id}/discover-recruiters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: selectedApp.company,
          role: selectedApp.title,
          location: selectedApp.location
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to discover recruiters');
      }

      const discovery: RecruiterDiscoveryResult = data.discovery;

      setApplications(prev => prev.map(app => {
        if (app.id === selectedApp.id) {
          return {
            ...app,
            outreach: {
              ...(app.outreach || {}),
              searchStrategies: discovery.strategies,
              recruiterCandidates: discovery.candidates,
              messages: app.outreach?.messages || []
            },
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      }));
    } catch (err: any) {
      alert(err.message || 'Error discovering recruiters.');
    } finally {
      setIsDiscoveringRecruiters(false);
    }
  };

  // Handle Outreach Generation
  const handleGenerateOutreach = async (candidateName?: string, candidateTitle?: string) => {
    if (!selectedApp) return;
    setIsGeneratingOutreach(true);
    try {
      const res = await fetch(`/api/jobs/${selectedApp.id}/generate-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: selectedApp.company,
          role: selectedApp.title,
          candidateName,
          candidateTitle,
          profile: profile
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate outreach');
      }

      const outreachPkg: OutreachPackage = data.outreach;

      setApplications(prev => prev.map(app => {
        if (app.id === selectedApp.id) {
          return {
            ...app,
            outreach: outreachPkg,
            status: app.status === 'READY_TO_APPLY' ? 'RECRUITER_CONTACTED' : app.status,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      }));
    } catch (err: any) {
      alert(err.message || 'Error generating outreach messages.');
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  // Update Application Status
  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return app;
    }));
  };

  // Delete Application
  const handleDeleteApplication = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setApplications(prev => prev.filter(app => app.id !== id));
    if (selectedApplicationId === id) {
      setSelectedApplicationId(null);
    }
    fetch(`/api/jobs/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Save Master Profile & LaTeX
  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error saving profile to server:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172B4D] font-sans flex flex-col selection:bg-[#DEEBFF] selection:text-[#0052CC]">
      {/* Atlassian Clean Minimalism Top Navigation Bar */}
      <Navbar
        onNewJobClick={() => setIsJobModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWorkflowGuide={() => setIsGuideModalOpen(true)}
        onHomeClick={() => setSelectedApplicationId(null)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        profile={profile}
        activeJobTitle={selectedApp ? `${selectedApp.company}_${selectedApp.title.replace(/\s+/g, '_')}` : undefined}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 bg-[#FAFBFC]">
        {selectedApp ? (
          <ApplicationDetailView
            application={selectedApp}
            profile={profile}
            onBack={() => setSelectedApplicationId(null)}
            onUpdateStatus={handleUpdateStatus}
            onTailorResume={handleTailorResume}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            onSaveCoverLetter={handleSaveCoverLetter}
            onDiscoverRecruiters={handleDiscoverRecruiters}
            onGenerateOutreach={handleGenerateOutreach}
            onDeleteApplication={handleDeleteApplication}
            onUpdateApplication={(updatedApp) => {
              setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
            }}
            onSaveMasterQA={async (newQAs) => {
              const updatedProfile = { ...profile, masterQA: newQAs };
              await handleSaveProfile(updatedProfile);
            }}
            isTailoring={isTailoringResume}
            isGeneratingCoverLetter={isGeneratingCoverLetter}
            isDiscoveringRecruiters={isDiscoveringRecruiters}
            isGeneratingOutreach={isGeneratingOutreach}
          />
        ) : (
          <ApplicationList
            applications={applications}
            onSelectApplication={(app) => setSelectedApplicationId(app.id)}
            onDeleteApplication={handleDeleteApplication}
            onNewJobClick={() => setIsJobModalOpen(true)}
            activeStatusFilter={activeStatusFilter}
            onStatusFilterChange={setActiveStatusFilter}
            searchTerm={searchTerm}
          />
        )}
      </main>

      {/* Modals */}
      <JobInputModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onAnalyze={handleAnalyzeNewJob}
        isLoading={isAnalyzingJob}
      />

      <MasterProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <WorkflowGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
