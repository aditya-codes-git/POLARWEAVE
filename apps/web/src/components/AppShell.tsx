import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  UploadCloud,
  FileCheck,
  Compass,
  Database,
  Film,
  Share2,
  Search,
  Settings,
  Shield,
  Sparkles,
  Command,
  ChevronRight,
  User,
  LogOut,
  ExternalLink,
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { AskTheEvidenceModal } from './AskTheEvidenceModal';
import { getActiveUser, setActiveUser, DEMO_USERS, AuthUser } from '../lib/supabase';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUserState] = useState<AuthUser>(getActiveUser());
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const switchUser = (role: 'researcher' | 'admin' | 'public') => {
    const user = DEMO_USERS[role];
    setActiveUser(user);
    setCurrentUserState(user);
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { to: '/workspace', label: 'Overview', icon: Activity, exact: true },
    { to: '/workspace/ingest', label: 'Ingest', icon: UploadCloud, badge: 'Hero' },
    { to: '/workspace/processing', label: 'Processing Queue', icon: Layers },
    { to: '/workspace/review', label: 'Review Queue', icon: FileCheck, count: 1 },
    { to: '/workspace/evidence', label: 'Evidence Trace', icon: Shield, highlight: true },
    { to: '/workspace/knowledge', label: 'Knowledge Graph', icon: Compass },
    { to: '/workspace/expeditions', label: 'Expeditions', icon: Compass },
    { to: '/workspace/datasets', label: 'Datasets', icon: Database },
    { to: '/workspace/media', label: 'Media Library', icon: Film },
    { to: '/workspace/outreach', label: 'Outreach Studio', icon: Share2 },
    { to: '/workspace/search', label: 'Global Search', icon: Search }
  ];

  if (currentUser.role === 'admin') {
    navItems.push({ to: '/workspace/admin', label: 'Admin Hub', icon: Shield });
  }

  // Derive breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((p, idx) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '),
    path: '/' + pathParts.slice(0, idx + 1).join('/')
  }));

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 bg-surface flex flex-col justify-between select-none z-20">
        <div>
          {/* Logo & Product Tagline */}
          <div className="p-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-polar-600 flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.2l6 3v9.6l-6 3-6-3V7.2l6-3zM12 9l-4 2v4l4 2 4-2v-4l-4-2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-950">
                    POLARWEAVE
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-polar-100 text-polar-800 px-1 py-0.2 rounded border border-polar-200">
                    SIH
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  MoES • NCPOR India
                </p>
              </div>
            </div>

            {/* Demo Workspace Pill */}
            <div className="mt-3 px-2 py-1 rounded bg-slate-100/80 border border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Demo Workspace
              </span>
              <span className="font-mono text-slate-400 text-[10px]">Ready</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : item.highlight
                        ? 'text-polar-700 bg-polar-50/70 hover:bg-polar-100/70 border border-polar-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-polar-600 text-white font-normal">
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Public Portal link & Settings */}
        <div className="p-3 border-t border-slate-200/80 bg-surface space-y-1">
          <NavLink
            to="/explore"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Public Explorer</span>
            </div>
            <span className="text-[10px] text-slate-400">View</span>
          </NavLink>

          <NavLink
            to="/workspace/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Keys</span>
          </NavLink>
        </div>
      </aside>

      {/* 2. MAIN APP SHELL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white z-10">
          {/* Breadcrumb trail */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Workspace</span>
            {breadcrumbs.slice(1).map((b, i) => (
              <React.Fragment key={b.path}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className={i === breadcrumbs.length - 2 ? 'font-medium text-slate-900' : ''}>
                  {b.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-3">
            {/* Ask the Evidence Button */}
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-polar-50 hover:bg-polar-100 text-polar-800 border border-polar-200 text-xs font-medium transition-all shadow-subtle"
            >
              <Sparkles className="w-3.5 h-3.5 text-polar-600" />
              <span>Ask the Evidence</span>
            </button>

            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search knowledge...</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono capitalize">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-slate-200 p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                    <p className="text-[10px] text-polar-600 font-mono mt-0.5">{currentUser.institution}</p>
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400">
                      Switch Role for SIH Demo:
                    </div>
                    <button
                      onClick={() => switchUser('researcher')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        currentUser.role === 'researcher' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>Dr. Rajesh Sharma (Researcher)</span>
                      {currentUser.role === 'researcher' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => switchUser('admin')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        currentUser.role === 'admin' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>Dr. Sunita Bose (Knowledge Admin)</span>
                      {currentUser.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => switchUser('public')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between ${
                        currentUser.role === 'public' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>Public Explorer (Educator)</span>
                      {currentUser.role === 'public' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/40 p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Dialog (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenAskTheEvidence={() => setIsAskModalOpen(true)}
      />

      {/* Ask the Evidence Grounded Q&A Modal */}
      <AskTheEvidenceModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </div>
  );
}
