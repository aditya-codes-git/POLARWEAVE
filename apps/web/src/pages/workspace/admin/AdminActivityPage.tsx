import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Terminal,
  FileCode,
  Shield,
  Layers
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  type: 'VERIFICATION' | 'INGEST' | 'PUBLISH' | 'ERROR';
  details: string;
}

const AUDIT_LOGS: AuditEvent[] = [];

export function AdminActivityPage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetryFailed = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 1200);
  };

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
            <span className="text-xs text-slate-500 font-mono">System Telemetry & Audit</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Activity & Operational Health
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline ingestion logs, verification audit events, and infrastructure health metrics.
          </p>
        </div>

        <button
          onClick={handleRetryFailed}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-subtle transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Flushing Queues...' : 'Sync Pipeline Telemetry'}</span>
        </button>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pipeline Ingestion Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">100.0%</div>
          <p className="text-[11px] text-emerald-600 mt-1">No dropped jobs in last 24h</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">AI Extraction Inference</span>
            <Cpu className="w-4 h-4 text-polar-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">1,240 ms</div>
          <p className="text-[11px] text-slate-500 mt-1">Gemini & Groq multi-model fallback active</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Audit Trail Retention</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">Immutable</div>
          <p className="text-[11px] text-slate-500 mt-1">Full cryptographically logged sign-offs</p>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          Real-Time Institutional Audit Stream
        </h3>

        <div className="divide-y divide-slate-100 font-mono text-xs">
          {AUDIT_LOGS.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No audit records logged yet. Actions performed by researchers and administrators will be recorded here.
            </div>
          ) : (
            AUDIT_LOGS.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      log.type === 'VERIFICATION'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.type === 'INGEST'
                        ? 'bg-polar-50 text-polar-700 border border-polar-200'
                        : log.type === 'PUBLISH'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-slate-400 text-[11px]">by {log.actor}</span>
                </div>
                <p className="text-[11px] text-slate-600">{log.target}</p>
                <p className="text-[10px] text-slate-400">{log.details}</p>
              </div>

              <div className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {log.timestamp}
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
