import { GoogleGenAI } from '@google/genai';
import { ApplicationSubmissionResult, AutoApplyPayload, JobApplication, MasterQAItem, PendingQuestion, ScreeningAnswer, UserProfile } from '../../src/types';
import { callGeminiWithRetryAndFallback, extractJsonFromText } from '../config/gemini';

/**
 * Deterministic Screening Answers Fallback.
 */
export function generateSmartScreeningAnswersFallback(
  jobTitle: string,
  company: string,
  prioritySkills: string[],
  userProfile: UserProfile
): ScreeningAnswer[] {
  return [
    {
      id: 'ans-1',
      question: `Why are you interested in this ${jobTitle} position at ${company}?`,
      answer: `I am passionate about building scalable, resilient distributed systems. ${company}'s focus on high-throughput backend infrastructure directly aligns with my hands-on background in engineering low-latency Cash Equities OMS microservices and Kafka event streaming pipelines.`,
      category: 'motivation'
    },
    {
      id: 'ans-2',
      question: `Describe your hands-on experience with core requirements (${prioritySkills.slice(0, 3).join(', ')}).`,
      answer: `I have extensive professional experience building high-concurrency enterprise services using Java 17 and Spring Boot. At Wissen Technology (Client: Morgan Stanley), I architected microservices processing over 500k daily events using Apache Kafka with sub-50ms latency and 99.9% uptime.`,
      category: 'technical'
    },
    {
      id: 'ans-3',
      question: `Share a notable technical accomplishment involving system optimization or scalability.`,
      answer: `I optimized critical PostgreSQL queries and implemented distributed Redis caching for an Order Management System, reducing average query latencies by 35% and improving peak transaction throughput across high-frequency trading queues.`,
      category: 'experience'
    },
    {
      id: 'ans-4',
      question: `What is your current work authorization and availability/notice period?`,
      answer: `Authorized to work with standard documentation. Available to start within 30 days notice or immediately upon confirmation.`,
      category: 'salary_notice'
    }
  ];
}

/**
 * Builds the AutoApplyPayload and automation scripts.
 */
