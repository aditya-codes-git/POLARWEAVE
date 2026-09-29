import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Sparkles,
  FileText,
  Eye,
  ArrowRight
} from 'lucide-react';

interface PublicationItem {
  id: string;
  title: string;
  contentType: string;
  audience: string;
  citationCount: number;
  author: string;
  submittedAt: string;
  status: 'pending' | 'published';
  summary: string;
}

const INITIAL_PUBLICATIONS: PublicationItem[] = [
  {
    id: 'pub_ice_45',
    title: 'How Indian Scientists Measure Sea Ice in Antarctica: Fast-Ice at Bharati',
    contentType: 'Student Explainer',
    audience: 'Students & Schools',
    citationCount: 4,
    author: 'Dr. Rajesh Sharma',
    submittedAt: '2026-03-28T10:30:00Z',
    status: 'published',
    summary: 'Audience-targeted explainer with locked citations linking to Report p.17, CSV row 42, and interview video.'
  },
  {
    id: 'pub_warm_prydz',
    title: 'Discovery of Subsurface Warm Water Intrusion in Prydz Bay Continental Shelf',
    contentType: 'Scientific Press Dispatch',
    audience: 'National Media & Journalists',
    citationCount: 2,
    author: 'Dr. Ananya Menon',
    submittedAt: '2026-03-29T14:10:00Z',
    status: 'pending',
    summary: 'Details the Modified Circumpolar Deep Water (+0.4°C) measured at 150m depth off Bharati station.'
  },
  {
    id: 'pub_aerosol_katabatic',
    title: 'Episodic Black Carbon Transport During Katabatic Drainage Winds at Maitri',
    contentType: 'Policy Brief',
    audience: 'MoES Climate Decision Makers',
    citationCount: 3,
    author: 'Dr. Vikram Patel',
    submittedAt: '2026-03-29T17:45:00Z',
    status: 'pending',
    summary: 'Analysis of 82.4 ng/m³ aerosol peak correlating plateau air discharge across Schirmacher Oasis.'
  }
];

export function AdminPublishingPage() {
  const [items, setItems] = useState<PublicationItem[]>(INITIAL_PUBLICATIONS);

  const handlePublish = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'published' } : item
      )
    );
  };

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const publishedCount = items.filter((i) => i.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Institutional Governance
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Outreach & Dissemination Gate</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Public Dissemination & Publishing Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize researcher-generated outreach stories, verify locked citation integrity, and release materials to the Public Portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            {pendingCount} Pending Sign-off
          </span>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            {publishedCount} Publicly Visible
          </span>
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
                  {item.contentType}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-600">{item.audience}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.summary}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                <span>By {item.author}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {item.citationCount} Locked Citations
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
              {item.status === 'published' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live on Public Portal
                </span>
              ) : (
                <button
                  onClick={() => handlePublish(item.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Authorize & Publish</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
