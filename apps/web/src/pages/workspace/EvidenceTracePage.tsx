import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  Database,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Play,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { getObservations, getEvidenceTrace, EvidenceTracePayload } from '../../lib/api';
import { Observation } from '@polarweave/types';
import { ConfidenceBadge, VerificationBadge, DomainBadge } from '../../components/ui/badges';

export function EvidenceTracePage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedObsId, setSelectedObsId] = useState<string>('obs_ice_thickness');
  const [trace, setTrace] = useState<EvidenceTracePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getObservations().then((list) => {
      setObservations(list);
      if (list.length > 0) {
        setSelectedObsId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedObsId) {
      setLoading(true);
      getEvidenceTrace(selectedObsId).then((res) => {
        setTrace(res);
        setLoading(false);
      });
    }
  }, [selectedObsId]);

  const selectedObs = observations.find((o) => o.id === selectedObsId) || observations[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
              POLARWEAVE Core Differentiator
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">"Show me why you believe this"</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Evidence Trace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Every scientific fact is anchored to multi-modal source evidence: document pages, dataset rows, video timestamps, and authenticated EXIF photography.
          </p>
        </div>

        {/* Observation Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Select Fact:</label>
          <select
            value={selectedObsId}
            onChange={(e) => setSelectedObsId(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-subtle focus:outline-none focus:border-polar-500 max-w-xs"
          >
            {observations.map((obs) => (
              <option key={obs.id} value={obs.id}>
                {obs.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Trace Showcase */}
      {selectedObs && trace && (
        <div className="space-y-6">
          {/* CLAIM CARD */}
          <div className="bg-white border-2 border-polar-200/80 rounded-2xl p-6 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-polar-50/50 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <DomainBadge domain={selectedObs.research_domain} />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-600">
                  {selectedObs.location_name}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedObs.expedition_title || 'Expedition 45'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Extraction Confidence:</span>
                <ConfidenceBadge confidence={trace.confidence} />
                <VerificationBadge status={trace.verification_status} />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-mono text-polar-700 uppercase tracking-wider font-semibold block mb-1">
                Extracted Scientific Claim
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                "{selectedObs.title}"
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-4xl">
                {selectedObs.description}
              </p>
            </div>

            {/* Sub-header Banner */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  Corroborated by {trace.total_sources} Distinct Physical & Multimodal Sources
                </span>
              </div>
              <span className="font-mono text-slate-400">
                Provenance Chain Integrity: 100%
              </span>
            </div>
          </div>

          {/* 4-WAY MULTIMODAL PROVENANCE GRID (Section 18 & 44) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. REPORT (PDF PAGE 17) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        1. Expedition Report
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        report_expedition_45_final.pdf
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-mono font-semibold border border-rose-200">
                    Page 17
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-700 leading-relaxed">
                  "Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction at station perimeter point IC-45-42 yielded an uncompressed sea-ice thickness of 1.80 m (±0.02 m), validating airborne EM survey profiles."
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Section 3.2.1 • Paragraph 2</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-200">
                  Exact Match (96%)
                </span>
              </div>
            </div>

            {/* 2. DATASET (CSV ROW 42) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        2. Sensor Dataset
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ice_measurements_larsemann.csv
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
                    Row #42
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-400">core_id:</span>
                    <span className="font-semibold text-slate-900">IC-45-42</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 py-1">
                    <span className="text-slate-400">ice_thickness_m:</span>
                    <span className="font-bold text-polar-700">1.80 m</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 py-1">
                    <span className="text-slate-400">density_kg_m3:</span>
                    <span className="font-semibold text-slate-900">918 kg/m³</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">temp_c:</span>
                    <span className="font-semibold text-slate-900">-14.8 °C</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Borehole Calibration Log</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-200">
                  Exact Match (98%)
                </span>
              </div>
            </div>

            {/* 3. VIDEO INTERVIEW (12:43 – 12:58) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        3. Scientist Field Interview
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        scientist_interview.mp4
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200 flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    12:43 – 12:58
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl text-white space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Glaciology Audio Track</span>
                    <span className="text-polar-400">Seek: 12:43</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-polar-500 h-full w-[61%]" />
                  </div>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed pt-1">
                    "When we extracted Core 42, the manual caliper and thermistor probe confirmed the fast-ice sheet stood at exactly 1.8 meters thick."
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Dr. Rajesh Sharma, NCPOR</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-200">
                  Transcribed Audio (94%)
                </span>
              </div>
            </div>

            {/* 4. PHOTOGRAPHY & EXIF GPS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">
                        4. Authenticated Photography
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        IMG_2041.jpg
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-mono font-semibold border border-purple-200">
                    EXIF Verified
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80"
                    alt="Fast-ice site"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                    <div className="text-[11px] font-mono text-white leading-tight">
                      <div>GPS: -69.4089°S, 76.1872°E</div>
                      <div className="text-slate-300 text-[10px]">Camera: Nikon Z8 • ISO 100 • 1/1000s</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Bharati Coastal Offing</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-200">
                  Visual Authenticated (97%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
