import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Database,
  Film,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Compass,
  Share2,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-polar-100 selection:text-polar-900">
      {/* 1. PUBLIC NAVIGATION */}
      <nav className="h-16 border-b border-slate-200/80 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
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
              <span className="text-[10px] font-mono uppercase bg-polar-100 text-polar-800 px-1.5 py-0.2 rounded border border-polar-200">
                SIH26063
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Ministry of Earth Sciences • NCPOR
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="#problem" className="hover:text-slate-900 transition-colors">The Problem</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#evidence-trace" className="hover:text-slate-900 transition-colors">Evidence Trace</a>
          <a href="#outreach" className="hover:text-slate-900 transition-colors">Outreach Engine</a>
          <button onClick={() => navigate('/explore')} className="hover:text-slate-900 transition-colors">
            Public Explorer
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/workspace')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Open Workspace
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION (Section 8) */}
      <section className="pt-20 pb-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-polar-600" />
          <span>SIH26063 • National Centre for Polar and Ocean Research (NCPOR)</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-950 max-w-3xl mx-auto leading-tight">
          From fragmented evidence <br />
          <span className="text-slate-800">to connected polar knowledge.</span>
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Transform expedition reports, datasets, field photographs and recordings into structured, verifiable knowledge with permanent multi-provenance evidence anchors.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-polar-600 hover:bg-polar-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Polar Knowledge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/workspace')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-xs font-semibold shadow-subtle transition-all flex items-center justify-center gap-2"
          >
            <span>Open Knowledge Workspace</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* HERO PRODUCT VISUALIZATION (Section 8: Fragmented Media -> Structured Knowledge -> Evidence, Research, Outreach) */}
        <div className="pt-12 max-w-4xl mx-auto">
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-elevated text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                POLARWEAVE Ingestion-to-Knowledge Pipeline
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Verification Flow
              </span>
            </div>

            {/* Pipeline Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Box 1: Fragmented Input */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  Fragmented Source Material
                </span>
                <div className="space-y-1.5 text-xs font-mono text-slate-700">
                  <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>report.pdf (Page 17)</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>measurements.csv (Row 42)</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100">
                    <Film className="w-3.5 h-3.5 text-blue-500" />
                    <span>interview.mp4 (12:43)</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Intelligent Structuring & Verification */}
              <div className="p-4 rounded-xl bg-polar-50/50 border border-polar-200 space-y-2 text-center">
                <span className="text-[10px] font-mono uppercase text-polar-700 font-semibold block">
                  Structuring & Human Sign-off
                </span>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-polar-600 mx-auto">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-slate-900">
                  "Surface ice recorded at 1.8m"
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Dr. Rajesh Sharma (Verified)
                </div>
              </div>

              {/* Box 3: Dissemination & Connected Graph */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  Multi-Audience Dissemination
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="p-1.5 bg-white rounded border border-slate-100 flex items-center justify-between">
                    <span>Evidence Trace</span>
                    <span className="text-[10px] font-mono text-polar-700">4 Sources</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-100 flex items-center justify-between">
                    <span>Student Explainer</span>
                    <span className="text-[10px] font-mono text-emerald-700">[1][2][3] Locked</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-100 flex items-center justify-between">
                    <span>Semantic Graph</span>
                    <span className="text-[10px] font-mono text-purple-700">10 Relations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: THE PROBLEM */}
      <section id="problem" className="py-20 border-t border-slate-200/80 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              01 • Problem Context
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-950">
              Polar science does not arrive as a clean database record.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Expeditions to Antarctica and the Arctic generate hundreds of gigabytes of unstructured PDF reports, sensor CSVs, handwritten field notes, and video tapes. Without structured evidence linking, critical discoveries remain trapped in silos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-2">
              <div className="text-xs font-bold text-slate-900">Unstructured Ingestion</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reports lack uniform schemas; crucial fast-ice or warming observations are buried across 80+ page documents.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-2">
              <div className="text-xs font-bold text-slate-900">Broken Provenance</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When facts are extracted into summaries, links to the underlying physical borehole rows and video timestamps are permanently lost.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-2">
              <div className="text-xs font-bold text-slate-900">Dissemination Gap</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Translating rigorous polar research into accessible explainers for students and media without risking hallucinations or inaccuracies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: THE HERO DIFFERENTIATOR — EVIDENCE TRACE */}
      <section id="evidence-trace" className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-polar-700 font-semibold bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
                02 • Core Differentiator
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950">
                Evidence Trace: "Show me why you believe this."
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every extracted observation is explicitly anchored to its origin. Click any scientific fact to reveal its multi-modal provenance chain.
              </p>
            </div>

            <button
              onClick={() => navigate('/workspace/evidence')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shrink-0"
            >
              <span>Launch Evidence Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Evidence Display Card */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Observation: Surface ice measurement recorded at 1.8 m along Larsemann fast-ice line
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  Report p.17
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  "In-situ mechanical core extraction yielded thickness of 1.80 m."
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  Dataset Row 42
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  "IC-45-42: depth_m=21.0, ice_thickness_m=1.80, temp_c=-14.8°C"
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Film className="w-3.5 h-3.5 text-blue-500" />
                  Video 12:43
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  "Manual caliper and thermistor confirmed ice sheet stood at 1.8m."
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                  EXIF Photo
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  "GPS -69.4089°S, 76.1872°E at Bharati coastal fast-ice line."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 border-t border-slate-200/80 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">POLARWEAVE</span>
            <span className="mx-2">•</span>
            <span>SIH26063 — Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">MoES / NCPOR India</span>
            <button onClick={() => navigate('/workspace')} className="text-slate-900 font-semibold hover:underline">
              Workspace Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
