import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  ArrowRight, 
  Briefcase,
  Building2,
  MapPin,
  RefreshCw,
  Filter,
  CheckCircle2,
  Mail,
  Linkedin,
  Compass,
  UserCheck
} from 'lucide-react';
import { JobApplication, RecruiterCandidate, SearchStrategy } from '../types';
import { StatusLozenge } from './StatusLozenge';

interface RecruiterDiscoveryViewProps {
  application: JobApplication;
  onDiscoverRecruiters: () => Promise<void>;
  isDiscovering: boolean;
  onSelectCandidateForOutreach: (candidate: RecruiterCandidate) => void;
}

export const RecruiterDiscoveryView: React.FC<RecruiterDiscoveryViewProps> = ({
  application,
  onDiscoverRecruiters,
  isDiscovering,
  onSelectCandidateForOutreach
}) => {
  const company = application.company || 'Company';
  const role = application.title || 'Software Engineer';
  const location = application.location || 'Bangalore, India';
  const locClean = location.replace(/\(.*\)/, '').trim();

  // Filter modes
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RECRUITER' | 'MANAGER' | 'LEAD' | 'TALENT_PARTNER'>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Expanded Discovery Strategies across multiple sourcing vectors
  const comprehensiveStrategies: SearchStrategy[] = [
    {
      title: 'LinkedIn Technical Recruiter Search',
      query: `site:linkedin.com/in "${company}" ("Technical Recruiter" OR "Engineering Recruiter" OR "Talent Acquisition") "${locClean}"`,
      platform: 'LinkedIn',
      searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} technical recruiter ${locClean}`)}&origin=GLOBAL_SEARCH_HEADER`,
      targetRole: 'Technical Recruiter / Talent Acquisition'
    },
    {
      title: 'Engineering Manager & Team Lead Search',
      query: `site:linkedin.com/in "${company}" ("Engineering Manager" OR "Software Development Manager" OR "Tech Lead") "${locClean}"`,
      platform: 'LinkedIn',
      searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} engineering manager ${locClean}`)}&origin=GLOBAL_SEARCH_HEADER`,
      targetRole: 'Direct Hiring Manager'
    },
    {
      title: 'Google X-Ray LinkedIn Sourcing',
      query: `site:linkedin.com/in/ "${company}" ("technical recruiter" OR "talent partner" OR "hiring lead") -intitle:jobs`,
      platform: 'Google X-Ray',
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" ("Technical Recruiter" OR "Engineering Manager" OR "Talent Acquisition") "${locClean}"`)}`,
      targetRole: 'Direct Profiles (Bypasses LinkedIn search limit)'
    },
    {
      title: 'Talent Acquisition Director & University Sourcing',
      query: `site:linkedin.com/in "${company}" ("Head of Talent" OR "Director Talent Acquisition" OR "University Recruiter")`,
      platform: 'LinkedIn',
      searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} head talent acquisition recruiter`)}`,
      targetRole: 'Talent Acquisition Leadership'
    },
    {
      title: 'GitHub & Engineering Blog Contributors',
      query: `${company} engineering blog software engineer "${locClean}"`,
      platform: 'Google X-Ray',
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${company} engineering blog tech team ${role}`)}`,
      targetRole: 'Tech Team Peer & SDE-2/3 Network'
    },
    {
      title: 'Company Careers Portal & Referral Network',
      query: `${company} internal employee referral careers ${role}`,
      platform: 'Company Career',
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${company} careers engineering jobs referral`)}`,
      targetRole: 'Careers Portal & Referral'
    }
  ];

  // Comprehensive Recruiter Archetypes with high-match candidate profiles
  const comprehensiveCandidates: RecruiterCandidate[] = [
    {
      id: 'rec-01',
      name: `${company} Lead Technical Recruiter`,
      title: `Lead Technical Recruiter --- Cloud Infrastructure & Enterprise Engineering`,
      company: company,
      location: location,
      confidence: 'HIGH',
      confidenceScore: 95,
      reasons: [
        `Primary recruiter actively managing requisitions for ${role}.`,
        `High engagement rate on LinkedIn for backend and distributed systems roles.`,
        `Direct sourcing pipeline for Bangalore / Hybrid engineering offices.`
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} Lead Technical Recruiter ${locClean}`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "Technical Recruiter" "${locClean}"`)}`
    },
    {
      id: 'rec-02',
      name: `${company} Software Engineering Manager`,
      title: `Engineering Manager / Team Lead --- Distributed OMS & Microservices`,
      company: company,
      location: location,
      confidence: 'HIGH',
      confidenceScore: 92,
      reasons: [
        `Direct potential hiring manager for Java 17, Spring Boot & Kafka platforms.`,
        `Directly evaluates candidate portfolio and technical architecture depth.`,
        `High receptivity to personalized engineering outreach with proven OMS achievements.`
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} Engineering Manager ${role}`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "Engineering Manager" "${locClean}"`)}`
    },
    {
      id: 'rec-03',
      name: `${company} Senior Talent Acquisition Partner`,
      title: `Senior Talent Acquisition Partner --- Enterprise Cloud & Systems`,
      company: company,
      location: location,
      confidence: 'MEDIUM',
      confidenceScore: 86,
      reasons: [
        `Coordinates interviews and salary bands for experienced software engineering requisitions.`,
        `Oversees interview scheduling and recruiter screening rounds.`
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} Talent Acquisition Partner ${role}`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "Talent Acquisition Partner"`)}`
    },
    {
      id: 'rec-04',
      name: `${company} Principal Engineer / Tech Lead`,
      title: `Principal Architect / Staff Software Engineer --- Event-Driven Systems`,
      company: company,
      location: location,
      confidence: 'MEDIUM',
      confidenceScore: 81,
      reasons: [
        `Technical bar raiser and team member who can submit internal referral recommendations.`,
        `Strong peer connection for Kafka and distributed systems technical discussions.`
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} Principal Engineer Kafka Java`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "Principal Software Engineer" "${locClean}"`)}`
    },
    {
      id: 'rec-05',
      name: `${company} University & Early Careers Lead`,
      title: `Talent Partner --- University & Fast-Track Engineering`,
      company: company,
      location: location,
      confidence: 'MEDIUM',
      confidenceScore: 78,
      reasons: [
        `Connects high-aptitude developers with rapid-fill requisitions across engineering orgs.`
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} University Recruiter`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "University Recruiter"`)}`
    }
  ];

  const strategies = application.outreach?.searchStrategies?.length 
    ? application.outreach.searchStrategies 
    : comprehensiveStrategies;

  const candidates = application.outreach?.recruiterCandidates?.length 
    ? application.outreach.recruiterCandidates 
    : comprehensiveCandidates;

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = searchFilter === '' || 
      cand.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cand.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cand.reasons.some(r => r.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'RECRUITER') return cand.title.toLowerCase().includes('recruiter');
    if (activeFilter === 'MANAGER') return cand.title.toLowerCase().includes('manager');
    if (activeFilter === 'LEAD') return cand.title.toLowerCase().includes('lead') || cand.title.toLowerCase().includes('architect');
    if (activeFilter === 'TALENT_PARTNER') return cand.title.toLowerCase().includes('partner') || cand.title.toLowerCase().includes('talent');

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-[4px] bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172B4D]">
              Multi-Vector Recruiter & Hiring Lead Discovery
            </h3>
            <p className="text-xs text-[#6B778C]">
              Discover recruiters, direct hiring managers, and peer referrers for {company} across LinkedIn, Google X-Ray, and Engineering blogs.
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-recruiter-search"
          onClick={onDiscoverRecruiters}
          disabled={isDiscovering}
          className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          {isDiscovering ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Recruiter Networks...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Refresh Discovery Pathways</span>
            </>
          )}
        </button>
      </div>

      {/* Sourcing Strategy Hub (Google X-Ray, LinkedIn, Engineering Portals) */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#0052CC]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Targeted Sourcing Queries & 1-Click Search Vectors
            </h4>
          </div>
          <span className="text-[11px] text-[#6B778C] font-medium">
            {strategies.length} search pathways
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {strategies.map((strat, idx) => (
            <div 
              key={idx} 
              className="p-3.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] space-y-2 flex flex-col justify-between hover:border-[#0052CC]/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase bg-[#DEEBFF] text-[#0052CC] px-2 py-0.5 rounded-[3px]">
                    {strat.platform}
                  </span>
                  <span className="text-[10px] text-[#6B778C] font-semibold">{strat.targetRole}</span>
                </div>
                <h5 className="text-xs font-bold text-[#172B4D] mt-2 group-hover:text-[#0052CC] transition-colors">{strat.title}</h5>
                <p className="text-[11px] text-[#6B778C] font-mono mt-1 break-all bg-white p-2 rounded border border-[#DFE1E6] line-clamp-2 hover:line-clamp-none">
                  {strat.query}
                </p>
              </div>

              <a
                href={strat.searchUrl}
                target="_blank"
                rel="noreferrer"
                id={`link-search-strat-${idx}`}
                className="w-full py-1.5 px-2.5 bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] hover:border-[#4C9AFF] text-xs font-bold rounded-[3px] transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Run {strat.platform} Search</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Candidates Ranked by Hiring Confidence */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DFE1E6] gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-[#006644]" />
              <span>Target Decision Maker Archetypes</span>
            </h4>
            <p className="text-xs text-[#6B778C]">
              Select a recruiter or hiring manager to generate a tailored connection note and InMail outreach.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-[3px] transition-colors cursor-pointer ${
                activeFilter === 'ALL' ? 'bg-[#0052CC] text-white' : 'bg-[#FAFBFC] text-[#42526E] border border-[#DFE1E6]'
              }`}
            >
              All ({candidates.length})
            </button>
            <button
              onClick={() => setActiveFilter('RECRUITER')}
              className={`px-2.5 py-1 text-xs font-bold rounded-[3px] transition-colors cursor-pointer ${
                activeFilter === 'RECRUITER' ? 'bg-[#0052CC] text-white' : 'bg-[#FAFBFC] text-[#42526E] border border-[#DFE1E6]'
              }`}
            >
              Recruiters
            </button>
            <button
              onClick={() => setActiveFilter('MANAGER')}
              className={`px-2.5 py-1 text-xs font-bold rounded-[3px] transition-colors cursor-pointer ${
                activeFilter === 'MANAGER' ? 'bg-[#0052CC] text-white' : 'bg-[#FAFBFC] text-[#42526E] border border-[#DFE1E6]'
              }`}
            >
              Engineering Managers
            </button>
            <button
              onClick={() => setActiveFilter('LEAD')}
              className={`px-2.5 py-1 text-xs font-bold rounded-[3px] transition-colors cursor-pointer ${
                activeFilter === 'LEAD' ? 'bg-[#0052CC] text-white' : 'bg-[#FAFBFC] text-[#42526E] border border-[#DFE1E6]'
              }`}
            >
              Staff / Peer Leads
            </button>
          </div>
        </div>

        {/* Candidate Archetype Cards */}
        <div className="space-y-3">
          {filteredCandidates.map((cand, idx) => (
            <div 
              key={cand.id || idx}
              className="p-4 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#4C9AFF] hover:bg-white transition-all shadow-[0_1px_2px_rgba(9,30,66,0.03)]"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#172B4D]">{cand.name}</span>
                  <StatusLozenge status={cand.confidence} size="sm" />
                  <span className="text-[11px] font-bold text-[#006644] bg-[#E3FCEF] px-1.5 py-0.5 rounded border border-[#ABF5D1]">
                    {cand.confidenceScore}% Hiring Match
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#42526E] flex items-center space-x-2">
                  <span>{cand.title}</span>
                  <span>•</span>
                  <span className="text-[#0052CC] font-bold">{cand.company}</span>
                </p>

                <ul className="text-xs text-[#6B778C] space-y-0.5 pl-3.5 list-disc">
                  {cand.reasons.map((r, ridx) => (
                    <li key={ridx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Sourcing Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={cand.linkedinSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  id={`link-linkedin-recruiter-${idx}`}
                  className="px-3 py-1.5 bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                  <span>Search on LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[#6B778C]" />
                </a>

                <button
                  id={`btn-generate-outreach-cand-${idx}`}
                  onClick={() => onSelectCandidateForOutreach(cand)}
                  className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Outreach Pitch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