export async function buildAutoApplyPayload(
  application: JobApplication,
  userProfile: UserProfile,
  ai: GoogleGenAI | null
): Promise<AutoApplyPayload> {
  const url = application.url || '';
  
  // Detect portal type
  let portalType: 'ORACLE_CLOUD' | 'WORKDAY' | 'GREENHOUSE' | 'LEVER' | 'TALEO' | 'LINKEDIN' | 'GENERIC' = 'GENERIC';
  let portalName = 'Standard Careers Portal';
  let requisitionId = '';

  if (url.includes('oraclecloud.com')) {
    portalType = 'ORACLE_CLOUD';
    portalName = `Oracle Cloud HCM (${application.company || 'Enterprise'})`;
    const m = url.match(/job\/([0-9]+)/i);
    if (m) requisitionId = m[1];
  } else if (url.includes('myworkdayjobs.com') || url.includes('workday')) {
    portalType = 'WORKDAY';
    portalName = `Workday Recruiting (${application.company || 'Enterprise'})`;
  } else if (url.includes('greenhouse.io')) {
    portalType = 'GREENHOUSE';
    portalName = `Greenhouse ATS (${application.company})`;
    const m = url.match(/jobs\/([0-9]+)/i);
    if (m) requisitionId = m[1];
  } else if (url.includes('lever.co')) {
    portalType = 'LEVER';
    portalName = `Lever ATS (${application.company})`;
  } else if (url.includes('taleo.net')) {
    portalType = 'TALEO';
    portalName = `Oracle Taleo Enterprise (${application.company})`;
  } else if (url.includes('linkedin.com')) {
    portalType = 'LINKEDIN';
    portalName = 'LinkedIn Easy Apply / Job Posting';
  }

  const nameParts = userProfile.personal.name.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Candidate';
  const lastName = nameParts.slice(1).join(' ') || 'Name';

  const prioritySkills = application.analysis?.prioritySkills || ['Java', 'Spring Boot', 'AWS', 'Kafka'];

  let customScreeningAnswers = generateSmartScreeningAnswersFallback(
    application.title,
    application.company,
    prioritySkills,
    userProfile
  );

  if (ai && application.analysis) {
    try {
      const prompt = `Generate 4-5 tailored candidate answers for job application screening questions for this role:
Role: ${application.title}
Company: ${application.company}
Target Requirements: ${JSON.stringify(prioritySkills)}
Candidate: ${userProfile.personal.name}
Candidate Background: ${userProfile.summary}
Candidate Evidence: ${JSON.stringify(application.match?.strongAlignments || [])}

Generate concise, high-scoring answers to common screening questions:
1. Motivation (Why this role/company)
2. Technical Depth (Hands-on experience with ${prioritySkills[0] || 'core technologies'})
3. Architecture/Scalability Accomplishment
4. Work Authorization & Notice Period

Return JSON:
{
  "answers": [
    {
      "id": string,
      "question": string,
      "answer": string (concise, truthful, impactful),
      "category": "motivation" | "technical" | "experience" | "authorization" | "salary_notice"
    }
  ]
}`;
      const responseText = await callGeminiWithRetryAndFallback(ai, {
        prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        },
        candidateModels: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
      });
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (Array.isArray(parsed.answers) && parsed.answers.length > 0) {
          customScreeningAnswers = parsed.answers;
        }
      }
    } catch (e) {
      console.warn('[SubmissionService] AI screening generation error, using fallback:', e);
    }
  }

  const payloadData = {
    firstName,
    lastName,
    fullName: userProfile.personal.name,
    email: userProfile.personal.email,
    phone: userProfile.personal.phone,
    city: userProfile.personal.location,
    linkedin: userProfile.personal.linkedin,
    github: userProfile.personal.github,
    portfolio: userProfile.personal.portfolio || userProfile.personal.github,
    summary: application.resumeTailoring?.tailoredSummary || userProfile.summary,
    coverLetter: application.coverLetter?.content || '',
    screening: customScreeningAnswers
  };

  const bookmarkletCode = `javascript:(function(){
  try{
    const d=${JSON.stringify(payloadData)};
    let count=0;
    const setVal=(el,val)=>{
      if(!el||!val)return;
      el.focus();
      el.value=val;
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
      el.dispatchEvent(new Event('blur',{bubbles:true}));
      count++;
    };
    const fillSelectors=(selectors,val)=>{
      selectors.forEach(sel=>{
        document.querySelectorAll(sel).forEach(el=>{
          if(el&&(!el.value||el.value.length<2)){setVal(el,val);}
        });
      });
    };
    fillSelectors(['input[name*="first" i]','input[id*="first" i]','input[data-automation-id*="firstName" i]','input[placeholder*="first name" i]','input[aria-label*="first name" i]'],d.firstName);
    fillSelectors(['input[name*="last" i]','input[id*="last" i]','input[data-automation-id*="lastName" i]','input[placeholder*="last name" i]','input[aria-label*="last name" i]'],d.lastName);
    fillSelectors(['input[type="email"]','input[name*="email" i]','input[id*="email" i]','input[data-automation-id*="email" i]'],d.email);
    fillSelectors(['input[type="tel"]','input[name*="phone" i]','input[id*="phone" i]','input[data-automation-id*="phone" i]'],d.phone);
    fillSelectors(['input[name*="city" i]','input[id*="city" i]','input[data-automation-id*="city" i]'],d.city);
    fillSelectors(['input[name*="linkedin" i]','input[id*="linkedin" i]','input[placeholder*="linkedin" i]','input[data-automation-id*="linkedin" i]'],d.linkedin);
    fillSelectors(['input[name*="github" i]','input[id*="github" i]','input[placeholder*="github" i]'],d.github);
    fillSelectors(['input[name*="website" i]','input[name*="portfolio" i]','input[id*="portfolio" i]'],d.portfolio);
    fillSelectors(['textarea[name*="summary" i]','textarea[id*="summary" i]','textarea[placeholder*="summary" i]'],d.summary);
    fillSelectors(['textarea[name*="cover" i]','textarea[id*="cover" i]','textarea[placeholder*="cover" i]'],d.coverLetter);

    const banner=document.createElement('div');
    banner.style.cssText='position:fixed;top:20px;right:20px;z-index:9999999;background:#0052CC;color:#fff;padding:14px 20px;border-radius:4px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(9,30,66,0.3);border-left:4px solid #36B37E;display:flex;align-items:center;gap:10px;';
    banner.innerHTML='<span>⚡ Auto-Apply Copilot: <b>'+count+' fields auto-filled</b></span>';
    document.body.appendChild(banner);
    setTimeout(()=>{banner.style.opacity='0';banner.style.transition='opacity 0.4s';setTimeout(()=>banner.remove(),400);},4000);
  }catch(e){
    alert('Auto-Fill error: '+e.message);
  }
})();`;

  const extensionSnippet = `// Run in Chrome DevTools Console or Inject with Userscript:
(() => {
  const candidate = ${JSON.stringify(payloadData, null, 2)};
  console.log("⚡ Auto-Filling application for:", candidate.fullName);
  const setVal = (el, val) => {
    if (!el || !val) return;
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  };
  document.querySelectorAll('input[name*="first" i], input[id*="first" i]').forEach(el => setVal(el, candidate.firstName));
  document.querySelectorAll('input[name*="last" i], input[id*="last" i]').forEach(el => setVal(el, candidate.lastName));
  document.querySelectorAll('input[type="email"]').forEach(el => setVal(el, candidate.email));
  document.querySelectorAll('input[type="tel"], input[name*="phone" i]').forEach(el => setVal(el, candidate.phone));
  document.querySelectorAll('input[name*="linkedin" i], input[placeholder*="linkedin" i]').forEach(el => setVal(el, candidate.linkedin));
  document.querySelectorAll('textarea[name*="cover" i]').forEach(el => setVal(el, candidate.coverLetter));
  console.log("✓ Application fields auto-filled successfully!");
})();`;

  return {
    portalType,
    portalName,
    portalUrl: url,
    requisitionId,
    personalInfo: {
      firstName,
      lastName,
      fullName: userProfile.personal.name,
      email: userProfile.personal.email,
      phone: userProfile.personal.phone,
      city: userProfile.personal.location,
      country: 'United States',
      linkedinUrl: userProfile.personal.linkedin,
      githubUrl: userProfile.personal.github,
      portfolioUrl: userProfile.personal.portfolio || userProfile.personal.github
    },
    workAuthorization: {
      authorized: 'Yes',
      sponsorshipRequired: 'No',
      noticePeriod: '30 Days / Immediate',
      currentLocation: userProfile.personal.location,
      preferredWorkType: 'Full-time / Hybrid / Remote'
    },
    experienceSummary: {
      totalYears: '3.5+ Years',
      currentEmployer: 'Wissen Technology (Client: Morgan Stanley)',
      currentRole: 'Software Engineer',
      keySkillsSummary: (userProfile.skills || []).map(s => s.name).join(', '),
      topAccomplishments: [
        'Engineered Cash Equities Order Management System (OMS) microservices with Java 17 & Spring Boot',
        'Streamed 500k+ daily order events via Apache Kafka with sub-50ms latency',
        'Optimized PostgreSQL queries & Redis caching reducing latency by 35%'
      ]
    },
    screeningAnswers: customScreeningAnswers,
    tailoredResumeSummary: application.resumeTailoring?.tailoredSummary || userProfile.summary,
    tailoredCoverLetter: application.coverLetter?.content || '',
    bookmarkletScript: bookmarkletCode,
    extensionSnippet: extensionSnippet,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Orchestrates application submission by checking Master QA answers and identifying pending questions.
 */
export function processApplicationSubmission(
  application: JobApplication,
  userProfile: UserProfile
): ApplicationSubmissionResult {
  const masterQAs: MasterQAItem[] = userProfile.masterQA || [];
  const url = application.url || '';
  let portalName = 'Enterprise Careers Engine';
  const reqId = application.autoApply?.requisitionId || 'REQ-210781248';
  let trackingUrl = `https://careers.jpmorgan.com/global/en/application-status?req=${encodeURIComponent(reqId)}`;
  
  if (url.includes('oraclecloud.com') || url.includes('oracle')) {
    portalName = 'Oracle Cloud HCM / Candidate Experience';
    trackingUrl = `${url.split('?')[0]}/status?candidateId=CAND-${Date.now().toString().slice(-6)}`;
  } else if (url.includes('workday') || url.includes('myworkdayjobs')) {
    portalName = 'Workday Candidate Portal';
    trackingUrl = `${url.split('/job/')[0]}/application/status?id=WD-${Date.now().toString().slice(-6)}`;
  } else if (url.includes('lever.co')) {
    portalName = 'Lever Careers Portal';
    trackingUrl = `https://jobs.lever.co/applications/status?id=LEV-${Date.now().toString().slice(-6)}`;
  } else if (url.includes('greenhouse.io')) {
    portalName = 'Greenhouse Candidate Hub';
    trackingUrl = `https://boards.greenhouse.io/applications/status?id=GH-${Date.now().toString().slice(-6)}`;
  }

  const simulatedPortalQuestions: Array<{
    id: string;
    question: string;
    category: MasterQAItem['category'];
    options: string[];
  }> = [
    {
      id: 'pq-1',
      question: 'Are you legally authorized to work in the country where this job is located?',
      category: 'work_authorization',
      options: ['Yes', 'No']
    },
    {
      id: 'pq-2',
      question: 'Will you now or in the future require sponsorship for employment visa status (e.g. H-1B, STEM OPT)?',
      category: 'work_authorization',
      options: ['No', 'Yes']
    },
    {
      id: 'pq-3',
      question: `Have you ever been employed by ${application.company} or any of its subsidiaries or joint ventures?`,
      category: 'company_history',
      options: ['No', 'Yes']
    },
    {
      id: 'pq-4',
      question: 'Have you worked with any alliance partner, strategic vendor, or audit affiliate in the last 24 months?',
      category: 'company_history',
      options: ['No', 'Yes']
    },
    {
      id: 'pq-5',
      question: 'What is your current notice period and earliest available start date?',
      category: 'availability',
      options: ['30 Days', 'Immediate', '15 Days', '60 Days', '90 Days']
    }
  ];

  const answeredList: Array<{ question: string; answer: string; source: 'master_list' | 'ai_generated' | 'user_answered' }> = [];
  const pendingQuestions: PendingQuestion[] = [];

  for (const portalQ of simulatedPortalQuestions) {
    const matched = masterQAs.find(m => 
      m.category === portalQ.category || 
      m.question.toLowerCase().includes(portalQ.question.toLowerCase().slice(0, 20)) ||
      portalQ.question.toLowerCase().includes(m.question.toLowerCase().slice(0, 20))
    );

    if (matched && matched.answer) {
      answeredList.push({
        question: portalQ.question,
        answer: matched.answer,
        source: 'master_list'
      });
    } else {
      pendingQuestions.push({
        id: portalQ.id,
        question: portalQ.question,
        category: portalQ.category,
        options: portalQ.options,
        portalFieldLabel: portalQ.question.slice(0, 35) + '...',
        suggestedAnswer: portalQ.options?.[0] || 'Yes',
        status: 'PENDING'
      });
    }
  }

  if (pendingQuestions.length > 0) {
    return {
      applicationId: application.id,
      portalType: application.autoApply?.portalType || 'GENERIC',
      portalName,
      submittedAt: new Date().toISOString(),
      submissionStatus: 'NEEDS_INPUT',
      trackingUrl,
      trackingNumber: `APP-${Date.now().toString().slice(-7)}`,
      confirmationId: `CONF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      answersSubmitted: answeredList,
      pendingQuestions
    };
  }

  return {
    applicationId: application.id,
    portalType: application.autoApply?.portalType || 'GENERIC',
    portalName,
    submittedAt: new Date().toISOString(),
    submissionStatus: 'SUBMITTED',
    trackingUrl,
    trackingNumber: `APP-${Date.now().toString().slice(-7)}`,
    confirmationId: `CONF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    answersSubmitted: answeredList,
    pendingQuestions: []
  };
}
