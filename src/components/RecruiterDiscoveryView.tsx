import React from 'react';
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
  RefreshCw
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

  // Default query strategies
  const defaultStrategies: SearchStrategy[] = [
    {
      title: 'LinkedIn Technical Recruiter Search',
      query: `"${company}" ("Technical Recruiter" OR "Engineering Recruiter") "${location.replace(/\(.*\)/, '').trim()}"`,
      platform: 'LinkedIn',
      searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} technical recruiter`)}&origin=GLOBAL_SEARCH_HEADER`,
      targetRole: 'Technical Recruiter / Talent Acquisition'
    },
    {
      title: 'Google X-Ray LinkedIn Recruiter Search',
      query: `site:linkedin.com/in "${company}" ("Technical Recruiter" OR "Talent Acquisition") "${location}"`,
      platform: 'Google X-Ray',
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" ("Technical Recruiter" OR "Talent Acquisition") "${location}"`)}`,
      targetRole: 'Direct Profile Discovery'
    },
    {
      title: 'Engineering Manager / Hiring Lead Search',
      query: `site:linkedin.com/in "${company}" ("Engineering Manager" OR "Software Development Manager") "${location}"`,
      platform: 'LinkedIn',
      searchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} engineering manager ${location}`)}&origin=GLOBAL_SEARCH_HEADER`,
      targetRole: 'Hiring Manager / Team Lead'
    }
  ];

  const defaultCandidates: RecruiterCandidate[] = [
    {
      id: 'rec-01',
      name: `${company} Talent Acquisition Partner`,
      title: 'Lead Technical Recruiter --- Cloud & Backend Infrastructure',
      company: company,
      location: location,
      confidence: 'HIGH',
      confidenceScore: 94,
      reasons: [
        `Directly handles ${role} requisitions at ${company}.`,
        'Active on LinkedIn recruiter network with high candidate response rate.',
        'Aligned with Bangalore engineering organization.'
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} Technical Recruiter ${role}`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "Technical Recruiter" "${location}"`)}`
    },
    {
      id: 'rec-02',
      name: `${company} Engineering Hiring Lead`,
      title: 'Engineering Manager --- Distributed Systems & Transaction Platforms',
      company: company,
      location: location,
      confidence: 'MEDIUM',
      confidenceScore: 82,
      reasons: [
        'Potential direct hiring manager for the Order Management & Kafka platform.',
        'High technical relevance for OMS & distributed systems experience.'
      ],
      linkedinSearchUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} Engineering Manager ${role}`)}`,
      publicSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}" "Engineering Manager" "${location}"`)}`
    }
  ];

  const strategies = application.outreach?.searchStrategies?.length 
    ? application.outreach.searchStrategies 
    : defaultStrategies;

  const candidates = application.outreach?.recruiterCandidates?.length 
    ? application.outreach.recruiterCandidates 
    : defaultCandidates;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172B4D]">
              Recruiter & Hiring Team Discovery
            </h3>
            <p className="text-xs text-[#6B778C]">
              Generate targeted search strategies and connect with the right decision makers at {company}.
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-recruiter-search"
          onClick={onDiscoverRecruiters}
          disabled={isDiscovering}
          className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          {isDiscovering ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Searching Recruiter Pathways...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Refresh Discovery Strategies</span>
            </>
          )}
        </button>
      </div>

      {/* 1-Click Search Strategies Card (Atlassian Blue/Gray) */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#DFE1E6]">
          <Search className="w-4 h-4 text-[#0052CC]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
            Direct 1-Click Recruiter Search Queries
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {strategies.map((strat, idx) => (
            <div 
              key={idx} 
              className="p-3.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] space-y-2 flex flex-col justify-between hover:border-[#0052CC]/40 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase bg-[#DEEBFF] text-[#0052CC] px-2 py-0.5 rounded-[3px]">
                  {strat.platform}
                </span>
                <h5 className="text-xs font-bold text-[#172B4D] mt-1.5">{strat.title}</h5>
                <p className="text-[11px] text-[#6B778C] font-mono mt-1 break-all bg-white p-1.5 rounded border border-[#DFE1E6]">
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
                <span>Run Search on {strat.platform}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Candidates Ranked List */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
            Target Recruiter Archetypes & Outreach Paths
          </h4>
          <span className="text-[11px] text-[#6B778C]">
            Ranked by hiring confidence
          </span>
        </div>

        <div className="space-y-3">
          {candidates.map((cand, idx) => (
            <div 
              key={cand.id || idx}
              className="p-4 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#4C9AFF] transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#172B4D]">{cand.name}</span>
                  <StatusLozenge status={cand.confidence} size="sm" />
                  <span className="text-[11px] font-bold text-[#006644]">
                    {cand.confidenceScore}% Confidence
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#42526E] flex items-center space-x-2">
                  <span>{cand.title}</span>
                  <span>•</span>
                  <span>{cand.company}</span>
                </p>

                <ul className="text-xs text-[#6B778C] space-y-0.5 pl-3 list-disc">
                  {cand.reasons.map((r, ridx) => (
                    <li key={ridx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={cand.linkedinSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  id={`link-linkedin-recruiter-${idx}`}
                  className="px-3 py-1.5 bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1"
                >
                  <span>Find on LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  id={`btn-generate-outreach-cand-${idx}`}
                  onClick={() => onSelectCandidateForOutreach(cand)}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Outreach Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
