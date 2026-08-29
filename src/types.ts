export type ApplicationStatus =
  | 'CREATED'
  | 'ANALYZED'
  | 'TAILORED'
  | 'READY_TO_APPLY'
  | 'APPLIED'
  | 'RECRUITER_CONTACTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'ARCHIVED';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio?: string;
}

export interface SkillItem {
  name: string;
  category: 'Language' | 'Framework' | 'Database' | 'Cloud/DevOps' | 'Architecture' | 'Tools' | 'Other';
}

export interface ExperienceBullet {
  id: string;
  text: string;
  evidenceTags: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  client?: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string; // e.g. "Present" or "2024-08"
  current: boolean;
  technologies: string[];
  bullets: ExperienceBullet[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  technologies: string[];
  description: string;
  bullets: string[];
  link?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface UserProfile {
  personal: PersonalInfo;
  summary: string;
  skills: SkillItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: string[];
  masterTexResume: string;
}

export interface Requirement {
  name: string;
  category: 'language' | 'framework' | 'database' | 'cloud' | 'architecture' | 'tool' | 'domain' | 'soft-skill' | 'other';
  importance: 'must-have' | 'preferred' | 'nice-to-have';
  evidenceInJD?: string;
}

export interface Keyword {
  term: string;
  importance: number; // 0.0 - 1.0
  category: 'technical' | 'domain' | 'responsibility' | 'soft-skill';
  occurrences: number;
}

export interface JobAnalysis {
  title: string;
  company: string;
  location: string;
  seniority: string;
  jobType: string;
  summary: string;
  technicalRequirements: Requirement[];
  softSkillRequirements: Requirement[];
  responsibilities: string[];
  keywords: Keyword[];
  domainTerms: string[];
  prioritySkills: string[];
}

export interface SkillMatch {
  requirement: string;
  importance: 'must-have' | 'preferred' | 'nice-to-have';
  status: 'strong' | 'moderate' | 'weak' | 'gap';
  candidateEvidence: string[];
  confidence: number;
}

export interface ProfileMatch {
  overallScore: number; // 0 - 100
  mustHaveScore: number; // 0 - 100
  matches: SkillMatch[];
  gaps: string[];
  strongAlignments: string[];
  recommendations: string[];
}

export interface ResumeChange {
  section: string;
  originalText?: string;
  tailoredText: string;
  reason: string;
  evidence: string[];
}

export interface ATSKeywordMatch {
  term: string;
  category: string;
  importance: number;
  presentInTailoredResume: boolean;
  frequencyInResume: number;
  status: 'covered' | 'missing' | 'unsupported_avoided';
}

export interface ResumeTailoringResult {
  tailoredTex: string;
  tailoredSummary: string;
  changes: ResumeChange[];
  keywordAnalysis: ATSKeywordMatch[];
  keywordCoveragePercentage: number;
  unsupportedClaimsAvoided: string[];
  tailoringNotes: string[];
  generatedAt: string;
}

export interface CoverLetter {
  content: string;
  subject: string;
  highlightedPoints: string[];
  wordCount: number;
  generatedAt: string;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  reasons: string[];
  linkedinSearchUrl: string;
  publicSearchUrl: string;
}

export interface SearchStrategy {
  title: string;
  query: string;
  platform: 'LinkedIn' | 'Google X-Ray' | 'Company Career';
  searchUrl: string;
  targetRole: string;
}

export interface RecruiterDiscoveryResult {
  strategies: SearchStrategy[];
  candidates: RecruiterCandidate[];
}

export interface OutreachMessage {
  type: 'LINKEDIN_NOTE' | 'LINKEDIN_INMAIL' | 'COLD_EMAIL';
  title: string;
  subject?: string;
  recipientName: string;
  recipientTitle: string;
  body: string;
  characterCount: number;
  highlightsUsed: string[];
}

export interface OutreachPackage {
  recruiterCandidates: RecruiterCandidate[];
  searchStrategies: SearchStrategy[];
  messages: OutreachMessage[];
  generatedAt: string;
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  url?: string;
  jobDescription: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  analysis?: JobAnalysis;
  match?: ProfileMatch;
  resumeTailoring?: ResumeTailoringResult;
  coverLetter?: CoverLetter;
  outreach?: OutreachPackage;
}
