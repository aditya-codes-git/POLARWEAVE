import test from 'node:test';
import assert from 'node:assert';
import { getNavigationForRole } from '../src/config/navigation.js';

// Import all public pages to verify they are distinct, independent exports
import { ExplorePage } from '../src/pages/public/ExplorePage.js';
import { PublicKnowledgePage } from '../src/pages/public/PublicKnowledgePage.js';
import { PublicExpeditionsPage } from '../src/pages/public/PublicExpeditionsPage.js';
import { PublicResearchPage } from '../src/pages/public/PublicResearchPage.js';
import { PublicMediaPage } from '../src/pages/public/PublicMediaPage.js';
import { PublicExplainersPage } from '../src/pages/public/PublicExplainersPage.js';
import { PublicTopicsPage } from '../src/pages/public/PublicTopicsPage.js';
import { PublicEvidencePage } from '../src/pages/public/PublicEvidencePage.js';
import { PublicKnowledgeGraphPage } from '../src/pages/public/PublicKnowledgeGraphPage.js';
import { PublicSearchPage } from '../src/pages/public/PublicSearchPage.js';
import { PublicExpeditionDetailPage } from '../src/pages/public/PublicExpeditionDetailPage.js';
import { PublicKnowledgeDetailPage } from '../src/pages/public/PublicKnowledgeDetailPage.js';

test('PUBLIC EXPLORER ROUTE & ARCHITECTURE AUDIT SUITE', async (t) => {
  await t.test('1. Every major public navigation destination has a unique component (No Collision)', () => {
    const components = [
      ExplorePage,
      PublicKnowledgePage,
      PublicExpeditionsPage,
      PublicResearchPage,
      PublicMediaPage,
      PublicExplainersPage,
      PublicTopicsPage,
      PublicEvidencePage,
      PublicKnowledgeGraphPage,
      PublicSearchPage
    ];

    // Verify all components exist and are functions
    components.forEach((Comp, idx) => {
      assert.strictEqual(typeof Comp, 'function', `Component at index ${idx} must be a valid React functional component`);
    });

    // Check pairwise uniqueness: no two major public routes can share the same page component!
    const uniqueSet = new Set(components);
    assert.strictEqual(
      uniqueSet.size,
      10,
      `Expected exactly 10 distinct page components for public routes, but found ${uniqueSet.size}. Route collision detected!`
    );
  });

  await t.test('2. Public Navigation contains all 10 destinations with correct paths', () => {
    const publicNav = getNavigationForRole('public');
    const allItems = publicNav.flatMap((section) => section.items);

    const expectedRoutes = [
      { id: 'explore-home', to: '/explore', label: 'Explore' },
      { id: 'explore-knowledge', to: '/explore/knowledge', label: 'Knowledge' },
      { id: 'explore-expeditions', to: '/explore/expeditions', label: 'Expeditions' },
      { id: 'explore-research', to: '/explore/research', label: 'Research' },
      { id: 'explore-media', to: '/explore/media', label: 'Media' },
      { id: 'explore-explainers', to: '/explore/explainers', label: 'Science Explainers' },
      { id: 'explore-topics', to: '/explore/topics', label: 'Topics' },
      { id: 'explore-evidence', to: '/explore/evidence', label: 'Explore Evidence' },
      { id: 'explore-graph', to: '/explore/knowledge-graph', label: 'Knowledge Graph' },
      { id: 'explore-search', to: '/explore/search', label: 'Global Search' }
    ];

    expectedRoutes.forEach((expected) => {
      const match = allItems.find((item) => item.id === expected.id);
      assert.ok(match, `Public navigation must contain item with id: ${expected.id}`);
      assert.strictEqual(match.to, expected.to, `Item ${expected.id} must point to ${expected.to}`);
      assert.strictEqual(match.label, expected.label, `Item ${expected.id} must have label "${expected.label}"`);
    });
  });

  await t.test('3. Dedicated public detail pages exist and are unique components', () => {
    assert.strictEqual(typeof PublicExpeditionDetailPage, 'function');
    assert.strictEqual(typeof PublicKnowledgeDetailPage, 'function');

    // Detail pages must be distinct from listing pages
    assert.notStrictEqual(PublicExpeditionDetailPage, PublicExpeditionsPage);
    assert.notStrictEqual(PublicKnowledgeDetailPage, PublicKnowledgePage);
    assert.notStrictEqual(PublicExpeditionDetailPage, ExplorePage);
  });
});
