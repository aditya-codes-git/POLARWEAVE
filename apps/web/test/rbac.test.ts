import test from 'node:test';
import assert from 'node:assert';
import { getNavigationForRole } from '../src/config/navigation.js';
import { DEMO_PROFILES, UserRole } from '../src/context/RoleContext.js';

test('RBAC Suite — Role Definitions & Navigation Isolation', async (t) => {
  await t.test('TEST 1: Researcher has correct sidebar items and does NOT have admin section', () => {
    const researcherNav = getNavigationForRole('researcher');
    assert.strictEqual(researcherNav.length, 1);
    const itemIds = researcherNav[0].items.map((i) => i.id);

    // Must have Ingest, Processing, Review Queue, Evidence Trace
    assert.ok(itemIds.includes('ingest'), 'Researcher must have Ingest');
    assert.ok(itemIds.includes('processing'), 'Researcher must have Processing');
    assert.ok(itemIds.includes('review'), 'Researcher must have Review');
    assert.ok(itemIds.includes('evidence'), 'Researcher must have Evidence Trace');

    // Must NOT have admin items
    assert.ok(!itemIds.includes('users'), 'Researcher must not have Users');
    assert.ok(!itemIds.includes('taxonomy'), 'Researcher must not have Taxonomy');
    assert.ok(!itemIds.includes('publishing'), 'Researcher must not have Publishing');
    assert.ok(!itemIds.includes('activity'), 'Researcher must not have System Activity');
  });

  await t.test('TEST 2: Admin has correct sidebar items and includes ADMINISTRATION section', () => {
    const adminNav = getNavigationForRole('admin');
    assert.strictEqual(adminNav.length, 2);

    const mainItemIds = adminNav[0].items.map((i) => i.id);
    assert.ok(mainItemIds.includes('review'), 'Admin must have Review Queue');
    assert.ok(mainItemIds.includes('evidence'), 'Admin must have Evidence Trace');

    // Administration section
    assert.strictEqual(adminNav[1].title, 'ADMINISTRATION');
    const adminItemIds = adminNav[1].items.map((i) => i.id);
    assert.ok(adminItemIds.includes('users'), 'Admin must have Users');
    assert.ok(adminItemIds.includes('taxonomy'), 'Admin must have Taxonomy');
    assert.ok(adminItemIds.includes('publishing'), 'Admin must have Publishing');
    assert.ok(adminItemIds.includes('activity'), 'Admin must have Activity');
    assert.ok(adminItemIds.includes('analytics'), 'Admin must have Analytics');
    assert.ok(adminItemIds.includes('settings'), 'Admin must have Settings');
  });

  await t.test('TEST 3: Public Explorer has editorial discovery sidebar and NEVER sees internal tools', () => {
    const publicNav = getNavigationForRole('public');
    const sectionTitles = publicNav.map((s) => s.title).filter(Boolean);
    assert.deepStrictEqual(sectionTitles, ['EXPLORE', 'LEARN', 'EVIDENCE']);

    const allPublicItemIds = publicNav.flatMap((s) => s.items.map((i) => i.id));
    assert.ok(allPublicItemIds.includes('explore-home'), 'Public must have Explore');
    assert.ok(allPublicItemIds.includes('explore-explainers'), 'Public must have Science Explainers');
    assert.ok(allPublicItemIds.includes('explore-evidence'), 'Public must have Explore Evidence');

    // NEVER see internal tools
    assert.ok(!allPublicItemIds.includes('ingest'), 'Public must NEVER see Ingest');
    assert.ok(!allPublicItemIds.includes('processing'), 'Public must NEVER see Processing Queue');
    assert.ok(!allPublicItemIds.includes('review'), 'Public must NEVER see Review Queue');
    assert.ok(!allPublicItemIds.includes('users'), 'Public must NEVER see Users');
    assert.ok(!allPublicItemIds.includes('taxonomy'), 'Public must NEVER see Taxonomy');
    assert.ok(!allPublicItemIds.includes('publishing'), 'Public must NEVER see Publishing Gate');
    assert.ok(!allPublicItemIds.includes('activity'), 'Public must NEVER see System Activity');
  });

  await t.test('TEST 11 & 12: Demo Identities and Safe Fallback validation', () => {
    assert.strictEqual(DEMO_PROFILES.researcher.name, 'Dr. Rajesh Sharma');
    assert.strictEqual(DEMO_PROFILES.researcher.badgeLabel, 'RESEARCHER');

    assert.strictEqual(DEMO_PROFILES.admin.name, 'Dr. Sunita Bose');
    assert.strictEqual(DEMO_PROFILES.admin.badgeLabel, 'KNOWLEDGE ADMIN');

    assert.strictEqual(DEMO_PROFILES.public.name, 'Public Explorer');
    assert.strictEqual(DEMO_PROFILES.public.badgeLabel, 'PUBLIC EXPLORER');
  });
});
