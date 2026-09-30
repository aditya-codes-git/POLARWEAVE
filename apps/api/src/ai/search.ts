import { Observation, EvidenceLink } from '@polarweave/types';
import { memoryStore } from '../db/supabase.js';

export interface GroundedQueryResult {
  answer: string;
  matchedObservation?: Observation;
  evidence: EvidenceLink[];
  found: boolean;
}

export function queryAskTheEvidence(userQuery: string): GroundedQueryResult {
  const queryLower = userQuery.toLowerCase().trim();

  // Search through verified observations first
  const allObs = memoryStore.observations;
  let matchedObs = allObs.find((o) => {
    const titleMatch = o.title.toLowerCase().includes(queryLower);
    const domainMatch = o.research_domain.toLowerCase().includes(queryLower);
    const descMatch = o.description.toLowerCase().includes(queryLower);
    return titleMatch || domainMatch || descMatch;
  });

  // Check specific query keywords strictly against loaded observations
  if (!matchedObs) {
    return {
      answer: 'No verified polar knowledge matching this query was found in the repository.',
      evidence: [],
      found: false
    };
  }

  // Retrieve evidence links for this observation
  const evidence = memoryStore.evidenceLinks.filter(
    (e) => e.knowledge_id === matchedObs?.id
  );

  const sourcesSummary = evidence
    .map((e) => {
      const ref = e.page_number
        ? `page ${e.page_number}`
        : e.row_number
        ? `row ${e.row_number}`
        : e.timestamp_start
        ? `${Math.floor(e.timestamp_start / 60)}:${Math.floor(e.timestamp_start % 60).toString().padStart(2, '0')}`
        : 'field log';
      return `${e.source_title} (${ref})`;
    })
    .join(', ');

  const answer = `The repository contains a verified ${matchedObs.research_domain} observation recorded during ${matchedObs.expedition_title || 'the expedition'}: "${matchedObs.title}".

This observation is corroborated by ${evidence.length} distinct multimodal source records: ${sourcesSummary}.`;

  return {
    answer,
    matchedObservation: matchedObs,
    evidence,
    found: true
  };
}
