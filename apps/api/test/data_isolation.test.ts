import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getObservations, getProcessingJobs, createObservation, createProcessingJob } from '../src/db/repository.js';
import { Observation, ProcessingJob } from '@polarweave/types';

describe('Data Ownership and Caller Scoping Isolation Tests', () => {
  it('Researcher queries only return records authored by that researcher', async () => {
    const userA_Id = 'usr_uuid_user_a_' + Date.now();
    const userB_Id = 'usr_uuid_user_b_' + Date.now();

    const obsUserA: Observation = {
      id: `obs_test_a_${Date.now()}`,
      title: 'User A Glaciology Finding',
      description: 'Glaciology measurement by user A',
      research_domain: 'Glaciology',
      confidence: 0.95,
      confidence_level: 'HIGH',
      verification_status: 'NEEDS_REVIEW',
      created_by: userA_Id,
      created_by_name: 'Dr. User A',
      demo: false,
      created_at: new Date().toISOString()
    };

    const obsUserB: Observation = {
      id: `obs_test_b_${Date.now()}`,
      title: 'User B Biology Finding',
      description: 'Biology observation by user B',
      research_domain: 'Biology & Ecology',
      confidence: 0.92,
      confidence_level: 'HIGH',
      verification_status: 'NEEDS_REVIEW',
      created_by: userB_Id,
      created_by_name: 'Dr. User B',
      demo: false,
      created_at: new Date().toISOString()
    };

    await createObservation(obsUserA);
    await createObservation(obsUserB);

    // Query as User A (scoped to created_by: userA_Id)
    const resultsUserA = await getObservations({ created_by: userA_Id });
    assert.ok(resultsUserA.length > 0, 'User A should receive their own observation');
    assert.ok(resultsUserA.every((o) => o.created_by === userA_Id), 'All returned observations must belong to User A');
    assert.ok(!resultsUserA.some((o) => o.created_by === userB_Id), 'User A must NOT receive User B records');

    // Query as User B (scoped to created_by: userB_Id)
    const resultsUserB = await getObservations({ created_by: userB_Id });
    assert.ok(resultsUserB.length > 0, 'User B should receive their own observation');
    assert.ok(resultsUserB.every((o) => o.created_by === userB_Id), 'All returned observations must belong to User B');
    assert.ok(!resultsUserB.some((o) => o.created_by === userA_Id), 'User B must NOT receive User A records');

    // Query for a new user with 0 records
    const newUserId = 'usr_uuid_new_user_' + Date.now();
    const resultsNewUser = await getObservations({ created_by: newUserId });
    assert.strictEqual(resultsNewUser.length, 0, 'New user with no records must receive empty array, NOT demo/Rajesh data');
  });

  it('Processing jobs are strictly scoped to the researcher who ingested them', async () => {
    const userA_Id = 'usr_uuid_job_a_' + Date.now();
    const userB_Id = 'usr_uuid_job_b_' + Date.now();

    const jobA: ProcessingJob = {
      id: `job_test_a_${Date.now()}`,
      filename: 'FieldReport_UserA.pdf',
      file_type: 'application/pdf',
      size_bytes: 1024,
      status: 'completed',
      current_stage: 'completed',
      stages: [],
      progress: 100,
      created_by: userA_Id,
      created_by_name: 'Researcher A',
      started_at: new Date().toISOString()
    };

    const jobB: ProcessingJob = {
      id: `job_test_b_${Date.now()}`,
      filename: 'FieldReport_UserB.pdf',
      file_type: 'application/pdf',
      size_bytes: 2048,
      status: 'completed',
      current_stage: 'completed',
      stages: [],
      progress: 100,
      created_by: userB_Id,
      created_by_name: 'Researcher B',
      started_at: new Date().toISOString()
    };

    await createProcessingJob(jobA);
    await createProcessingJob(jobB);

    // Researcher A fetching jobs
    const jobsUserA = await getProcessingJobs(userA_Id, 'researcher');
    assert.ok(jobsUserA.some((j) => j.id === jobA.id));
    assert.ok(!jobsUserA.some((j) => j.id === jobB.id), 'Researcher A must not see Researcher B jobs');

    // Researcher B fetching jobs
    const jobsUserB = await getProcessingJobs(userB_Id, 'researcher');
    assert.ok(jobsUserB.some((j) => j.id === jobB.id));
    assert.ok(!jobsUserB.some((j) => j.id === jobA.id), 'Researcher B must not see Researcher A jobs');

    // Admin fetching jobs sees both
    const jobsAdmin = await getProcessingJobs(undefined, 'admin');
    assert.ok(jobsAdmin.some((j) => j.id === jobA.id));
    assert.ok(jobsAdmin.some((j) => j.id === jobB.id));
  });
});
