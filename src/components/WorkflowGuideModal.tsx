import React from 'react';
import { 
  X, 
  Sparkles, 
  FileCode2, 
  ShieldCheck, 
  Send, 
  Users, 
  CheckCircle2, 
  Target,
  ArrowRight
} from 'lucide-react';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowGuideModal: React.FC<WorkflowGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Job Description Intake & Analysis',
      desc: 'Paste any job posting or enter a URL. The system extracts hard requirements, must-haves vs preferred qualifications, and domain terms without assumptions.',
      color: '#0052CC',
      bgColor: '#DEEBFF'
    },
    {
      step: '02',
      title: 'Deterministic Profile Match',
      desc: 'Compares the extracted requirements against authenticated candidate evidence in your Master Profile. Maps exact supporting facts while flagging real gaps.',
      color: '#6554C0',
      bgColor: '#EAE6FF'
    },
    {
      step: '03',
      title: 'LaTeX (.tex) Resume Tailoring Engine',
      desc: 'Strictly edits bullet points and content in your master .tex code. Preserves all LaTeX packages, macros, preamble, and geometry 100% intact.',
      color: '#006644',
      bgColor: '#E3FCEF'
    },
    {
      step: '04',
      title: 'Zero-Fabrication Guardrail',
      desc: 'Never invents unverified companies, metrics, or years of experience. Unsupported requirements in the job description are safely avoided.',
      color: '#FF8B00',
      bgColor: '#FFF0B3'
    },
    {
      step: '05',
      title: 'Tailored Cover Letter Generation',
      desc: 'Produces a concise (250–350 word), high-impact cover letter focused on your top 2–3 authentic accomplishments aligned with the role.',
      color: '#008DA6',
      bgColor: '#E6FCFF'
    },
    {
      step: '06',
      title: 'Recruiter Discovery & Outreach',
      desc: 'Generates 1-click LinkedIn/Google X-ray searches to find relevant recruiters, plus instant 300-char LinkedIn notes and cold emails.',
      color: '#403294',
      bgColor: '#EAE6FF'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#091E42]/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DFE1E6] rounded-[6px] shadow-[0_8px_30px_rgba(9,30,66,0.25)] max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#0052CC] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">How the Application Copilot Works</h2>
              <p className="text-xs text-[#6B778C]">
                Designed specifically for authentic, LaTeX-based job applications.
              </p>
            </div>
          </div>
          <button
            id="btn-close-workflow-guide"
            onClick={onClose}
            className="p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3.5 bg-[#E3FCEF] border border-[#ABF5D1] rounded-[4px] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#006644] shrink-0 mt-0.5" />
            <p className="text-xs text-[#006644] font-medium leading-relaxed">
              <strong>Core Rule:</strong> For each job application, your same resume code (<code>.tex</code> file) is loaded. Only the bullet points and content are modified to best showcase your real experience for that job — nothing else.
            </p>
          </div>

          <div className="space-y-2.5">
            {steps.map((s, idx) => (
              <div key={idx} className="p-3.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] flex items-start space-x-3">
                <span 
                  style={{ color: s.color, backgroundColor: s.bgColor }}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center text-xs font-bold shrink-0"
                >
                  {s.step}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D]">{s.title}</h4>
                  <p className="text-xs text-[#6B778C] mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-end">
          <button
            type="button"
            id="btn-dismiss-workflow-guide"
            onClick={onClose}
            className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors cursor-pointer"
          >
            Got It, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
