import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Save,
  CheckCircle2,
  Send
} from 'lucide-react';
import { CoverLetter, JobApplication, UserProfile } from '../types';

interface CoverLetterViewProps {
  application: JobApplication;
  profile: UserProfile;
  onGenerateCoverLetter: () => Promise<void>;
  isGenerating: boolean;
  onSaveCoverLetter: (content: string) => void;
}

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  application,
  profile,
  onGenerateCoverLetter,
  isGenerating,
  onSaveCoverLetter
}) => {
  const coverLetter = application.coverLetter;
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(coverLetter?.content || '');
  const [copied, setCopied] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    if (coverLetter?.content) {
      setEditableContent(coverLetter.content);
    }
  }, [coverLetter?.content]);

  const handleCopy = () => {
    const textToCopy = `${coverLetter?.subject ? `Subject: ${coverLetter.subject}\n\n` : ''}${editableContent}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveCoverLetter(editableContent);
    setIsEditing(false);
  };

  const handleDownload = () => {
    const filename = `Cover_Letter_${profile.personal.name.replace(/\s+/g, '_')}_${application.company}.txt`;
    const text = `${coverLetter?.subject ? `Subject: ${coverLetter.subject}\n\n` : ''}${editableContent}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-4 shadow-[0_1px_2px_rgba(9,30,66,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#E6FCFF] text-[#008DA6] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172B4D]">
              Tailored Cover Letter Generator
            </h3>
            <p className="text-xs text-[#6B778C]">
              250–350 words, role-specific, highlighting top 2–3 authentic accomplishments.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-generate-cover-letter"
            onClick={onGenerateCoverLetter}
            disabled={isGenerating}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Cover Letter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}</span>
              </>
            )}
          </button>

          {coverLetter && (
            <>
              {isEditing ? (
                <button
                  id="btn-save-cover-letter"
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-[#36B37E] hover:bg-[#006644] text-white text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Edits</span>
                </button>
              ) : (
                <button
                  id="btn-edit-cover-letter"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#6B778C]" />
                  <span>Edit</span>
                </button>
              )}

              <button
                id="btn-copy-cover-letter"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#006644]" /> : <Copy className="w-3.5 h-3.5 text-[#6B778C]" />}
                <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
              </button>

              <button
                id="btn-download-cover-letter"
                onClick={handleDownload}
                className="px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6] text-xs font-semibold rounded-[3px] transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#6B778C]" />
                <span>Download .txt</span>
              </button>
            </>
          )}
        </div>
      </div>

      {coverLetter ? (
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-[0_1px_3px_rgba(9,30,66,0.08)] p-6 space-y-4">
          {/* Subject Line */}
          {coverLetter.subject && (
            <div className="p-3 bg-[#F4F5F7] rounded-[3px] border border-[#DFE1E6] flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B4D]">
                <strong className="text-[#0052CC]">Subject:</strong> {coverLetter.subject}
              </span>
              <span className="text-[11px] text-[#6B778C]">
                {coverLetter.wordCount} words
              </span>
            </div>
          )}

          {/* Letter Body or Textarea */}
          {isEditing ? (
            <textarea
              id="textarea-edit-cover-letter"
              rows={14}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full p-4 text-xs font-sans leading-relaxed text-[#172B4D] bg-white border border-[#0052CC] rounded-[3px] outline-none focus:ring-2 focus:ring-[#0052CC]/20"
            />
          ) : (
            <div className="p-6 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D] leading-relaxed whitespace-pre-line font-sans">
              {editableContent}
            </div>
          )}

          {/* Highlighted Value Propositions */}
          {coverLetter.highlightedPoints && coverLetter.highlightedPoints.length > 0 && (
            <div className="p-3.5 bg-[#E6FCFF]/40 border border-[#B2F5EA] rounded-[3px] space-y-1.5">
              <span className="text-xs font-bold text-[#008DA6] block">
                Highlighted Candidate Value Propositions:
              </span>
              <ul className="space-y-1 text-xs text-[#172B4D] pl-4 list-disc">
                {coverLetter.highlightedPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-12 text-center shadow-[0_1px_2px_rgba(9,30,66,0.06)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#E6FCFF] text-[#008DA6] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#172B4D]">
            No Cover Letter Generated Yet
          </h4>
          <p className="text-xs text-[#6B778C] max-w-md mx-auto">
            Click <strong>"Generate Cover Letter"</strong> to create a concise, truthful 300-word cover letter tailored for {application.company}.
          </p>
          <button
            id="btn-empty-cover-letter"
            onClick={onGenerateCoverLetter}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors inline-flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Cover Letter Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
