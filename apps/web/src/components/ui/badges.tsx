import React from 'react';
import { VerificationStatus, ConfidenceLevel } from '@polarweave/types';
import { ShieldCheck, AlertCircle, Clock, XCircle, Sparkles } from 'lucide-react';

export function VerificationBadge({ status }: { status: VerificationStatus | string }) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified
        </span>
      );
    case 'NEEDS_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Needs Review
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case 'AI_EXTRACTED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200/80">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          AI Extracted
        </span>
      );
  }
}

export function ConfidenceBadge({ confidence, level }: { confidence?: number; level?: ConfidenceLevel | string }) {
  const percentage = confidence !== undefined ? Math.round(confidence * 100) : 94;
  const inferredLevel = level || (percentage >= 85 ? 'HIGH' : percentage >= 60 ? 'MEDIUM' : 'LOW');

  let colorClasses = 'bg-slate-50 text-slate-700 border-slate-200';
  if (inferredLevel === 'HIGH') {
    colorClasses = 'bg-slate-50 text-slate-800 border-slate-200';
  } else if (inferredLevel === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  } else {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
  }

  return (
    <span
      title="Extraction confidence score from parsing models (not scientific certainty)"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${colorClasses}`}
    >
      <span>{inferredLevel}</span>
      <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
    </span>
  );
}

export function DomainBadge({ domain }: { domain: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {domain}
    </span>
  );
}
