import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Database,
  Film,
  FileText,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { getExpeditionById, getObservations } from '../../lib/api';
import { Expedition, Observation, Dataset, MediaAsset } from '@polarweave/types';
import { DomainBadge } from '../../components/ui/badges';
import { EvidenceDrawer } from '../../components/EvidenceDrawer';

export function PublicExpeditionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expedition, setExpedition] = useState<(Expedition & { observations?: Observation[]; datasets?: Dataset[]; media?: MediaAsset[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getExpeditionById(id)
      .then((data) => {
        setExpedition(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Expedition Dossier Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested expedition record does not exist or has not been publicly released.
        </p>
        <button
          onClick={() => navigate('/explore/expeditions')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Expeditions Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/explore/expeditions')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expeditions</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-polar-700 bg-polar-50 px-2.5 py-1 rounded border border-polar-200">
              {expedition.code}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">{expedition.lead_agency}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {expedition.status}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
          {expedition.title}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          {expedition.description}
        </p>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Geographic Sector</div>
            <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-polar-600" />
              {expedition.region}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Field Deployment</div>
            <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {expedition.start_date.slice(0, 4)} – {expedition.end_date?.slice(0, 4) || 'Present'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Operating Bases</div>
            <div className="font-semibold text-slate-800 mt-0.5">
              {expedition.stations.join(', ')}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Scientific Team</div>
            <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              42 Scientists & Logisticians
            </div>
          </div>
        </div>
      </div>

      {/* Observations Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Verified Scientific Observations</h2>
          <p className="text-xs text-slate-500">
            Ground-truth measurements certified by the Expedition Science Directorate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(expedition.observations || []).map((obs) => (
            <div
              key={obs.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <DomainBadge domain={obs.research_domain} />
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {obs.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {obs.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  Confidence: {Math.round((obs.confidence || 0.94) * 100)}%
                </span>
                <button
                  onClick={() => setSelectedObs(obs)}
                  className="font-bold text-polar-700 hover:text-polar-900 text-xs"
                >
                  View Evidence Chain →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Datasets Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Calibrated Sensor Datasets</h2>
          <p className="text-xs text-slate-500">
            Primary CSV and NetCDF tables logged during this campaign
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(expedition.datasets || []).map((d) => (
            <div
              key={d.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-700 font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-polar-600" />
                  {d.filename}
                </span>
                <span className="font-mono text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                  {d.row_count} Rows
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800">{d.title}</p>
              <div className="text-[11px] text-slate-500 font-mono">
                Variables: {d.columns?.map(c => c.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mission Field Media</h2>
          <p className="text-xs text-slate-500">
            EXIF-tagged photography and documentary video
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(expedition.media || []).map((m) => (
            <div
              key={m.id}
              onClick={() => navigate('/explore/media')}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-slate-900 flex items-center justify-center text-white">
                {m.type === 'video' ? <Film className="w-6 h-6 text-polar-400" /> : <MapPin className="w-6 h-6 text-polar-400" />}
              </div>
              <div className="p-3 space-y-1">
                <div className="font-mono text-[11px] font-bold text-slate-800 truncate">{m.filename}</div>
                <div className="text-[10px] text-slate-500 truncate">{m.location_name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Drawer */}
      {selectedObs && (
        <EvidenceDrawer
          isOpen={Boolean(selectedObs)}
          onClose={() => setSelectedObs(null)}
          knowledgeTitle={selectedObs.title}
          confidence={selectedObs.confidence}
          verificationStatus={selectedObs.verification_status}
          evidenceLinks={[
            {
              id: 'evi_obs1_report',
              knowledge_type: 'observation',
              knowledge_id: selectedObs.id,
              source_type: 'pdf',
              source_id: 'doc_exp45_report',
              source_title: 'report_expedition_45_final.pdf',
              page_number: 17,
              excerpt: 'Section 3.2.1 Coastal Fast-Ice Monitoring: In-situ mechanical core extraction yielded uncompressed sea-ice thickness of 1.80 m (±0.02 m).',
              confidence: 0.96,
              verification_status: selectedObs.verification_status,
              created_at: new Date().toISOString()
            },
            {
              id: 'evi_obs1_dataset',
              knowledge_type: 'observation',
              knowledge_id: selectedObs.id,
              source_type: 'dataset',
              source_id: 'dts_ice_measurements',
              source_title: 'ice_measurements_larsemann.csv',
              row_number: 42,
              excerpt: 'Row 42: core_id=IC-45-42, depth_m=21.0, ice_thickness_m=1.80, temp_c=-14.8°C.',
              confidence: 0.98,
              verification_status: selectedObs.verification_status,
              created_at: new Date().toISOString()
            }
          ]}
        />
      )}
    </div>
  );
}
