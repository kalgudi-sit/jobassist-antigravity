import { GoogleGenAI } from '@google/genai';
import { extractJsonFromText } from '../config/gemini';

export interface ScrapedJobResult {
  text: string;
  title?: string;
  company?: string;
  location?: string;
  portalType?: string;
  requisitionId?: string;
}

/**
 * Strips HTML tags, styles, scripts, and normalizes whitespaces.
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Multi-tier scraper targeting Oracle Cloud Candidate Experience, Greenhouse, Lever, and generic web pages.
 */
export async function scrapeJobFromUrl(rawUrl: string, ai: GoogleGenAI | null): Promise<ScrapedJobResult> {
  const url = rawUrl.trim();

  // 1. Oracle Cloud HCM Candidate Experience Detection
  const oracleMatch = url.match(/https?:\/\/([a-zA-Z0-9_\-\.]+oraclecloud\.com).*?\/sites\/([a-zA-Z0-9_\-]+)\/job\/([0-9]+)/i)
    || url.match(/https?:\/\/([a-zA-Z0-9_\-\.]+oraclecloud\.com).*?\/job\/([0-9]+)/i);

  if (oracleMatch) {
    const domain = oracleMatch[1];
    const reqId = oracleMatch[3] || oracleMatch[2];

    try {
      const apiUrl = `https://${domain}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails/${reqId}`;
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const item = data.items?.[0] || data;

        const title = item.Title || item.requisitionTitle || 'Lead Software Engineer';
        let company = 'Enterprise';
        if (domain.includes('jpmc')) company = 'JPMorganChase';
        else if (domain.includes('oracle')) company = 'Oracle';
        else {
          company = domain.split('.')[0].toUpperCase();
        }

        const location = item.PrimaryLocation || item.location || 'United States';
        const shortDesc = stripHtmlTags(item.ShortDescriptionStr || '');
        const responsibilities = stripHtmlTags(item.JobResponsibilitiesStr || item.ExternalResponsibilitiesStr || '');
        const qualifications = stripHtmlTags(item.ExternalQualificationsStr || item.RequiredQualificationsStr || '');
        const preferredQuals = stripHtmlTags(item.InternalQualificationsStr || item.PreferredQualificationsStr || '');
        const extDesc = stripHtmlTags(item.ExternalDescriptionStr || '');
        const orgDesc = stripHtmlTags(item.OrganizationDescriptionStr || item.CorporateDescriptionStr || '');

        const formattedText = `Job Title: ${title}
Company: ${company}
Location: ${location}
Requisition Number: ${reqId}
Job Function: ${item.JobFunctionCode || 'Technology / Engineering'}

Summary:
${shortDesc}

Job Responsibilities:
${responsibilities}

Required Qualifications & Skills:
${qualifications}

${preferredQuals ? `Preferred Qualifications:\n${preferredQuals}\n\n` : ''}
Full Job Description:
${extDesc}

About ${company}:
${orgDesc}`.trim();

        return {
          text: formattedText,
          title,
          company,
          location,
          portalType: 'ORACLE_CLOUD',
          requisitionId: reqId
        };
      }
    } catch (e) {
      console.warn('[Scraper] Oracle direct API fetch failed, falling back:', e);
    }
  }

  // 2. Greenhouse ATS
  const ghMatch = url.match(/boards\.greenhouse\.io\/(?:embed\/job_app\?for=)?([a-zA-Z0-9_\-]+).*?job[s]?[\/=]([0-9]+)/i)
    || url.match(/boards\.greenhouse\.io\/([a-zA-Z0-9_\-]+)\/jobs\/([0-9]+)/i);

  if (ghMatch) {
    const ghCompany = ghMatch[1];
    const ghJobId = ghMatch[2];
    try {
      const ghRes = await fetch(`https://api.greenhouse.io/v1/boards/${ghCompany}/jobs/${ghJobId}`);
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        const content = stripHtmlTags(ghData.content || '');
        const title = ghData.title;
        const location = ghData.location?.name || 'Remote / Hybrid';
        const formatted = `Job Title: ${title}\nCompany: ${ghCompany}\nLocation: ${location}\nRequisition ID: ${ghJobId}\n\nJob Description:\n${content}`;
        return {
          text: formatted,
          title,
          company: ghCompany.charAt(0).toUpperCase() + ghCompany.slice(1),
          location,
          portalType: 'GREENHOUSE',
          requisitionId: ghJobId
        };
      }
    } catch (e) {
      console.warn('[Scraper] Greenhouse API fetch failed:', e);
    }
  }

  // 3. Lever ATS
  const leverMatch = url.match(/jobs\.lever\.co\/([a-zA-Z0-9_\-]+)\/([a-zA-Z0-9_\-]+)/i);
  if (leverMatch) {
    const leverCompany = leverMatch[1];
    const leverJobId = leverMatch[2];
    try {
      const leverRes = await fetch(`https://api.lever.co/v0/postings/${leverCompany}/${leverJobId}`);
      if (leverRes.ok) {
        const leverData = await leverRes.json();
        const title = leverData.text;
        const location = leverData.categories?.location || leverData.categories?.workplaceType || 'Remote';
        const desc = leverData.descriptionPlain || stripHtmlTags(leverData.description || '');
        const lists = (leverData.lists || []).map((l: any) => `${l.text}:\n${stripHtmlTags(l.content)}`).join('\n\n');
        const formatted = `Job Title: ${title}\nCompany: ${leverCompany}\nLocation: ${location}\n\n${desc}\n\n${lists}`;
        return {
          text: formatted,
          title,
          company: leverCompany.charAt(0).toUpperCase() + leverCompany.slice(1),
          location,
          portalType: 'LEVER',
          requisitionId: leverJobId
        };
      }
    } catch (e) {
      console.warn('[Scraper] Lever API fetch failed:', e);
    }
  }

  // 4. Generic Direct HTML Fetch & JSON-LD / Meta Parsing
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (res.ok) {
      const html = await res.text();

      const jsonLdMatches = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const m of jsonLdMatches) {
        try {
          const parsed = JSON.parse(m[1].trim());
          const jobObj = Array.isArray(parsed) ? parsed.find(p => p['@type'] === 'JobPosting') : (parsed['@type'] === 'JobPosting' ? parsed : null);
          if (jobObj && jobObj.description) {
            const title = jobObj.title;
            const company = jobObj.hiringOrganization?.name;
            const location = jobObj.jobLocation?.address?.addressLocality || jobObj.jobLocation?.address?.addressRegion || 'Remote';
            const desc = stripHtmlTags(jobObj.description);
            const formatted = `Job Title: ${title || 'Software Engineer'}\nCompany: ${company || ''}\nLocation: ${location}\n\nJob Description:\n${desc}`;
            return {
              text: formatted,
              title,
              company,
              location,
              portalType: 'GENERIC'
            };
          }
        } catch (_) {}
      }

      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const ogSiteMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);

      let text = stripHtmlTags(html);
      if (text.length > 8000) {
        text = text.substring(0, 8000);
      }

      if (text.length > 250) {
        return {
          text,
          title: ogTitleMatch ? ogTitleMatch[1] : undefined,
          company: ogSiteMatch ? ogSiteMatch[1] : undefined,
          portalType: 'GENERIC'
        };
      }
    }
  } catch (e) {
    console.warn('[Scraper] Direct HTML scrape failed:', e);
  }

  // 5. Gemini Google Search Grounding Fallback
  if (ai) {
    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
    const searchPrompt = `Extract complete and accurate job posting information for this specific URL or requisition:
"${url}"

You MUST search the web for this exact job link / requisition.
Return a structured JSON object:
{
  "title": string (job title),
  "company": string (company name),
  "location": string (job location),
  "requisitionId": string (requisition number if available),
  "portalType": string ("ORACLE_CLOUD" | "WORKDAY" | "GREENHOUSE" | "LEVER" | "GENERIC"),
  "jobDescription": string (the complete, detailed job description with responsibilities, required skills, and qualifications)
}

Return ONLY valid JSON.`;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: searchPrompt,
          config: {
            responseMimeType: 'application/json',
            tools: [{ googleSearch: {} }]
          }
        });

        const extracted = extractJsonFromText(response.text || '{}');
        if (extracted && extracted.jobDescription && extracted.jobDescription.length > 100) {
          return {
            text: extracted.jobDescription,
            title: extracted.title,
            company: extracted.company,
            location: extracted.location,
            portalType: extracted.portalType || 'GENERIC',
            requisitionId: extracted.requisitionId
          };
        }
      } catch (e) {
        console.warn(`[Scraper] Search Grounding on ${model} failed:`, e);
      }
    }
  }

  throw new Error('Could not automatically parse the job description from this URL. Please paste the JD text directly.');
}
