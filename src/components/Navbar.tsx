import React from 'react';
import { 
  Briefcase, 
  Plus, 
  User, 
  FileCode2, 
  Search, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  onNewJobClick: () => void;
  onOpenProfile: () => void;
  onOpenWorkflowGuide: () => void;
  onHomeClick?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  profile?: UserProfile;
  activeJobTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewJobClick,
  onOpenProfile,
  onOpenWorkflowGuide,
  onHomeClick,
  searchTerm,
  onSearchChange,
  profile,
  activeJobTitle
}) => {
  const initials = profile?.personal?.name 
    ? profile.personal.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JD';

  return (
    <header className="h-14 border-b border-[#EBECF0] px-4 sm:px-6 flex items-center justify-between bg-white shrink-0 sticky top-0 z-40">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          id="btn-nav-brand-logo"
          onClick={onHomeClick}
          className="w-8 h-8 bg-[#0052CC] hover:bg-[#0747A6] rounded flex items-center justify-center text-white font-bold italic text-base transition-colors shadow-sm cursor-pointer"
          title="Job Application Copilot"
        >
          A
        </button>
        <div className="flex items-center text-sm font-semibold tracking-tight text-[#172B4D]">
          <button 
            id="btn-nav-home-title"
            onClick={onHomeClick} 
            className="hover:text-[#0052CC] transition-colors font-bold text-base cursor-pointer"
          >
            ResumeForge
          </button>
          <span className="text-[#6B778C] font-normal px-2">/</span>
          <span className="text-[#0052CC] font-medium truncate max-w-[180px] sm:max-w-[320px]">
            {activeJobTitle ? `${activeJobTitle}.tex` : 'Master_Resume.tex'}
          </span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-1">
        <button
          id="btn-nav-apps"
          onClick={onHomeClick}
          className="px-3 py-1.5 rounded hover:bg-[#F4F5F7] text-xs font-semibold text-[#42526E] hover:text-[#172B4D] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-[#0052CC]" />
          <span>Applications</span>
        </button>

        <button
          id="btn-nav-profile"
          onClick={onOpenProfile}
          className="px-3 py-1.5 rounded hover:bg-[#F4F5F7] text-xs font-semibold text-[#42526E] hover:text-[#172B4D] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FileCode2 className="w-3.5 h-3.5 text-[#6554C0]" />
          <span>Master Profile & .tex</span>
        </button>

        <button
          id="btn-nav-guide"
          onClick={onOpenWorkflowGuide}
          className="px-2.5 py-1.5 rounded hover:bg-[#F4F5F7] text-xs font-semibold text-[#42526E] hover:text-[#172B4D] transition-colors flex items-center gap-1 cursor-pointer"
          title="Workflow Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#6B778C]" />
          <span>Guide</span>
        </button>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden lg:block w-48 xl:w-56">
          <Search className="w-3.5 h-3.5 text-[#6B778C] absolute left-2.5 top-2 pointer-events-none" />
          <input
            id="input-nav-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs, skills..."
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#F4F5F7] hover:bg-[#EBECF0] focus:bg-white text-[#172B4D] placeholder-[#6B778C] border border-[#EBECF0] focus:border-[#0052CC] rounded outline-none transition-all"
          />
        </div>

        <button
          id="btn-nav-workflow-help"
          onClick={onOpenWorkflowGuide}
          className="px-3 py-1.5 rounded bg-[#F4F5F7] hover:bg-[#EBECF0] text-xs font-medium text-[#172B4D] transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0052CC]" />
          <span>Guide</span>
        </button>

        <button
          id="btn-new-application-primary"
          onClick={onNewJobClick}
          className="px-3.5 py-1.5 rounded bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Job</span>
        </button>

        {/* User Profile Avatar */}
        <button
          id="btn-nav-profile-avatar"
          onClick={onOpenProfile}
          className="h-8 w-8 rounded-full bg-[#FFAB00] text-white flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-[#FFAB00]/50 transition-all cursor-pointer shrink-0 ml-1"
          title="Master Candidate Profile & .tex Source"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
