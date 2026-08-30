import { GoogleGenAI } from '@google/genai';
import { JobAnalysis } from '../../src/types';
import { callGeminiWithRetryAndFallback, extractJsonFromText } from '../config/gemini';

/**
 * Comprehensive Rule-Based / NLP Job Analysis Generator (Used as zero-failure fallback)
 */
export function generateSmartJobAnalysisFallback(
  jobDescription: string,
  hintTitle?: string,
  hintCompany?: string,
  hintLocation?: string
): JobAnalysis {
  const jdLower = jobDescription.toLowerCase();

  // Inferred title
  let inferredTitle = hintTitle && hintTitle.trim() ? hintTitle.trim() : '';
  if (!inferredTitle) {
    const titleMatch = jobDescription.match(/(?:Job Title|Position|Role|Looking for a|Seeking a|Hiring a)\s*[:\-]?\s*([A-Za-z0-9\s\/\-\(\)\+]{4,45})/i);
    if (titleMatch && titleMatch[1]) {
      inferredTitle = titleMatch[1].trim();
    } else if (jdLower.includes('lead') || jdLower.includes('principal')) {
      inferredTitle = 'Lead Software Engineer';
    } else if (jdLower.includes('senior') || jdLower.includes('sr.')) {
      inferredTitle = 'Senior Software Engineer';
    } else if (jdLower.includes('full stack') || jdLower.includes('fullstack')) {
      inferredTitle = 'Full Stack Software Engineer';
    } else {
      inferredTitle = 'Software Engineer';
    }
  }

  // Inferred company
  let inferredCompany = hintCompany && hintCompany.trim() ? hintCompany.trim() : '';
  if (!inferredCompany) {
    const compMatch = jobDescription.match(/(?:About|Join|At|Careers at)\s+([A-Z][A-Za-z0-9\s&]{2,30})/);
    if (compMatch && compMatch[1]) {
      inferredCompany = compMatch[1].trim();
    } else {
      inferredCompany = 'Target Enterprise';
    }
  }

  // Location
  const inferredLocation = hintLocation && hintLocation.trim() 
    ? hintLocation.trim() 
    : (jdLower.includes('remote') ? 'Remote / Hybrid' : (jdLower.includes('bangalore') || jdLower.includes('bengaluru') ? 'Bangalore, India (Hybrid)' : 'Bangalore, India / Remote'));

  // Seniority
  let seniority = 'Mid Level (2-4 yrs)';
  if (jdLower.includes('10+') || jdLower.includes('principal') || jdLower.includes('staff')) {
    seniority = 'Staff / Principal (8+ yrs)';
  } else if (jdLower.includes('5+') || jdLower.includes('6+') || jdLower.includes('7+') || jdLower.includes('senior') || jdLower.includes('sr.')) {
    seniority = 'Senior (5+ yrs)';
  } else if (jdLower.includes('0-2') || jdLower.includes('entry') || jdLower.includes('graduate') || jdLower.includes('fresher')) {
    seniority = 'Entry Level (0-2 yrs)';
  }

  // Technical Requirement detection dictionary
  const techDict: Array<{
    name: string;
    category: 'language' | 'framework' | 'database' | 'cloud' | 'architecture' | 'tool' | 'domain' | 'other';
    keywords: string[];
    defaultImportance?: 'must-have' | 'preferred';
  }> = [
    { name: 'Java (Core / 11 / 17)', category: 'language', keywords: ['java', 'core java', 'java 8', 'java 11', 'java 17', 'jvm'], defaultImportance: 'must-have' },
    { name: 'Spring Boot & Microservices', category: 'framework', keywords: ['spring boot', 'spring framework', 'spring cloud', 'spring data', 'spring'], defaultImportance: 'must-have' },
    { name: 'Apache Kafka / Event Streaming', category: 'architecture', keywords: ['kafka', 'event-driven', 'event driven', 'messaging queue', 'pub/sub', 'message broker', 'rabbitmq'], defaultImportance: 'must-have' },
    { name: 'REST APIs & Distributed Systems', category: 'architecture', keywords: ['rest api', 'restful', 'microservices', 'distributed systems', 'grpc', 'api design'], defaultImportance: 'must-have' },
    { name: 'Relational Databases (PostgreSQL / SQL)', category: 'database', keywords: ['postgresql', 'postgres', 'sql', 'oracle db', 'mysql', 'relational database', 'rdbms'], defaultImportance: 'must-have' },
    { name: 'Redis / Distributed Caching', category: 'database', keywords: ['redis', 'caching', 'memcached', 'cache'], defaultImportance: 'preferred' },
    { name: 'Docker & Kubernetes (Containerization)', category: 'cloud', keywords: ['docker', 'kubernetes', 'k8s', 'containers', 'containerization'], defaultImportance: 'preferred' },
    { name: 'AWS Cloud Infrastructure', category: 'cloud', keywords: ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'cloud'], defaultImportance: 'preferred' },
    { name: 'TypeScript / React', category: 'language', keywords: ['typescript', 'react', 'javascript', 'frontend', 'ui'], defaultImportance: 'preferred' },
    { name: 'CI/CD & Automated Testing (JUnit/Mockito)', category: 'tool', keywords: ['ci/cd', 'junit', 'mockito', 'automated testing', 'jenkins', 'gitlab', 'unit test'], defaultImportance: 'must-have' },
    { name: 'Low Latency & High Throughput Architecture', category: 'architecture', keywords: ['low latency', 'high throughput', 'concurrency', 'multithreading', 'performance optimization'], defaultImportance: 'preferred' }
  ];

  const technicalRequirements: Array<{
    name: string;
    category: 'language' | 'framework' | 'database' | 'cloud' | 'architecture' | 'tool' | 'domain' | 'other';
    importance: 'must-have' | 'preferred' | 'nice-to-have';
    evidenceInJD: string;
  }> = [];

  const foundKeywords: Array<{ term: string; importance: number; category: 'technical' | 'domain' | 'responsibility' | 'soft-skill'; occurrences: number }> = [];

  for (const item of techDict) {
    let occurrences = 0;
    let foundSnippet = '';

    for (const kw of item.keywords) {
      const reg = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = jobDescription.match(reg);
      if (matches) {
        occurrences += matches.length;
        if (!foundSnippet) {
          const idx = jobDescription.toLowerCase().indexOf(kw);
          if (idx >= 0) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(jobDescription.length, idx + 80);
            foundSnippet = jobDescription.substring(start, end).replace(/\n/g, ' ').trim();
          }
        }
      }
    }

    if (occurrences > 0 || item.name.includes('Java') || item.name.includes('Spring')) {
      const isMustHave = 
        item.defaultImportance === 'must-have' ||
        jdLower.includes(`must have ${item.keywords[0]}`) ||
        jdLower.includes(`required:`) ||
        occurrences >= 2;

      technicalRequirements.push({
        name: item.name,
        category: item.category,
        importance: isMustHave ? 'must-have' : 'preferred',
        evidenceInJD: foundSnippet || `Referenced ${occurrences} times in requirements.`
      });

      foundKeywords.push({
        term: item.keywords[0].toUpperCase() === 'JAVA' ? 'Java' : (item.keywords[0].toUpperCase() === 'AWS' ? 'AWS' : item.keywords[0]),
        importance: isMustHave ? 0.95 : 0.8,
        category: 'technical',
        occurrences: occurrences || 1
      });
    }
  }

  // Extract responsibilities
  const rawLines = jobDescription.split('\n').map(l => l.trim()).filter(l => l.length > 25);
  const bulletLines = rawLines.filter(l => /^[•\-\*\d\.\)]\s*/.test(l) || l.startsWith('Design') || l.startsWith('Build') || l.startsWith('Develop') || l.startsWith('Collaborate') || l.startsWith('Maintain') || l.startsWith('Drive'));

  const responsibilities: string[] = bulletLines.slice(0, 6).map(l => l.replace(/^[•\-\*\d\.\)]\s*/, '').trim());
  if (responsibilities.length < 3) {
    responsibilities.push(
      'Architect, design, and implement resilient microservices and distributed backend systems.',
      'Build scalable, event-driven data pipelines and transaction processing services.',
      'Collaborate with cross-functional engineering teams on system design, code reviews, and production readiness.',
      'Optimize database queries, distributed caching, and end-to-end API response latencies.'
    );
  }

  const prioritySkills = technicalRequirements.slice(0, 6).map(t => t.name.split(' (')[0]);

  return {
    title: inferredTitle,
    company: inferredCompany,
    location: inferredLocation,
    seniority,
    jobType: 'Full-time',
    summary: `${inferredCompany} is seeking a ${inferredTitle} to engineer resilient, high-throughput distributed systems and mission-critical backend microservices.`,
    technicalRequirements,
    softSkillRequirements: [
      { name: 'Problem Solving & System Debugging', category: 'soft-skill', importance: 'must-have' },
      { name: 'Ownership & Technical Collaboration', category: 'soft-skill', importance: 'must-have' },
      { name: 'Agile Delivery & Clear Communication', category: 'soft-skill', importance: 'preferred' }
    ],
    responsibilities,
    keywords: foundKeywords.slice(0, 10),
    domainTerms: ['Distributed Systems', 'Order Management / High Throughput', 'Cloud Infrastructure', 'Event Streaming'],
    prioritySkills: prioritySkills.length > 0 ? prioritySkills : ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'PostgreSQL']
  };
}

