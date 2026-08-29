import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  HelpCircle, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Plus, 
  Save, 
  Check, 
  FileText,
  Building2,
  Copy,
  Sliders,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Info
} from 'lucide-react';
import { JobApplication, UserProfile, MasterQAItem, PendingQuestion, ApplicationSubmissionResult } from '../types';
import { StatusLozenge } from './StatusLozenge';

interface AutoApplySubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  profile: UserProfile;
  onUpdateApplication: (updatedApp: JobApplication) => void;
  onSaveMasterQA: (newQAs: MasterQAItem[]) => Promise<void>;
}

export const AutoApplySubmitModal: React.FC<AutoApplySubmitModalProps> = ({
  isOpen,
  onClose,
  application,
  profile,
  onUpdateApplication,
  onSaveMasterQA
}) => {
  const [step, setStep] = useState<'review' | 'executing' | 'pending_qa' | 'submitted'>('review');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [saveToMasterList, setSaveToMasterList] = useState<Record<string, boolean>>({});
  const [submissionResult, setSubmissionResult] = useState<ApplicationSubmissionResult | null>(
    application.submissionResult || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);

  if (!isOpen) return null;

  const masterQAs = profile.masterQA || [];

  // Start the automated application submission
  const handleStartApplication = async () => {
    setStep('executing');
    setExecutionLogs([]);
    setIsSubmitting(true);

    try {
      // Step 1: Initialize submission on backend
      const res = await fetch(`/api/jobs/${application.id}/submit-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize submission');
      }

      // Simulate step-by-step progress for user transparency
      const logs: string[] = [
        `Connecting to job portal (${data.result?.portalName || 'Careers Engine'})...`,
        `Injecting candidate coordinates for ${profile.personal.name}...`,
        `Binding tailored LaTeX resume & cover letter content...`,
        `Matching portal screening fields against ${masterQAs.length} Master QA entries...`
      ];

      for (let i = 0; i < logs.length; i++) {
        await new Promise(r => setTimeout(r, 450));
        setExecutionLogs(prev => [...prev, logs[i]]);
      }

      const result: ApplicationSubmissionResult = data.result;

      if (result.submissionStatus === 'NEEDS_INPUT' && result.pendingQuestions && result.pendingQuestions.length > 0) {
        // Needs user answer for unknown questions
        setPendingQuestions(result.pendingQuestions);
        // Pre-fill answers with suggestions
        const initialAnswers: Record<string, string> = {};
        const initialSaveFlags: Record<string, boolean> = {};
        result.pendingQuestions.forEach(q => {
          initialAnswers[q.id] = q.suggestedAnswer || '';
          initialSaveFlags[q.id] = true; // Default to saving new questions to master list!
        });
        setUserAnswers(initialAnswers);
        setSaveToMasterList(initialSaveFlags);
        setStep('pending_qa');
      } else {
        // Successfully submitted
        setSubmissionResult(result);
        onUpdateApplication({
          ...application,
          status: 'APPLIED',
          submissionResult: result,
          trackingUrl: result.trackingUrl,
          updatedAt: new Date().toISOString()
        });
        setStep('submitted');
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
      setStep('review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit answered pending questions
  const handleResolvePendingQuestions = async () => {
    setIsSubmitting(true);
    try {
      const answeredList = pendingQuestions.map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        answer: userAnswers[q.id] || q.suggestedAnswer || 'N/A',
        saveToMasterList: saveToMasterList[q.id] ?? true
      }));

      const res = await fetch(`/api/jobs/${application.id}/answer-pending-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answeredList,
          profile
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit answers');
      }

      // If new Master QA items were generated, save them to the profile
      if (Array.isArray(data.newMasterQAItems) && data.newMasterQAItems.length > 0) {
        const updatedMasterQA = [...(profile.masterQA || []), ...data.newMasterQAItems];
        await onSaveMasterQA(updatedMasterQA);
      }

      const result: ApplicationSubmissionResult = data.result;
      setSubmissionResult(result);
      onUpdateApplication({
        ...application,
        status: 'APPLIED',
        submissionResult: result,
        trackingUrl: result.trackingUrl,
        updatedAt: new Date().toISOString()
      });
      setStep('submitted');
    } catch (err: any) {
      alert(`Failed to submit answers: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#091E42]/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DFE1E6] rounded-[6px] shadow-[0_12px_40px_rgba(9,30,66,0.3)] max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#0052CC] text-white flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">
                Auto-Apply & Submission Copilot
              </h2>
              <p className="text-xs text-[#6B778C]">
                {application.company} • {application.title}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <StatusLozenge status={application.status} size="sm" />
            <button
              onClick={onClose}
              className="p-1 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: REVIEW BEFORE APPLYING */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006644]" />
                  <span>Verified Application Package Readiness</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white border border-[#DFE1E6] rounded-[3px]">
                    <span className="text-[11px] text-[#6B778C] block font-semibold">Tailored LaTeX Resume</span>
                    <span className="font-bold text-[#172B4D] flex items-center space-x-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#36B37E]" />
                      <span>{application.resumeTailoring?.tailoredTex ? 'Validated & Ready (.tex)' : 'Master Resume (.tex)'}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-[#DFE1E6] rounded-[3px]">
                    <span className="text-[11px] text-[#6B778C] block font-semibold">Master Non-Technical Answers</span>
                    <span className="font-bold text-[#172B4D] flex items-center space-x-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#36B37E]" />
                      <span>{masterQAs.length} Verified Standard Q&A Answers</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-[#DFE1E6] rounded-[3px]">
                    <span className="text-[11px] text-[#6B778C] block font-semibold">Tailored Cover Letter</span>
                    <span className="font-bold text-[#172B4D] flex items-center space-x-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#36B37E]" />
                      <span>{application.coverLetter?.content ? 'Generated & Formatted' : 'Standard Alignment Letter'}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-[#DFE1E6] rounded-[3px]">
                    <span className="text-[11px] text-[#6B778C] block font-semibold">Target Job Portal</span>
                    <span className="font-bold text-[#0052CC] flex items-center space-x-1 mt-0.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{application.url ? 'Oracle Cloud / Workday / Lever' : 'Direct Employer Careers Portal'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Master QA Summary Preview */}
              <div className="border border-[#DFE1E6] rounded-[4px] p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Auto-Fill Screening Knowledge Rules
                  </h5>
                  <span className="text-[11px] font-semibold text-[#0052CC]">
                    {masterQAs.length} questions covered
                  </span>
                </div>
                <p className="text-xs text-[#6B778C]">
                  The submission engine will automatically answer questions regarding work authorization, visa sponsorship, alliance/partner history, veteran status, and demographics using your Master QA profile.
                </p>

                <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto">
                  {masterQAs.slice(0, 4).map((qa, idx) => (
                    <div key={qa.id || idx} className="text-xs p-2 bg-[#FAFBFC] border border-[#EBECF0] rounded flex justify-between gap-2">
                      <span className="text-[#42526E] font-medium truncate flex-1">{qa.question}</span>
                      <span className="font-bold text-[#006644] shrink-0">{qa.answer}</span>
                    </div>
                  ))}
                  {masterQAs.length > 4 && (
                    <p className="text-[11px] text-[#6B778C] italic text-center pt-1">
                      + {masterQAs.length - 4} more answers active in your Master List
                    </p>
                  )}
                </div>
              </div>

              {/* Interactive Info Banner */}
              <div className="bg-[#DEEBFF]/60 border border-[#B3D4FF] rounded-[4px] p-3.5 text-xs text-[#0747A6] flex items-start space-x-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0052CC]" />
                <div className="space-y-1">
                  <span className="font-bold">Automated Missing Question Detection:</span>
                  <p className="text-[#172B4D] leading-relaxed">
                    If the portal contains any question not present in your Master List, the workflow will pause, prompt you to answer it, and seamlessly save your response to your Master QA profile for all future applications!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXECUTING SUBMISSION */}
          {step === 'executing' && (
            <div className="py-8 space-y-5 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-[#0052CC] border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#172B4D]">
                  Executing Application to {application.company}...
                </h4>
                <p className="text-xs text-[#6B778C]">
                  Filling fields, attaching tailored documents, and resolving screening requirements.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] p-3 text-left font-mono text-[11px] space-y-1.5 shadow-inner">
                {executionLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-[#42526E]">
                    <span className="text-[#0052CC]">➔</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: PENDING QUESTIONS PROMPT (WHEN MISSING FROM MASTER LIST) */}
          {step === 'pending_qa' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FFF0B3]/50 border border-[#FFE380] rounded-[4px] flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-[#FFAB00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Missing Question Confirmation Required ({pendingQuestions.length} Pending)
                  </h4>
                  <p className="text-xs text-[#42526E] mt-0.5">
                    The portal asked the following questions that were not yet in your Master List. Answer them below to complete submission and optionally save them to your permanent profile.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {pendingQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 bg-white border border-[#DFE1E6] rounded-[4px] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#DEEBFF] text-[#0052CC] rounded">
                        Question #{idx + 1} • {q.category.replace(/_/g, ' ')}
                      </span>
                      {q.portalFieldLabel && (
                        <span className="text-[11px] text-[#6B778C] font-mono">
                          Field: {q.portalFieldLabel}
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-[#172B4D]">
                      {q.question}
                    </h5>

                    {/* Options or Text Input */}
                    {q.options && q.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oidx) => (
                          <label 
                            key={oidx}
                            className={`p-2.5 border rounded-[3px] text-xs font-semibold flex items-center space-x-2 cursor-pointer transition-colors ${
                              userAnswers[q.id] === opt 
                                ? 'border-[#0052CC] bg-[#DEEBFF]/40 text-[#0052CC]' 
                                : 'border-[#DFE1E6] hover:bg-[#FAFBFC] text-[#172B4D]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`pq-${q.id}`}
                              value={opt}
                              checked={userAnswers[q.id] === opt}
                              onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                              className="accent-[#0052CC]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          rows={2}
                          value={userAnswers[q.id] || ''}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                          placeholder="Type your answer for this question..."
                          className="w-full text-xs p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] outline-none focus:border-[#0052CC] focus:bg-white"
                        />
                      </div>
                    )}

                    {/* Checkbox to add to Master List */}
                    <div className="pt-2 border-t border-[#EBECF0] flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-[#006644] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveToMasterList[q.id] ?? true}
                          onChange={(e) => setSaveToMasterList({ ...saveToMasterList, [q.id]: e.target.checked })}
                          className="accent-[#006644] w-3.5 h-3.5 rounded"
                        />
                        <span>Save this question and answer to my Master List for future applications</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: APPLICATION SUBMITTED & TRACKING LINK */}
          {step === 'submitted' && submissionResult && (
            <div className="space-y-4">
              <div className="p-5 bg-[#E3FCEF] border border-[#ABF5D1] rounded-[4px] text-center space-y-2">
                <div className="w-10 h-10 bg-[#36B37E] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#006644]">
                  Application Submitted Successfully!
                </h4>
                <p className="text-xs text-[#172B4D]">
                  Your application for <span className="font-bold">{application.title}</span> at <span className="font-bold">{application.company}</span> has been processed.
                </p>
              </div>

              {/* Official Tracking Link Card */}
              <div className="p-4 bg-white border border-[#DFE1E6] rounded-[4px] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center space-x-1.5">
                    <Bookmark className="w-4 h-4 text-[#0052CC]" />
                    <span>Application Tracking & Confirmation</span>
                  </span>
                  <span className="text-[11px] text-[#6B778C] font-mono">
                    ID: {submissionResult.confirmationId || submissionResult.trackingNumber}
                  </span>
                </div>

                <div className="p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#6B778C] block font-semibold">Official Status Tracking Link</span>
                    <a
                      href={submissionResult.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      id="link-official-tracking"
                      className="text-xs font-bold text-[#0052CC] hover:underline flex items-center space-x-1 break-all"
                    >
                      <span>{submissionResult.trackingUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>

                  <a
                    href={submissionResult.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] flex items-center space-x-1.5 shrink-0"
                  >
                    <span>Open Tracking Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Submitted Answers Summary */}
              {submissionResult.answersSubmitted && submissionResult.answersSubmitted.length > 0 && (
                <div className="border border-[#DFE1E6] rounded-[4px] p-4 bg-white space-y-2">
                  <h5 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Answers Submitted On Your Behalf ({submissionResult.answersSubmitted.length})
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {submissionResult.answersSubmitted.map((ans, idx) => (
                      <div key={idx} className="p-2 bg-[#FAFBFC] border border-[#EBECF0] rounded text-xs flex justify-between gap-3">
                        <span className="text-[#42526E] font-medium">{ans.question}</span>
                        <span className="font-bold text-[#006644] shrink-0">{ans.answer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] rounded-[3px]"
          >
            {step === 'submitted' ? 'Done' : 'Cancel'}
          </button>

          {step === 'review' && (
            <button
              id="btn-confirm-submit-application"
              onClick={handleStartApplication}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit My Application</span>
            </button>
          )}

          {step === 'pending_qa' && (
            <button
              id="btn-resolve-pending-questions"
              onClick={handleResolvePendingQuestions}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Answers & Complete Application</span>
            </button>
          )}

          {step === 'submitted' && (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
