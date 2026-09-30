import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Database,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Share2,
  Calendar,
  User,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  FileCheck,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { ResearchPackagePayload } from '../lib/api';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from './ui/badges';

interface ResearchPackageViewProps {
  pkg: ResearchPackagePayload;
  onBack: () => void;
  isAdmin: boolean;
  onRename?: (newTitle: string) => Promise<void>;
}

export function ResearchPackageView({ pkg, onBack, isAdmin, onRename }: ResearchPackageViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'extracted' | 'sources' | 'datasets' | 'media' | 'evidence' | 'relationships' | 'outreach'>('extracted');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(pkg.title || pkg.job.filename);
  const [isSaving, setIsSaving] = useState(false);

  const { job, counts, documents, observations, datasets, media, evidence_links, relationships, outreach } = pkg;

  const handleSaveTitle = async () => {
    if (!editTitleValue.trim() || !onRename) {
      setIsEditingTitle(false);
      return;
    }
    try {
      setIsSaving(true);
      await onRename(editTitleValue.trim());
      setIsEditingTitle(false);
    } catch (e: any) {
      alert(e.message || 'Failed to rename package');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'extracted', label: 'Extracted Knowledge', count: observations.length },
    { id: 'sources', label: 'Source Material', count: documents.length },
    { id: 'datasets', label: 'Datasets', count: datasets.length },
    { id: 'media', label: 'Media', count: media.length },
    { id: 'evidence', label: 'Evidence & Provenance', count: evidence_links.length },
    { id: 'relationships', label: 'Relationships', count: relationships.length },
    { id: 'outreach', label: 'Outreach', count: outreach.length }
  ] as const;

  const displayTitle = pkg.title || job.title || job.filename;
  const originalFilename = pkg.original_filename || job.original_filename || job.filename;

  let reviewBadgeText = 'Needs Review';
  let reviewBadgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
  if (pkg.review_status === 'VERIFIED') {
    reviewBadgeText = 'Verified';
    reviewBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (pkg.review_status === 'PARTIALLY_VERIFIED') {
    reviewBadgeText = 'Partially Verified';
    reviewBadgeClass = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  return (
    <div className="space-y-5 text-slate-900">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Research Packages</span>
      </button>

      {/* Package Header Card - Institutional / Document Style */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Title with subtle pencil edit */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-xl">
                <input
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  disabled={isSaving}
                  className="text-lg font-semibold text-slate-900 border border-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-slate-600 w-full bg-white"
                />
                <button
                  onClick={handleSaveTitle}
                  disabled={isSaving}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  disabled={isSaving}
                  className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                  {displayTitle}
                </h1>
                {onRename && (
                  <button
                    onClick={() => {
                      setEditTitleValue(displayTitle);
                      setIsEditingTitle(true);
                    }}
                    title="Rename package"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Original filename & metadata row */}
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="font-mono text-slate-600">{originalFilename}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">{job.id}</span>
              <span>•</span>
              <span>Uploaded {new Date(job.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>Researcher: <strong className="text-slate-700 font-medium">{pkg.researcher}</strong></span>
              <span>•</span>
              <span>{pkg.artifact_count} artifact{pkg.artifact_count === 1 ? '' : 's'}</span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${reviewBadgeClass}`}>
              {reviewBadgeText}
            </span>
            <button
              onClick={() => navigate(`/workspace/processing?jobId=${job.id}`)}
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
            >
              Pipeline Stages
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Extracted Knowledge Findings */}
      {activeTab === 'extracted' && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {observations.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Structured Observations</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No observations were structured from this job's source materials.
              </p>
            </div>
          ) : (
            observations.map((obs) => (
              <div
                key={obs.id}
                onClick={() => navigate(`/workspace/review/${obs.id}`)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 capitalize">
                      {obs.research_domain.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400 truncate max-w-xs">
                      {obs.source_file_name || 'Source File'}
                    </span>
                    <span>•</span>
                    <span>{obs.location_name || 'Unspecified Location'}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {obs.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {obs.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                      obs.verification_status === 'VERIFIED'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >
                    {obs.verification_status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-800 transition-colors">
                    {isAdmin ? 'Verify →' : 'Inspect →'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Source Material */}
      {activeTab === 'sources' && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {documents.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Documents Uploaded</div>
              <p className="text-xs text-slate-400">This package did not include document files.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{doc.filename}</h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    {doc.mime_type} • {(doc.size_bytes / 1024).toFixed(1)} KB • {doc.page_count ? `${doc.page_count} page(s)` : 'Source file'}
                  </p>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase font-medium">
                  {doc.processing_status || 'Archived'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Datasets */}
      {activeTab === 'datasets' && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {datasets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Datasets Ingested</div>
              <p className="text-xs text-slate-400">No tabular or CSV datasets were part of this package.</p>
            </div>
          ) : (
            datasets.map((dts) => (
              <div key={dts.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{dts.title || dts.filename}</h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    {dts.row_count || 0} rows • {dts.column_count || 0} columns
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  Tabular
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Media Assets */}
      {activeTab === 'media' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          {media.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Media Files</div>
              <p className="text-xs text-slate-400">No imagery or video files belong to this package.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((m) => (
                <div key={m.id} className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                  {m.thumbnail_path ? (
                    <img src={m.thumbnail_path} alt={m.filename} className="w-full h-36 object-cover bg-slate-100" />
                  ) : (
                    <div className="w-full h-36 bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-mono">
                      {m.type}
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <h5 className="text-xs font-semibold text-slate-900 truncate">{m.filename}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {m.ai_analysis_json?.caption || m.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Evidence & Provenance */}
      {activeTab === 'evidence' && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {evidence_links.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Evidence Links Staged</div>
              <p className="text-xs text-slate-400">Cross-modal evidence citations have not yet been linked.</p>
            </div>
          ) : (
            evidence_links.map((link) => (
              <div key={link.id} className="p-4 space-y-1.5 hover:bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase font-medium">
                    {link.source_type}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{link.source_title}</span>
                  {link.page_number && (
                    <span className="text-[11px] font-mono text-slate-400">Page {link.page_number}</span>
                  )}
                </div>
                <p className="text-xs font-serif italic text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  "{link.excerpt}"
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Relationships */}
      {activeTab === 'relationships' && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {relationships.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Knowledge Graph Relationships</div>
              <p className="text-xs text-slate-400">Direct entity links within this package have not been defined.</p>
            </div>
          ) : (
            relationships.map((rel) => (
              <div key={rel.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-600">{rel.source_entity_id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {rel.label || rel.relationship_type}
                  </span>
                  <span className="font-mono text-slate-600">{rel.target_entity_id}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{rel.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 7: Generated Outreach */}
      {activeTab === 'outreach' && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {outreach.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Outreach Content Generated</div>
              <p className="text-xs text-slate-400">
                You can generate public science explainers and articles from this package in the Outreach Studio.
              </p>
            </div>
          ) : (
            outreach.map((c) => (
              <div key={c.id} className="p-4 space-y-1 hover:bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                    {c.content_type}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-900">{c.title}</h4>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{c.summary || c.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
