import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles, 
  Search,
  Filter,
  CheckCircle2,
  FileQuestion,
  Info
} from 'lucide-react';
import { MasterQAItem, UserProfile } from '../types';
import { DEFAULT_MASTER_QA } from '../data/defaultProfile';

interface MasterQAEditorProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void>;
}

export const MasterQAEditor: React.FC<MasterQAEditorProps> = ({
  profile,
  onSaveProfile
}) => {
  const [qaList, setQaList] = useState<MasterQAItem[]>(
    profile.masterQA && profile.masterQA.length > 0 ? profile.masterQA : DEFAULT_MASTER_QA
  );
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<MasterQAItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQA, setNewQA] = useState<Partial<MasterQAItem>>({
    category: 'work_authorization',
    question: '',
    answer: '',
    explanation: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Questions' },
    { id: 'work_authorization', label: 'Work Authorization' },
    { id: 'company_history', label: 'Company & Alliance History' },
    { id: 'demographics', label: 'Demographics & EEO' },
    { id: 'availability', label: 'Availability & Notice Period' },
    { id: 'compensation', label: 'Compensation & Benefits' },
    { id: 'general', label: 'General & Compliance' }
  ];

  const filteredQAs = qaList.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.explanation && item.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStartEdit = (item: MasterQAItem) => {
    setEditingId(item.id);
    setEditFormData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = (id: string) => {
    const updated = qaList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...editFormData,
          updatedAt: new Date().toISOString()
        } as MasterQAItem;
      }
      return item;
    });
    setQaList(updated);
    setEditingId(null);
    setEditFormData({});
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to remove this answer from your master list?')) {
      const updated = qaList.filter(item => item.id !== id);
      setQaList(updated);
    }
  };

  const handleAddNew = () => {
    if (!newQA.question?.trim() || !newQA.answer?.trim()) {
      alert('Please fill out both the question and answer.');
      return;
    }
    const item: MasterQAItem = {
      id: `mqa-custom-${Date.now()}`,
      category: (newQA.category as any) || 'general',
      question: newQA.question.trim(),
      answer: newQA.answer.trim(),
      explanation: newQA.explanation?.trim() || '',
      updatedAt: new Date().toISOString()
    };
    setQaList([item, ...qaList]);
    setIsAddingNew(false);
    setNewQA({
      category: 'work_authorization',
      question: '',
      answer: '',
      explanation: ''
    });
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset Master QA List to system defaults? Any custom added questions will be replaced.')) {
      setQaList(DEFAULT_MASTER_QA);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveProfile({
        ...profile,
        masterQA: qaList
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save master QA:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Info */}
      <div className="bg-[#DEEBFF]/50 border border-[#B3D4FF] rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#0052CC] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0747A6] uppercase tracking-wide">
              Master Non-Technical QA & Screening Answers
            </h4>
            <p className="text-xs text-[#172B4D] mt-0.5">
              The Auto-Apply engine consults this master list to fill company history, work authorization, alliance experience, demographic, notice period, and compliance questions on your behalf.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="btn-master-qa-reset"
            onClick={handleResetToDefaults}
            className="px-2.5 py-1.5 bg-white text-[#42526E] hover:text-[#172B4D] hover:bg-[#EBECF0] border border-[#DFE1E6] rounded-[3px] text-xs font-semibold transition-colors"
          >
            Reset Defaults
          </button>
          <button
            id="btn-master-qa-save-all"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] disabled:opacity-50 text-white text-xs font-bold rounded-[3px] shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#36B37E]" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Master QA List'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#DFE1E6] rounded-[4px]">
        {/* Category Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-[3px] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0052CC] text-white'
                  : 'bg-[#FAFBFC] text-[#42526E] hover:bg-[#EBECF0] border border-[#DFE1E6]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Add New */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B778C] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search master answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D] placeholder-[#6B778C] focus:bg-white focus:border-[#0052CC] outline-none w-44 sm:w-56"
            />
          </div>

          <button
            id="btn-add-master-qa"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] transition-colors flex items-center space-x-1 cursor-pointer"
          >
            {isAddingNew ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAddingNew ? 'Cancel' : 'Add Question'}</span>
          </button>
        </div>
      </div>

      {/* Add New Question Form */}
      {isAddingNew && (
        <div className="bg-[#FAFBFC] border-2 border-dashed border-[#4C9AFF] rounded-[4px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-[#0052CC] uppercase tracking-wider">
              Add New Master Screening Answer
            </h5>
            <span className="text-[11px] text-[#6B778C]">
              Will be saved to your permanent master profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#6B778C] block mb-1">Category</label>
              <select
                value={newQA.category}
                onChange={(e) => setNewQA({ ...newQA, category: e.target.value as any })}
                className="w-full text-xs font-semibold bg-white border border-[#DFE1E6] rounded-[3px] p-2 outline-none focus:border-[#0052CC]"
              >
                <option value="work_authorization">Work Authorization</option>
                <option value="company_history">Company & Alliance History</option>
                <option value="demographics">Demographics & EEO</option>
                <option value="availability">Availability & Notice Period</option>
                <option value="compensation">Compensation & Benefits</option>
                <option value="general">General & Compliance</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-[#6B778C] block mb-1">Question / Prompt Phrase</label>
              <input
                type="text"
                placeholder="e.g. Have you ever worked with any partner alliance or subsidiary?"
                value={newQA.question}
                onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[3px] p-2 outline-none focus:border-[#0052CC]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#6B778C] block mb-1">Standard / Master Answer</label>
            <textarea
              rows={2}
              placeholder="e.g. Yes (Wissen Technology on client engagement for Morgan Stanley)"
              value={newQA.answer}
              onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
              className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[3px] p-2 outline-none focus:border-[#0052CC]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#6B778C] block mb-1">Context / Explanation (Optional)</label>
            <input
              type="text"
              placeholder="Why this answer is used or details for the AI auto-submitter"
              value={newQA.explanation}
              onChange={(e) => setNewQA({ ...newQA, explanation: e.target.value })}
              className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[3px] p-2 outline-none focus:border-[#0052CC]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] rounded-[3px]"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNew}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] shadow-sm flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add to Master List</span>
            </button>
          </div>
        </div>
      )}

      {/* QA List Items */}
      <div className="space-y-2.5">
        {filteredQAs.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#DFE1E6] rounded-[4px]">
            <FileQuestion className="w-8 h-8 text-[#6B778C] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-[#172B4D]">No master questions found</p>
            <p className="text-xs text-[#6B778C] mt-1">Try selecting a different category or clearing search filters.</p>
          </div>
        ) : (
          filteredQAs.map((item) => {
            const isEditing = editingId === item.id;

            if (isEditing) {
              return (
                <div key={item.id} className="p-4 bg-white border-2 border-[#0052CC] rounded-[4px] space-y-3 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#6B778C]">Category</label>
                      <select
                        value={editFormData.category || item.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as any })}
                        className="w-full text-xs font-semibold bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-1.5 mt-1"
                      >
                        <option value="work_authorization">Work Authorization</option>
                        <option value="company_history">Company & Alliance History</option>
                        <option value="demographics">Demographics & EEO</option>
                        <option value="availability">Availability & Notice Period</option>
                        <option value="compensation">Compensation & Benefits</option>
                        <option value="general">General & Compliance</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-[#6B778C]">Question Prompt</label>
                      <input
                        type="text"
                        value={editFormData.question || item.question}
                        onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                        className="w-full text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-1.5 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#6B778C]">Answer</label>
                    <textarea
                      rows={2}
                      value={editFormData.answer || item.answer}
                      onChange={(e) => setEditFormData({ ...editFormData, answer: e.target.value })}
                      className="w-full text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-1.5 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#6B778C]">Explanation / Notes</label>
                    <input
                      type="text"
                      value={editFormData.explanation ?? item.explanation ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                      className="w-full text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] p-1.5 mt-1"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0] rounded-[3px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-3.5 py-1 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={item.id} 
                className="p-3.5 bg-white border border-[#DFE1E6] rounded-[4px] hover:border-[#4C9AFF] transition-all space-y-2 group shadow-[0_1px_2px_rgba(9,30,66,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#DEEBFF] text-[#0052CC] rounded-[3px]">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-[#6B778C]">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-[#172B4D] pt-0.5">
                      {item.question}
                    </h5>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-edit-mqa-${item.id}`}
                      onClick={() => handleStartEdit(item)}
                      title="Edit this Master Answer"
                      className="p-1 text-[#6B778C] hover:text-[#0052CC] hover:bg-[#DEEBFF] rounded-[3px] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-mqa-${item.id}`}
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete from Master List"
                      className="p-1 text-[#6B778C] hover:text-[#BF2600] hover:bg-[#FFEBE6] rounded-[3px] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#FAFBFC] border border-[#EBECF0] rounded-[3px] p-2.5">
                  <div className="flex items-start space-x-2">
                    <span className="text-xs font-bold text-[#006644] shrink-0">Answer:</span>
                    <span className="text-xs font-medium text-[#172B4D] leading-relaxed">
                      {item.answer}
                    </span>
                  </div>

                  {item.explanation && (
                    <div className="flex items-center space-x-1.5 mt-1.5 pt-1.5 border-t border-[#EBECF0] text-[11px] text-[#6B778C]">
                      <Info className="w-3 h-3 text-[#6B778C] shrink-0" />
                      <span>{item.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