/**
 * Analyzes a Job Description using Gemini models with resilient fallback.
 */
export async function analyzeJobDescription(
  jobDescription: string,
  ai: GoogleGenAI | null,
  options?: { title?: string; company?: string; location?: string }
): Promise<JobAnalysis> {
  const { title, company, location } = options || {};
  let analysis: JobAnalysis | null = null;

  if (ai) {
    try {
      const prompt = `You are a precision Job Description Analysis Engine adhering to strict extraction rules.
Untrusted Job Description:
"""
${jobDescription}
"""

Provided hints: Title: "${title || ''}", Company: "${company || ''}", Location: "${location || ''}"

Analyze the job description and extract a comprehensive, structured JSON object with EXACTLY this structure:
{
  "title": string (exact or best inferred job title),
  "company": string (exact or best inferred company name),
  "location": string (e.g. "Bangalore, India (Hybrid)", "Remote", "New York, NY"),
  "seniority": string (e.g. "Entry Level", "Mid Level (2-4 yrs)", "Senior (5+ yrs)", "Staff"),
  "jobType": string (e.g. "Full-time", "Contract", "Hybrid"),
  "summary": string (2-3 sentences summarizing the role and core mission),
  "technicalRequirements": [
    {
      "name": string (specific skill/technology name),
      "category": "language" | "framework" | "database" | "cloud" | "architecture" | "tool" | "domain" | "other",
      "importance": "must-have" | "preferred" | "nice-to-have",
      "evidenceInJD": string (short snippet from JD backing this requirement)
    }
  ],
  "softSkillRequirements": [
    {
      "name": string,
      "category": "soft-skill",
      "importance": "must-have" | "preferred"
    }
  ],
  "responsibilities": [
    string (4-6 key responsibility statements extracted directly from the role)
  ],
  "keywords": [
    {
      "term": string,
      "importance": number between 0.5 and 1.0,
      "category": "technical" | "domain" | "responsibility" | "soft-skill",
      "occurrences": number (approx count)
    }
  ],
  "domainTerms": [
    string (specific domain terminology, e.g. "Order Management", "FinTech", "Low Latency", "Payment Gateway")
  ],
  "prioritySkills": [
    string (top 5-8 absolute highest priority skills)
  ]
}

Return ONLY valid JSON. No markdown codeblock wrapper, no preamble.`;

      const responseText = await callGeminiWithRetryAndFallback(ai, {
        prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        },
        candidateModels: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
      });

      if (responseText) {
        analysis = extractJsonFromText<JobAnalysis>(responseText);
      }
    } catch (err: any) {
      console.warn('[JobAnalyzer] Gemini Analysis encountered error, falling back:', err?.message || err);
    }
  }

  if (!analysis || !analysis.technicalRequirements || analysis.technicalRequirements.length === 0) {
    analysis = generateSmartJobAnalysisFallback(jobDescription, title, company, location);
  }

  return analysis;
}
