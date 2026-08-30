import React from 'react';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Send,
  Plus
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';
import { StatusLozenge } from './StatusLozenge';

interface ApplicationListProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string, e: React.MouseEvent) => void;
  onNewJobClick: () => void;
  onOpenTailorForApp?: (app: JobApplication) => void;
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchTerm: string;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onSelectApplication,
  onDeleteApplication,
  onNewJobClick,
  onOpenTailorForApp,
  activeStatusFilter,
  onStatusFilterChange,
  searchTerm
}) => {
  // Metrics calculation
  const total = applications.length;
  const readyToApply = applications.filter(a => a.status === 'READY_TO_APPLY').length;
  const inProgress = applications.filter(a => ['ANALYZED', 'TAILORED', 'CREATED'].includes(a.status)).length;
  const activeOutreach = applications.filter(a => ['APPLIED', 'RECRUITER_CONTACTED', 'INTERVIEW', 'OFFER'].includes(a.status)).length;

  // Filtered applications
  const filtered = applications.filter(app => {
    const matchesStatus = activeStatusFilter === 'ALL' || app.status === activeStatusFilter;
    const matchesSearch = searchTerm.trim() === '' || 
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.analysis?.prioritySkills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filterOptions: { label: string; value: string; count: number }[] = [
    { label: 'All Jobs', value: 'ALL', count: total },
    { label: 'Ready to Apply', value: 'READY_TO_APPLY', count: readyToApply },
    { label: 'In Progress', value: 'IN_PROGRESS', count: inProgress },
    { label: 'Outreach & Applied', value: 'ACTIVE', count: activeOutreach }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Metric Summary Cards (Atlassian Jira Dashboard Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Applications */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] hover:border-[#0052CC]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C]">
              Total Jobs
            </span>
            <div className="w-6 h-6 rounded-[3px] bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#172B4D]">{total}</span>
            <span className="text-xs text-[#6B778C]">Applications tracked</span>
          </div>
        </div>

        {/* Ready to Apply */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] hover:border-[#36B37E]/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006644]">
              Ready To Apply
            </span>
            <div className="w-6 h-6 rounded-[3px] bg-[#E3FCEF] text-[#006644] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#006644]">{readyToApply}</span>
            <span className="text-xs text-[#006644] font-medium">LaTeX & Cover Ready</span>
          </div>
        </div>

        {/* Tailoring & Analysis in progress */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] hover:border-[#6554C0]/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#403294]">
              In Progress
            </span>
            <div className="w-6 h-6 rounded-[3px] bg-[#EAE6FF] text-[#403294] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#403294]">{inProgress}</span>
            <span className="text-xs text-[#6B778C]">Analysis & Tailoring</span>
          </div>
        </div>

        {/* Outreach & Interview */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] hover:border-[#008DA6]/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#008DA6]">
              Outreach & Active
            </span>
            <div className="w-6 h-6 rounded-[3px] bg-[#E6FCFF] text-[#008DA6] flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#008DA6]">{activeOutreach}</span>
            <span className="text-xs text-[#6B778C]">Recruiter Contacted</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0_1px_3px_rgba(9,30,66,0.08)]">
        {/* Toolbar Header */}
        <div className="px-5 py-3.5 border-b border-[#DFE1E6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FAFBFC]">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filterOptions.map(tab => {
              const isSelected = activeStatusFilter === tab.value || 
                (tab.value === 'IN_PROGRESS' && ['ANALYZED', 'TAILORED', 'CREATED'].includes(activeStatusFilter)) ||
                (tab.value === 'ACTIVE' && ['APPLIED', 'RECRUITER_CONTACTED', 'INTERVIEW', 'OFFER'].includes(activeStatusFilter));
              return (
                <button
                  key={tab.value}
                  id={`filter-tab-${tab.value.toLowerCase()}`}
                  onClick={() => onStatusFilterChange(tab.value === 'IN_PROGRESS' ? 'ANALYZED' : tab.value === 'ACTIVE' ? 'APPLIED' : tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0052CC] text-white shadow-sm'
                      : 'bg-white text-[#42526E] hover:bg-[#EBECF0] border border-[#DFE1E6]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#EBECF0] text-[#6B778C]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* New Job CTA */}
          <button
            id="btn-list-new-job"
            onClick={onNewJobClick}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[3px] shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Analyze New Job</span>
          </button>
        </div>

        {/* Applications List */}
        <div className="divide-y divide-[#DFE1E6]">
          {filtered.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <div className="w-12 h-12 bg-[#DEEBFF] text-[#0052CC] rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172B4D]">No job applications found</h3>
              <p className="text-xs text-[#6B778C] max-w-md mx-auto mt-1 mb-4">
                {searchTerm ? 'No results matched your search term.' : 'Get started by analyzing a job description or pasting a job listing URL.'}
              </p>
              <button
                id="btn-empty-new-job"
                onClick={onNewJobClick}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[3px] shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Analyze First Job</span>
              </button>
            </div>
          ) : (
            filtered.map((app) => {
              const matchScore = app.match?.overallScore || 0;
              const hasTailoredTex = !!app.resumeTailoring?.tailoredTex;
              const hasCoverLetter = !!app.coverLetter?.content;

              return (
                <div
                  key={app.id}
                  id={`job-row-${app.id}`}
                  onClick={() => onSelectApplication(app)}
                  className="p-4 hover:bg-[#F4F5F7] transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Role Info & Badges */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusLozenge status={app.status} size="sm" />
                      
                      {matchScore > 0 && (
                        <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-[3px] border ${
                          matchScore >= 85 
                            ? 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]' 
                            : matchScore >= 70 
                            ? 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]' 
                            : 'bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]'
                        }`}>
                          {matchScore}% Profile Match
                        </span>
                      )}

                      {hasTailoredTex && (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#403294] bg-[#EAE6FF] border border-[#C0B6F2] px-1.5 py-0.5 rounded-[3px]">
                          <FileCode2 className="w-3 h-3" />
                          <span>.tex Tailored</span>
                        </span>
                      )}

                      {hasCoverLetter && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-[#008DA6] bg-[#E6FCFF] border border-[#B2F5EA] px-1.5 py-0.5 rounded-[3px]">
                          Cover Letter Ready
                        </span>
                      )}
                    </div>

                    {/* Job Title & Company */}
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-[#172B4D] group-hover:text-[#0052CC] transition-colors truncate">
                        {app.title}
                      </h4>
                      <span className="text-xs font-semibold text-[#42526E] flex items-center space-x-1 shrink-0">
                        <span>at</span>
                        <span className="text-[#172B4D] font-bold">{app.company}</span>
                      </span>
                    </div>

                    {/* Meta: Location, Skills, Created */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B778C]">
                      {app.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#6B778C]" />
                          <span>{app.location}</span>
                        </span>
                      )}

                      {app.analysis?.prioritySkills && app.analysis.prioritySkills.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-[#42526E]">Key Skills:</span>
                          <span className="text-[#42526E] truncate max-w-xs">
                            {app.analysis.prioritySkills.slice(0, 4).join(' • ')}
                          </span>
                        </div>
                      )}

                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#6B778C]" />
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {onOpenTailorForApp && (
                      <button
                        id={`btn-optimize-tex-card-${app.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTailorForApp(app);
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-[3px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                          hasTailoredTex
                            ? 'bg-[#EAE6FF] hover:bg-[#D8D0FF] text-[#403294] border border-[#C0B6F2]'
                            : 'bg-[#0052CC] hover:bg-[#0747A6] text-white'
                        }`}
                        title="Optimize LaTeX Resume (.tex) for this Job Description"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${hasTailoredTex ? 'text-[#6554C0]' : 'text-[#FFE380]'}`} />
                        <span>{hasTailoredTex ? 'View / Re-Optimize .tex' : 'Optimize .tex'}</span>
                      </button>
                    )}

                    <button
                      id={`btn-open-${app.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApplication(app);
                      }}
                      className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] hover:border-[#4C9AFF] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      id={`btn-delete-${app.id}`}
                      onClick={(e) => onDeleteApplication(app.id, e)}
                      title="Delete Application"
                      className="p-1.5 text-[#6B778C] hover:text-[#BF2600] hover:bg-[#FFEBE6] rounded-[3px] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
