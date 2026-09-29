import test from 'node:test';
import assert from 'node:assert/strict';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { env, supabaseKey } from '../src/config/env.js';
import {
  uploadStorageFile,
  createProcessingJob,
  updateProcessingJob,
  createDocument,
  createObservation,
  createEvidenceLinks,
  createKnowledgeRelationships,
  reviewKnowledgeEntity
} from '../src/db/repository.js';

test('POLARWEAVE P0 Database & Storage Persistence Suite', async (t) => {
  const testRunId = uuidv4().slice(0, 8);
  const testDocId = `doc_test_${testRunId}`;
  const testJobId = `job_test_${testRunId}`;
  const testObsId = `obs_test_${testRunId}`;
  const testEviId = `evi_test_${testRunId}`;
  const testRelId = `rel_test_${testRunId}`;

  // Direct Supabase client simulating external/restarted consumer
  const directSb = createClient(env.SUPABASE_URL, supabaseKey!);

  await t.test('1. Supabase Storage: Uploads binary file to polarweave-assets bucket', async () => {
    const fileContent = Buffer.from(`POLARWEAVE AUTOMATED AUDIT VERIFICATION: ${testRunId}`);
    const result = await uploadStorageFile('documents', `audit_test_${testRunId}.txt`, fileContent, 'text/plain');

    assert.ok(result.storagePath, 'Storage path should be returned');
    assert.ok(result.publicUrl.includes('polarweave-assets'), 'Public URL must include polarweave-assets bucket');

    // Verify directly against Supabase Storage
    const { data, error } = await directSb.storage
      .from('polarweave-assets')
      .download(result.storagePath);

    assert.equal(error, null, 'File should be downloadable from Supabase Storage without error');
    assert.ok(data, 'Downloaded blob should exist');
  });

  await t.test('2. Processing Jobs: Creates and updates processing_jobs in PostgreSQL', async () => {
    const job = await createProcessingJob({
      id: testJobId,
      filename: `test_expedition_${testRunId}.pdf`,
      file_type: 'application/pdf',
      size_bytes: 1048576,
      status: 'processing',
      current_stage: 'uploaded',
      stages: [
        { name: 'uploaded', label: 'Uploaded', status: 'completed', progress: 100 },
        { name: 'parsed', label: 'Parsing', status: 'active', progress: 50 }
      ],
      progress: 25,
      started_at: new Date().toISOString()
    });

    assert.equal(job.id, testJobId);

    // Update job to completed
    await updateProcessingJob(testJobId, {
      status: 'completed',
      current_stage: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
      result_summary: { test: true }
    });

    // Verify directly from PostgreSQL
    const { data: dbJob, error } = await directSb
      .from('processing_jobs')
      .select('*')
      .eq('id', testJobId)
      .single();

    assert.equal(error, null);
    assert.equal(dbJob.id, testJobId);
    assert.equal(dbJob.status, 'completed');
    assert.equal(dbJob.progress, 100);
  });

  await t.test('3. Documents & Chunks: Persists document record and text chunks to PostgreSQL', async () => {
    const doc = await createDocument(
      {
        id: testDocId,
        filename: `report_${testRunId}.pdf`,
        storage_path: `documents/${testRunId}.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 524288,
        document_type: 'expedition_report',
        processing_status: 'completed',
        page_count: 5,
        metadata_json: { test_run: testRunId },
        created_at: new Date().toISOString()
      },
      [
        { page_number: 1, section: 'Abstract', content: 'Coastal ice shelf observation report.', token_count: 6 },
        { page_number: 2, section: 'Data', content: 'Borehole core depth reached 24 meters.', token_count: 7 }
      ]
    );

    assert.equal(doc.id, testDocId);

    // Verify document in PostgreSQL
    const { data: dbDoc, error: docErr } = await directSb
      .from('documents')
      .select('*')
      .eq('id', testDocId)
      .single();

    assert.equal(docErr, null);
    assert.equal(dbDoc.id, testDocId);
    assert.equal(dbDoc.filename, `report_${testRunId}.pdf`);

    // Verify chunks in PostgreSQL
    const { data: dbChunks, error: chunkErr } = await directSb
      .from('document_chunks')
      .select('*')
      .eq('document_id', testDocId);

    assert.equal(chunkErr, null);
    assert.equal(dbChunks.length, 2, 'Two document chunks should be persisted in DB');
  });

  await t.test('4. Structured Knowledge: Persists Observation to PostgreSQL', async () => {
    const obs = await createObservation({
      id: testObsId,
      expedition_id: 'exp_45_ant',
      title: `Glaciological Ice Density Measurement ${testRunId}`,
      description: 'In-situ ice core density verified at 918 kg/m3.',
      research_domain: 'Glaciology',
      observed_at: new Date().toISOString(),
      location_name: 'Bharati Research Station',
      confidence: 0.94,
      confidence_level: 'HIGH',
      verification_status: 'AI_EXTRACTED',
      created_at: new Date().toISOString()
    });

    assert.equal(obs.id, testObsId);

    // Verify observation in PostgreSQL
    const { data: dbObs, error } = await directSb
      .from('observations')
      .select('*')
      .eq('id', testObsId)
      .single();

    assert.equal(error, null);
    assert.equal(dbObs.id, testObsId);
    assert.equal(dbObs.verification_status, 'AI_EXTRACTED');
  });

  await t.test('5. Evidence Links: Persists provenance link to PostgreSQL', async () => {
    await createEvidenceLinks([
      {
        id: testEviId,
        knowledge_type: 'observation',
        knowledge_id: testObsId,
        source_type: 'pdf',
        source_id: testDocId,
        source_title: `report_${testRunId}.pdf`,
        page_number: 2,
        excerpt: 'Borehole core depth reached 24 meters.',
        confidence: 0.96,
        verification_status: 'AI_EXTRACTED',
        created_at: new Date().toISOString()
      }
    ]);

    // Verify evidence_links in PostgreSQL
    const { data: dbEvi, error } = await directSb
      .from('evidence_links')
      .select('*')
      .eq('id', testEviId)
      .single();

    assert.equal(error, null);
    assert.equal(dbEvi.id, testEviId);
    assert.equal(dbEvi.source_id, testDocId);
    assert.equal(dbEvi.knowledge_id, testObsId);
  });

  await t.test('6. Knowledge Relationships: Persists graph edge to PostgreSQL', async () => {
    await createKnowledgeRelationships([
      {
        id: testRelId,
        source_entity_type: 'observation',
        source_entity_id: testObsId,
        target_entity_type: 'report',
        target_entity_id: testDocId,
        relationship_type: 'RECORDED_IN',
        label: 'Source Report',
        confidence: 0.95,
        status: 'suggested',
        created_at: new Date().toISOString()
      }
    ]);

    // Verify relationship in PostgreSQL
    const { data: dbRel, error } = await directSb
      .from('knowledge_relationships')
      .select('*')
      .eq('id', testRelId)
      .single();

    assert.equal(error, null);
    assert.equal(dbRel.id, testRelId);
    assert.equal(dbRel.source_entity_id, testObsId);
    assert.equal(dbRel.target_entity_id, testDocId);
  });

  await t.test('7. Human Verification: Approves observation & writes to verification_records in PostgreSQL', async () => {
    const reviewResult = await reviewKnowledgeEntity('observation', testObsId, 'approve', {
      reviewer_name: 'Dr. Ananya Sengupta',
      notes: 'Confirmed by field ice core thermistor'
    });

    assert.equal(reviewResult.updated_entity.verification_status, 'VERIFIED');

    // Verify observation status changed in PostgreSQL
    const { data: dbObs } = await directSb
      .from('observations')
      .select('verification_status')
      .eq('id', testObsId)
      .single();

    assert.equal(dbObs?.verification_status, 'VERIFIED');

    // Verify verification_records row exists in PostgreSQL
    const { data: dbVer, error: verErr } = await directSb
      .from('verification_records')
      .select('*')
      .eq('entity_id', testObsId)
      .single();

    assert.equal(verErr, null);
    assert.equal(dbVer.status, 'approved');
    assert.equal(dbVer.reviewer_name, 'Dr. Ananya Sengupta');
  });

  await t.test('8. MANDATORY RESTART TEST: Cold Read Directly From Database', async () => {
    // Fresh client instance simulating server restart with empty memory
    const coldClient = createClient(env.SUPABASE_URL, supabaseKey!);

    const [jobRes, docRes, obsRes, eviRes, relRes, verRes] = await Promise.all([
      coldClient.from('processing_jobs').select('id, status').eq('id', testJobId).single(),
      coldClient.from('documents').select('id, filename').eq('id', testDocId).single(),
      coldClient.from('observations').select('id, verification_status').eq('id', testObsId).single(),
      coldClient.from('evidence_links').select('id, verification_status').eq('id', testEviId).single(),
      coldClient.from('knowledge_relationships').select('id').eq('id', testRelId).single(),
      coldClient.from('verification_records').select('id, status').eq('entity_id', testObsId).single()
    ]);

    assert.equal(jobRes.data?.id, testJobId, 'Job must survive restart in PostgreSQL');
    assert.equal(docRes.data?.id, testDocId, 'Document must survive restart in PostgreSQL');
    assert.equal(obsRes.data?.verification_status, 'VERIFIED', 'Verified Observation must survive restart');
    assert.equal(eviRes.data?.verification_status, 'VERIFIED', 'Verified Evidence must survive restart');
    assert.equal(relRes.data?.id, testRelId, 'Relationship edge must survive restart');
    assert.equal(verRes.data?.status, 'approved', 'Audit record must survive restart');
  });

  // Cleanup test artifacts
  await t.test('Cleanup: Remove test artifacts from PostgreSQL and Storage', async () => {
    await directSb.from('verification_records').delete().eq('entity_id', testObsId);
    await directSb.from('knowledge_relationships').delete().eq('id', testRelId);
    await directSb.from('evidence_links').delete().eq('id', testEviId);
    await directSb.from('observations').delete().eq('id', testObsId);
    await directSb.from('document_chunks').delete().eq('document_id', testDocId);
    await directSb.from('documents').delete().eq('id', testDocId);
    await directSb.from('processing_jobs').delete().eq('id', testJobId);
  });
});
