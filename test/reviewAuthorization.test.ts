import { supabase } from '../apps/api/src/db/supabase.js';

const API_BASE = 'http://localhost:5000';

async function runReviewAuthorizationTestSuite() {
  console.log('==================================================');
  console.log('STARTING POLARWEAVE REVIEW & RBAC AUTHORIZATION TEST SUITE');
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

  // Generate a unique test observation ID
  const testObsId = `obs_auth_test_${Date.now().toString(16)}`;
  const testTitle = `Polarimetric Ice Radar Measurement #${Date.now().toString(16).slice(-4)}`;

  console.log(`[SETUP] Seeding unverified test observation (${testObsId}) created by Researcher Dr. Rajesh Sharma...`);
  
  if (supabase) {
    const { error: insErr } = await supabase.from('observations').insert({
      id: testObsId,
      title: testTitle,
      description: 'Raw high-frequency radar sounding of coastal ice shelf.',
      research_domain: 'Glaciology',
      observed_at: new Date().toISOString(),
      location_name: 'Bharati Station East Shelf',
      confidence: 0.94,
      confidence_level: 'HIGH',
      verification_status: 'NEEDS_REVIEW',
      created_by: 'usr_researcher_sharma',
      created_by_name: 'Dr. Rajesh Sharma',
      demo: false
    });
    if (insErr) {
      console.error('[SETUP ERROR] Failed to insert test observation in DB:', insErr.message);
    }
  }

  // Count existing verification records for baseline
  let initialVerRecordsCount = 0;
  if (supabase) {
    const { data: verRows } = await supabase
      .from('verification_records')
      .select('id')
      .eq('entity_id', testObsId);
    initialVerRecordsCount = verRows?.length || 0;
  }

  // -------------------------------------------------------------
  // TEST 1: Researcher Attempting POST Approve -> Must return 403
  // -------------------------------------------------------------
  console.log('\nTEST 1: Researcher Attempting POST Approve');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${testObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-researcher-token'
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Researcher attempting unauthorized self-approval'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 403, `HTTP Status is 403 Forbidden (received ${res.status})`);
    assert(json.success === false, 'Response indicates success: false');
    assert(json.error?.code === 'FORBIDDEN', `Error code is FORBIDDEN (received "${json.error?.code}")`);
    assert(
      json.error?.message?.includes('Only Knowledge Admins') || json.error?.message?.includes('Self-approval is prohibited'),
      `Error message rejects unauthorized approval (received: "${json.error?.message}")`
    );
  } catch (err: any) {
    console.error('Test 1 network/runtime error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 2: Researcher Attempting POST Reject -> Must return 403
  // -------------------------------------------------------------
  console.log('\nTEST 2: Researcher Attempting POST Reject');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${testObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-researcher-token'
      },
      body: JSON.stringify({
        action: 'reject',
        notes: 'Researcher attempting unauthorized rejection'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 403, `HTTP Status is 403 Forbidden (received ${res.status})`);
    assert(json.success === false, 'Response indicates success: false');
    assert(json.error?.code === 'FORBIDDEN', `Error code is FORBIDDEN (received "${json.error?.code}")`);
  } catch (err: any) {
    console.error('Test 2 network/runtime error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Public Explorer Attempting POST Approve -> Must return 403
  // -------------------------------------------------------------
  console.log('\nTEST 3: Public Explorer Attempting POST Approve');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${testObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-public-token'
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Public user attempting approval'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 403, `HTTP Status is 403 Forbidden (received ${res.status})`);
    assert(json.success === false, 'Response indicates success: false');
    assert(json.error?.code === 'FORBIDDEN', `Error code is FORBIDDEN (received "${json.error?.code}")`);
  } catch (err: any) {
    console.error('Test 3 network/runtime error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Anonymous / Unauthenticated Caller Attempting POST Approve -> Must return 403
  // -------------------------------------------------------------
  console.log('\nTEST 4: Anonymous Caller Attempting POST Approve (No Auth Header)');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${testObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Anonymous attempting approval'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 403, `HTTP Status is 403 Forbidden (received ${res.status})`);
    assert(json.success === false, 'Response indicates success: false');
  } catch (err: any) {
    console.error('Test 4 network/runtime error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 5: Database State Verification after Failed Researcher Attempts
  // -------------------------------------------------------------
  console.log('\nTEST 5: Database Integrity Check (Negative Test Verification)');
  if (supabase) {
    const { data: currentObs } = await supabase
      .from('observations')
      .select('verification_status')
      .eq('id', testObsId)
      .single();

    assert(
      currentObs?.verification_status === 'NEEDS_REVIEW' || currentObs?.verification_status === 'AI_EXTRACTED',
      `Observation verification_status remains unverified (current: ${currentObs?.verification_status})`
    );
    assert(
      currentObs?.verification_status !== 'VERIFIED',
      'Observation was NOT promoted to VERIFIED by failed researcher/public calls'
    );

    const { data: verRecords } = await supabase
      .from('verification_records')
      .select('id')
      .eq('entity_id', testObsId);

    assert(
      (verRecords?.length || 0) === initialVerRecordsCount,
      `NO verification_records row created for unauthorized attempts (count: ${verRecords?.length || 0})`
    );
  }

  // -------------------------------------------------------------
  // TEST 6: Knowledge Admin POST Approve -> Must return 200 & Persist
  // -------------------------------------------------------------
  console.log('\nTEST 6: Knowledge Admin (Dr. Sunita Bose) Legitimate POST Approve');
  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${testObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-admin-token'
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Officially verified and signed-off by NCPOR Knowledge Admin Dr. Sunita Bose'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 200, `HTTP Status is 200 OK (received ${res.status})`);
    assert(json.success === true, 'Response indicates success: true');
    assert(
      json.data?.updated_entity?.verification_status === 'VERIFIED',
      `Updated entity verification_status is VERIFIED (received: "${json.data?.updated_entity?.verification_status}")`
    );
    assert(
      json.data?.audit_record?.reviewer_name?.includes('Sunita Bose') || json.data?.audit_record?.reviewer_id === 'usr_admin_bose',
      `Audit record lists Knowledge Admin reviewer (${json.data?.audit_record?.reviewer_name})`
    );
  } catch (err: any) {
    console.error('Test 6 network/runtime error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 7: Database Verification after Knowledge Admin Approval
  // -------------------------------------------------------------
  console.log('\nTEST 7: Database Audit Trail Verification after Admin Approval');
  if (supabase) {
    const { data: verifiedObs } = await supabase
      .from('observations')
      .select('verification_status')
      .eq('id', testObsId)
      .single();

    assert(
      verifiedObs?.verification_status === 'VERIFIED',
      `Database observation verification_status is persistently VERIFIED`
    );

    const { data: finalVerRecords } = await supabase
      .from('verification_records')
      .select('*')
      .eq('entity_id', testObsId);

    assert(
      (finalVerRecords?.length || 0) >= 1,
      `verification_records row was successfully created in PostgreSQL (count: ${finalVerRecords?.length})`
    );

    const auditRow = finalVerRecords?.[0];
    if (auditRow) {
      assert(
        auditRow.status === 'approved',
        `Verification record audit status is "approved"`
      );
      assert(
        auditRow.reviewer_name?.includes('Sunita Bose') || auditRow.reviewer_name?.includes('Admin'),
        `Verification record lists Admin reviewer name: "${auditRow.reviewer_name}"`
      );
    }
  }

  // -------------------------------------------------------------
  // TEST 8: Knowledge Admin POST Reject on Second Observation
  // -------------------------------------------------------------
  console.log('\nTEST 8: Knowledge Admin Legitimate POST Reject');
  const rejectObsId = `obs_rej_test_${Date.now().toString(16)}`;
  if (supabase) {
    await supabase.from('observations').insert({
      id: rejectObsId,
      title: 'Questionable Ice Core Sample Data',
      description: 'Anomalous core data missing calibration certificates.',
      research_domain: 'Glaciology',
      confidence: 0.45,
      confidence_level: 'LOW',
      verification_status: 'NEEDS_REVIEW',
      created_by: 'usr_researcher_sharma',
      created_by_name: 'Dr. Rajesh Sharma',
      demo: false
    });
  }

  try {
    const res = await fetch(`${API_BASE}/api/review/observation/${rejectObsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-admin-token'
      },
      body: JSON.stringify({
        action: 'reject',
        notes: 'Rejected by Knowledge Admin: requires laboratory recalibration before archiving.'
      })
    });

    const json = await res.json().catch(() => ({}));
    assert(res.status === 200, `HTTP Status is 200 OK (received ${res.status})`);
    assert(json.success === true, 'Response indicates success: true');
    assert(
      json.data?.updated_entity?.verification_status === 'REJECTED',
      `Updated entity verification_status is REJECTED (received: "${json.data?.updated_entity?.verification_status}")`
    );
  } catch (err: any) {
    console.error('Test 8 network/runtime error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 9: Clean up test observations
  // -------------------------------------------------------------
  if (supabase) {
    await supabase.from('verification_records').delete().eq('entity_id', testObsId);
    await supabase.from('verification_records').delete().eq('entity_id', rejectObsId);
    await supabase.from('observations').delete().eq('id', testObsId);
    await supabase.from('observations').delete().eq('id', rejectObsId);
  }

  console.log('\n==================================================');
  if (failed === 0) {
    console.log(`ALL ${passed} RBAC AUTHORIZATION TESTS PASSED (100% SECURE)`);
  } else {
    console.error(`COMPLETED WITH ${failed} FAILURES (${passed} passed)`);
    process.exit(1);
  }
  console.log('==================================================\n');
}

runReviewAuthorizationTestSuite().catch((err) => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
