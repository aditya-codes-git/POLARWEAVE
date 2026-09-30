import { supabase } from '../apps/api/src/db/supabase.js';

const API_BASE = 'http://localhost:5000';

async function runAdminReviewFlowTest() {
  console.log('==================================================');
  console.log('STARTING ADMIN REVIEW FLOW & ROLE SYNC TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      failed++;
    }
  }

  // 1. Check real uploaded observation obs_476dffe5 from user session
  console.log('\nTEST 1: Inspect Real Uploaded Observation obs_476dffe5');
  let realObs: any = null;
  if (supabase) {
    const { data, error } = await supabase
      .from('observations')
      .select('*')
      .eq('id', 'obs_476dffe5')
      .maybeSingle();

    if (data) {
      realObs = data;
      assert(realObs.id === 'obs_476dffe5', `Found real observation obs_476dffe5`);
      assert(realObs.created_by_name === 'Dr. Rajesh Sharma', `Author is Dr. Rajesh Sharma`);
      console.log(`    Current Status: ${realObs.verification_status}`);
      console.log(`    Title: "${realObs.title}"`);
    } else {
      console.log('    obs_476dffe5 not found in DB; will test on fresh seeded record.');
    }
  }

  // Target ID: either real obs_476dffe5 or newly seeded researcher observation
  const targetObsId = realObs ? 'obs_476dffe5' : `obs_flow_${Date.now().toString(16)}`;
  if (!realObs && supabase) {
    await supabase.from('observations').insert({
      id: targetObsId,
      title: 'Cost Reduction Estimates',
      description: 'Projected cost reductions across polar sensor hardware.',
      research_domain: 'Other',
      observed_at: new Date().toISOString(),
      location_name: 'India',
      confidence: 1.0,
      confidence_level: 'HIGH',
      verification_status: 'NEEDS_REVIEW',
      created_by: 'usr_researcher_sharma',
      created_by_name: 'Dr. Rajesh Sharma',
      demo: false
    });
  }

  // Reset status to NEEDS_REVIEW before test
  if (supabase) {
    await supabase
      .from('observations')
      .update({ verification_status: 'NEEDS_REVIEW' })
      .eq('id', targetObsId);
  }

  // -------------------------------------------------------------
  // TEST 2: Role Switch & Negative Test: Researcher Attempting Approval
  // -------------------------------------------------------------
  console.log('\nTEST 2: Researcher (Dr. Rajesh Sharma) attempting POST approve');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${targetObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-researcher-token'
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Researcher attempting to verify own finding'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 403, `HTTP status is 403 Forbidden (received ${res.status})`);
    assert(json.success === false, 'success is false');
    assert(json.error?.code === 'FORBIDDEN', `error code is FORBIDDEN (received "${json.error?.code}")`);
  } catch (err: any) {
    console.error('Test 2 error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Knowledge Admin (Dr. Sunita Bose) Legitimate Approval
  // -------------------------------------------------------------
  console.log('\nTEST 3: Knowledge Admin (Dr. Sunita Bose) legitimate POST approve');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${targetObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-admin-token'
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Officially verified and approved by Knowledge Admin Dr. Sunita Bose'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 200, `HTTP status is 200 OK (received ${res.status})`);
    assert(json.success === true, 'success is true');
    assert(
      json.data?.updated_entity?.verification_status === 'VERIFIED',
      `Updated entity verification_status is VERIFIED`
    );
    assert(
      json.data?.audit_record?.reviewer_name?.includes('Sunita Bose') || json.data?.audit_record?.reviewer_id === 'usr_admin_bose',
      `Audit record lists Admin reviewer (Dr. Sunita Bose)`
    );
  } catch (err: any) {
    console.error('Test 3 error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Database State & Verification Records Persistence
  // -------------------------------------------------------------
  console.log('\nTEST 4: Database State & Audit Trail Verification in Supabase');
  if (supabase) {
    const { data: dbObs } = await supabase
      .from('observations')
      .select('verification_status')
      .eq('id', targetObsId)
      .single();

    assert(dbObs?.verification_status === 'VERIFIED', `PostgreSQL observation verification_status is VERIFIED`);

    const { data: verRecords } = await supabase
      .from('verification_records')
      .select('*')
      .eq('entity_id', targetObsId)
      .order('reviewed_at', { ascending: false });

    assert((verRecords?.length || 0) >= 1, `verification_records row exists in PostgreSQL`);
    const latestAudit = verRecords?.[0];
    assert(latestAudit?.status === 'approved', `verification_record status is "approved"`);
    assert(
      latestAudit?.reviewer_name?.includes('Sunita Bose') || latestAudit?.reviewer_name?.includes('Admin'),
      `verification_record reviewer_name is "${latestAudit?.reviewer_name}"`
    );
  }

  console.log('\n==================================================');
  if (failed === 0) {
    console.log(`ALL ${passed} ADMIN REVIEW FLOW TESTS PASSED (100% VERIFIED)`);
  } else {
    console.error(`COMPLETED WITH ${failed} FAILURES (${passed} passed)`);
    process.exit(1);
  }
  console.log('==================================================\n');
}

runAdminReviewFlowTest().catch((err) => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
