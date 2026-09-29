import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ScientificStructuringOutputSchema,
  OutreachGenerationRequestSchema,
  ReviewActionSchema
} from '@polarweave/types';
import { parseTabularBuffer } from '../src/ingestion/parsers/tabularParser.js';
import { linkEvidenceCrossModal } from '../src/ai/linking.js';
import { queryAskTheEvidence } from '../src/ai/search.js';
import {
  DEMO_OBSERVATIONS,
  DEMO_DOCUMENTS,
  DEMO_DATASETS,
  DEMO_MEDIA
} from '../src/data/demoSeed.js';

describe('POLARWEAVE Ingestion & Structuring Pipeline Tests', () => {
  it('Validates Scientific Structuring Zod Schema', () => {
    const validData = {
      title: 'Larsemann Hills Fast Ice Core Survey',
      content_type: 'expedition_report',
      expedition: '45th Indian Scientific Expedition to Antarctica',
      locations: [{ value: 'Bharati Station', confidence: 0.98, source_reference: 'p. 17' }],
      researchers: [{ value: 'Dr. Rajesh Sharma', confidence: 0.95, source_reference: 'Author' }],
      research_domains: ['Glaciology'],
      observations: [
        {
          title: 'Surface ice thickness at 1.8m',
          description: 'Measured uncompressed fast-ice at 1.8 meters',
          research_domain: 'Glaciology',
          observed_at: '2026-01-14T06:30:00Z',
          confidence: 0.96,
          source_reference: 'report.pdf p.17',
          excerpt: 'Uncompressed fast-ice measured at 1.8m'
        }
      ],
      datasets: [{ title: 'Ice Soundings', variables: ['depth_m', 'thickness_m'] }],
      publications: [],
      media_references: [],
      activities: [],
      summary: 'Validated structured extraction.'
    };

    const parsed = ScientificStructuringOutputSchema.parse(validData);
    assert.strictEqual(parsed.observations[0].research_domain, 'Glaciology');
    assert.strictEqual(parsed.locations[0].value, 'Bharati Station');
  });

  it('Parses Tabular Sensor CSV with Variable Detection', () => {
    const csvContent = 'timestamp,core_id,depth_m,ice_thickness_m,density_kg_m3,temp_c\n2026-01-14,IC-45-42,21.0,1.80,918,-14.8\n';
    const buffer = Buffer.from(csvContent, 'utf-8');
    const result = parseTabularBuffer(buffer);

    assert.strictEqual(result.rowCount, 1);
    assert.ok(result.columns.some((c) => c.name === 'ice_thickness_m' && c.datatype === 'numeric'));
  });

  it('Discovers Cross-Modal Evidence Links Across Report, CSV, and Video', () => {
    const linking = linkEvidenceCrossModal({
      observations: [DEMO_OBSERVATIONS[0]],
      datasets: DEMO_DATASETS,
      documents: DEMO_DOCUMENTS,
      media: DEMO_MEDIA
    });

    assert.ok(linking.evidenceLinks.length >= 3, 'Should discover at least 3 multi-modal links');
    const hasPdf = linking.evidenceLinks.some((l) => l.source_type === 'pdf');
    const hasDataset = linking.evidenceLinks.some((l) => l.source_type === 'dataset');
    const hasVideo = linking.evidenceLinks.some((l) => l.source_type === 'video');

    assert.ok(hasPdf, 'Evidence chain includes PDF report');
    assert.ok(hasDataset, 'Evidence chain includes tabular dataset');
    assert.ok(hasVideo, 'Evidence chain includes interview video');
  });

  it('Executes Source-Grounded "Ask the Evidence" Query Without Hallucination', () => {
    const queryResult = queryAskTheEvidence('What evidence supports the ice observation from Expedition 45?');
    assert.strictEqual(queryResult.found, true);
    assert.ok(queryResult.evidence.length >= 3);
    assert.ok(queryResult.answer.includes('corroborated by'));

    // Test nonexistent query
    const unknownResult = queryAskTheEvidence('Nonexistent lunar alien findings');
    assert.strictEqual(unknownResult.found, false);
    assert.strictEqual(unknownResult.answer, 'No verified polar knowledge matching this query was found in the repository.');
  });

  it('Validates Review Action Schema', () => {
    const approveAction = { action: 'approve', notes: 'Scientist verified' };
    const validated = ReviewActionSchema.parse(approveAction);
    assert.strictEqual(validated.action, 'approve');
  });

  it('Validates Outreach Generation Request Schema', () => {
    const outreachReq = {
      source_knowledge_ids: ['obs_ice_thickness'],
      content_type: 'student_explainer',
      audience: 'student',
      tone: 'accessible'
    };
    const validated = OutreachGenerationRequestSchema.parse(outreachReq);
    assert.strictEqual(validated.content_type, 'student_explainer');
  });
});
