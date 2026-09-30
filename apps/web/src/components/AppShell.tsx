import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ChevronRight,
  LogOut,
  ExternalLink,
  Check,
  Menu,
  X,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { AskTheEvidenceModal } from './AskTheEvidenceModal';
import { useRole, UserRole, DEMO_PROFILES } from '../context/RoleContext';
import { getNavigationForRole, NavigationItem } from '../config/navigation';
import { getObservations } from '../lib/api';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user, switchRole, signOutUser } = useRole();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);

  useEffect(() => {
    if (role === 'admin' || role === 'researcher') {
      getObservations()
        .then((obs) => {
          const pending = obs.filter(
            (o) => o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED'
          );
          setPendingReviewCount(pending.length);
        })
        .catch(() => setPendingReviewCount(0));
    }
  }, [role, location.pathname]);

  const navigationSections = getNavigationForRole(role);

  // Derive breadcrumbs and contextual title
  const pathParts = location.pathname.split('/').filter(Boolean);

  const PUBLIC_LABEL_MAP: Record<string, string> = {
    explore: 'Explore',
    knowledge: 'Knowledge',
    expeditions: 'Expeditions',
    research: 'Research',
    media: 'Media',
    explainers: 'Science Explainers',
    topics: 'Topics',
    evidence: 'Explore Evidence',
    'knowledge-graph': 'Knowledge Graph',
    graph: 'Knowledge Graph',
    search: 'Global Search'
  };

  const breadcrumbs: { label: string; path: string }[] = [];

  if (role === 'public' || location.pathname.startsWith('/explore')) {
    breadcrumbs.push({ label: 'Public Portal', path: '/explore' });

    if (pathParts.length === 1 && pathParts[0] === 'explore') {
      breadcrumbs.push({ label: 'Explore', path: '/explore' });
    } else {
      pathParts.forEach((part, idx) => {
        if (part === 'explore') return;
        const mapped =
          PUBLIC_LABEL_MAP[part] ||
          (part.length > 15 ? 'Record Dossier' : part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '));
        breadcrumbs.push({
          label: mapped,
          path: '/' + pathParts.slice(0, idx + 1).join('/')
        });
      });
    }
  } else {
    breadcrumbs.push({ label: 'Workspace', path: '/workspace' });
    pathParts.forEach((p, idx) => {
      if (p === 'workspace') return;
      breadcrumbs.push({
        label: p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '),
        path: '/' + pathParts.slice(0, idx + 1).join('/')
      });
    });
  }

  const handleRoleSelect = (targetRole: UserRole) => {
    switchRole(targetRole);
    setIsUserMenuOpen(false);
  };

  const renderNavSection = (section: { title?: string; items: NavigationItem[] }, sIdx: number) => (
    <div key={sIdx} className="space-y-1">
      {section.title && (
        <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {section.title}
        </div>
      )}
      {section.items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.exact}
            onClick={() => setIsMobileMenuOpen(false)}
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
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-polar-600 text-white font-normal">
                  {item.badge}
                </span>
              )}
              {(() => {
                const count = item.id === 'review' ? pendingReviewCount : item.count;
                if (count !== undefined && count > 0) {
                  return (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                      {count}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-surface flex flex-col justify-between select-none transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Product Tagline */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-polar-600 flex items-center justify-center text-white shadow-sm shrink-0">
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

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Context Banner in Sidebar */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  role === 'admin'
                    ? 'bg-purple-500'
                    : role === 'researcher'
                    ? 'bg-emerald-500'
                    : 'bg-polar-500'
                }`}
              />
              <span className="font-semibold text-slate-700 truncate">
                {user.roleLabel}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {role === 'public' ? 'Public' : 'Workspace'}
            </span>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navigationSections.map((sec, i) => renderNavSection(sec, i))}
          </nav>
        </div>

        {/* Sidebar Footer with Switcher hint & Settings */}
        <div className="p-3 border-t border-slate-200/80 bg-surface space-y-1">
          {role !== 'public' ? (
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
          ) : (
            <button
              onClick={() => handleRoleSelect('researcher')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-polar-700 bg-polar-50/60 hover:bg-polar-100/60 border border-polar-200/50 transition-colors"
            >
              <span className="font-medium">Researcher Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-polar-600" />
            </button>
          )}

          {role !== 'public' && (
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
              <span className="w-4 h-4 flex items-center justify-center font-mono text-xs">⚙</span>
              <span>Settings & Keys</span>
            </NavLink>
          )}
        </div>
      </aside>

      {/* 2. MAIN APP SHELL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-14 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between bg-white z-10 shrink-0">
          {/* Mobile Hamburger + Breadcrumb trail */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Menu className="w-4 h-4" />
            </button>

            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.path + i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                <NavLink
                  to={b.path}
                  className={
                    i === breadcrumbs.length - 1
                      ? 'font-bold text-slate-900 truncate max-w-[220px]'
                      : i === 0
                      ? 'font-semibold text-slate-700 hover:text-slate-900'
                      : 'hidden sm:inline text-slate-500 hover:text-slate-800 truncate max-w-[160px]'
                  }
                >
                  {b.label}
                </NavLink>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask the Evidence Button */}
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-polar-50 hover:bg-polar-100 text-polar-800 border border-polar-200 text-xs font-medium transition-all shadow-subtle cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-polar-600" />
              <span className="hidden sm:inline">Ask the Evidence</span>
              <span className="sm:hidden">Ask</span>
            </button>

            {/* Command Palette / Search Trigger */}
            <button
              onClick={() => {
                if (role === 'public') {
                  navigate('/explore/search');
                } else {
                  setIsCommandOpen(true);
                }
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-subtle cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search {role === 'public' ? 'Polar Knowledge...' : '...'}</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Current Role Badge (Section 13) */}
            <span
              className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : role === 'researcher'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-polar-50 text-polar-700 border-polar-200'
              }`}
            >
              {user.badgeLabel}
            </span>

            {/* User Profile Popover & Role Switcher (Section 6 & 23) */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${
                      role === 'admin'
                        ? 'bg-purple-700'
                        : role === 'researcher'
                        ? 'bg-slate-900'
                        : 'bg-polar-600'
                    }`}
                  >
                    {user.name.charAt(3) || user.name.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-900 leading-none">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {user.roleLabel}
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-elevated border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {/* User Profile Info */}
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : role === 'researcher'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-polar-50 text-polar-700 border border-polar-200'
                        }`}
                      >
                        {user.badgeLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                    <p className="text-[10px] text-polar-700 font-medium mt-0.5">
                      {user.institution}
                    </p>
                  </div>

                  {/* Role Switcher for SIH Demo (Section 6 & 23) */}
                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                      <span>SIH DEMO ROLE</span>
                      <span className="text-[9px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200 font-bold">
                        DEMO
                      </span>
                    </div>

                    {/* Role 1: Researcher */}
                    <button
                      onClick={() => handleRoleSelect('researcher')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        role === 'researcher'
                          ? 'bg-slate-100 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-slate-900">Dr. Rajesh Sharma (Researcher)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Scientific Contributor • CREATE
                        </div>
                      </div>
                      {role === 'researcher' && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>

                    {/* Role 2: Knowledge Admin */}
                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        role === 'admin'
                          ? 'bg-slate-100 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-slate-900">Dr. Sunita Bose (Knowledge Admin)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          NCPOR Knowledge Management • GOVERN
                        </div>
                      </div>
                      {role === 'admin' && (
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      )}
                    </button>

                    {/* Role 3: Public Explorer */}
                    <button
                      onClick={() => handleRoleSelect('public')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        role === 'public'
                          ? 'bg-slate-100 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-slate-900">Public Explorer (Educator)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Student / Discovery • EXPLORE
                        </div>
                      </div>
                      {role === 'public' && (
                        <Check className="w-4 h-4 text-polar-600 shrink-0" />
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await signOutUser();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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
        <main className="flex-1 overflow-y-auto bg-slate-50/40 p-4 sm:p-6 lg:p-8">
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
