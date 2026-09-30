import React, { useState, useEffect } from 'react';
import {
  Database,
  Table as TableIcon,
  Download,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { getDatasets } from '../../lib/api';
import { Dataset } from '@polarweave/types';

export function DatasetExplorerPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  useEffect(() => {
    getDatasets().then((list) => {
      setDatasets(list);
      if (list.length > 0) setSelectedDatasetId(list[0].id);
    });
  }, []);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sensor & Tabular Ingestion
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Oceanographic & Cryosphere Records</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dataset Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tabular scientific measurements with calibrated units, schema detection, and exact row-level evidence links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {datasets.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDatasetId(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedDataset?.id === d.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {d.filename}
            </button>
          ))}
        </div>
      </div>

      {datasets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Datasets Ingested</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No tabular or sensor CSV datasets are currently loaded. Upload a CSV or sensor stream through the Ingest page to explore calibrated records.
          </p>
        </div>
      ) : selectedDataset && (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    CSV / Sensor Stream
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-mono">{selectedDataset.row_count} total records</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedDataset.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/workspace/evidence"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-polar-50 hover:bg-polar-100 text-polar-800 border border-polar-200 text-xs font-medium transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-polar-600" />
                  <span>View Row 42 Evidence Anchor</span>
                </a>
              </div>
            </div>

            {/* Detected Variables & Column Schema */}
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Detected Scientific Schema ({selectedDataset.columns?.length || 0} variables):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedDataset.columns?.map((col, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                  >
                    <span className="font-mono font-medium text-slate-900">{col.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({col.datatype})</span>
                    {col.unit && (
                      <span className="text-[10px] px-1 bg-white rounded border border-slate-200 text-polar-700 font-mono">
                        {col.unit}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabular Preview (Section 30) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Tabular Preview Sample
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Notice Row #42 highlighted: verified ground-truth for ice thickness claim
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing sample rows
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-slate-500 text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Row</th>
                    {selectedDataset.columns?.map((c, i) => (
                      <th key={i} className="px-4 py-2.5">{c.name} {c.unit ? `(${c.unit})` : ''}</th>
                    ))}
                    <th className="px-4 py-2.5">Evidence Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {selectedDataset.preview_data?.map((row, idx) => {
                    const isAnchorRow = (row as any).core_id === 'IC-45-42';
                    return (
                      <tr
                        key={idx}
                        className={isAnchorRow ? 'bg-polar-50/70 font-semibold text-polar-900' : 'hover:bg-slate-50/60'}
                      >
                        <td className="px-4 py-2.5 text-slate-400">
                          {isAnchorRow ? '42 (Anchor)' : idx + 1}
                        </td>
                        {selectedDataset.columns?.map((col, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5">
                            {row[col.name] !== undefined ? String(row[col.name]) : '-'}
                          </td>
                        ))}
                        <td className="px-4 py-2.5">
                          {isAnchorRow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Anchored to Obs #1
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Calibrated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
