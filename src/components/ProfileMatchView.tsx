import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Lightbulb, 
  Check, 
  X,
  FileCode2,
  ArrowRight
} from 'lucide-react';
import { ProfileMatch, UserProfile } from '../types';
import { StatusLozenge } from './StatusLozenge';

interface ProfileMatchViewProps {
  match: ProfileMatch;
  profile: UserProfile;
  onNavigateToResume: () => void;
}

export const ProfileMatchView: React.FC<ProfileMatchViewProps> = ({
  match,
  profile,
  onNavigateToResume
}) => {
  return (
    <div className="space-y-5">
      {/* Top Scores Card */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Overall Match Gauge */}
        <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-[#DFE1E6] pb-4 md:pb-0 md:pr-4">
          <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold border-4 shrink-0 ${
            match.overallScore >= 85 
              ? 'border-[#36B37E] bg-[#E3FCEF] text-[#006644]' 
              : match.overallScore >= 70 
              ? 'border-[#0052CC] bg-[#DEEBFF] text-[#0747A6]' 
              : 'border-[#FFAB00] bg-[#FFF0B3] text-[#172B4D]'
          }`}>
            <span className="text-xl leading-none">{match.overallScore}%</span>
            <span className="text-[9px] font-normal uppercase">Match</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#172B4D]">Profile Match Score</h4>
            <p className="text-xs text-[#6B778C]">
              Alignment between candidate profile evidence and JD requirements.
            </p>
          </div>
        </div>

        {/* Must-Have Requirements Score */}
        <div className="border-b md:border-b-0 md:border-r border-[#DFE1E6] pb-4 md:pb-0 md:pr-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C] block">
            Must-Have Core Alignment
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-[#172B4D]">{match.mustHaveScore}%</span>
            <span className="text-xs text-[#006644] font-semibold">
              {match.matches.filter(m => m.importance === 'must-have' && m.status === 'strong').length} of {match.matches.filter(m => m.importance === 'must-have').length} Must-Haves Strong
            </span>
          </div>
          <p className="text-[11px] text-[#6B778C] mt-1">
            Core qualifications verified with high confidence.
          </p>
        </div>

        {/* Quick Tailor CTA */}
        <div className="flex flex-col justify-center space-y-2">
          <button
            id="btn-match-view-tailor-cta"
            onClick={onNavigateToResume}
            className="w-full py-2 px-3 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Proceed to LaTeX (.tex) Tailoring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-center text-[#6B778C]">
            Edits bullet points & content only
          </span>
        </div>
      </div>

      {/* Evidence Mapping Matrix */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Candidate Evidence vs. Job Requirements
            </h4>
          </div>
          <span className="text-[11px] text-[#6B778C]">
            {match.matches.length} Total Verified Requirements
          </span>
        </div>

        <div className="divide-y divide-[#DFE1E6] max-h-[500px] overflow-y-auto pr-1">
          {match.matches.map((item, idx) => (
            <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#172B4D]">{item.requirement}</span>
                  <StatusLozenge status={item.importance} size="sm" />
                </div>
                <StatusLozenge status={item.status} size="sm" />
              </div>

              {/* Supporting Evidence */}
              {item.candidateEvidence && item.candidateEvidence.length > 0 ? (
                <div className="bg-[#FAFBFC] p-2.5 rounded border border-[#DFE1E6] text-xs text-[#172B4D] space-y-1">
                  <span className="text-[11px] font-bold text-[#0052CC] block">
                    Authentic Profile Evidence:
                  </span>
                  <ul className="space-y-0.5 pl-3 list-disc text-[#42526E]">
                    {item.candidateEvidence.map((ev, eidx) => (
                      <li key={eidx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-[#FFEBE6]/50 p-2 rounded border border-[#FFBDAD] text-xs text-[#BF2600] flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>No direct supporting experience in profile. Will NOT be fabricated in resume.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      {match.recommendations && match.recommendations.length > 0 && (
        <div className="bg-[#EAE6FF]/40 border border-[#C0B6F2] rounded-[4px] p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-[#6554C0]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#403294]">
              Strategic Alignment Recommendations
            </h4>
          </div>
          <ul className="space-y-1 text-xs text-[#172B4D]">
            {match.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-[#6554C0] font-bold mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
