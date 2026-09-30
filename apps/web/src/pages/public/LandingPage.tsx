import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import {
  FileText,
  Database,
  Film,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Compass,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Share2,
  Search,
  Network,
  BookOpen,
  Send,
  Eye,
  Activity,
  Binary,
  GitBranch,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans selection:bg-polar-100 selection:text-polar-900 overflow-x-hidden">
      {/* ========================================================= */}
      {/* 1. STICKY NAVBAR                                         */}
      {/* ========================================================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-subtle'
            : 'bg-[#FAFAFC]/80 backdrop-blur-sm border-b border-slate-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <NavLink to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="POLARWEAVE"
                className="h-10 w-auto object-contain max-w-[200px]"
              />
            </NavLink>
            <div className="hidden xl:flex items-center">
              <span className="h-4 w-px bg-slate-200 mx-3" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 font-medium">
                POLAR SCIENCE KNOWLEDGE PLATFORM
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${
                  isActive ? 'text-slate-900 font-semibold' : ''
                }`
              }
            >
              Explore
            </NavLink>
            <NavLink
              to="/expeditions"
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${
                  isActive ? 'text-slate-900 font-semibold' : ''
                }`
              }
            >
              Expeditions
            </NavLink>
            <NavLink
              to="/research"
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${
                  isActive ? 'text-slate-900 font-semibold' : ''
                }`
              }
            >
              Research
            </NavLink>
            <NavLink
              to="/media"
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${
                  isActive ? 'text-slate-900 font-semibold' : ''
                }`
              }
            >
              Media
            </NavLink>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/search')}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs transition-colors"
              title="Search knowledge base"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px]">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-slate-100 rounded text-slate-500">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate('/workspace')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/60 overflow-hidden bg-white">
        {/* Subtle Polar Topographic & Coordinate Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#0369a1_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Subtle Latitude/Longitude Polar Horizon Gridlines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <svg className="w-full h-full text-slate-200" preserveAspectRatio="none" viewBox="0 0 1440 600" fill="none">
            <path d="M-100,120 Q720,-40 1540,120" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 6" />
            <path d="M-100,280 Q720,100 1540,280" stroke="currentColor" strokeWidth="0.75" />
            <path d="M-100,440 Q720,260 1540,440" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
            <line x1="360" y1="0" x2="360" y2="600" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
            <line x1="720" y1="0" x2="720" y2="600" stroke="currentColor" strokeWidth="0.5" />
            <line x1="1080" y1="0" x2="1080" y2="600" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-6"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-mono tracking-wider uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-polar-600 animate-pulse" />
                <span>POLAR SCIENCE KNOWLEDGE PLATFORM</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-slate-950 leading-[1.08]">
                From fragmented evidence <br className="hidden sm:inline" />
                to connected <span className="text-polar-700 font-extrabold">polar knowledge.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                POLARWEAVE transforms expedition reports, datasets, publications and field media into structured, traceable scientific knowledge.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/explore')}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
                >
                  <span>Explore Knowledge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/expeditions')}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all inline-flex items-center gap-2"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Explore Expeditions</span>
                </button>
              </div>

              {/* Institutional Endorsement Line */}
              <div className="pt-4 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Antarctica • Arctic • Himalayas
                </span>
                <span>•</span>
                <span>MoES / NCPOR Initiative</span>
              </div>
            </motion.div>

            {/* Hero Right Visual: The Evidence → Knowledge Product Pipeline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-premium">
                {/* Header Window Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">pipeline.polarweave.internal</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Deterministic Ingest Live
                  </span>
                </div>

                {/* Pipeline Stages Vertical Trace */}
                <div className="space-y-3 relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-200 z-0" />

                  {/* Stage 1 */}
                  <div className="relative z-10 flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-subtle text-slate-700">
                      <FileText className="w-4 h-4 text-polar-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">1. Research Material</span>
                        <span className="text-[10px] font-mono text-slate-400">PDF • CSV • Media</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        45th Indian Antarctic Expedition report & CTD ocean sensors
                      </p>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="relative z-10 flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-subtle text-slate-700">
                      <Binary className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">2. AI Extraction</span>
                        <span className="text-[10px] font-mono text-indigo-600 font-medium">96% Conf.</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Entities: Bharati Station, Fast-Ice Sheet (1.80m), Prydz Bay
                      </p>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="relative z-10 flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-subtle text-slate-700">
                      <Layers className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">3. Structured Knowledge</span>
                        <span className="text-[10px] font-mono text-slate-400">Taxonomy Match</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Standardized Glaciology observation with geo-coordinates
                      </p>
                    </div>
                  </div>

                  {/* Stage 4 */}
                  <div className="relative z-10 flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-subtle text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">4. Human Verification</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 rounded">Admin Gate</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        NCPOR Knowledge Admin peer verification & governance lock
                      </p>
                    </div>
                  </div>

                  {/* Stage 5 */}
                  <div className="relative z-10 flex items-start gap-3 p-2.5 rounded-xl bg-polar-50/50 border border-polar-200/80">
                    <div className="w-8 h-8 rounded-lg bg-white border border-polar-200 flex items-center justify-center shrink-0 shadow-subtle text-polar-700">
                      <GitBranch className="w-4 h-4 text-polar-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">5. Evidence Trace & Dissemination</span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">100% Provenance</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">
                        Public explainer linked directly to Page 17 & Dataset Row 42
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. TRUST / VALUE STRIP                                    */}
      {/* ========================================================= */}
      <section className="border-b border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                <Database className="w-4 h-4 text-polar-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Knowledge Repository</h4>
                <p className="text-[11px] text-slate-500">Centralized scientific findings</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                <Compass className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Expedition Intelligence</h4>
                <p className="text-[11px] text-slate-500">Field station trajectories</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Evidence Traceability</h4>
                <p className="text-[11px] text-slate-500">Zero unbacked assertions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                <Send className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Scientific Dissemination</h4>
                <p className="text-[11px] text-slate-500">Verified public outreach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. "HOW IT WORKS" WORKFLOW SECTION                       */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-[#FAFAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-polar-700 font-semibold block mb-2">
              PRECISION WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Deterministic processing from raw field files to published science.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal">
              A rigorous 5-step pipeline maintaining complete institutional provenance at every transformation stage.
            </p>
          </div>

          {/* 5-Step Connected Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium transition-all space-y-3">
              <div className="text-xs font-mono font-bold text-polar-700">01 INGEST</div>
              <h3 className="text-sm font-bold text-slate-900">Research Material</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Expedition reports, raw sensor CSVs, DOCX field diaries, satellite imagery and field video logs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium transition-all space-y-3">
              <div className="text-xs font-mono font-bold text-indigo-600">02 EXTRACT</div>
              <h3 className="text-sm font-bold text-slate-900">Structured Findings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transform unstructured documentation into normalized observation records, geo-coordinates and values.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium transition-all space-y-3">
              <div className="text-xs font-mono font-bold text-purple-600">03 VERIFY</div>
              <h3 className="text-sm font-bold text-slate-900">Human Governance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Institutional review by Knowledge Admins. Independent scientists inspect excerpts and confirm integrity.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium transition-all space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-600">04 CONNECT</div>
              <h3 className="text-sm font-bold text-slate-900">Knowledge Network</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Link observations to expeditions, stations, datasets, publications and researcher profiles.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-premium transition-all space-y-3">
              <div className="text-xs font-mono font-bold text-slate-900">05 DISSEMINATE</div>
              <h3 className="text-sm font-bold text-slate-900">Outreach Studio</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Synthesize public explainers, educational summaries and press releases backed by verified evidence links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CORE PRODUCT SECTION                                   */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-2">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              One knowledge layer for the polar research ecosystem.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal">
              Designed for polar research institutes, cross-disciplinary scientists and public discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Capability 1: Knowledge Repository */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-[#FAFAFC] hover:border-slate-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-subtle">
                <Database className="w-5 h-5 text-polar-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Knowledge Repository</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Centralized, taxonomy-driven access to polar scientific observations across Antarctica, the Arctic and the Himalayas.
                </p>
              </div>
              <div className="pt-2 p-4 bg-white rounded-xl border border-slate-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>RECORD ID</span>
                  <span>DOMAIN</span>
                  <span>STATUS</span>
                </div>
                <div className="flex items-center justify-between font-sans text-slate-800 pt-1 border-t border-slate-100">
                  <span className="font-mono text-[11px]">obs_larsemann_01</span>
                  <span>Glaciology</span>
                  <span className="text-emerald-700 font-medium">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between font-sans text-slate-800">
                  <span className="font-mono text-[11px]">obs_himadri_core</span>
                  <span>Atmospheric</span>
                  <span className="text-emerald-700 font-medium">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Capability 2: Evidence Trace */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-[#FAFAFC] hover:border-slate-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-subtle">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Evidence Trace</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Every important finding remains connected to its exact page number, sensor row, or media timestamp.
                </p>
              </div>
              <div className="pt-2 p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">PROVENANCE TRACE</span>
                  <span className="text-purple-700 font-mono font-semibold">100% Backed</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-mono">
                  Report: 45th_Expedition.pdf (Page 18) • Row 284
                </div>
              </div>
            </div>

            {/* Capability 3: Knowledge Graph */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-[#FAFAFC] hover:border-slate-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-subtle">
                <Network className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Knowledge Graph</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Connect researchers, expeditions, observations, datasets and publications into a navigable multi-entity map.
                </p>
              </div>
              <div className="pt-2 p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-around text-center text-xs font-mono">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">Expedition</div>
                <span className="text-slate-300">→</span>
                <div className="p-2 rounded bg-polar-50 text-polar-700 border border-polar-200">Finding</div>
                <span className="text-slate-300">→</span>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">Station</div>
              </div>
            </div>

            {/* Capability 4: Outreach Studio */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 bg-[#FAFAFC] hover:border-slate-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-subtle">
                <Send className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Outreach Studio</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Transform verified scientific knowledge into public-facing articles, student explainers and institutional press releases.
                </p>
              </div>
              <div className="pt-2 p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="text-[11px] font-mono text-slate-400">DISSEMINATION ENGINE</div>
                <p className="text-slate-700 text-[11px] line-clamp-2">
                  "Antarctic fast-ice stability verified at Larsemann Hills provides safe landing strip for 45th Indian Expedition..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. EVIDENCE TRACE WOW SECTION                             */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-polar-400 font-semibold block mb-2">
              SCIENTIFIC INTEGRITY & PROVENANCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Every claim has a source.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 font-normal">
              No hallucinated conclusions. In POLARWEAVE, every synthesized insight is directly clickable to the authoritative sentence, sensor reading, or photo that proves it.
            </p>
          </div>

          {/* Realistic Evidence Trace Interface Demo */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Top Observation Box */}
            <div className="p-5 rounded-xl border border-slate-700 bg-slate-850/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  STRUCTURED SCIENTIFIC OBSERVATION
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  "Surface fast-ice sheet thickness measured at 1.95 m"
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Location: Prydz Bay coastal zone, Bharati Station, Antarctica
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  Status: Verified
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-polar-950 text-polar-300 border border-polar-800 font-semibold">
                  Confidence: 98%
                </span>
              </div>
            </div>

            {/* Trace Indicator */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500 pl-4">
              <span className="w-2 h-2 rounded-full bg-polar-500" />
              <span>LINKED PROVENANCE SOURCES (3 MULTIMODAL PROOFS)</span>
            </div>

            {/* 3 Source Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Proof 1: Expedition Report */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-850/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <FileText className="w-4 h-4" />
                  <span>Expedition Report</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Page 18, Paragraph 3</div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Core sampling along transit line B yielded continuous uncompressed sea-ice thickness of 1.95 meters."
                </p>
              </div>

              {/* Proof 2: Sensor Dataset */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-850/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Database className="w-4 h-4" />
                  <span>Station Sensor Dataset</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Dataset Row 284 (Acoustic Sonar)</div>
                <p className="text-xs text-slate-300 font-mono text-[11px] leading-relaxed">
                  depth_m: 24.2 • ice_thickness_m: 1.95 • temp_c: -14.6°C
                </p>
              </div>

              {/* Proof 3: Field Media */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-850/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Film className="w-4 h-4" />
                  <span>Field Media Video</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Timestamp 04:18 (Lead Glaciologist)</div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  Dr. Rajesh Sharma calipers the mechanical core drill at the ice shelf edge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. KNOWLEDGE GRAPH SECTION                                */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-2">
              KNOWLEDGE GRAPH
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Navigable scientific relationships across all missions.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal">
              POLARWEAVE connects isolated publications, raw files, and expeditions into an interconnected graph of polar discovery.
            </p>
          </div>

          {/* Interactive Visual Graph representation */}
          <div className="rounded-2xl border border-slate-200/80 bg-[#FAFAFC] p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 items-center text-center">
              {/* Node 1 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle hover:border-polar-300 transition-colors">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Entity</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Expedition 45</div>
                <div className="text-[10px] text-polar-700 font-mono mt-0.5">Antarctica</div>
              </div>

              {/* Node 2 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle hover:border-polar-300 transition-colors">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Finding</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Fast-Ice Thickness</div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5">1.95m Glaciology</div>
              </div>

              {/* Node 3 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle hover:border-polar-300 transition-colors">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Location</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Bharati Station</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Larsemann Hills</div>
              </div>

              {/* Node 4 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle hover:border-polar-300 transition-colors">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Dataset</div>
                <div className="text-xs font-bold text-slate-900 mt-1">CTD Hydro Sensor</div>
                <div className="text-[10px] text-indigo-600 font-mono mt-0.5">1,240 soundings</div>
              </div>

              {/* Node 5 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle hover:border-polar-300 transition-colors">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Publication</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Prydz Bay Sea-Ice</div>
                <div className="text-[10px] text-purple-600 font-mono mt-0.5">Polar Biology 2026</div>
              </div>

              {/* Node 6 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle hover:border-polar-300 transition-colors">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Researcher</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Dr. Rajesh Sharma</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">NCPOR Glaciologist</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/graph')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-subtle hover:bg-slate-50 transition-colors"
              >
                <Network className="w-3.5 h-3.5 text-polar-700" />
                <span>Launch Interactive Knowledge Graph</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. PUBLIC DISCOVERY SECTION                               */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-[#FAFAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-2">
                PUBLIC DISCOVERY
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                Explore Polar Knowledge
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Open access scientific knowledge for citizens, journalists, and global researchers.
              </p>
            </div>

            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-semibold text-polar-700 hover:text-polar-900 flex items-center gap-1 shrink-0"
            >
              <span>View All Discoveries</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Large Editorial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Knowledge */}
            <div
              onClick={() => navigate('/explore')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-polar-50 text-polar-700 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-polar-700 transition-colors">
                  Knowledge
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Browse structured observations filtered by scientific domain, region, and confidence level.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 group-hover:text-polar-700 gap-1">
                <span>Browse observations</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Expeditions */}
            <div
              onClick={() => navigate('/expeditions')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Expeditions
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Follow historic and current missions to Maitri, Bharati, Himadri, and Southern Ocean voyages.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 group-hover:text-emerald-700 gap-1">
                <span>View expeditions</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: Research */}
            <div
              onClick={() => navigate('/research')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Research
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Peer-reviewed publications, institutional protocols, and multidisciplinary scientific papers.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 group-hover:text-indigo-700 gap-1">
                <span>Explore research</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 4: Media */}
            <div
              onClick={() => navigate('/media')}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  Media Library
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Authoritative high-resolution field photography, interview videos, and raw audiovisual logs.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 group-hover:text-rose-700 gap-1">
                <span>View gallery</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. SCIENCE & LEARNING SECTION                             */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-2">
              PUBLIC SCIENCE & EDUCATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Make polar science easier to understand.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 font-normal">
              Accessible science communication built directly on verified evidence, designed for educators, students, and citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/explainers')}
              className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:bg-white hover:shadow-subtle transition-all cursor-pointer space-y-3"
            >
              <span className="text-xs font-mono font-bold text-polar-700 uppercase">EXPLAINERS</span>
              <h3 className="text-base font-bold text-slate-900">Science Explainers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear, evidence-backed breakdowns of complex polar phenomena: fast-ice dynamics, atmospheric ozone, and glacial retreat.
              </p>
            </div>

            <div
              onClick={() => navigate('/topics')}
              className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:bg-white hover:shadow-subtle transition-all cursor-pointer space-y-3"
            >
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase">TAXONOMY</span>
              <h3 className="text-base font-bold text-slate-900">Curated Topics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deep dives into Glaciology, Marine Biology, Polar Geophysics, and Antarctic Meteorology.
              </p>
            </div>

            <div
              onClick={() => navigate('/research')}
              className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:bg-white hover:shadow-subtle transition-all cursor-pointer space-y-3"
            >
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase">STORIES</span>
              <h3 className="text-base font-bold text-slate-900">Research Stories</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                First-hand field accounts and long-term telemetry from Bharati, Maitri, and Himadri research stations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FINAL CALL TO ACTION                                  */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 bg-[#FAFAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950">
            Turn polar research into connected knowledge.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Explore scientific evidence, discover expeditions and follow the knowledge behind every finding.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
            >
              <span>Explore Knowledge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate('/expeditions')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all inline-flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Explore Expeditions</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. FOOTER                                                */}
      {/* ========================================================= */}
      <footer className="py-16 bg-white border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <NavLink to="/" className="inline-block">
                <img
                  src="/logo.png"
                  alt="POLARWEAVE"
                  className="h-10 w-auto object-contain max-w-[200px]"
                />
              </NavLink>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                POLAR SCIENCE KNOWLEDGE PLATFORM. Developed for the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences (MoES), Government of India.
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                SIH26063 • Multimodal Polar Knowledge Infrastructure
              </div>
            </div>

            {/* Explore column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Explore</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/explore')} className="hover:text-slate-900 transition-colors">Knowledge Base</button></li>
                <li><button onClick={() => navigate('/expeditions')} className="hover:text-slate-900 transition-colors">Expeditions</button></li>
                <li><button onClick={() => navigate('/research')} className="hover:text-slate-900 transition-colors">Research Papers</button></li>
                <li><button onClick={() => navigate('/media')} className="hover:text-slate-900 transition-colors">Media Library</button></li>
              </ul>
            </div>

            {/* Learn column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Learn</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/explainers')} className="hover:text-slate-900 transition-colors">Science Explainers</button></li>
                <li><button onClick={() => navigate('/topics')} className="hover:text-slate-900 transition-colors">Scientific Topics</button></li>
                <li><button onClick={() => navigate('/evidence')} className="hover:text-slate-900 transition-colors">Evidence Explorer</button></li>
              </ul>
            </div>

            {/* Platform column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Platform</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/workspace')} className="hover:text-slate-900 transition-colors">Researcher Workspace</button></li>
                <li><button onClick={() => navigate('/graph')} className="hover:text-slate-900 transition-colors">Knowledge Graph</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-slate-900 transition-colors">Admin Portal</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 POLARWEAVE. All rights reserved. Scientific knowledge open access under MoES guidelines.
            </div>
            <div className="flex items-center gap-4">
              <span>National Centre for Polar and Ocean Research</span>
              <span>•</span>
              <span>Goa, India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
