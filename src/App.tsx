import React, { useState } from 'react';
import { 
  JobApplication, 
  UserProfile, 
  ApplicationStatus,
  ResumeTailoringResult,
  CoverLetter,
  RecruiterDiscoveryResult,
  OutreachPackage
} from './types';
import { useApplications } from './hooks/useApplications';
import { useMasterProfile } from './hooks/useMasterProfile';
import { jobService } from './services/jobService';
import { resumeService } from './services/resumeService';
import { communicationService } from './services/communicationService';
import { Navbar } from './components/Navbar';
import { ApplicationList } from './components/ApplicationList';
import { ApplicationDetailView } from './components/ApplicationDetailView';
import { ResumeTailorWorkspace } from './components/ResumeTailorWorkspace';
import { JobInputModal } from './components/JobInputModal';
import { MasterProfileModal } from './components/MasterProfileModal';
import { WorkflowGuideModal } from './components/WorkflowGuideModal';

export default function App() {
  const {
    applications,
    selectedApplication,
    isLoading: isAppsLoading,
    searchQuery,
    statusFilter,
    setSelectedApplication,
    setSearchQuery,
    setStatusFilter,
    saveApplication,
    updateApplicationStatus,
    deleteApplication,
    selectApplicationById
  } = useApplications();

  const {
    profile,
    updateProfile,
    updateMasterQA
  } = useMasterProfile();

  const [currentView, setCurrentView] = useState<'applications' | 'tailor' | 'detail'>('applications');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Action Loading states
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [isTailoringResume, setIsTailoringResume] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isDiscoveringRecruiters, setIsDiscoveringRecruiters] = useState(false);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);

  const activeApp = selectedApplication || applications.find(a => a.id === selectedApplicationId) || null;

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
      const { analysis, match } = await jobService.analyze({
        jobDescription: jobInput.jobDescription,
        title: jobInput.title,
        company: jobInput.company,
        location: jobInput.location,
        url: jobInput.url
      });

      const newApp: JobApplication = {
        id: `job-${Date.now()}`,
        title: jobInput.title || analysis.title || 'Software Engineer',
        company: jobInput.company || analysis.company || 'Company',
        location: jobInput.location || analysis.location || 'Bangalore, India',
        url: jobInput.url,
        jobDescription: jobInput.jobDescription,
        status: 'ANALYZED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysis,
        match
      };

      await saveApplication(newApp);
      setSelectedApplication(newApp);
      setSelectedApplicationId(newApp.id);
      setIsJobModalOpen(false);
      setCurrentView('detail');
    } catch (err: any) {
      alert(err.message || 'Error analyzing job description. Please check connection and try again.');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Handle Tailoring LaTeX Resume
  const handleTailorResume = async (appId?: string) => {
    const targetId = appId || activeApp?.id || selectedApplicationId;
    const targetApp = applications.find(a => a.id === targetId) || activeApp || applications[0];
    if (!targetApp) return;

    setIsTailoringResume(true);
    try {
      const response = await resumeService.tailorForApplication(targetApp.id, {
        masterTex: profile.masterTexResume,
        jobDescription: targetApp.jobDescription,
        analysis: targetApp.analysis,
        match: targetApp.match,
        profile: profile
      });

      const tailoringResult: ResumeTailoringResult = response.tailoring || response.result;
      const updated: JobApplication = {
        ...targetApp,
        resumeTailoring: tailoringResult,
        status: targetApp.status === 'CREATED' || targetApp.status === 'ANALYZED' ? 'TAILORED' : targetApp.status,
        updatedAt: new Date().toISOString()
      };

      await saveApplication(updated);
    } catch (err: any) {
      alert(err.message || 'Error tailoring LaTeX resume.');
    } finally {
      setIsTailoringResume(false);
    }
  };

  // Handle Cover Letter Generation
  const handleGenerateCoverLetter = async () => {
    if (!activeApp) return;
    setIsGeneratingCoverLetter(true);
    try {
      const { coverLetter } = await communicationService.generateCoverLetter(activeApp.id, {
        jobDescription: activeApp.jobDescription,
        profile: profile
      });

      const updated: JobApplication = {
        ...activeApp,
        coverLetter,
        status: activeApp.status === 'TAILORED' ? 'READY_TO_APPLY' : activeApp.status,
        updatedAt: new Date().toISOString()
      };

      await saveApplication(updated);
    } catch (err: any) {
      alert(err.message || 'Error generating cover letter.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Save manual cover letter edits
  const handleSaveCoverLetter = async (content: string) => {
    if (!activeApp || !activeApp.coverLetter) return;
    const updatedCover: CoverLetter = {
      ...activeApp.coverLetter,
      content,
      wordCount: content.trim().split(/\s+/).filter(Boolean).length
    };

    const updated: JobApplication = {
      ...activeApp,
      coverLetter: updatedCover,
      updatedAt: new Date().toISOString()
    };

    await saveApplication(updated);
  };

  // Handle Recruiter Discovery
  const handleDiscoverRecruiters = async () => {
    if (!activeApp) return;
    setIsDiscoveringRecruiters(true);
    try {
      const { discovery } = await communicationService.discoverRecruiters(activeApp.id, {
        company: activeApp.company,
        role: activeApp.title,
        location: activeApp.location
      });

      const updated: JobApplication = {
        ...activeApp,
        outreach: {
          searchStrategies: discovery.strategies,
          recruiterCandidates: discovery.candidates,
          messages: activeApp.outreach?.messages || [],
          generatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      await saveApplication(updated);
    } catch (err: any) {
      alert(err.message || 'Error discovering recruiters.');
    } finally {
      setIsDiscoveringRecruiters(false);
    }
  };

  // Handle Outreach Generation
  const handleGenerateOutreach = async (candidateName?: string, candidateTitle?: string) => {
    if (!activeApp) return;
    setIsGeneratingOutreach(true);
    try {
      const { outreach } = await communicationService.generateOutreach(activeApp.id, {
        company: activeApp.company,
        role: activeApp.title,
        candidateName,
        candidateTitle,
        profile
      });

      const updated: JobApplication = {
        ...activeApp,
        outreach,
        status: activeApp.status === 'READY_TO_APPLY' ? 'RECRUITER_CONTACTED' : activeApp.status,
        updatedAt: new Date().toISOString()
      };

      await saveApplication(updated);
    } catch (err: any) {
      alert(err.message || 'Error generating outreach messages.');
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172B4D] font-sans flex flex-col selection:bg-[#DEEBFF] selection:text-[#0052CC]">
      {/* Precision Top Navigation Bar */}
      <Navbar
        onNewJobClick={() => setIsJobModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWorkflowGuide={() => setIsGuideModalOpen(true)}
        onHomeClick={() => {
          setSelectedApplication(null);
          setSelectedApplicationId(null);
          setCurrentView('applications');
        }}
        onOpenTailorWorkspace={() => {
          if (!selectedApplicationId && applications.length > 0) {
            setSelectedApplicationId(applications[0].id);
            setSelectedApplication(applications[0]);
          }
          setCurrentView('tailor');
        }}
        currentView={currentView}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        profile={profile}
        activeJobTitle={activeApp ? `${activeApp.company}_${activeApp.title.replace(/\s+/g, '_')}` : undefined}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 bg-[#FAFBFC]">
        {currentView === 'tailor' ? (
          <ResumeTailorWorkspace
            applications={applications}
            selectedApplicationId={selectedApplicationId || activeApp?.id || (applications[0]?.id ?? null)}
            onSelectApplication={(id) => {
              setSelectedApplicationId(id);
              selectApplicationById(id);
            }}
            profile={profile}
            onUpdateProfile={updateProfile}
            onTailorResume={handleTailorResume}
            isTailoring={isTailoringResume}
            onNewJobClick={() => setIsJobModalOpen(true)}
            onOpenApplicationDetail={(app) => {
              setSelectedApplicationId(app.id);
              setSelectedApplication(app);
              setCurrentView('detail');
            }}
          />
        ) : currentView === 'detail' && activeApp ? (
          <ApplicationDetailView
            application={activeApp}
            profile={profile}
            onBack={() => {
              setSelectedApplication(null);
              setSelectedApplicationId(null);
              setCurrentView('applications');
            }}
            onUpdateStatus={(id, status) => updateApplicationStatus(id, status)}
            onTailorResume={handleTailorResume}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            onSaveCoverLetter={handleSaveCoverLetter}
            onDiscoverRecruiters={handleDiscoverRecruiters}
            onGenerateOutreach={handleGenerateOutreach}
            onDeleteApplication={async (id) => {
              await deleteApplication(id);
              setCurrentView('applications');
            }}
            onUpdateApplication={saveApplication}
            onSaveMasterQA={updateMasterQA}
            isTailoring={isTailoringResume}
            isGeneratingCoverLetter={isGeneratingCoverLetter}
            isDiscoveringRecruiters={isDiscoveringRecruiters}
            isGeneratingOutreach={isGeneratingOutreach}
          />
        ) : (
          <ApplicationList
            applications={applications}
            onSelectApplication={(app) => {
              setSelectedApplicationId(app.id);
              setSelectedApplication(app);
              setCurrentView('detail');
            }}
            onOpenTailorForApp={(app) => {
              setSelectedApplicationId(app.id);
              setSelectedApplication(app);
              setCurrentView('tailor');
            }}
            onDeleteApplication={(id, e) => {
              if (e) e.stopPropagation();
              deleteApplication(id);
            }}
            onNewJobClick={() => setIsJobModalOpen(true)}
            activeStatusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchTerm={searchQuery}
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
        onSaveProfile={updateProfile}
      />

      <WorkflowGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
