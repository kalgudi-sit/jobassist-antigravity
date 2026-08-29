import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  Mail, 
  Linkedin, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  MessageSquare,
  FileCheck2,
  Edit3,
  Save,
  CheckCircle2
} from 'lucide-react';
import { JobApplication, UserProfile, OutreachMessage } from '../types';

interface OutreachGeneratorViewProps {
  application: JobApplication;
  profile: UserProfile;
  onGenerateOutreach: (candidateName?: string, candidateTitle?: string) => Promise<void>;
  isGenerating: boolean;
}

export const OutreachGeneratorView: React.FC<OutreachGeneratorViewProps> = ({
  application,
  profile,
  onGenerateOutreach,
  isGenerating
}) => {
  const company = application.company || 'Company';
  const role = application.title || 'Software Engineer';
  const outreach = application.outreach;

  const [activeMessageType, setActiveMessageType] = useState<'LINKEDIN_NOTE' | 'LINKEDIN_INMAIL' | 'COLD_EMAIL'>('LINKEDIN_NOTE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingMsgType, setEditingMsgType] = useState<string | null>(null);
  const [customBodies, setCustomBodies] = useState<Record<string, string>>({});

  const messages = outreach?.messages || [
    {
      type: 'LINKEDIN_NOTE',
      title: 'LinkedIn Connection Note (Under 300 Characters)',
      recipientName: `${company} Technical Recruiter`,
      recipientTitle: 'Technical Recruiter',
      body: `Hi! I saw the ${role} opening at ${company}. I build high-throughput Order Management microservices with Java 17, Spring Boot & Kafka at Morgan Stanley (Wissen). Would love to connect and share my resume!`,
      characterCount: 206,
      highlightsUsed: ['Java 17 & Spring Boot', 'Kafka event streaming', 'Morgan Stanley OMS']
    },
    {
      type: 'LINKEDIN_INMAIL',
      title: 'LinkedIn InMail / Direct Message',
      recipientName: `${company} Technical Recruiter`,
      recipientTitle: 'Technical Recruiter',
      body: `Hi,\n\nI hope you're having a great week.\n\nI came across the ${role} opening at ${company} and wanted to reach out regarding my background. I currently build high-throughput Cash Equities Order Management System (OMS) microservices using Java 17, Spring Boot, Apache Kafka, and PostgreSQL at Wissen Technology (Client: Morgan Stanley).\n\nGiven the role's focus on scalable backend architecture, low-latency transaction processing, and event-driven systems, I believe my background aligns strongly with your team's objectives.\n\nI would welcome the chance to connect and discuss how my experience can contribute to ${company}.\n\nBest regards,\n${profile.personal.name}\n${profile.personal.linkedin}`,
      characterCount: 680,
      highlightsUsed: ['Cash Equities OMS', 'Java 17, Spring Boot, Kafka', 'Low-latency distributed systems']
    },
    {
      type: 'COLD_EMAIL',
      title: 'Cold Email to Recruiter / Hiring Manager',
      subject: `Application: ${role} --- ${profile.personal.name}`,
      recipientName: `${company} Technical Recruiter`,
      recipientTitle: 'Technical Recruiter',
      body: `Hi,\n\nI hope this email finds you well.\n\nI am reaching out to express my interest in the ${role} position at ${company}. I am a Software Engineer currently working on tier-1 investment banking infrastructure (Morgan Stanley Cash Equities OMS), specializing in Java 17, Spring Boot, Kafka event streaming, and PostgreSQL database optimization.\n\nA few key highlights of my experience relevant to ${company}:\n- Engineered high-throughput microservices handling 500k+ daily trade events with sub-50ms latency.\n- Architected Kafka event streaming pipelines with dead-letter queue handling and partition strategies.\n- Optimized PostgreSQL queries and Redis caching, reducing query latency by 35%.\n\nI have attached my tailored resume for your review and would greatly appreciate the opportunity to speak with you or the engineering hiring team.\n\nThank you for your time and consideration.\n\nBest regards,\n${profile.personal.name}\n${profile.personal.email} | ${profile.personal.phone}\n${profile.personal.linkedin} | ${profile.personal.github}`,
      characterCount: 955,
      highlightsUsed: ['500k+ daily events sub-50ms', 'Kafka event pipelines', '35% database latency reduction']
    }
  ];

  const currentMsg = messages.find(m => m.type === activeMessageType) || messages[0];
  const displayBody = customBodies[currentMsg.type] !== undefined ? customBodies[currentMsg.type] : currentMsg.body;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenMailto = () => {
    if (currentMsg.type === 'COLD_EMAIL') {
      const subject = encodeURIComponent(currentMsg.subject || `Application for ${role}`);
      const body = encodeURIComponent(displayBody);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const charLimit = currentMsg.type === 'LINKEDIN_NOTE' ? 300 : null;
  const isOverLimit = charLimit ? displayBody.length > charLimit : false;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center font-bold">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172B4D]">
              Personalized Recruiter Outreach Generator
            </h3>
            <p className="text-xs text-[#6B778C]">
              Generate concise, impactful messages for LinkedIn notes, InMails, and cold emails.
            </p>
          </div>
        </div>

        <button
          id="btn-regenerate-outreach"
          onClick={() => onGenerateOutreach()}
          disabled={isGenerating}
          className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Outreach...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Messages</span>
            </>
          )}
        </button>
      </div>

      {/* Main Outreach Card */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0_1px_3px_rgba(9,30,66,0.08)] overflow-hidden">
        {/* Atlassian Tab Strip for Message Types */}
        <div className="px-4 border-b border-[#DFE1E6] flex space-x-2 bg-[#FAFBFC]">
          <button
            id="tab-outreach-note"
            onClick={() => setActiveTab('LINKEDIN_NOTE')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeMessageType === 'LINKEDIN_NOTE'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5 text-[#0052CC]" />
            <span>LinkedIn Connection Note (&lt;300 chars)</span>
          </button>

          <button
            id="tab-outreach-inmail"
            onClick={() => setActiveTab('LINKEDIN_INMAIL')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeMessageType === 'LINKEDIN_INMAIL'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#6554C0]" />
            <span>LinkedIn InMail / Message</span>
          </button>

          <button
            id="tab-outreach-email"
            onClick={() => setActiveTab('COLD_EMAIL')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeMessageType === 'COLD_EMAIL'
                ? 'border-[#0052CC] text-[#0052CC]'
                : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#008DA6]" />
            <span>Cold Email Draft</span>
          </button>
        </div>

        {/* Message Content Container */}
        <div className="p-6 space-y-4">
          {/* Header metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFE1E6]">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
                {currentMsg.title}
              </h4>
              <span className="text-xs text-[#6B778C]">
                Target Recruiter: <strong className="text-[#172B4D]">{currentMsg.recipientName}</strong> ({company})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {charLimit && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-[3px] border ${
                  isOverLimit 
                    ? 'bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]' 
                    : 'bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]'
                }`}>
                  {displayBody.length} / {charLimit} characters
                </span>
              )}

              <button
                id="btn-copy-current-outreach"
                onClick={() => handleCopy(currentMsg.subject ? `Subject: ${currentMsg.subject}\n\n${displayBody}` : displayBody, currentMsg.type)}
                className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] hover:border-[#4C9AFF] text-xs font-bold rounded-[3px] transition-colors flex items-center space-x-1.5"
              >
                {copiedKey === currentMsg.type ? <Check className="w-3.5 h-3.5 text-[#006644]" /> : <Copy className="w-3.5 h-3.5 text-[#0052CC]" />}
                <span>{copiedKey === currentMsg.type ? 'Copied to Clipboard!' : 'Copy Message'}</span>
              </button>

              {currentMsg.type === 'COLD_EMAIL' && (
                <button
                  id="btn-trigger-mailto"
                  onClick={handleOpenMailto}
                  className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] transition-colors flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Mail Client</span>
                </button>
              )}
            </div>
          </div>

          {/* Email Subject if present */}
          {currentMsg.subject && (
            <div className="p-3 bg-[#F4F5F7] rounded-[3px] border border-[#DFE1E6] flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B4D]">
                <strong className="text-[#0052CC]">Subject:</strong> {currentMsg.subject}
              </span>
              <button
                id="btn-copy-subject"
                onClick={() => handleCopy(currentMsg.subject!, 'subject')}
                className="text-[11px] font-semibold text-[#0052CC] hover:underline flex items-center space-x-1"
              >
                <span>{copiedKey === 'subject' ? 'Copied' : 'Copy Subject'}</span>
              </button>
            </div>
          )}

          {/* Message Body Editor */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B778C]">
                Draft Content (Editable):
              </label>
              <span className="text-[11px] text-[#6B778C]">
                You can edit this draft before copying
              </span>
            </div>
            <textarea
              id={`textarea-outreach-${currentMsg.type}`}
              rows={currentMsg.type === 'LINKEDIN_NOTE' ? 5 : 10}
              value={displayBody}
              onChange={(e) => setCustomBodies({ ...customBodies, [currentMsg.type]: e.target.value })}
              className="w-full p-4 text-xs font-sans leading-relaxed text-[#172B4D] bg-[#FAFBFC] focus:bg-white border border-[#DFE1E6] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 rounded-[3px] outline-none"
            />
          </div>

          {/* Highlights Used Badges */}
          {currentMsg.highlightsUsed && currentMsg.highlightsUsed.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#42526E]">Key Strengths Woven In:</span>
              {currentMsg.highlightsUsed.map((h, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] rounded-[3px] font-semibold text-[11px]">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function setActiveTab(type: 'LINKEDIN_NOTE' | 'LINKEDIN_INMAIL' | 'COLD_EMAIL') {
    setActiveMessageType(type);
  }
};
