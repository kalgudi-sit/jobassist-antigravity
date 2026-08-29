import React, { useState } from 'react';
import { 
  X, 
  User, 
  FileCode2, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Save, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserProfile, SkillItem, ExperienceItem, ProjectItem } from '../types';
import { DEFAULT_MASTER_TEX, DEFAULT_USER_PROFILE } from '../data/defaultProfile';
import { MasterQAEditor } from './MasterQAEditor';

interface MasterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void>;
}

export const MasterProfileModal: React.FC<MasterProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [activeTab, setActiveTab] = useState<'tex' | 'qa' | 'personal' | 'experience' | 'skills' | 'projects'>('tex');
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setFormData({ ...formData, masterTexResume: content });
      }
    };
    reader.readAsText(file);
  };

  const handleResetTex = () => {
    if (window.confirm('Reset Master .tex template to default? Any unsaved edits will be replaced.')) {
      setFormData({ ...formData, masterTexResume: DEFAULT_MASTER_TEX });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#091E42]/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DFE1E6] rounded-[6px] shadow-[0_8px_30px_rgba(9,30,66,0.25)] max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#0052CC] text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">Master Profile & LaTeX Resume (.tex)</h2>
              <p className="text-xs text-[#6B778C]">
                Your single source of truth. The AI tailors this authentic profile & .tex file without fabrication.
              </p>
            </div>
          </div>
          <button
            id="btn-close-master-profile"
            onClick={onClose}
            className="p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#DFE1E6] flex space-x-4 bg-[#FAFBFC]">
          <button
            id="tab-master-tex"
            onClick={() => setActiveTab('tex')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'tex' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#6554C0]" />
            <span>Master .tex Resume Code</span>
          </button>

          <button
            id="tab-master-qa"
            onClick={() => setActiveTab('qa')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'qa' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#006644]" />
            <span>Master QA & Screening Answers ({formData.masterQA?.length || 13})</span>
          </button>

          <button
            id="tab-master-personal"
            onClick={() => setActiveTab('personal')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'personal' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal & Summary</span>
          </button>

          <button
            id="tab-master-experience"
            onClick={() => setActiveTab('experience')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'experience' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work Experience ({formData.experience.length})</span>
          </button>

          <button
            id="tab-master-skills"
            onClick={() => setActiveTab('skills')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'skills' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-[#42526E] hover:text-[#172B4D]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Skills ({formData.skills.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: MASTER LATEX .TEX EDITOR */}
          {activeTab === 'tex' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#DEEBFF]/50 border border-[#B3D4FF] rounded-[4px]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
                  <span className="text-xs text-[#0747A6] font-semibold">
                    This .tex file is the base template. When applying, only its bullet points and content will be tailored.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="px-2.5 py-1 bg-white hover:bg-[#DEEBFF] text-[#0052CC] border border-[#DFE1E6] rounded-[3px] text-xs font-semibold cursor-pointer flex items-center space-x-1 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Upload Your .tex File</span>
                    <input
                      type="file"
                      accept=".tex,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetTex}
                    className="px-2.5 py-1 bg-white hover:bg-[#EBECF0] text-[#42526E] border border-[#DFE1E6] rounded-[3px] text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#172B4D]">
                  LaTeX (.tex) Code Source
                </label>
                <textarea
                  id="textarea-master-tex"
                  rows={16}
                  value={formData.masterTexResume}
                  onChange={(e) => setFormData({ ...formData, masterTexResume: e.target.value })}
                  className="w-full p-3.5 font-mono text-xs text-[#172B4D] leading-relaxed bg-[#FAFBFC] border border-[#DFE1E6] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 rounded-[3px] outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MASTER NON-TECHNICAL QA & SCREENING ANSWERS */}
          {activeTab === 'qa' && (
            <MasterQAEditor
              profile={formData}
              onSaveProfile={async (updatedProfile) => {
                setFormData(updatedProfile);
                await onSaveProfile(updatedProfile);
              }}
            />
          )}

          {/* TAB 3: PERSONAL & SUMMARY */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.personal.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, name: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.personal.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, email: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.personal.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, phone: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.personal.location}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, location: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.personal.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, linkedin: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B4D] mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.personal.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      personal: { ...formData.personal, github: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs text-[#172B4D] bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Master Professional Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-3 text-xs text-[#172B4D] leading-relaxed bg-white border border-[#DFE1E6] rounded-[3px] outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE WITH EVIDENCE TAGS */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {formData.experience.map((exp, eidx) => (
                <div key={exp.id || eidx} className="p-4 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#172B4D]">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[eidx].company = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#DFE1E6] rounded-[3px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#172B4D]">Client (Optional)</label>
                      <input
                        type="text"
                        value={exp.client || ''}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[eidx].client = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        placeholder="e.g. Morgan Stanley"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#DFE1E6] rounded-[3px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#172B4D]">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[eidx].role = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#DFE1E6] rounded-[3px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#172B4D]">
                      Experience Bullets (with Evidence Tags)
                    </label>
                    {exp.bullets.map((b, bidx) => (
                      <div key={b.id || bidx} className="p-2.5 bg-white border border-[#DFE1E6] rounded-[3px] space-y-1.5">
                        <textarea
                          rows={2}
                          value={b.text}
                          onChange={(e) => {
                            const updated = [...formData.experience];
                            updated[eidx].bullets[bidx].text = e.target.value;
                            setFormData({ ...formData, experience: updated });
                          }}
                          className="w-full text-xs text-[#172B4D] border-none p-0 outline-none resize-none"
                        />
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#6B778C]">
                          <span className="font-bold text-[#0052CC]">Evidence Tags:</span>
                          <span>{b.evidenceTags.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF] rounded-[3px] text-xs font-bold"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-[#42526E] font-normal">({skill.category})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#DFE1E6] bg-[#FAFBFC] flex items-center justify-between">
          <span className="text-xs text-[#6B778C]">
            {saveSuccess ? (
              <span className="text-[#006644] font-bold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Profile & LaTeX template saved!</span>
              </span>
            ) : (
              'Changes will be saved locally to profile.json'
            )}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              id="btn-save-master-profile"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Master Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
