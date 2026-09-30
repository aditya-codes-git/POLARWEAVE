/**
 * POLARWEAVE — INGESTION PIPELINE ISOLATION REGRESSION TEST SUITE
 * 
 * Verifies:
 * 1. Uploaded PDF with unique markers produces observations strictly derived from its text.
 * 2. Uploaded image produces visual analysis derived from its content without Antarctic hallucination.
 * 3. Processing Job isolation guarantees Job A cannot see Job B data.
 * 4. Real ingestion never receives seeded demo fixtures (REAL INGESTION ≠ DEMO DATA).
 * 5. Database scoping accurately isolates real records (demo = false) from seeded fixtures.
 */

import { v4 as uuidv4 } from 'uuid';
import { parsePdfBuffer } from '../apps/api/src/ingestion/parsers/pdfParser.js';
import { structureScientificDocument, analyzeImageContent } from '../apps/api/src/ai/gemini.js';
import { linkEvidenceCrossModal } from '../apps/api/src/ai/linking.js';
import {
  createProcessingJob,
  createDocument,
  createMediaAsset,
  createObservation,
  createMeasurements,
  createEvidenceLinks,
  getObservations,
  getObservationById,
  getEvidenceByKnowledgeId,
  getKnowledgeGraphData
} from '../apps/api/src/db/repository.js';
import { Observation, Document as PolarDocument, MediaAsset } from '@polarweave/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTestSuite() {
  console.log('\n==================================================');
  console.log('STARTING POLARWEAVE INGESTION ISOLATION TEST SUITE');
  console.log('==================================================\n');

  // -------------------------------------------------------------------------
  // TEST A: UNIQUE PDF INGESTION & ZERO CONTAMINATION
  // -------------------------------------------------------------------------
  console.log('TEST 1: Ingest unique PDF with marker POLARWEAVE_TEST_9842');
  
  const uniquePdfText = `POLARWEAVE UNIQUE TEST 784291
POLARWEAVE_TEST_9842
Project: POLARWEAVE TEST DOCUMENT
Subject: Blue Ocean Sensor Calibration
Location: TEST LOCATION ALPHA
Unique observation: Temperature marker 47.31`;

  const pdfBuffer = Buffer.from(`%PDF-1.4
stream
BT
(POLARWEAVE UNIQUE TEST 784291) Tj T*
(POLARWEAVE_TEST_9842) Tj T*
(Project: POLARWEAVE TEST DOCUMENT) Tj T*
(Subject: Blue Ocean Sensor Calibration) Tj T*
(Location: TEST LOCATION ALPHA) Tj T*
(Unique observation: Temperature marker 47.31) Tj
ET
endstream
%%EOF`);

  const parsedPdf = await parsePdfBuffer(pdfBuffer);
  assert(parsedPdf.text.includes('POLARWEAVE_TEST_9842'), 'PDF parser extracted unique marker POLARWEAVE_TEST_9842');
  assert(parsedPdf.text.includes('Temperature marker 47.31'), 'PDF parser extracted Temperature marker 47.31');

  // Run structuring
  const structuring = await structureScientificDocument('unique_test_document.pdf', parsedPdf.text, parsedPdf.pages);
  assert(structuring.observations.length > 0, 'Structuring generated at least 1 observation');

  const obs = structuring.observations[0];
  console.log('  Extracted Observation Title:', obs.title);
  console.log('  Extracted Location:', obs.location);
  console.log('  Extracted Domain:', obs.research_domain);

  // Assertions against contamination
  assert(
    obs.title.includes('Temperature marker 47.31') || obs.title.includes('Sensor Calibration') || obs.title.includes('Observation'),
    'Observation title originated from test document'
  );
  assert(obs.location === 'TEST LOCATION ALPHA', 'Location accurately extracted as TEST LOCATION ALPHA');
  assert(!obs.title.includes('fast-ice') && !obs.title.includes('1.80 m'), 'No fast-ice demo title present');
  assert(!obs.description.includes('Bharati') && !obs.description.includes('Larsemann'), 'No Antarctic demo locations injected');

  // Persist to job and verify provenance
  const jobId1 = `job_test_${uuidv4().slice(0, 8)}`;
  const docId1 = `doc_test_${uuidv4().slice(0, 8)}`;
  const obsId1 = `obs_test_${uuidv4().slice(0, 8)}`;

  await createProcessingJob({
    id: jobId1,
    filename: 'unique_test_document.pdf',
    file_type: 'application/pdf',
    size_bytes: pdfBuffer.length,
    status: 'completed',
    current_stage: 'completed',
    stages: [],
    progress: 100,
    started_at: new Date().toISOString()
  });

  const docRecord: PolarDocument = {
    id: docId1,
    filename: 'unique_test_document.pdf',
    storage_path: `documents/${docId1}.pdf`,
    mime_type: 'application/pdf',
    size_bytes: pdfBuffer.length,
    document_type: 'expedition_report',
    processing_status: 'completed',
    processing_job_id: jobId1,
    created_at: new Date().toISOString()
  };
  await createDocument(docRecord);

  const realObs: Observation = {
    id: obsId1,
    title: obs.title,
    description: obs.description,
    research_domain: obs.research_domain,
    observed_at: new Date().toISOString(),
    location_name: obs.location,
    confidence: obs.confidence,
    confidence_level: 'HIGH',
    verification_status: 'AI_EXTRACTED',
    processing_job_id: jobId1,
    source_file_id: docId1,
    source_file_name: 'unique_test_document.pdf',
    excerpt: obs.excerpt,
    demo: false,
    created_at: new Date().toISOString()
  };
  await createObservation(realObs);

  // Link evidence
  const linkingResult = linkEvidenceCrossModal({
    observations: [realObs],
    datasets: [],
    documents: [docRecord],
    media: [],
    processingJobId: jobId1
  });

  assert(linkingResult.evidenceLinks.length > 0, 'Cross-file linking created evidence link for document');
  const evidence = linkingResult.evidenceLinks[0];
  assert(evidence.source_id === docId1, `Evidence source_id matches uploaded docId (${docId1})`);
  assert(evidence.source_title === 'unique_test_document.pdf', 'Evidence source_title matches uploaded file');
  assert(!evidence.excerpt.includes('1.80 m') && !evidence.excerpt.includes('Coastal Fast-Ice'), 'Evidence does NOT contain synthetic Antarctic fast-ice excerpt');
  assert(evidence.excerpt.includes('Temperature marker 47.31') || evidence.excerpt.includes('Sensor Calibration'), 'Evidence excerpt contains real document text');

  await createEvidenceLinks(linkingResult.evidenceLinks);

  // -------------------------------------------------------------------------
  // TEST B: IMAGE INGESTION (NON-POLAR / DIABETIC RETINOPATHY SCAN)
  // -------------------------------------------------------------------------
  console.log('\nTEST 2: Ingest non-polar image (retinal fundus scan)');

  // 1x1 image buffer
  const sampleImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const imgAnalysis = await analyzeImageContent('diabetic_retinopathy_scan_01.jpg', sampleImageBuffer, 'image/jpeg');

  console.log('  Image Caption:', imgAnalysis.caption);
  console.log('  Detected Entities:', imgAnalysis.detected_entities);
  console.log('  Domain:', imgAnalysis.research_domain);
  console.log('  Is Polar:', imgAnalysis.is_polar_related);

  assert(imgAnalysis.is_polar_related === false, 'Image is correctly flagged as NOT polar');
  assert(!imgAnalysis.caption.toLowerCase().includes('iceberg'), 'Caption does NOT mention iceberg');
  assert(!imgAnalysis.caption.toLowerCase().includes('sea ice'), 'Caption does NOT mention sea ice');
  assert(!imgAnalysis.caption.toLowerCase().includes('bharati'), 'Caption does NOT mention Bharati');
  assert(!imgAnalysis.caption.toLowerCase().includes('glaciology'), 'Caption does NOT mention glaciology');
  assert(
    imgAnalysis.detected_entities.some(e => e.includes('retin') || e.includes('optic') || e.includes('vessel') || e.includes('diabetic') || e.includes('scan')),
    'Detected entities reflect image or domain-neutral identity'
  );

  // -------------------------------------------------------------------------
  // TEST C: MULTI-JOB ISOLATION (JOB A VS JOB B)
  // -------------------------------------------------------------------------
  console.log('\nTEST 3: Multi-Job Isolation between Job A and Job B');

  const jobIdA = `job_A_${uuidv4().slice(0, 8)}`;
  const jobIdB = `job_B_${uuidv4().slice(0, 8)}`;

  const obsA: Observation = {
    id: `obs_A_${uuidv4().slice(0, 8)}`,
    title: 'Alpha Wave Sensor Calibration A-101',
    description: 'Calibration for instrument cluster Alpha',
    research_domain: 'General Science',
    confidence: 0.95,
    confidence_level: 'HIGH',
    verification_status: 'AI_EXTRACTED',
    processing_job_id: jobIdA,
    source_file_id: 'doc_A',
    source_file_name: 'document_A.pdf',
    demo: false,
    created_at: new Date().toISOString()
  };

  const obsB: Observation = {
    id: `obs_B_${uuidv4().slice(0, 8)}`,
    title: 'Beta Depth Acoustic Survey B-202',
    description: 'Acoustic soundings from cluster Beta',
    research_domain: 'Oceanography',
    confidence: 0.95,
    confidence_level: 'HIGH',
    verification_status: 'AI_EXTRACTED',
    processing_job_id: jobIdB,
    source_file_id: 'doc_B',
    source_file_name: 'document_B.pdf',
    demo: false,
    created_at: new Date().toISOString()
  };

  await createObservation(obsA);
  await createObservation(obsB);

  // Query Job A
  const jobAResults = await getObservations({ job_id: jobIdA });
  assert(jobAResults.some((o) => o.id === obsA.id), 'Job A query returns Observation A');
  assert(!jobAResults.some((o) => o.id === obsB.id), 'Job A query DOES NOT contain Observation B (cross-job leakage prevented)');
  assert(!jobAResults.some((o) => o.id === 'obs_ice_thickness'), 'Job A query DOES NOT contain seeded demo observation');

  // Query Job B
  const jobBResults = await getObservations({ job_id: jobIdB });
  assert(jobBResults.some((o) => o.id === obsB.id), 'Job B query returns Observation B');
  assert(!jobBResults.some((o) => o.id === obsA.id), 'Job B query DOES NOT contain Observation A (cross-job leakage prevented)');
  assert(!jobBResults.some((o) => o.id === 'obs_ice_thickness'), 'Job B query DOES NOT contain seeded demo observation');

  // -------------------------------------------------------------------------
  // TEST D: REAL VS DEMO COEXISTENCE
  // -------------------------------------------------------------------------
  console.log('\nTEST 4: Real Ingestion vs Demo Coexistence');

  const realList = await getObservations({ scope: 'real' });
  assert(!realList.some((o) => o.demo === true), 'Real scope query contains ZERO demo records');
  assert(!realList.some((o) => o.id === 'obs_ice_thickness'), 'obs_ice_thickness is absent from real scope');

  const demoList = await getObservations({ scope: 'demo' });
  assert(demoList.every((o) => o.demo === true), 'Demo scope query contains ONLY demo records');
  assert(demoList.some((o) => o.id === 'obs_ice_thickness'), 'obs_ice_thickness is present in demo scope');

  // -------------------------------------------------------------------------
  // TEST E: KNOWLEDGE GRAPH SCOPING
  // -------------------------------------------------------------------------
  console.log('\nTEST 5: Knowledge Graph Scoping to Job ID');

  const jobAGraph = await getKnowledgeGraphData({ jobId: jobIdA });
  assert(jobAGraph.nodes.some((n) => n.id === obsA.id), 'Job A graph includes Observation A');
  assert(!jobAGraph.nodes.some((n) => n.id === obsB.id), 'Job A graph does NOT include Observation B');
  assert(!jobAGraph.nodes.some((n) => n.id === 'exp_45_ant'), 'Job A graph does NOT inject Expedition 45 demo expedition');
  assert(!jobAGraph.nodes.some((n) => n.id === 'loc_bharati'), 'Job A graph does NOT inject Bharati Station demo location');

  // -------------------------------------------------------------------------
  // TEST F: EVIDENCE TRACE ISOLATION
  // -------------------------------------------------------------------------
  console.log('\nTEST 6: Evidence Trace Provenance Scoping');

  const traceA = await getEvidenceByKnowledgeId(obsA.id);
  assert(traceA.knowledge_id === obsA.id, 'Trace knowledge_id matches Observation A');
  assert(!traceA.evidence_chain.some((l: any) => l.source_title?.includes('report_expedition_45')), 'Trace A does NOT contain report_expedition_45_final.pdf');
  assert(!traceA.evidence_chain.some((l: any) => l.source_title?.includes('ice_measurements_larsemann')), 'Trace A does NOT contain ice_measurements_larsemann.csv');
  assert(!traceA.evidence_chain.some((l: any) => l.source_title?.includes('scientist_interview')), 'Trace A does NOT contain scientist_interview.mp4');

  console.log('\n==================================================');
  console.log('ALL REGRESSION TESTS PASSED (100% ISOLATION VERIFIED)');
  console.log('==================================================\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ TEST RUNNER ERROR:', err);
  process.exit(1);
});
