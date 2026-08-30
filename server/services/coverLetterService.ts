import { GoogleGenAI } from '@google/genai';
import { CoverLetter, JobAnalysis, ProfileMatch, UserProfile } from '../../src/types';
import { callGeminiWithRetryAndFallback, extractJsonFromText } from '../config/gemini';

/**
 * Resilient Cover Letter Fallback Generator.
 */
export function generateSmartCoverLetterFallback(
  analysis: JobAnalysis,
  match: ProfileMatch,
  userProfile: UserProfile
): CoverLetter {
  const company = analysis?.company || 'your team';
  const role = analysis?.title || 'Software Engineer';
  const name = userProfile.personal.name || 'Candidate';

  const content = `Dear Hiring Team at ${company},

I am writing to express my enthusiastic interest in the ${role} position at ${company}. With proven experience in developing resilient, high-throughput microservices using Java 17, Spring Boot, and event-driven architectures with Apache Kafka, I am excited about the opportunity to bring my distributed systems expertise to your team.

At Wissen Technology (client: Morgan Stanley), I engineered mission-critical Cash Equities Order Management System (OMS) microservices handling over 500,000 daily trade events with sub-50ms response latency. My contributions included designing resilient Kafka event streaming pipelines with guaranteed delivery and optimizing PostgreSQL queries and Redis caches to achieve a 35% reduction in database latency. My background in building contract-first APIs and scalable backend architectures aligns directly with the technical roadmap at ${company}.

I look forward to the opportunity to discuss how my hands-on experience in high-concurrency systems, system optimization, and backend engineering can add immediate value to ${company}.

Sincerely,
${name}
${userProfile.personal.email} | ${userProfile.personal.phone}
${userProfile.personal.linkedin}`;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    subject: `Application for ${role} --- ${name}`,
    content,
    highlightedPoints: [
      'Cash Equities Order Management System (OMS) microservices with Java 17 & Spring Boot',
      'High-throughput Apache Kafka event streaming pipelines handling 500k+ daily trade events',
      'Database query optimization (PostgreSQL/SQL) and Redis distributed caching'
    ],
    wordCount,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates tailored cover letter with AI and grounding.
 */
export async function generateCoverLetter(
  analysis: JobAnalysis,
  match: ProfileMatch,
  userProfile: UserProfile,
  ai: GoogleGenAI | null
): Promise<CoverLetter> {
  let coverLetter: CoverLetter | null = null;

  if (ai && analysis) {
    try {
      const prompt = `You are an executive career advisor crafting a high-impact, truthful Cover Letter.

Target Role: ${analysis?.title}
Company: ${analysis?.company}
Company Location: ${analysis?.location}
Candidate: ${userProfile.personal.name}
Candidate Profile Summary: ${userProfile.summary}
Candidate Strong Alignments: ${JSON.stringify(match?.strongAlignments || [])}
Priority Skills: ${JSON.stringify(analysis?.prioritySkills || [])}

RULES:
- Length: 250 - 350 words.
- Specific to ${analysis?.company} and the ${analysis?.title} role.
- Highlight the strongest 2-3 authentic candidate accomplishments (Cash Equities OMS, Java/Spring Boot, Kafka event streaming, database optimization).
- Avoid generic AI buzzwords ("spearheaded", "passionate synergy", "delve").
- Strictly DO NOT claim ungrounded skills (${JSON.stringify(match?.gaps || [])}).
- Professional, confident, concise tone.

Return a JSON object:
{
  "subject": string (e.g. "Application for [Role] --- [Candidate Name]"),
  "content": string (the complete cover letter text with paragraphs),
  "highlightedPoints": [string] (3 bullet points highlighting candidate value proposition)
}

Return ONLY valid JSON.`;

      const responseText = await callGeminiWithRetryAndFallback(ai, {
        prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        },
        candidateModels: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
      });

      if (responseText) {
        const data = extractJsonFromText(responseText);
        const wordCount = (data.content || '').trim().split(/\s+/).filter(Boolean).length;

        coverLetter = {
          subject: data.subject || `Application for ${analysis?.title} --- ${userProfile.personal.name}`,
          content: data.content || '',
          highlightedPoints: data.highlightedPoints || [],
          wordCount,
          generatedAt: new Date().toISOString()
        };
      }
    } catch (err: any) {
      console.warn('[CoverLetter] AI generation error, using fallback:', err?.message || err);
    }
  }

  if (!coverLetter || !coverLetter.content) {
    coverLetter = generateSmartCoverLetterFallback(analysis, match, userProfile);
  }

  return coverLetter;
}
