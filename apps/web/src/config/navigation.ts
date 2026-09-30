import { LucideIcon } from 'lucide-react';
import {
  Activity,
  UploadCloud,
  Layers,
  FileCheck,
  Shield,
  Compass,
  Database,
  Film,
  Share2,
  Search,
  Users,
  GitBranch,
  Send,
  Cpu,
  BarChart3,
  Settings,
  Globe,
  BookOpen,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { UserRole } from '../context/RoleContext';

export interface NavigationItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
  highlight?: boolean;
  exact?: boolean;
  description?: string;
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

// 1. RESEARCHER NAVIGATION (CREATE)
export const researcherNavigation: NavigationSection[] = [
  {
    items: [
      { id: 'overview', label: 'Overview', to: '/workspace', icon: Activity, exact: true },
      { id: 'ingest', label: 'Ingest', to: '/workspace/ingest', icon: UploadCloud, badge: 'Hero' },
      { id: 'processing', label: 'Processing Queue', to: '/workspace/processing', icon: Layers },
      { id: 'review', label: 'Review Queue', to: '/workspace/review', icon: FileCheck },
      { id: 'evidence', label: 'Evidence Trace', to: '/workspace/evidence', icon: Shield, highlight: true },
      { id: 'knowledge', label: 'Knowledge Graph', to: '/workspace/knowledge', icon: Compass },
      { id: 'expeditions', label: 'Expeditions', to: '/workspace/expeditions', icon: Compass },
      { id: 'datasets', label: 'Datasets', to: '/workspace/datasets', icon: Database },
      { id: 'media', label: 'Media Library', to: '/workspace/media', icon: Film },
      { id: 'outreach', label: 'Outreach Studio', to: '/workspace/outreach', icon: Share2 },
      { id: 'search', label: 'Global Search', to: '/workspace/search', icon: Search }
    ]
  }
];

// 2. KNOWLEDGE ADMIN NAVIGATION (GOVERN)
export const adminNavigation: NavigationSection[] = [
  {
    items: [
      { id: 'overview', label: 'Overview', to: '/workspace', icon: Activity, exact: true },
      { id: 'review', label: 'Review Queue', to: '/workspace/review', icon: FileCheck, highlight: true },
      { id: 'evidence', label: 'Evidence Trace', to: '/workspace/evidence', icon: Shield, highlight: true },
      { id: 'knowledge-graph', label: 'Knowledge Graph', to: '/workspace/knowledge', icon: Compass },
      { id: 'expeditions', label: 'Expeditions', to: '/workspace/expeditions', icon: Compass },
      { id: 'datasets', label: 'Datasets', to: '/workspace/datasets', icon: Database },
      { id: 'media', label: 'Media Library', to: '/workspace/media', icon: Film },
      { id: 'outreach', label: 'Outreach Studio', to: '/workspace/outreach', icon: Share2 },
      { id: 'search', label: 'Global Search', to: '/workspace/search', icon: Search }
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { id: 'users', label: 'Users', to: '/workspace/admin/users', icon: Users, description: 'Researcher access & roles' },
      { id: 'taxonomy', label: 'Taxonomy', to: '/workspace/admin/taxonomy', icon: GitBranch, description: 'Polar domains & ontology' },
      { id: 'publishing', label: 'Publishing', to: '/workspace/admin/publishing', icon: Send, badge: 'Gate' },
      { id: 'activity', label: 'Activity', to: '/workspace/admin/activity', icon: Cpu, description: 'Parsing & audit logs' },
      { id: 'analytics', label: 'Analytics', to: '/workspace/admin/analytics', icon: BarChart3, description: 'Repository metrics & telemetry' },
      { id: 'settings', label: 'Settings', to: '/workspace/settings', icon: Settings, description: 'System configuration' }
    ]
  }
];

// 3. PUBLIC EXPLORER NAVIGATION (EXPLORE)
export const publicNavigation: NavigationSection[] = [
  {
    title: 'EXPLORE',
    items: [
      { id: 'explore-home', label: 'Explore', to: '/explore', icon: Globe, exact: true },
      { id: 'explore-knowledge', label: 'Knowledge', to: '/explore/knowledge', icon: Bookmark },
      { id: 'explore-expeditions', label: 'Expeditions', to: '/explore/expeditions', icon: Compass },
      { id: 'explore-research', label: 'Research', to: '/explore/research', icon: Database },
      { id: 'explore-media', label: 'Media', to: '/explore/media', icon: Film }
    ]
  },
  {
    title: 'LEARN',
    items: [
      { id: 'explore-explainers', label: 'Science Explainers', to: '/explore/explainers', icon: Sparkles },
      { id: 'explore-topics', label: 'Topics', to: '/explore/topics', icon: BookOpen }
    ]
  },
  {
    title: 'EVIDENCE',
    items: [
      { id: 'explore-evidence', label: 'Explore Evidence', to: '/explore/evidence', icon: Shield, highlight: true },
      { id: 'explore-graph', label: 'Knowledge Graph', to: '/explore/knowledge-graph', icon: Compass }
    ]
  },
  {
    items: [
      { id: 'explore-search', label: 'Global Search', to: '/explore/search', icon: Search }
    ]
  }
];

export function getNavigationForRole(role: UserRole): NavigationSection[] {
  switch (role) {
    case 'admin':
      return adminNavigation;
    case 'public':
      return publicNavigation;
    case 'researcher':
    default:
      return researcherNavigation;
  }
}
