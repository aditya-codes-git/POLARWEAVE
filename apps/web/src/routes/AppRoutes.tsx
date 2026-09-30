import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { ExplorePage } from '../pages/public/ExplorePage';
import { PublicKnowledgePage } from '../pages/public/PublicKnowledgePage';
import { PublicExpeditionsPage } from '../pages/public/PublicExpeditionsPage';
import { PublicResearchPage } from '../pages/public/PublicResearchPage';
import { PublicMediaPage } from '../pages/public/PublicMediaPage';
import { PublicExplainersPage } from '../pages/public/PublicExplainersPage';
import { PublicTopicsPage } from '../pages/public/PublicTopicsPage';
import { PublicEvidencePage } from '../pages/public/PublicEvidencePage';
import { PublicKnowledgeGraphPage } from '../pages/public/PublicKnowledgeGraphPage';
import { PublicSearchPage } from '../pages/public/PublicSearchPage';
import { PublicExpeditionDetailPage } from '../pages/public/PublicExpeditionDetailPage';
import { PublicKnowledgeDetailPage } from '../pages/public/PublicKnowledgeDetailPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';

// Workspace Pages
import { DashboardPage } from '../pages/workspace/DashboardPage';
import { IngestPage } from '../pages/workspace/IngestPage';
import { ProcessingPage } from '../pages/workspace/ProcessingPage';
import { ReviewQueuePage } from '../pages/workspace/ReviewQueuePage';
import { ReviewDetailPage } from '../pages/workspace/ReviewDetailPage';
import { EvidenceTracePage } from '../pages/workspace/EvidenceTracePage';
import { KnowledgeGraphPage } from '../pages/workspace/KnowledgeGraphPage';
import { ExpeditionsManagerPage } from '../pages/workspace/ExpeditionsManagerPage';
import { DatasetExplorerPage } from '../pages/workspace/DatasetExplorerPage';
import { MediaLibraryPage } from '../pages/workspace/MediaLibraryPage';
import { OutreachStudioPage } from '../pages/workspace/OutreachStudioPage';
import { GlobalSearchPage } from '../pages/workspace/GlobalSearchPage';
import { AdminDashboardPage } from '../pages/workspace/AdminDashboardPage';
import { SettingsPage } from '../pages/workspace/SettingsPage';

// Admin-Only Governance Pages
import { AdminUsersPage } from '../pages/workspace/admin/AdminUsersPage';
import { AdminTaxonomyPage } from '../pages/workspace/admin/AdminTaxonomyPage';
import { AdminPublishingPage } from '../pages/workspace/admin/AdminPublishingPage';
import { AdminActivityPage } from '../pages/workspace/admin/AdminActivityPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. PUBLIC MARKETING & PORTAL ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Public Discovery Portal (rendered in AppShell with Public Sidebar) */}
      <Route path="/explore" element={<AppShell />}>
        <Route index element={<ExplorePage />} />
        <Route path="knowledge" element={<PublicKnowledgePage />} />
        <Route path="knowledge/:id" element={<PublicKnowledgeDetailPage />} />
        <Route path="expeditions" element={<PublicExpeditionsPage />} />
        <Route path="expeditions/:id" element={<PublicExpeditionDetailPage />} />
        <Route path="research" element={<PublicResearchPage />} />
        <Route path="research/:id" element={<PublicResearchPage />} />
        <Route path="media" element={<PublicMediaPage />} />
        <Route path="media/:id" element={<PublicMediaPage />} />
        <Route path="explainers" element={<PublicExplainersPage />} />
        <Route path="explainers/:id" element={<PublicExplainersPage />} />
        <Route path="topics" element={<PublicTopicsPage />} />
        <Route path="topics/:id" element={<PublicTopicsPage />} />
        <Route path="evidence" element={<PublicEvidencePage />} />
        <Route path="knowledge-graph" element={<PublicKnowledgeGraphPage />} />
        <Route path="graph" element={<Navigate to="/explore/knowledge-graph" replace />} />
        <Route path="search" element={<PublicSearchPage />} />
      </Route>

      {/* Public route aliases redirect to canonical public views */}
      <Route path="/expeditions" element={<Navigate to="/explore/expeditions" replace />} />
      <Route path="/expeditions/:id" element={<AppShell />}>
        <Route index element={<PublicExpeditionDetailPage />} />
      </Route>
      <Route path="/knowledge" element={<Navigate to="/explore/knowledge" replace />} />
      <Route path="/knowledge/:id" element={<AppShell />}>
        <Route index element={<PublicKnowledgeDetailPage />} />
      </Route>
      <Route path="/research" element={<Navigate to="/explore/research" replace />} />
      <Route path="/media" element={<Navigate to="/explore/media" replace />} />
      <Route path="/explainers" element={<Navigate to="/explore/explainers" replace />} />
      <Route path="/topics" element={<Navigate to="/explore/topics" replace />} />
      <Route path="/evidence" element={<Navigate to="/explore/evidence" replace />} />
      <Route path="/search" element={<Navigate to="/explore/search" replace />} />

      {/* 2. PROTECTED WORKSPACE ROUTES (Researcher & Admin only) */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute allowedRoles={['researcher', 'admin']} redirectPath="/explore">
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="ingest" element={<IngestPage />} />
        <Route path="processing" element={<ProcessingPage />} />
        <Route path="review" element={<ReviewQueuePage />} />
        <Route path="review/:id" element={<ReviewDetailPage />} />
        <Route path="evidence" element={<EvidenceTracePage />} />
        <Route path="knowledge" element={<KnowledgeGraphPage />} />
        <Route path="knowledge/:id" element={<KnowledgeGraphPage />} />
        <Route path="expeditions" element={<ExpeditionsManagerPage />} />
        <Route path="expeditions/:id" element={<ExpeditionsManagerPage />} />
        <Route path="datasets" element={<DatasetExplorerPage />} />
        <Route path="datasets/:id" element={<DatasetExplorerPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="outreach" element={<OutreachStudioPage />} />
        <Route path="search" element={<GlobalSearchPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* 3. ADMIN-ONLY GOVERNANCE ROUTES (Admin only) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} redirectPath="/workspace" />}>
          <Route path="admin" element={<Navigate to="/workspace/admin/users" replace />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/taxonomy" element={<AdminTaxonomyPage />} />
          <Route path="admin/publishing" element={<AdminPublishingPage />} />
          <Route path="admin/activity" element={<AdminActivityPage />} />
          <Route path="admin/analytics" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
