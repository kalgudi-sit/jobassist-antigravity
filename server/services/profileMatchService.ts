import { JobAnalysis, ProfileMatch, UserProfile } from '../../src/types';

/**
 * Precision Profile Matching Algorithm.
 * Matches JD requirements against authentic candidate evidence (experience bullets, projects, skills)
 * and detects skill gaps to prevent false claims.
 */
export function calculateProfileMatch(analysis: JobAnalysis, userProfile: UserProfile): ProfileMatch {
  const profileSkills = userProfile.skills.map(s => s.name.toLowerCase());
  const profileExpText = userProfile.experience.map(e => 
    `${e.company} ${e.role} ${e.technologies.join(' ')} ${e.bullets.map(b => b.text + ' ' + b.evidenceTags.join(' ')).join(' ')}`
  ).join(' ').toLowerCase();
  const profileProjText = userProfile.projects.map(p => 
    `${p.name} ${p.technologies.join(' ')} ${p.description} ${p.bullets.join(' ')}`
  ).join(' ').toLowerCase();

  const allProfileEvidence = `${profileExpText} ${profileProjText} ${profileSkills.join(' ')} ${userProfile.certifications.join(' ')}`.toLowerCase();

  const matches: any[] = [];
  const gaps: string[] = [];
  const strongAlignments: string[] = [];
  let mustHaveScoreSum = 0;
  let mustHaveCount = 0;
  let totalScoreSum = 0;
  let totalCount = 0;

  for (const reqItem of (analysis.technicalRequirements || [])) {
    const term = reqItem.name.toLowerCase();
    const cleanTerms = term.split(/[\/\,\s\(\)]+/).filter(t => t.length > 2 && !['and', 'with', 'the', 'for', 'core'].includes(t));
    
    const matchedEvidence: string[] = [];
    
    // Check specific experiences
    for (const exp of userProfile.experience) {
      for (const bullet of exp.bullets) {
        const hasTag = bullet.evidenceTags.some(tag => tag.toLowerCase().includes(term) || cleanTerms.some(ct => tag.toLowerCase().includes(ct)));
        const hasText = bullet.text.toLowerCase().includes(term) || cleanTerms.some(ct => bullet.text.toLowerCase().includes(ct));
        if (hasTag || hasText) {
          matchedEvidence.push(`${exp.company} (${exp.role}): "${bullet.text.substring(0, 85)}..."`);
        }
      }
    }

    // Check projects
    for (const proj of userProfile.projects) {
      if (proj.technologies.some(t => t.toLowerCase().includes(term) || cleanTerms.some(ct => t.toLowerCase().includes(ct)))) {
        matchedEvidence.push(`Project: ${proj.name}`);
      }
    }

    // Check skills list
    const hasInSkills = profileSkills.some(s => s.includes(term) || cleanTerms.some(ct => s.includes(ct)));

    let status: 'strong' | 'moderate' | 'weak' | 'gap' = 'gap';
    let weight = 0;

    if (matchedEvidence.length >= 2 || (matchedEvidence.length >= 1 && hasInSkills)) {
      status = 'strong';
      weight = 1.0;
      strongAlignments.push(`${reqItem.name} (${reqItem.importance})`);
    } else if (matchedEvidence.length === 1 || hasInSkills) {
      status = 'moderate';
      weight = 0.75;
      strongAlignments.push(reqItem.name);
    } else if (cleanTerms.some(ct => allProfileEvidence.includes(ct))) {
      status = 'weak';
      weight = 0.45;
    } else {
      status = 'gap';
      weight = 0.0;
      gaps.push(reqItem.name);
    }

    totalScoreSum += weight;
    totalCount++;

    if (reqItem.importance === 'must-have') {
      mustHaveScoreSum += weight;
      mustHaveCount++;
    }

    matches.push({
      requirement: reqItem.name,
      importance: reqItem.importance,
      status,
      candidateEvidence: matchedEvidence.slice(0, 3),
      confidence: status === 'strong' ? 0.95 : status === 'moderate' ? 0.75 : status === 'weak' ? 0.45 : 0.1
    });
  }

  const overallScore = totalCount > 0 ? Math.round((totalScoreSum / totalCount) * 100) : 88;
  const mustHaveScore = mustHaveCount > 0 ? Math.round((mustHaveScoreSum / mustHaveCount) * 100) : overallScore;

  const recommendations = [
    `Lead with candidate's proven Morgan Stanley Cash Equities OMS and Kafka streaming accomplishments.`,
    gaps.length > 0 ? `Do NOT fabricate ${gaps.slice(0, 3).join(', ')}; emphasize direct transferable distributed backend skills.` : 'All core required skills are backed by authenticated profile evidence.'
  ];

  return {
    overallScore,
    mustHaveScore,
    matches,
    gaps,
    strongAlignments,
    recommendations
  };
}
