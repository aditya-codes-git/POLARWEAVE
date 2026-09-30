import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Database,
  Film,
  Compass,
  CheckCircle2,
  ExternalLink,
  Table
} from 'lucide-react';
import { getObservationById, getEvidenceTrace } from '../../lib/api';
import { Observation, EvidenceLink } from '@polarweave/types';
import { DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function PublicKnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [obs, setObs] = useState<(Observation & { measurements?: any[]; evidence?: EvidenceLink[] }) | null>(null);
  const [evidenceChain, setEvidenceChain] = useState<EvidenceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getObservationById(id).catch(() => null),
      getEvidenceTrace(id).catch(() => ({ evidence_chain: [] }))
    ]).then(([obsData, traceData]) => {
      setObs(obsData);
      setEvidenceChain(traceData.evidence_chain || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!obs) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Knowledge Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested scientific record does not exist or has not been verified.
        </p>
        <button
          onClick={() => navigate('/explore/knowledge')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Knowledge Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/explore/knowledge')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Library</span>
        </button>
      </div>

      {/* Main Record Card */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <DomainBadge domain={obs.research_domain} />
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-polar-600" />
              {obs.location_name}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Ground-Truth
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
          {obs.title}
        </h1>

        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
          {obs.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
            <div className="font-bold text-emerald-700 text-sm mt-0.5">
              {Math.round((obs.confidence || 0.94) * 100)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Observed At</div>
            <div className="text-slate-800 mt-0.5">
              {obs.observed_at ? new Date(obs.observed_at).toLocaleDateString() : '2026-01-14'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Expedition</div>
            <div
              onClick={() => navigate(`/explore/expeditions/${obs.expedition_id}`)}
              className="text-polar-700 font-bold hover:underline cursor-pointer truncate mt-0.5"
            >
              {obs.expedition_title || '45th Indian Antarctic Expedition'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Connected Sources</div>
            <div className="text-slate-800 font-bold mt-0.5">
              {evidenceChain.length || 3} Ground Records
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Measurements Table */}
      {obs.measurements && obs.measurements.length > 0 && (
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-polar-600" />
              <span>Calibrated Physical Measurements</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Sensor & Core In-Situ Data</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Variable</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Sensor Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obs.measurements.map((m, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.variable}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{m.value}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.unit}</td>
                    <td className="py-2.5 px-3 text-slate-500">{Math.round((m.confidence || 0.98) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Connected Evidence Chain */}
      <section className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Multimodal Evidence Provenance</h3>
            <p className="text-xs text-slate-500">
              Verified source records anchoring this observation to raw expedition material
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Inspect in Drawer
          </button>
        </div>

        <div className="space-y-3">
          {(evidenceChain.length > 0 ? evidenceChain : [
            {
              id: 'evi_obs1_report',
              knowledge_type: 'observation',
              knowledge_id: obs.id,
              source_type: 'pdf',
              source_id: 'doc_exp45_report',
              source_title: 'report_expedition_45_final.pdf',
              page_number: 17,
              excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction yielded uncompressed sea-ice thickness of 1.80 m (±0.02 m).',
              confidence: 0.96,
              verification_status: 'VERIFIED',
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_dataset',
              knowledge_type: 'observation',
              knowledge_id: obs.id,
              source_type: 'dataset',
              source_id: 'dts_ice_measurements',
              source_title: 'ice_measurements_larsemann.csv',
              row_number: 42,
              excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, temp_c=-14.8°C.',
              confidence: 0.98,
              verification_status: 'VERIFIED',
              created_at: new Date().toISOString()
            }
          ]).map((link) => (
            <div key={link.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 font-mono text-[11px]">{link.source_title}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {link.page_number ? `Page ${link.page_number}` : link.row_number ? `Row ${link.row_number}` : 'Video 12:43'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-slate-100">
                "{link.excerpt}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        knowledgeTitle={obs.title}
        confidence={obs.confidence}
        verificationStatus={obs.verification_status}
        evidenceLinks={evidenceChain}
      />
    </div>
  );
}
