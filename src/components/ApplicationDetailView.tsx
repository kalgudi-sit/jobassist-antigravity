import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  FileCode2, 
  FileText, 
  Target, 
  ShieldCheck, 
  Users, 
  Send, 
  Download, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  CheckCircle2,
  Bookmark,
  Sliders,
  Check
} from 'lucide-react';
import { JobApplication, UserProfile, ApplicationStatus, RecruiterCandidate, MasterQAItem } from '../types';
import { StatusLozenge } from './StatusLozenge';
import { LatexResumeView } from './LatexResumeView';
import { JobAnalysisView } from './JobAnalysisView';
import { ProfileMatchView } from './ProfileMatchView';
import { CoverLetterView } from './CoverLetterView';
import { RecruiterDiscoveryView } from './RecruiterDiscoveryView';
import { OutreachGeneratorView } from './OutreachGeneratorView';
import { AutoApplySubmitModal } from './AutoApplySubmitModal';

interface ApplicationDetailViewProps {
  application: JobApplication;
  profile: UserProfile;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onTailorResume: () => Promise<void>;
  onGenerateCoverLetter: () => Promise<void>;
  onSaveCoverLetter: (content: string) => void;
  onDiscoverRecruiters: () => Promise<void>;
  onGenerateOutreach: (candName?: string, candTitle?: string) => Promise<void>;
  onDeleteApplication: (id: string) => void;
  onUpdateApplication: (updatedApp: JobApplication) => void;
  onSaveMasterQA: (newQAs: MasterQAItem[]) => Promise<void>;
  isTailoring: boolean;
  isGeneratingCoverLetter: boolean;
  isDiscoveringRecruiters: boolean;
  isGeneratingOutreach: boolean;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  application,
  profile,
  onBack,
  onUpdateStatus,
  onTailorResume,
  onGenerateCoverLetter,
  onSaveCoverLetter,
  onDiscoverRecruiters,
  onGenerateOutreach,
  onDeleteApplication,
  onUpdateApplication,
  onSaveMasterQA,
  isTailoring,
  isGeneratingCoverLetter,
  isDiscoveringRecruiters,
  isGeneratingOutreach
}) => {
  const [activeTab, setActiveTab] = useState<'latex' | 'analysis' | 'match' | 'coverLetter' | 'recruiters' | 'outreach'>('latex');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const matchScore = application.match?.overallScore || 0;
  const isTailored = !!application.resumeTailoring?.tailoredTex;
  const hasCoverLetter = !!application.coverLetter?.content;
  const hasApplied = application.status === 'APPLIED' || !!application.submissionResult;

  const handleCandidateOutreachSelect = async (candidate: RecruiterCandidate) => {
    setActiveTab('outreach');
    await onGenerateOutreach(candidate.name, candidate.title);
  };

  const statusOptions: ApplicationStatus[] = [
    'CREATED',
    'ANALYZED',
    'TAILORED',
    'READY_TO_APPLY',
    'APPLIED',
    'RECRUITER_CONTACTED',
    'INTERVIEW',
    'OFFER',
    'ARCHIVED'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Detail Header */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_3px_rgba(9,30,66,0.08)] space-y-4">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            id="btn-back-to-jobs"
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0052CC] hover:text-[#0747A6] hover:bg-[#DEEBFF] px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Applications</span>
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-[#6B778C]">Status:</label>
            <select
              id="select-application-status"
              value={application.status}
              onChange={(e) => onUpdateStatus(application.id, e.target.value as ApplicationStatus)}
              className="text-xs font-bold bg-[#FAFBFC] text-[#172B4D] border border-[#DFE1E6] rounded-[3px] px-2.5 py-1 outline-none focus:border-[#0052CC]"
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <button
              id="btn-delete-current-job"
              onClick={() => {
                if (window.confirm(`Delete application for ${application.company} - ${application.title}?`)) {
                  onDeleteApplication(application.id);
                }
              }}
              title="Delete this job application"
              className="p-1.5 text-[#6B778C] hover:text-[#BF2600] hover:bg-[#FFEBE6] rounded-[3px] transition-colors ml-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Job Title & Tracking Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-[#DFE1E6] items-start">
          <div className="space-y-1.5 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusLozenge status={application.status} size="md" />
              {matchScore > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-[3px] border ${
                  matchScore >= 85 
                    ? 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]' 
                    : 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]'
                }`}>
                  {matchScore}% Profile Match
                </span>
              )}
              {isTailored && (
                <span className="text-xs font-bold text-[#403294] bg-[#EAE6FF] border border-[#C0B6F2] px-2 py-0.5 rounded-[3px]">
                  LaTeX (.tex) Tailored
                </span>
              )}
              {hasApplied && (
                <span className="text-xs font-bold text-[#006644] bg-[#E3FCEF] border border-[#ABF5D1] px-2 py-0.5 rounded-[3px] flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Submitted & Tracked</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#172B4D]">
                {application.title}
              </h1>
              <span className="text-sm font-semibold text-[#42526E]">at</span>
              <span className="text-sm font-bold text-[#0052CC]">{application.company}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B778C]">
              {application.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#6B778C]" />
                  <span>{application.location}</span>
                </span>
              )}
              {application.url && (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-[#0052CC] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Original Job Posting</span>
                </a>
              )}
              {application.trackingUrl && (
                <a
                  href={application.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-[#006644] font-bold hover:underline"
                >
                  <Bookmark className="w-3 h-3" />
                  <span>Application Tracking Link</span>
                </a>
              )}
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#6B778C]" />
                <span>Created {new Date(application.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Quick Tip & Submission Status Card */}
          <div className={`p-4 rounded-[4px] shadow-sm flex flex-col justify-between space-y-2 ${
            hasApplied 
              ? 'bg-[#E3FCEF] border border-[#ABF5D1] text-[#006644]' 
              : 'bg-[#0052CC] text-white'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
              <span>{hasApplied ? 'SUBMISSION COMPLETED' : 'AUTO-APPLY READY'}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFE380]" />
            </div>
            <p className="text-xs leading-relaxed opacity-95">
              {hasApplied 
                ? 'Your application package has been submitted. Tracking status link and answer logs are recorded below.'
                : 'Click "Submit My Application" below to auto-fill fields using your Master QA non-technical answers & tailored resume.'}
            </p>
          </div>
        </div>

        {/* Quick Action Launchers & Apply Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DFE1E6]">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Tailor Resume Button */}
            <button
              id="btn-header-tailor-latex"
              onClick={() => {
                setActiveTab('latex');
                onTailorResume();
              }}
              disabled={isTailoring}
              className="px-3.5 py-2 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-bold rounded-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              {isTailoring ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Tailoring .tex...</span>
                </>
              ) : (
                <>
                  <FileCode2 className="w-3.5 h-3.5 text-[#6554C0]" />
                  <span>{isTailored ? 'Re-Tailor .tex' : 'Tailor LaTeX Resume'}</span>
                </>
              )}
            </button>

            {/* 2. Generate Cover Letter Button */}
            <button
              id="btn-header-gen-cover-letter"
              onClick={() => {
                setActiveTab('coverLetter');
                onGenerateCoverLetter();
              }}
              disabled={isGeneratingCoverLetter}
              className="px-3.5 py-2 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-bold rounded-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              {isGeneratingCoverLetter ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Cover Letter...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-[#008DA6]" />
                  <span>{hasCoverLetter ? 'Edit Cover Letter' : 'Generate Cover Letter'}</span>
                </>
              )}
            </button>
          </div>

          {/* PRIMARY AUTO-APPLY BUTTON */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-submit-my-application"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-[0_2px_6px_rgba(0,82,204,0.3)] transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{hasApplied ? 'Re-Apply / View Submission Tracking' : 'Submit My Application'}</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex space-x-2 overflow-x-auto pt-2 border-t border-[#DFE1E6] scrollbar-none">
          <button
            id="tab-view-latex"
            onClick={() => setActiveTab('latex')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'latex'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#6554C0]" />
            <span>LaTeX Resume (.tex)</span>
            {isTailored && <span className="w-2 h-2 rounded-full bg-[#36B37E]" />}
          </button>

          <button
            id="tab-view-match"
            onClick={() => setActiveTab('match')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'match'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#006644]" />
            <span>Profile Match & Evidence</span>
            {matchScore > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#DEEBFF] text-[#0052CC] rounded-full">
                {matchScore}%
              </span>
            )}
          </button>

          <button
            id="tab-view-analysis"
            onClick={() => setActiveTab('analysis')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analysis'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Job Requirements</span>
          </button>

          <button
            id="tab-view-cover-letter"
            onClick={() => setActiveTab('coverLetter')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'coverLetter'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#008DA6]" />
            <span>Cover Letter</span>
            {hasCoverLetter && <span className="w-2 h-2 rounded-full bg-[#008DA6]" />}
          </button>

          <button
            id="tab-view-recruiters"
            onClick={() => setActiveTab('recruiters')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'recruiters'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>Find Recruiters</span>
          </button>

          <button
            id="tab-view-outreach"
            onClick={() => setActiveTab('outreach')}
            className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'outreach'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#6554C0]" />
            <span>Outreach Generator</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'latex' && (
        <LatexResumeView
          application={application}
          masterTex={profile.masterTexResume}
          profile={profile}
          onTailorResume={onTailorResume}
          isTailoring={isTailoring}
        />
      )}

      {activeTab === 'match' && application.match && (
        <ProfileMatchView
          match={application.match}
          profile={profile}
          onNavigateToResume={() => setActiveTab('latex')}
        />
      )}

      {activeTab === 'analysis' && application.analysis && (
        <JobAnalysisView analysis={application.analysis} />
      )}

      {activeTab === 'coverLetter' && (
        <CoverLetterView
          application={application}
          profile={profile}
          onGenerateCoverLetter={onGenerateCoverLetter}
          isGenerating={isGeneratingCoverLetter}
          onSaveCoverLetter={onSaveCoverLetter}
        />
      )}

      {activeTab === 'recruiters' && (
        <RecruiterDiscoveryView
          application={application}
          onDiscoverRecruiters={onDiscoverRecruiters}
          isDiscovering={isDiscoveringRecruiters}
          onSelectCandidateForOutreach={handleCandidateOutreachSelect}
        />
      )}

      {activeTab === 'outreach' && (
        <OutreachGeneratorView
          application={application}
          profile={profile}
          onGenerateOutreach={onGenerateOutreach}
          isGenerating={isGeneratingOutreach}
        />
      )}

      {/* Auto-Apply Submit Modal */}
      <AutoApplySubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        application={application}
        profile={profile}
        onUpdateApplication={onUpdateApplication}
        onSaveMasterQA={onSaveMasterQA}
      />
    </div>
  );
};
