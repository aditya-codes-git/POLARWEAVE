import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck,
  Layers,
  Database,
  Film
} from 'lucide-react';
import { getJobById, getProcessingJobs } from '../../lib/api';
import { ProcessingJob } from '@polarweave/types';

export function ProcessingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('jobId');

  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      try {
        if (jobIdParam) {
          const fetched = await getJobById(jobIdParam);
          if (fetched) {
            setJob(fetched);
            setLoading(false);
            return;
          }
        }
        // Fallback to latest job in repository
        const allJobs = await getProcessingJobs();
        if (allJobs && allJobs.length > 0) {
          setJob(allJobs[0]);
        }
      } catch (e) {
        console.warn('Error loading processing job:', e);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobIdParam]);

  const stages = job?.stages || [
    { name: 'uploaded', label: 'Files received & validated in storage', status: 'completed', progress: 100, detail: 'Validating payload checksums' },
    { name: 'parsed', label: 'Deterministic document & media parsing', status: 'completed', progress: 100, detail: 'Parsing text, structures, and visual content' },
    { name: 'extracted', label: 'Metadata & entity extraction', status: 'completed', progress: 100, detail: 'Extracting features and measurements' },
    { name: 'structured', label: 'Observation structuring', status: 'completed', progress: 100, detail: 'Mapping into verified scientific record' },
    { name: 'linked', label: 'Cross-file evidence linking', status: 'completed', progress: 100, detail: 'Establishing provenance traces to uploaded sources' },
    { name: 'indexed', label: 'Knowledge indexing', status: 'completed', progress: 100, detail: 'Connecting semantic graph and updating repository' }
  ];

  const progress = job?.progress || 100;
  const isCompleted = job?.status === 'completed' || progress === 100;
  const obsCount = job?.result_summary?.observations_found ?? 0;
  const evidenceCount = job?.result_summary?.evidence_links_count ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-polar-50 text-polar-700 border border-polar-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-polar-600" />
          <span>{isCompleted ? 'Multimodal Pipeline Complete' : 'Pipeline Active'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {job ? `Processing: ${job.filename}` : 'Understanding Your Research Package'}
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Heterogeneous research material transformed into structured knowledge while preserving exact provenance to source files.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Pipeline Progression</span>
            <span className="font-mono text-polar-700">{progress}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="bg-polar-600 h-full rounded-full"
            />
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-4 divide-y divide-slate-100">
          {stages.map((stage, idx) => {
            const isStageCompleted = stage.status === 'completed';
            const isStageActive = stage.status === 'active';

            return (
              <div key={stage.name || idx} className="pt-3 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isStageCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isStageActive ? (
                    <Clock className="w-4 h-4 text-polar-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isStageCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isStageCompleted ? 'COMPLETED' : isStageActive ? 'IN PROGRESS' : 'PENDING'}
                    </span>
                  </div>
                  {stage.detail && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-900">
              Extraction Output: {obsCount} Observation{obsCount === 1 ? '' : 's'} • {evidenceCount} Evidence Chain{evidenceCount === 1 ? '' : 's'}
            </div>
            <div className="text-[11px] text-slate-500">
              {obsCount > 0
                ? 'Structured scientific findings ready for human verification in the Review Queue.'
                : 'Job processed. Materials archived in repository.'}
            </div>
          </div>

          <button
            onClick={() => {
              if (job?.id) {
                navigate(`/workspace/review?jobId=${job.id}`);
              } else {
                navigate('/workspace/review');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <span>Inspect in Review Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
