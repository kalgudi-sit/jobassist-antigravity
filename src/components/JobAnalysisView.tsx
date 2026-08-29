import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Award, 
  Briefcase, 
  Target, 
  Tag, 
  Building2,
  MapPin,
  Clock
} from 'lucide-react';
import { JobAnalysis } from '../types';
import { StatusLozenge } from './StatusLozenge';

interface JobAnalysisViewProps {
  analysis: JobAnalysis;
}

export const JobAnalysisView: React.FC<JobAnalysisViewProps> = ({ analysis }) => {
  return (
    <div className="space-y-5">
      {/* Role Overview Card */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFE1E6]">
          <div>
            <h3 className="text-base font-bold text-[#172B4D]">{analysis.title}</h3>
            <p className="text-xs text-[#42526E] font-semibold">{analysis.company}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#DEEBFF] text-[#0052CC] rounded-[3px] border border-[#B3D4FF]">
              {analysis.seniority}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#F4F5F7] text-[#42526E] rounded-[3px] border border-[#DFE1E6]">
              {analysis.jobType}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#172B4D] leading-relaxed">
          {analysis.summary}
        </p>

        {/* Priority Skills Chips */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C] block mb-1.5">
            Core Target Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.prioritySkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-bold bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] rounded-[3px]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Technical Requirements & Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Technical Requirements Breakdown */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#DFE1E6]">
            <Target className="w-4 h-4 text-[#0052CC]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Extracted Technical Requirements
            </h4>
          </div>

          <div className="divide-y divide-[#DFE1E6] max-h-[420px] overflow-y-auto pr-1">
            {analysis.technicalRequirements.map((req, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B4D]">{req.name}</span>
                  <StatusLozenge status={req.importance} size="sm" />
                </div>
                {req.evidenceInJD && (
                  <p className="text-[11px] text-[#6B778C] italic">
                    "{req.evidenceInJD}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Responsibilities */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#DFE1E6]">
            <Briefcase className="w-4 h-4 text-[#6554C0]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Key Responsibilities
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-[#172B4D] max-h-[420px] overflow-y-auto pr-1">
            {analysis.responsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start space-x-2 p-2 bg-[#FAFBFC] rounded border border-[#DFE1E6]">
                <span className="text-[#0052CC] font-bold mt-0.5">•</span>
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Domain Terms & Soft Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Domain Terms */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
            Domain & Industry Terminology
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.domainTerms.map((term, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2] rounded-[3px] font-semibold">
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
            Soft Skills & Competencies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.softSkillRequirements.map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs bg-[#E6FCFF] text-[#008DA6] border border-[#B2F5EA] rounded-[3px] font-semibold">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
