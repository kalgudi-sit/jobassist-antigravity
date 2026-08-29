import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Globe, 
  FileText, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface JobInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (data: { title: string; company: string; location: string; url?: string; jobDescription: string }) => Promise<void>;
  isLoading: boolean;
}

export const JobInputModal: React.FC<JobInputModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'url'>('paste');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Bangalore, India');
  const [url, setUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset sample JDs for 1-click test
  const loadSample = (type: 'oracle' | 'goldman' | 'stripe') => {
    if (type === 'oracle') {
      setTitle('Senior Software Engineer - Cloud Order Management');
      setCompany('Oracle');
      setLocation('Bangalore, India (Hybrid)');
      setUrl('https://careers.oracle.com/jobs/senior-software-engineer-cloud-oms');
      setJobDescription(`About the Role:
Oracle is looking for a Software Engineer to join our Cloud Order Management and Transaction Platform team in Bangalore. You will be building resilient, distributed backend services that process millions of transactions per day for global enterprise customers.

Key Responsibilities:
- Design, develop, and maintain high-performance microservices in Java and Spring Boot.
- Implement event-driven asynchronous processing pipelines using Apache Kafka and message brokers.
- Build and maintain secure, high-throughput REST APIs and integration points.
- Collaborate with database engineers to optimize PostgreSQL / Oracle DB schemas, queries, and caching strategies.
- Maintain high code quality through rigorous automated testing (JUnit, Mockito) and CI/CD best practices.

Requirements:
- Bachelor's degree in Computer Science, Engineering, or related technical field.
- 1-4 years of hands-on software development experience with Java (8/11/17) and Spring Boot.
- Proven experience with distributed systems, microservices architecture, and Apache Kafka.
- Strong knowledge of relational databases (PostgreSQL, Oracle DB) and caching mechanisms (Redis).
- Familiarity with modern frontend technologies like React or TypeScript is a plus.
- Excellent analytical, debugging, and communication skills.`);
    } else if (type === 'goldman') {
      setTitle('Java Backend Engineer - Global Trading Infrastructure');
      setCompany('Goldman Sachs');
      setLocation('Bangalore / Hybrid');
      setUrl('https://www.goldmansachs.com/careers/java-backend-engineer');
      setJobDescription(`Position Summary:
The Core Trading Technology division at Goldman Sachs is seeking a Backend Engineer with strong expertise in Java, event-driven messaging, and distributed transaction systems.

Responsibilities:
- Build low-latency trade routing engines and Order Management microservices using Java 17, Spring Boot, and Kafka.
- Design multi-threaded asynchronous event processors handling thousands of order messages per second.
- Implement enterprise integration services with REST APIs and gRPC.
- Optimize relational database queries in PostgreSQL/SQL and implement Redis distributed caches.
- Drive automated unit, integration, and performance benchmarking suites.

Qualifications:
- BS/MS in Computer Science or equivalent.
- Strong proficiency in Core Java, multithreading, concurrency, and Spring Boot framework.
- Experience with Kafka message queues and event streaming.
- Solid understanding of distributed data consistency, transactions, and caching.
- React/TypeScript familiarity is beneficial.`);
    } else if (type === 'stripe') {
      setTitle('Backend Software Engineer - Payment Workflows');
      setCompany('Stripe');
      setLocation('Bangalore, India / Remote');
      setUrl('https://stripe.com/jobs/backend-software-engineer');
      setJobDescription(`About the Role:
Stripe builds economic infrastructure for the internet. We are looking for Backend Engineers to join our Core Payment Workflows team.

What you'll do:
- Build reliable, idempotent financial transaction pipelines processing global payments.
- Architect scalable microservices using Java, TypeScript, and distributed event queues.
- Ensure strict 99.999% availability and sub-100ms API response latency.
- Work with relational databases, transaction isolation, and asynchronous processing.

Who you are:
- Experienced in building distributed systems and high-throughput APIs.
- Proficient in Java, Spring Boot, or modern backend typed languages.
- Deep respect for system reliability, automated testing, and clean architecture.`);
    }
  };

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setIsFetchingUrl(true);
    setFetchError(null);

    try {
      const res = await fetch('/api/jobs/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch job page');
      }
      setJobDescription(data.text);
      // Try to parse basic company / title if missing
      if (!company) {
        try {
          const u = new URL(url);
          const domainParts = u.hostname.replace('www.', '').replace('careers.', '').split('.');
          if (domainParts.length > 0) {
            setCompany(domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1));
          }
        } catch (_) {}
      }
      if (!title) {
        setTitle('Software Engineer');
      }
      setActiveTab('paste');
    } catch (err: any) {
      setFetchError(err.message || 'Could not fetch URL directly. Please copy & paste the JD text below.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    await onAnalyze({
      title: title.trim() || 'Software Engineer',
      company: company.trim() || 'Target Company',
      location: location.trim() || 'Bangalore, India',
      url: url.trim() || undefined,
      jobDescription: jobDescription.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#091E42]/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DFE1E6] rounded-[6px] shadow-[0_8px_30px_rgba(9,30,66,0.25)] max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header (Atlassian Blue Bar) */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#0052CC] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">Analyze New Job Opportunity</h2>
              <p className="text-xs text-[#6B778C]">Extract requirements, match profile, and tailor LaTeX (.tex) resume</p>
            </div>
          </div>
          <button
            id="btn-close-new-job-modal"
            onClick={onClose}
            className="p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets Bar */}
          <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#172B4D]">
              <Zap className="w-3.5 h-3.5 text-[#FFAB00]" />
              <span>Quick Test Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                id="btn-preset-oracle"
                onClick={() => loadSample('oracle')}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] rounded-[3px] transition-colors"
              >
                Oracle (Java/OMS)
              </button>
              <button
                type="button"
                id="btn-preset-goldman"
                onClick={() => loadSample('goldman')}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] rounded-[3px] transition-colors"
              >
                Goldman Sachs (Core Trading)
              </button>
              <button
                type="button"
                id="btn-preset-stripe"
                onClick={() => loadSample('stripe')}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] rounded-[3px] transition-colors"
              >
                Stripe (Payments)
              </button>
            </div>
          </div>

          {/* Job Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Company Name <span className="text-[#BF2600]">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-[#6B778C] absolute left-2.5 top-2.5" />
                <input
                  id="input-new-job-company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Oracle"
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 rounded-[3px] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Job Title <span className="text-[#BF2600]">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-[#6B778C] absolute left-2.5 top-2.5" />
                <input
                  id="input-new-job-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 rounded-[3px] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Location
              </label>
              <input
                id="input-new-job-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 rounded-[3px] outline-none"
              />
            </div>
          </div>

          {/* Tab Selector: Paste JD vs Fetch URL */}
          <div className="flex border-b border-[#DFE1E6] space-x-4">
            <button
              type="button"
              id="tab-paste-jd"
              onClick={() => setActiveTab('paste')}
              className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
                activeTab === 'paste'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-[#6B778C] hover:text-[#172B4D]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Job Description</span>
            </button>

            <button
              type="button"
              id="tab-url-jd"
              onClick={() => setActiveTab('url')}
              className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
                activeTab === 'url'
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-[#6B778C] hover:text-[#172B4D]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Fetch from Job URL</span>
            </button>
          </div>

          {/* URL Fetch Sub-section */}
          {activeTab === 'url' && (
            <div className="p-3.5 bg-[#F4F5F7] border border-[#DFE1E6] rounded-[4px] space-y-2">
              <label className="block text-xs font-bold text-[#172B4D]">
                Job Posting URL
              </label>
              <div className="flex gap-2">
                <input
                  id="input-fetch-job-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://careers.oracle.com/jobs/12345..."
                  className="flex-1 px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] focus:border-[#0052CC] rounded-[3px] outline-none"
                />
                <button
                  type="button"
                  id="btn-fetch-url"
                  onClick={handleFetchUrl}
                  disabled={isFetchingUrl || !url.trim()}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  {isFetchingUrl ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Extract JD</span>
                    </>
                  )}
                </button>
              </div>

              {fetchError && (
                <div className="p-2 bg-[#FFEBE6] border border-[#FFBDAD] rounded-[3px] text-xs text-[#BF2600] flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}
            </div>
          )}

          {/* Job Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#172B4D]">
                Job Description Text <span className="text-[#BF2600]">*</span>
              </label>
              <span className="text-[11px] text-[#6B778C]">
                {jobDescription.length} characters
              </span>
            </div>
            <textarea
              id="textarea-job-description"
              required
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste full job description, requirements, responsibilities, and qualifications here..."
              className="w-full p-3 text-xs text-[#172B4D] font-mono leading-relaxed bg-white border border-[#DFE1E6] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 rounded-[3px] outline-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between">
          <button
            type="button"
            id="btn-cancel-new-job"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-submit-analyze-job"
            onClick={handleSubmit}
            disabled={isLoading || !jobDescription.trim() || !company.trim() || !title.trim()}
            className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Job & Matching Profile...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Job Analysis & Matching</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
