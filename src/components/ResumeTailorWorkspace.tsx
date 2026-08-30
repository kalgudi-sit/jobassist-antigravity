import React, { useState, useMemo } from 'react';
import { 
  FileCode2, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  Eye, 
  GitCompare, 
  ShieldCheck, 
  ListChecks, 
  Printer, 
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Terminal,
  ExternalLink,
  ChevronDown,
  Upload,
  RotateCcw,
  Edit3,
  Save,
  CheckCircle2,
  Layers,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Target,
  FileText
} from 'lucide-react';
import { JobApplication, UserProfile, ResumeTailoringResult, MasterQAItem } from '../types';
import { DEFAULT_MASTER_TEX } from '../data/defaultProfile';
import { StatusLozenge } from './StatusLozenge';
import { copyToClipboard } from '../utils/clipboardUtils';
import { downloadTexFile, createResumeFilename } from '../utils/latexUtils';

interface ResumeTailorWorkspaceProps {
  applications: JobApplication[];
  selectedApplicationId: string | null;
  onSelectApplication: (id: string) => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
  onTailorResume: (appId: string) => Promise<void>;
  isTailoring: boolean;
  onNewJobClick: () => void;
  onOpenApplicationDetail: (app: JobApplication) => void;
}

export const ResumeTailorWorkspace: React.FC<ResumeTailorWorkspaceProps> = ({
  applications,
  selectedApplicationId,
  onSelectApplication,
  profile,
  onUpdateProfile,
  onTailorResume,
  isTailoring,
  onNewJobClick,
  onOpenApplicationDetail
}) => {
  // Selected Application
  const selectedApp = applications.find(a => a.id === selectedApplicationId) || applications[0] || null;

  // Active Output Tab in Workspace
  const [activeOutputTab, setActiveOutputTab] = useState<'diff' | 'code' | 'preview' | 'audit' | 'keywords'>('diff');
  const [masterTexTab, setMasterTexTab] = useState<'view' | 'edit'>('view');
  const [masterTexBuffer, setMasterTexBuffer] = useState<string>(profile.masterTexResume || DEFAULT_MASTER_TEX);
  const [copied, setCopied] = useState(false);
  const [masterSaved, setMasterSaved] = useState(false);
  const [isEditingTailored, setIsEditingTailored] = useState(false);
  const [tailoredTexBuffer, setTailoredTexBuffer] = useState<string>('');

  const masterTex = profile.masterTexResume || DEFAULT_MASTER_TEX;
  const tailoring = selectedApp?.resumeTailoring;
  const currentTex = tailoring?.tailoredTex || masterTex;

  // Sync tailored buffer when tailoring changes
  React.useEffect(() => {
    if (tailoring?.tailoredTex) {
      setTailoredTexBuffer(tailoring.tailoredTex);
    } else {
      setTailoredTexBuffer(masterTex);
    }
  }, [tailoring, masterTex]);

  // Sync master tex buffer when profile changes
  React.useEffect(() => {
    setMasterTexBuffer(profile.masterTexResume || DEFAULT_MASTER_TEX);
  }, [profile.masterTexResume]);

  const matchScore = selectedApp?.match?.overallScore || 0;

  // Line-by-line diff calculation
  const diffLines = useMemo(() => {
    const origLines = masterTex.split('\n');
    const newLines = currentTex.split('\n');
    const maxLen = Math.max(origLines.length, newLines.length);
    const result: {
      origLineNum: number | null;
      newLineNum: number | null;
      origText: string | null;
      newText: string | null;
      isDiff: boolean;
    }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i] !== undefined ? origLines[i] : null;
      const nw = newLines[i] !== undefined ? newLines[i] : null;
      const isDiff = orig !== nw;

      result.push({
        origLineNum: orig !== null ? i + 1 : null,
        newLineNum: nw !== null ? i + 1 : null,
        origText: orig,
        newText: nw,
        isDiff
      });
    }
    return result;
  }, [masterTex, currentTex]);

  const diffCount = diffLines.filter(d => d.isDiff).length;

  const handleCopy = async () => {
    const textToCopy = isEditingTailored ? tailoredTexBuffer : currentTex;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTex = () => {
    if (!selectedApp) return;
    const filename = createResumeFilename(profile.personal.name, selectedApp.company, selectedApp.title);
    const textToDownload = isEditingTailored ? tailoredTexBuffer : currentTex;
    downloadTexFile(textToDownload, filename);
  };

  const handleFileUploadMaster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setMasterTexBuffer(content);
        await onUpdateProfile({
          ...profile,
          masterTexResume: content
        });
        setMasterSaved(true);
        setTimeout(() => setMasterSaved(false), 2500);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveMasterTex = async () => {
    await onUpdateProfile({
      ...profile,
      masterTexResume: masterTexBuffer
    });
    setMasterSaved(true);
    setMasterTexTab('view');
    setTimeout(() => setMasterSaved(false), 2500);
  };

  const handleResetMasterTex = async () => {
    if (window.confirm('Reset master .tex resume to default template?')) {
      setMasterTexBuffer(DEFAULT_MASTER_TEX);
      await onUpdateProfile({
        ...profile,
        masterTexResume: DEFAULT_MASTER_TEX
      });
    }
  };

  if (!selectedApp) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-white border border-[#DFE1E6] rounded-[6px] p-8 max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mx-auto">
            <FileCode2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#172B4D]">No Jobs in Workspace</h2>
          <p className="text-xs text-[#6B778C]">
            To start tailoring your LaTeX resume (.tex), add a job description or paste a job listing URL first.
          </p>
          <button
            id="btn-workspace-new-job"
            onClick={onNewJobClick}
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors cursor-pointer"
          >
            + Analyze New Job Description
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Workspace Hero Header */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_3px_rgba(9,30,66,0.08)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left info & Job selector */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6554C0] bg-[#EAE6FF] border border-[#C0B6F2] px-2 py-0.5 rounded-[3px] flex items-center space-x-1">
                <FileCode2 className="w-3 h-3" />
                <span>Dedicated LaTeX (.tex) Tailoring Studio</span>
              </span>
              <StatusLozenge status={selectedApp.status} size="sm" />
              {matchScore > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-[3px] border ${
                  matchScore >= 85 
                    ? 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]' 
                    : 'bg-[#DEEBFF] text-[#0747A6] border-[#B3D4FF]'
                }`}>
                  {matchScore}% Match Score
                </span>
              )}
            </div>

            {/* Target Job Selector Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[280px] sm:min-w-[360px]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B778C] mb-1">
                  Active Target Application:
                </label>
                <div className="relative">
                  <select
                    id="select-tailor-job-dropdown"
                    value={selectedApp.id}
                    onChange={(e) => onSelectApplication(e.target.value)}
                    className="w-full text-xs font-bold bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] rounded-[4px] px-3 py-2 pr-8 outline-none focus:border-[#0052CC] transition-colors cursor-pointer appearance-none"
                  >
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.company} — {app.title} ({app.match?.overallScore || 0}% match)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#6B778C] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-2">
                <button
                  id="btn-tailor-view-detail"
                  onClick={() => onOpenApplicationDetail(selectedApp)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#0052CC] hover:bg-[#DEEBFF] rounded-[3px] transition-colors flex items-center space-x-1"
                >
                  <span>Open Full Application View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Action: PRIMARY OPTIMIZE BUTTON */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              id="btn-optimize-latex-main"
              onClick={() => onTailorResume(selectedApp.id)}
              disabled={isTailoring}
              className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-[0_2px_8px_rgba(0,82,204,0.35)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isTailoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Optimizing LaTeX Content & Bullets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFE380]" />
                  <span>{tailoring ? 'Re-Optimize .tex for this JD' : 'Optimize .tex for this JD'}</span>
                </>
              )}
            </button>

            <button
              id="btn-tailor-download-tex"
              onClick={handleDownloadTex}
              className="px-3.5 py-2.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-bold rounded-[3px] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Download tailored .tex file"
            >
              <Download className="w-4 h-4 text-[#6B778C]" />
              <span>Download .tex</span>
            </button>

            <button
              id="btn-tailor-copy-tex"
              onClick={handleCopy}
              className="px-3.5 py-2.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-bold rounded-[3px] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Copy .tex content to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-[#006644]" /> : <Copy className="w-4 h-4 text-[#6B778C]" />}
              <span>{copied ? 'Copied!' : 'Copy .tex'}</span>
            </button>
          </div>
        </div>

        {/* Tailoring Safety & Scope Guarantees Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#DFE1E6]">
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-2.5 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-[#E3FCEF] text-[#006644] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-[#172B4D] block">Zero Styling/Preamble Modification</span>
              <span className="text-[#6B778C]">Packages, macros, and formatting kept 100% intact</span>
            </div>
          </div>

          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-2.5 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-[#172B4D] block">Content & Bullet Optimization</span>
              <span className="text-[#6B778C]">Surgically edits & adds points matching JD keywords</span>
            </div>
          </div>

          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-2.5 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded bg-[#EAE6FF] text-[#6554C0] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-[#172B4D] block">
                {tailoring ? `${tailoring.keywordCoveragePercentage}% ATS Keyword Coverage` : 'Zero Fabrication Guard'}
              </span>
              <span className="text-[#6B778C]">All claims backed by authentic profile evidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: JD & Match Insights (Left) vs Tailored .tex Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (4 cols): Target JD Details, Match Breakdown & Master .tex Template */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Target Job Requirements Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B4D] flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Job Requirements & Match</span>
              </span>
              <span className="text-xs font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded-[3px]">
                {matchScore}% Match
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#172B4D]">{selectedApp.title}</h4>
              <p className="text-xs font-semibold text-[#42526E]">{selectedApp.company} • {selectedApp.location || 'Remote'}</p>
            </div>

            {/* Match Breakdown Bars */}
            {selectedApp.match && (
              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-[#42526E]">Skills Match</span>
                    <span className="font-bold text-[#172B4D]">{selectedApp.match.skillMatchScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EBECF0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0052CC] rounded-full" style={{ width: `${selectedApp.match.skillMatchScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-[#42526E]">Experience Alignment</span>
                    <span className="font-bold text-[#172B4D]">{selectedApp.match.experienceAlignmentScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EBECF0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#36B37E] rounded-full" style={{ width: `${selectedApp.match.experienceAlignmentScore}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Target Priority Skills from JD */}
            {selectedApp.analysis?.prioritySkills && selectedApp.analysis.prioritySkills.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#DFE1E6]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C]">
                  Target JD Priority Skills:
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedApp.analysis.prioritySkills.map((skill, idx) => (
                    <span key={idx} className="text-[11px] font-semibold bg-[#FAFBFC] text-[#172B4D] border border-[#DFE1E6] px-2 py-0.5 rounded-[3px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strong Alignments */}
            {selectedApp.match?.strongAlignments && selectedApp.match.strongAlignments.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-[#DFE1E6]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#006644]">
                  Key Authentic Profile Matches:
                </label>
                <ul className="text-xs text-[#172B4D] space-y-1 list-disc pl-4">
                  {selectedApp.match.strongAlignments.slice(0, 3).map((align, idx) => (
                    <li key={idx} className="text-[11px] leading-tight">
                      {align}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Master .tex Template Source Box */}
          <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B4D] flex items-center space-x-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-[#6554C0]" />
                <span>Master .tex Resume</span>
              </span>
              <div className="flex items-center space-x-1">
                <button
                  id="btn-toggle-master-edit"
                  onClick={() => setMasterTexTab(masterTexTab === 'view' ? 'edit' : 'view')}
                  className="px-2 py-0.5 text-[11px] font-bold text-[#0052CC] hover:bg-[#DEEBFF] rounded transition-colors"
                >
                  {masterTexTab === 'view' ? 'Edit Master' : 'View Master'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#6B778C]">
              This master template is your baseline. The optimizer reads this file and modifies content for each job.
            </p>

            {masterTexTab === 'view' ? (
              <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded p-2.5 font-mono text-[10px] text-[#42526E] max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono m-0">
                  {masterTex.split('\n').slice(0, 25).join('\n')}
                  {'\n... (full master template loaded)'}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  id="textarea-edit-master-tex"
                  value={masterTexBuffer}
                  onChange={(e) => setMasterTexBuffer(e.target.value)}
                  className="w-full h-44 p-2 text-[11px] font-mono bg-[#FAFBFC] text-[#172B4D] border border-[#DFE1E6] rounded outline-none focus:border-[#0052CC]"
                  placeholder="Paste Master .tex code here..."
                />
                <div className="flex items-center justify-between">
                  <button
                    id="btn-save-master-tex"
                    onClick={handleSaveMasterTex}
                    className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] transition-colors flex items-center space-x-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Master .tex</span>
                  </button>
                  {masterSaved && (
                    <span className="text-[11px] font-bold text-[#006644] flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Saved to Profile!</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DFE1E6]">
              <label 
                htmlFor="upload-master-tex-workspace"
                className="px-2.5 py-1 text-[11px] font-bold text-[#172B4D] bg-[#FAFBFC] hover:bg-[#EBECF0] border border-[#DFE1E6] rounded cursor-pointer flex items-center space-x-1"
              >
                <Upload className="w-3 h-3 text-[#6B778C]" />
                <span>Upload .tex</span>
                <input
                  id="upload-master-tex-workspace"
                  type="file"
                  accept=".tex"
                  onChange={handleFileUploadMaster}
                  className="hidden"
                />
              </label>

              <button
                id="btn-reset-master-tex-workspace"
                onClick={handleResetMasterTex}
                className="px-2 py-1 text-[11px] font-semibold text-[#BF2600] hover:bg-[#FFEBE6] rounded transition-colors flex items-center space-x-1"
                title="Reset to default LaTeX template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Interactive Tailored .tex Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0_1px_3px_rgba(9,30,66,0.08)] overflow-hidden">
            {/* Tab Strip */}
            <div className="px-4 border-b border-[#DFE1E6] flex flex-wrap items-center justify-between bg-[#FAFBFC]">
              <div className="flex space-x-1 overflow-x-auto scrollbar-none">
                <button
                  id="tab-tailor-diff"
                  onClick={() => setActiveOutputTab('diff')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeOutputTab === 'diff'
                      ? 'border-[#0052CC] text-[#0052CC]'
                      : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Side-by-Side Diff</span>
                  {diffCount > 0 && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 bg-[#EAE6FF] text-[#403294] rounded-full">
                      {diffCount} lines changed
                    </span>
                  )}
                </button>

                <button
                  id="tab-tailor-code"
                  onClick={() => setActiveOutputTab('code')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeOutputTab === 'code'
                      ? 'border-[#0052CC] text-[#0052CC]'
                      : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>Tailored .tex Code</span>
                </button>

                <button
                  id="tab-tailor-preview"
                  onClick={() => setActiveOutputTab('preview')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeOutputTab === 'preview'
                      ? 'border-[#0052CC] text-[#0052CC]'
                      : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Document Preview</span>
                </button>

                <button
                  id="tab-tailor-audit"
                  onClick={() => setActiveOutputTab('audit')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeOutputTab === 'audit'
                      ? 'border-[#0052CC] text-[#0052CC]'
                      : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Change Audit Log</span>
                  {tailoring && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 bg-[#E3FCEF] text-[#006644] rounded-full">
                      {tailoring.changes.length}
                    </span>
                  )}
                </button>

                <button
                  id="tab-tailor-keywords"
                  onClick={() => setActiveOutputTab('keywords')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeOutputTab === 'keywords'
                      ? 'border-[#0052CC] text-[#0052CC]'
                      : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>ATS Keyword Matrix</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <button
                  id="btn-output-copy"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-semibold text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] border border-[#DFE1E6] flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-[#006644]" /> : <Copy className="w-3 h-3 text-[#6B778C]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  id="btn-output-download"
                  onClick={handleDownloadTex}
                  className="px-2.5 py-1 text-xs font-semibold text-[#0052CC] bg-[#DEEBFF] hover:bg-[#B3D4FF] rounded-[3px] flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .tex</span>
                </button>
              </div>
            </div>

            {/* TAB 1: SIDE-BY-SIDE DIFF */}
            {activeOutputTab === 'diff' && (
              <div className="p-0 overflow-x-auto">
                <div className="bg-[#091E42]/5 px-4 py-2 border-b border-[#DFE1E6] grid grid-cols-2 text-xs font-bold text-[#172B4D]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BF2600]" />
                    <span>Original Master .tex</span>
                  </div>
                  <div className="flex items-center space-x-2 pl-4 border-l border-[#DFE1E6]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006644]" />
                    <span>Tailored for {selectedApp.company} .tex</span>
                  </div>
                </div>

                <div className="font-mono text-[11px] leading-relaxed divide-y divide-[#EBECF0] max-h-[600px] overflow-y-auto">
                  {diffLines.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`grid grid-cols-2 ${line.isDiff ? 'bg-[#FFF0B3]/20' : 'hover:bg-[#FAFBFC]'}`}
                    >
                      {/* Left (Original) */}
                      <div className={`p-1.5 flex items-start space-x-2 overflow-x-auto ${line.isDiff && line.origText ? 'bg-[#FFEBE6] text-[#BF2600]' : 'text-[#42526E]'}`}>
                        <span className="text-[#6B778C] select-none text-[10px] w-6 text-right shrink-0">
                          {line.origLineNum || ''}
                        </span>
                        <pre className="whitespace-pre font-mono m-0 overflow-visible">
                          {line.origText || ''}
                        </pre>
                      </div>

                      {/* Right (Tailored) */}
                      <div className={`p-1.5 flex items-start space-x-2 overflow-x-auto border-l border-[#DFE1E6] ${line.isDiff && line.newText ? 'bg-[#E3FCEF] text-[#006644] font-medium' : 'text-[#172B4D]'}`}>
                        <span className="text-[#6B778C] select-none text-[10px] w-6 text-right shrink-0">
                          {line.newLineNum || ''}
                        </span>
                        <pre className="whitespace-pre font-mono m-0 overflow-visible">
                          {line.newText || ''}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TAILORED .TEX CODE WITH LIVE SYNTAX INSPECTOR */}
            {activeOutputTab === 'code' && (
              <div className="flex flex-col rounded-b-md overflow-hidden bg-white">
                <div className="bg-[#F4F5F7] border-b border-[#DFE1E6] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5630]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFAB00]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#36B37E]" />
                    </div>
                    <span className="text-xs font-mono text-[#6B778C] uppercase tracking-wider font-medium">
                      {selectedApp.company.toLowerCase().replace(/\s+/g, '_')}_tailored_resume.tex
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B778C] font-mono">
                    <span>LaTeX 2e (pdfLaTeX Ready)</span>
                    <span>•</span>
                    <span>{currentTex.split('\n').length} lines</span>
                  </div>
                </div>

                <div className="p-4 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto bg-white text-[#172B4D]">
                  <pre className="whitespace-pre-wrap font-mono m-0">
                    {currentTex.split('\n').map((line, lidx) => {
                      const isSection = line.includes('\\section');
                      const isItem = line.includes('\\resumeItem') || line.includes('\\item');
                      const isHeading = line.includes('\\resumeSubheading') || line.includes('\\resumeProjectHeading');
                      const isComment = line.trim().startsWith('%');
                      const isTailoredHighlight = line.includes(tailoring?.changes?.[0]?.tailoredText?.slice(0, 30) || '___NOMATCH___');

                      return (
                        <div 
                          key={lidx} 
                          className={`flex items-start py-0.5 px-2 -mx-2 rounded hover:bg-[#F4F5F7] ${
                            isTailoredHighlight ? 'bg-[#DEEBFF] border-y border-[#B3D4FF]' : ''
                          }`}
                        >
                          <span className="text-[#6B778C] select-none text-[10px] w-8 text-right pr-3 shrink-0 font-mono opacity-70">
                            {lidx + 1}
                          </span>
                          <span className={`flex-1 ${
                            isComment 
                              ? 'text-[#6B778C] italic' 
                              : isSection 
                              ? 'text-[#0052CC] font-bold' 
                              : isHeading 
                              ? 'text-[#0747A6] font-semibold' 
                              : isItem 
                              ? 'text-[#172B4D]' 
                              : 'text-[#42526E]'
                          }`}>
                            {line}
                          </span>
                        </div>
                      );
                    })}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: FORMATTED DOCUMENT PREVIEW */}
            {activeOutputTab === 'preview' && (
              <div className="p-6 bg-[#F4F5F7] overflow-y-auto max-h-[650px]">
                <div 
                  id="printable-tailored-resume"
                  className="max-w-[800px] mx-auto bg-white p-8 border border-[#DFE1E6] shadow-md rounded-[2px] text-[#172B4D] font-sans text-xs leading-relaxed space-y-4"
                >
                  <div className="text-center pb-2 border-b border-[#172B4D]">
                    <h1 className="text-xl font-bold uppercase tracking-wide text-[#172B4D]">
                      {profile.personal.name}
                    </h1>
                    <p className="text-[11px] font-semibold text-[#42526E] mt-0.5">
                      Software Engineer --- Java, Spring Boot, Microservices & Distributed Systems
                    </p>
                    <div className="text-[11px] text-[#6B778C] mt-1 space-x-2">
                      <span>{profile.personal.location}</span>
                      <span>|</span>
                      <a href={`mailto:${profile.personal.email}`} className="text-[#0052CC] hover:underline">
                        {profile.personal.email}
                      </a>
                      <span>|</span>
                      <span>{profile.personal.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                      Professional Summary (Tailored)
                    </h2>
                    <p className="text-xs text-[#172B4D] leading-normal">
                      {tailoring?.tailoredSummary || profile.summary}
                    </p>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                      Work Experience
                    </h2>
                    {profile.experience.map((exp, eidx) => (
                      <div key={eidx} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[#172B4D]">{exp.company}</span>
                          <span className="text-[11px] text-[#6B778C]">{exp.startDate} -- {exp.endDate}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-[11px] italic text-[#42526E]">
                          <span>{exp.title}</span>
                          <span>{exp.location}</span>
                        </div>
                        <ul className="list-disc pl-4 text-xs space-y-1 text-[#172B4D]">
                          {exp.highlights.map((h, hidx) => (
                            <li key={hidx} className="leading-tight">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                      Technical Skills
                    </h2>
                    <p className="text-xs text-[#172B4D]">
                      <strong>Core Languages & Frameworks:</strong> Java 17, Spring Boot, Microservices, Hibernate, Apache Kafka, RESTful APIs, Redis.
                    </p>
                    <p className="text-xs text-[#172B4D]">
                      <strong>Databases & Cloud:</strong> PostgreSQL, MySQL, Docker, Kubernetes, AWS, Git, Maven, CI/CD Pipelines.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CHANGE AUDIT LOG */}
            {activeOutputTab === 'audit' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6]">
                  <div>
                    <h4 className="text-sm font-bold text-[#172B4D]">Surgical Modifications Audit</h4>
                    <p className="text-xs text-[#6B778C]">
                      Every modified bullet point, with JD alignment rationale and authentic supporting evidence.
                    </p>
                  </div>
                  {tailoring && (
                    <span className="text-xs font-bold px-2 py-1 bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] rounded-[3px]">
                      {tailoring.changes.length} Points Optimized
                    </span>
                  )}
                </div>

                {tailoring && tailoring.changes.length > 0 ? (
                  <div className="space-y-3">
                    {tailoring.changes.map((change, cidx) => (
                      <div key={cidx} className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0052CC] uppercase tracking-wide">
                            {change.section}
                          </span>
                          <span className="text-[10px] font-bold text-[#006644] bg-[#E3FCEF] px-1.5 py-0.5 rounded">
                            Verified Grounded
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-[#FFEBE6] border border-[#FFBDAD] rounded text-[#BF2600]">
                            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Previous / Master:</span>
                            <span>{change.originalText}</span>
                          </div>
                          <div className="p-2 bg-[#E3FCEF] border border-[#ABF5D1] rounded text-[#006644] font-medium">
                            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Optimized for {selectedApp.company}:</span>
                            <span>{change.tailoredText}</span>
                          </div>
                        </div>

                        <div className="text-xs text-[#42526E] pt-1 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-[#172B4D]">Rationale: </span>
                            <span>{change.reason}</span>
                          </div>
                          {change.evidence && change.evidence.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-[#172B4D]">Evidence:</span>
                              {change.evidence.map((ev, eidx) => (
                                <span key={eidx} className="text-[10px] font-bold bg-[#DEEBFF] text-[#0747A6] px-1.5 py-0.2 rounded">
                                  {ev}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#6B778C]">
                    Click "Optimize .tex for this JD" above to generate tailored bullets and change audit logs.
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ATS KEYWORD MATRIX */}
            {activeOutputTab === 'keywords' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DFE1E6]">
                  <div>
                    <h4 className="text-sm font-bold text-[#172B4D]">Target ATS Keyword Coverage Matrix</h4>
                    <p className="text-xs text-[#6B778C]">
                      Shows how essential JD keywords are woven into your tailored resume bullets.
                    </p>
                  </div>
                  {tailoring && (
                    <span className="text-xs font-bold px-2 py-1 bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF] rounded-[3px]">
                      {tailoring.keywordCoveragePercentage}% Keywords Covered
                    </span>
                  )}
                </div>

                {tailoring && tailoring.keywordAnalysis && tailoring.keywordAnalysis.length > 0 ? (
                  <div className="border border-[#DFE1E6] rounded-[4px] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[11px] font-bold text-[#6B778C] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Keyword / Term</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Status in Tailored .tex</th>
                          <th className="py-2.5 px-3 text-right">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE1E6]">
                        {tailoring.keywordAnalysis.map((k, kidx) => (
                          <tr key={kidx} className="hover:bg-[#FAFBFC]">
                            <td className="py-2 px-3 font-semibold text-[#172B4D]">{k.term}</td>
                            <td className="py-2 px-3 text-[#6B778C] capitalize">{k.category}</td>
                            <td className="py-2 px-3">
                              {k.status === 'covered' ? (
                                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded">
                                  <Check className="w-3 h-3" />
                                  <span>Covered</span>
                                </span>
                              ) : k.status === 'unsupported_avoided' ? (
                                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#BF2600] bg-[#FFEBE6] px-2 py-0.5 rounded">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Intentionally Omitted (No Grounded Evidence)</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-[#6B778C]">Missing</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#172B4D]">
                              {k.frequencyInResume || 0}x
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#6B778C]">
                    Click "Optimize .tex for this JD" above to extract and analyze ATS keywords.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
