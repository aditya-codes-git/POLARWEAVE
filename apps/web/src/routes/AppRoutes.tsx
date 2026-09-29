import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { ExplorePage } from '../pages/public/ExplorePage';

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

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/expeditions" element={<ExplorePage />} />
      <Route path="/research" element={<ExplorePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Authenticated Workspace */}
      <Route path="/workspace" element={<AppShell />}>
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
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
