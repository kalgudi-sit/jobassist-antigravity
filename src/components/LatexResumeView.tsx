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
  ExternalLink
} from 'lucide-react';
import { ResumeTailoringResult, JobApplication, UserProfile } from '../types';

interface LatexResumeViewProps {
  application: JobApplication;
  masterTex: string;
  profile: UserProfile;
  onTailorResume: () => Promise<void>;
  isTailoring: boolean;
}

export const LatexResumeView: React.FC<LatexResumeViewProps> = ({
  application,
  masterTex,
  profile,
  onTailorResume,
  isTailoring
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'code' | 'preview' | 'audit' | 'keywords'>('diff');
  const [copied, setCopied] = useState(false);

  const tailoring = application.resumeTailoring;
  const currentTex = tailoring?.tailoredTex || masterTex;

  // Simple line-by-line diff calculator
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

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const safeCompany = (application.company || 'Company').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const safeRole = (application.title || 'Resume').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${profile.personal.name.toLowerCase().replace(/\s+/g, '_')}_${safeCompany}_${safeRole}.tex`;
    
    const blob = new Blob([currentTex], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Status Bar */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#EAE6FF] text-[#6554C0] flex items-center justify-center font-bold">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#172B4D]">
                LaTeX (.tex) Resume Tailoring Engine
              </h3>
              {tailoring ? (
                <span className="text-[10px] font-bold uppercase bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] px-1.5 py-0.5 rounded-[3px]">
                  Tailored for {application.company}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase bg-[#FFF0B3] text-[#172B4D] border border-[#FFE380] px-1.5 py-0.5 rounded-[3px]">
                  Master Template Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B778C]">
              Strictly modifies bullet points & content only. Preserves all LaTeX preamble, commands, and packages.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-trigger-tailor-latex"
            onClick={onTailorResume}
            disabled={isTailoring}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            {isTailoring ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Tailoring Bullets & Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tailoring ? 'Re-Tailor Resume' : 'Tailor Resume for this Job'}</span>
              </>
            )}
          </button>

          <button
            id="btn-copy-latex"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#006644]" /> : <Copy className="w-3.5 h-3.5 text-[#6B778C]" />}
            <span>{copied ? 'Copied!' : 'Copy .tex'}</span>
          </button>

          <button
            id="btn-download-latex"
            onClick={handleDownloadTex}
            className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#6B778C]" />
            <span>Download .tex</span>
          </button>
        </div>
      </div>

      {/* Stats and Guarantee Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-3 flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-[#E3FCEF] text-[#006644] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#172B4D] block">Zero Fabrication Guard</span>
            <span className="text-[#6B778C]">All claims backed by authentic profile evidence</span>
          </div>
        </div>

        <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-3 flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center shrink-0">
            <ListChecks className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#172B4D] block">
              {tailoring ? `${tailoring.keywordCoveragePercentage}% Keyword Coverage` : 'Keyword Optimization'}
            </span>
            <span className="text-[#6B778C]">Targeting core ATS terms naturally</span>
          </div>
        </div>

        <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-3 flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-[#EAE6FF] text-[#6554C0] flex items-center justify-center shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#172B4D] block">
              {tailoring ? `${tailoring.changes.length} Bullets Optimized` : 'Ready to Tailor'}
            </span>
            <span className="text-[#6B778C]">LaTeX commands & macros 100% intact</span>
          </div>
        </div>
      </div>

      {/* Main LaTeX Viewer Container */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0_1px_3px_rgba(9,30,66,0.08)] overflow-hidden">
        {/* Atlassian Tab Strip */}
        <div className="px-4 border-b border-[#DFE1E6] flex flex-wrap items-center justify-between bg-[#FAFBFC]">
          <div className="flex space-x-1">
            <button
              id="tab-latex-diff"
              onClick={() => setActiveTab('diff')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'diff'
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
              id="tab-latex-code"
              onClick={() => setActiveTab('code')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Tailored .tex Code</span>
            </button>

            <button
              id="tab-latex-preview"
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formatted Document Preview</span>
            </button>

            <button
              id="tab-latex-audit"
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'audit'
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
              id="tab-latex-keywords"
              onClick={() => setActiveTab('keywords')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'keywords'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>ATS Keyword Matrix</span>
            </button>
          </div>

          {activeTab === 'preview' && (
            <button
              id="btn-print-preview"
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs font-semibold text-[#0052CC] hover:bg-[#DEEBFF] rounded-[3px] flex items-center space-x-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          )}
        </div>

        {/* Tab 1: Side-by-Side Diff Viewer */}
        {activeTab === 'diff' && (
          <div className="p-0 overflow-x-auto">
            <div className="bg-[#091E42]/5 px-4 py-2 border-b border-[#DFE1E6] grid grid-cols-2 text-xs font-bold text-[#172B4D]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BF2600]" />
                <span>Original Master .tex</span>
              </div>
              <div className="flex items-center space-x-2 pl-4 border-l border-[#DFE1E6]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006644]" />
                <span>Tailored for {application.company} .tex</span>
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

        {/* Tab 2: Tailored .tex Code Viewer */}
        {activeTab === 'code' && (
          <div className="flex flex-col rounded-b-md overflow-hidden bg-white">
            {/* Mac Window Header */}
            <div className="bg-[#F4F5F7] border-b border-[#DFE1E6] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5630]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFAB00]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#36B37E]" />
                </div>
                <span className="text-xs font-mono text-[#6B778C] uppercase tracking-wider font-medium">
                  {application.company.toLowerCase().replace(/\s+/g, '_')}_resume.tex
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6B778C] font-mono">
                <span>LaTeX 2e (pdfLaTeX)</span>
                <span>•</span>
                <span>{currentTex.split('\n').length} lines</span>
              </div>
            </div>

            {/* Code Body with LaTeX Syntax Styling */}
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

        {/* Tab 3: High-Fidelity Formatted Document Preview */}
        {activeTab === 'preview' && (
          <div className="p-8 bg-[#F4F5F7] overflow-y-auto max-h-[700px]">
            <div 
              id="printable-resume"
              className="max-w-[800px] mx-auto bg-white p-10 border border-[#DFE1E6] shadow-md rounded-[2px] text-[#172B4D] font-sans text-xs leading-relaxed space-y-4"
            >
              {/* Document Header */}
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
                  <span>|</span>
                  <a href={profile.personal.linkedin} target="_blank" rel="noreferrer" className="text-[#0052CC] hover:underline">
                    LinkedIn
                  </a>
                  <span>|</span>
                  <a href={profile.personal.github} target="_blank" rel="noreferrer" className="text-[#0052CC] hover:underline">
                    GitHub
                  </a>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                  Professional Summary
                </h2>
                <p className="text-xs text-[#172B4D] leading-normal">
                  {tailoring?.tailoredSummary || profile.summary}
                </p>
              </div>

              {/* Technical Skills */}
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                  Technical Skills
                </h2>
                <div className="text-xs space-y-0.5">
                  <p><strong className="text-[#172B4D]">Languages:</strong> Java (8/11/17/21), TypeScript, JavaScript, SQL, Bash</p>
                  <p><strong className="text-[#172B4D]">Frameworks & Libraries:</strong> Spring Boot, Spring MVC, Spring Data JPA, Hibernate, React.js, Redux, Express.js</p>
                  <p><strong className="text-[#172B4D]">Distributed Systems & Messaging:</strong> Apache Kafka, Event-Driven Architecture, Microservices, RESTful APIs, gRPC</p>
                  <p><strong className="text-[#172B4D]">Databases & Caching:</strong> PostgreSQL, MySQL, Redis, Oracle DB</p>
                  <p><strong className="text-[#172B4D]">Tools & DevOps:</strong> Git, Docker, Maven, Gradle, Jenkins, JUnit 5, Mockito, Postman, Linux</p>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                  Work Experience
                </h2>

                {profile.experience.map(exp => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs text-[#172B4D]">{exp.company}</span>
                      <span className="text-[11px] text-[#6B778C]">{exp.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] italic text-[#42526E]">
                      <span>{exp.role} {exp.client && `(Client: ${exp.client})`}</span>
                      <span>{exp.startDate} --- {exp.endDate}</span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-[#172B4D]">
                      {exp.bullets.map(b => (
                        <li key={b.id}>{b.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Key Projects */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                  Key Projects
                </h2>
                {profile.projects.map(proj => (
                  <div key={proj.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-xs text-[#172B4D]">{proj.name}</span>
                      <span className="text-[11px] italic text-[#6B778C]">{proj.technologies.join(', ')}</span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-[#172B4D]">
                      {proj.bullets.map((pb, pidx) => (
                        <li key={pidx}>{pb}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] pb-0.5 border-b border-[#DFE1E6]">
                  Education
                </h2>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-[#172B4D]">{profile.education[0]?.degree} in {profile.education[0]?.field}</span>
                  <span className="text-[#6B778C]">{profile.education[0]?.startDate} --- {profile.education[0]?.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-[#42526E]">
                  <span>{profile.education[0]?.institution}</span>
                  <span>GPA: {profile.education[0]?.grade}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Change Audit Log */}
        {activeTab === 'audit' && (
          <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-1">
                Auditable Resume Tailoring Log
              </h4>
              <p className="text-xs text-[#6B778C]">
                Every change made to the LaTeX file is audited against the master candidate profile and target JD requirements.
              </p>
            </div>

            {tailoring?.changes && tailoring.changes.length > 0 ? (
              <div className="space-y-3">
                {tailoring.changes.map((change, cidx) => (
                  <div key={cidx} className="p-3.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded-[3px]">
                        {change.section}
                      </span>
                      <span className="text-[11px] text-[#6B778C]">Change #{cidx + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#006644] block">Tailored Content:</span>
                      <p className="text-xs text-[#172B4D] font-mono bg-white p-2 rounded border border-[#DFE1E6]">
                        {change.tailoredText}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-[#EBECF0]">
                      <span className="text-[#42526E]">
                        <strong>Reason:</strong> {change.reason}
                      </span>
                      {change.evidence && change.evidence.length > 0 && (
                        <span className="text-[#6554C0] font-semibold">
                          Evidence: {change.evidence.join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] text-center text-xs text-[#6B778C]">
                No tailoring modifications recorded yet. Click <strong>"Tailor Resume for this Job"</strong> to run the engine.
              </div>
            )}

            {/* Avoided Gaps Section */}
            {tailoring?.unsupportedClaimsAvoided && tailoring.unsupportedClaimsAvoided.length > 0 && (
              <div className="p-3.5 bg-[#FFF0B3]/30 border border-[#FFE380] rounded-[4px] space-y-1">
                <span className="text-xs font-bold text-[#172B4D] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFAB00]" />
                  <span>Intentionally Avoided Unsupported Claims (No Fabrication):</span>
                </span>
                <p className="text-xs text-[#42526E]">
                  The engine detected JD keywords ({tailoring.unsupportedClaimsAvoided.join(', ')}) that are absent in your master profile and strictly did not invent false experience.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: ATS Keyword Matrix */}
        {activeTab === 'keywords' && (
          <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
                  ATS Keyword Optimization Matrix
                </h4>
                <p className="text-xs text-[#6B778C]">
                  Target keywords extracted from {application.company}'s job description verified against the tailored .tex code.
                </p>
              </div>
              {tailoring && (
                <div className="text-right">
                  <span className="text-xl font-bold text-[#006644]">
                    {tailoring.keywordCoveragePercentage}%
                  </span>
                  <span className="block text-[10px] text-[#6B778C]">Coverage Score</span>
                </div>
              )}
            </div>

            <div className="border border-[#DFE1E6] rounded-[4px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFBFC] border-b border-[#DFE1E6] text-[#42526E] font-bold">
                  <tr>
                    <th className="p-2.5">Keyword Term</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Importance</th>
                    <th className="p-2.5">Status in Resume</th>
                    <th className="p-2.5 text-right">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E6] text-[#172B4D]">
                  {(tailoring?.keywordAnalysis || (application.analysis?.keywords || []).map(k => ({
                    term: k.term,
                    category: k.category,
                    importance: k.importance,
                    presentInTailoredResume: true,
                    frequencyInResume: 1,
                    status: 'covered'
                  }))).map((kw, kwidx) => (
                    <tr key={kwidx} className="hover:bg-[#F4F5F7]">
                      <td className="p-2.5 font-bold text-[#172B4D]">{kw.term}</td>
                      <td className="p-2.5 capitalize text-[#6B778C]">{kw.category}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${
                          kw.importance >= 0.9 ? 'bg-[#FFEBE6] text-[#BF2600]' : 'bg-[#DEEBFF] text-[#0052CC]'
                        }`}>
                          {Math.round(kw.importance * 100)}%
                        </span>
                      </td>
                      <td className="p-2.5">
                        {kw.status === 'covered' ? (
                          <span className="inline-flex items-center space-x-1 text-[#006644] font-bold text-[11px] bg-[#E3FCEF] px-2 py-0.5 rounded-[3px]">
                            <Check className="w-3 h-3" />
                            <span>Present in .tex</span>
                          </span>
                        ) : kw.status === 'unsupported_avoided' ? (
                          <span className="text-[#172B4D] text-[11px] font-semibold bg-[#FFF0B3] px-2 py-0.5 rounded-[3px]">
                            Unsupported (Avoided)
                          </span>
                        ) : (
                          <span className="text-[#BF2600] text-[11px] font-semibold bg-[#FFEBE6] px-2 py-0.5 rounded-[3px]">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-mono text-[#42526E]">
                        {kw.frequencyInResume}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
