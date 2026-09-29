import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface Stage {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
}

export function ProcessingPage() {
  const navigate = useNavigate();

  // Simulated live intelligence pipeline stages with realistic progression
  const [stages, setStages] = useState<Stage[]>([
    { id: '1', label: 'Files received & validated', description: '5 multimodal files verified with MIME inspection', status: 'completed' },
    { id: '2', label: 'Deterministic document parsing', description: 'Extracted 84 PDF pages, 1420 CSV rows, and video audio track', status: 'completed' },
    { id: '3', label: 'Metadata & entity extraction', description: 'Detected Bharati Station, Larsemann Hills, Dr. Rajesh Sharma', status: 'completed' },
    { id: '4', label: 'Observation structuring & Zod validation', description: 'Structured 12 scientific observations with confidence scoring', status: 'completed' },
    { id: '5', label: 'Cross-file evidence linking', description: 'Established multi-provenance chains: Report p.17 ↔ CSV row 42 ↔ Video 12:43', status: 'completed' },
    { id: '6', label: 'Human verification queuing', description: 'Staged in verification queue awaiting researcher sign-off', status: 'completed' },
    { id: '7', label: 'Knowledge network indexing', description: 'Connected semantic graph nodes and embeddings', status: 'completed' }
  ]);

  const [activeStageIdx, setActiveStageIdx] = useState(6);
  const [progress, setProgress] = useState(100);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-polar-50 text-polar-700 border border-polar-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-polar-600" />
          <span>Multimodal Pipeline Complete</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Understanding Your Research Package
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
              transition={{ duration: 1 }}
              className="bg-polar-600 h-full rounded-full"
            />
          </div>
        </div>

        {/* Stages Checklist (Section 12 & 45) */}
        <div className="space-y-4 divide-y divide-slate-100">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';

            return (
              <div key={stage.id} className="pt-3 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <Clock className="w-4 h-4 text-polar-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isCompleted ? 'VERIFIED' : isActive ? 'IN PROGRESS' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-900">
              Extraction Output: 12 Observations • 10 Evidence Chains
            </div>
            <div className="text-[11px] text-slate-500">
              Observation "Surface ice measurement recorded at 1.8m" has 4-way cross-modal evidence.
            </div>
          </div>

          <button
            onClick={() => navigate('/workspace/review/obs_ice_thickness')}
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
