import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Package,
  List,
  Edit2,
  Check,
  X,
  FileText
} from 'lucide-react';
import {
  getObservations,
  getProcessingJobs,
  getJobPackage,
  renameProcessingJob,
  ResearchPackagePayload
} from '../../lib/api';
import { Observation, ProcessingJob } from '@polarweave/types';
import { useRole } from '../../context/RoleContext';
import { ResearchPackageView } from '../../components/ResearchPackageView';

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { role } = useRole();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ResearchPackagePayload | null>(null);
  const [packageLoading, setPackageLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'verified'>('all');
  const [viewMode, setViewMode] = useState<'packages' | 'flat'>('packages');

  // Inline package renaming state
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const isAdmin = role === 'admin';

  // Load observations and jobs
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getObservations({
        job_id: jobId || undefined,
        scope: 'real'
      }),
      getProcessingJobs()
    ])
      .then(([obsData, jobsData]) => {
        const scopedData = jobId ? (obsData || []).filter((o) => o.processing_job_id === jobId) : (obsData || []);
        setObservations(scopedData);
        setJobs(jobsData || []);
      })
      .catch((err) => {
        console.error('Failed to load observations or jobs:', err);
        setObservations([]);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  // When jobId is present, load the comprehensive research package
  useEffect(() => {
    if (!jobId) {
      setSelectedPackage(null);
      return;
    }
    setPackageLoading(true);
    getJobPackage(jobId)
      .then((pkg) => {
        setSelectedPackage(pkg);
      })
      .catch((err) => {
        console.warn('Failed to load package for job:', jobId, err);
        setSelectedPackage(null);
      })
      .finally(() => setPackageLoading(false));
  }, [jobId]);

  const handleStartRename = (e: React.MouseEvent, job: ProcessingJob) => {
    e.stopPropagation();
    setEditingJobId(job.id);
    setEditingTitle(job.title || job.filename);
  };

  const handleSaveRename = async (e: React.MouseEvent, targetJobId: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingJobId(null);
      return;
    }

    try {
      setIsRenaming(true);
      const updated = await renameProcessingJob(targetJobId, editingTitle.trim());
      // Update jobs list in state
      setJobs((prev) =>
        prev.map((j) => (j.id === targetJobId ? { ...j, title: updated.title } : j))
      );
      // Update selectedPackage if open
      if (selectedPackage && selectedPackage.job.id === targetJobId) {
        setSelectedPackage({
          ...selectedPackage,
          title: updated.title || selectedPackage.title,
          job: { ...selectedPackage.job, title: updated.title }
        });
      }
      setEditingJobId(null);
    } catch (err: any) {
      console.error('Failed to rename job:', err);
      alert(err.message || 'Failed to rename package');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJobId(null);
  };

  const filtered = observations.filter((o) => {
    if (jobId && o.processing_job_id !== jobId) return false;
    if (filter === 'needs_review') return o.verification_status === 'NEEDS_REVIEW' || o.verification_status === 'AI_EXTRACTED';
    if (filter === 'verified') return o.verification_status === 'VERIFIED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-900">
      {/* Top Breadcrumb & Clean Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            Institutional Verification
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {isAdmin ? 'Institutional Verification Queue' : 'My Submissions'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Review and verify findings grouped by research package before institutional sign-off.'
              : 'Track and manage research packages submitted for NCPOR institutional review.'}
          </p>
        </div>

        {/* View Toggle & Status Filter */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-md bg-white p-0.5 text-xs">
            <button
              onClick={() => setViewMode('packages')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'packages'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Packages</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'flat'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Flat Artifacts</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center border border-slate-200 rounded-md bg-white p-0.5 text-xs">
            {(['all', 'needs_review', 'verified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  filter === f
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* When a specific package is selected (via query param or card click) */}
      {jobId ? (
        packageLoading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-400">
            Loading research package {jobId}...
          </div>
        ) : selectedPackage ? (
          <ResearchPackageView
            pkg={selectedPackage}
            onBack={() => setSearchParams({})}
            isAdmin={isAdmin}
            onRename={async (newTitle) => {
              const updated = await renameProcessingJob(selectedPackage.job.id, newTitle);
              setSelectedPackage({
                ...selectedPackage,
                title: updated.title || newTitle,
                job: { ...selectedPackage.job, title: updated.title }
              });
              setJobs((prev) =>
                prev.map((j) => (j.id === selectedPackage.job.id ? { ...j, title: updated.title } : j))
              );
            }}
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3">
            <p className="text-sm text-slate-700">Package container could not be loaded for {jobId}</p>
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              Return to All Research Packages
            </button>
          </div>
        )
      ) : viewMode === 'packages' ? (
        /* Clean Institutional Research Package List */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{jobs.length} Research Package{jobs.length === 1 ? '' : 's'}</span>
            <span>One Job = One Container</span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-400">
              Loading packages...
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
              <div className="text-sm font-medium text-slate-800">No Research Packages Found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Uploaded scientific papers or expedition reports will appear here as self-contained research packages.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
              {jobs.map((job) => {
                const jobObs = observations.filter((o) => o.processing_job_id === job.id);
                const verifiedCount = jobObs.filter((o) => o.verification_status === 'VERIFIED').length;
                
                let reviewBadgeText = 'Needs Review';
                let reviewBadgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
                if (jobObs.length > 0 && verifiedCount === jobObs.length) {
                  reviewBadgeText = 'Verified';
                  reviewBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                } else if (verifiedCount > 0) {
                  reviewBadgeText = 'Partially Verified';
                  reviewBadgeClass = 'text-blue-700 bg-blue-50 border-blue-200';
                }

                if (filter === 'needs_review' && reviewBadgeText === 'Verified') return null;
                if (filter === 'verified' && reviewBadgeText !== 'Verified') return null;

                const uploadDate = new Date(job.started_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                const displayTitle = job.title || job.filename;
                const originalFilename = job.original_filename || job.filename;
                const isEditing = editingJobId === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      if (!isEditing) setSearchParams({ jobId: job.id });
                    }}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Left Column: Title & Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(e as any, job.id);
                              if (e.key === 'Escape') handleCancelRename(e as any);
                            }}
                            autoFocus
                            disabled={isRenaming}
                            className="text-sm font-semibold text-slate-900 border border-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-slate-600 w-full max-w-md bg-white"
                          />
                          <button
                            onClick={(e) => handleSaveRename(e, job.id)}
                            disabled={isRenaming}
                            title="Save name"
                            className="p-1 rounded text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Check className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            disabled={isRenaming}
                            title="Cancel"
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {displayTitle}
                          </h2>
                          <button
                            onClick={(e) => handleStartRename(e, job)}
                            title="Rename research package"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Original Filename & Source Metadata */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        {displayTitle !== originalFilename && (
                          <>
                            <span className="font-mono text-slate-400 truncate max-w-xs">
                              {originalFilename}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span className="font-mono text-slate-400">{job.id}</span>
                        <span>•</span>
                        <span>Dr. Rajesh Sharma (NCPOR)</span>
                      </div>
                    </div>

                    {/* Middle Column: Status & Artifact Count */}
                    <div className="flex items-center gap-6 text-xs text-slate-500 shrink-0">
                      <div className="text-right">
                        <div className="font-medium text-slate-800">
                          {jobObs.length} artifact{jobObs.length === 1 ? '' : 's'}
                        </div>
                        <div className="text-[11px] text-slate-400">{uploadDate}</div>
                      </div>

                      <div className="w-28 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border ${reviewBadgeClass}`}
                        >
                          {reviewBadgeText}
                        </span>
                      </div>

                      {/* Right Action */}
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-800 transition-colors pl-2">
                        <span className="text-xs font-medium">Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Flat List of All Uploaded Artifacts */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{filtered.length} total individual artifacts</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading findings...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="text-sm font-medium text-slate-800">No observations found</div>
                <p className="text-xs text-slate-400">No findings match the current filter.</p>
              </div>
            ) : (
              filtered.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => navigate(`/workspace/review/${obs.id}`)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700 capitalize">
                        {obs.research_domain.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">
                        {obs.source_file_name || obs.processing_job_id || 'Uploaded Source'}
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

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        obs.verification_status === 'VERIFIED'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {obs.verification_status.replace('_', ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
