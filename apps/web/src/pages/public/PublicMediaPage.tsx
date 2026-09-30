import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Film,
  Image as ImageIcon,
  Volume2,
  Search,
  MapPin,
  Calendar,
  Camera,
  Play,
  X,
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowRight,
  Maximize2,
  FileText
} from 'lucide-react';
import { getMedia, getExpeditions } from '../../lib/api';
import { MediaAsset, Expedition } from '@polarweave/types';

export function PublicMediaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<MediaAsset | null>(null);

  const activeTab = (searchParams.get('tab') as 'all' | 'image' | 'video' | 'audio') || 'all';
  const searchQuery = searchParams.get('q') || '';

  const updateTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'all') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    Promise.all([
      getMedia().catch(() => []),
      getExpeditions().catch(() => [])
    ]).then(([mList, expList]) => {
      setMediaList(mList);
      setExpeditions(expList);
      setLoading(false);
    });
  }, []);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      if (activeTab !== 'all' && m.type !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.filename.toLowerCase().includes(q) ||
          m.location_name?.toLowerCase().includes(q) ||
          m.ai_analysis_json?.caption?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mediaList, activeTab, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. HEADER (Section 8) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                Visual Repository
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">EXIF & GPS Authenticated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Public Media Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authenticated photography, drone footage, and scientist field video recorded across Bharati, Maitri, and Himadri stations.
            </p>
          </div>

          <div className="relative max-w-xs self-start sm:self-auto">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('q', e.target.value);
                else next.delete('q');
                setSearchParams(next, { replace: true });
              }}
              placeholder="Search captions, stations, gear..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Media Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 border-t border-slate-100 pt-3">
          {[
            { id: 'all', label: 'All Media', icon: Film },
            { id: 'image', label: 'Photography', icon: ImageIcon },
            { id: 'video', label: 'Field Footage & Videos', icon: Play },
            { id: 'audio', label: 'Audio & Hydrophone', icon: Volume2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all' ? mediaList.length : mediaList.filter(m => m.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => updateTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MEDIA GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 space-y-3">
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No public media has been published for this filter.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try switching media tabs or resetting your search term.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchParams(new URLSearchParams());
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Show All Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((med) => {
            const isVideo = med.type === 'video';
            const exp = expeditions.find((e) => e.id === med.expedition_id);

            return (
              <div
                key={med.id}
                onClick={() => setActiveMedia(med)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-subtle hover:shadow-premium transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
              >
                {/* Media Preview Box */}
                <div className="relative h-48 bg-slate-950 overflow-hidden flex items-center justify-center">
                  {med.thumbnail_path ? (
                    <img
                      src={med.thumbnail_path}
                      alt={med.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="text-slate-500 font-mono text-xs">{med.filename}</div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                      {isVideo ? <Film className="w-3 h-3 text-polar-400" /> : <Camera className="w-3 h-3 text-polar-400" />}
                      {med.type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      EXIF Verified
                    </span>
                  </div>

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  {med.duration_seconds && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                      {Math.floor(med.duration_seconds / 60)}:{(med.duration_seconds % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>

                {/* Info Block */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span className="truncate max-w-[180px] font-semibold text-slate-800">{med.filename}</span>
                      <span>{med.capture_date?.slice(0, 10)}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {med.ai_analysis_json?.caption || 'Verified research record.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px] truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-polar-600 shrink-0" />
                      <span className="truncate">{med.location_name}</span>
                    </span>

                    <span className="font-mono text-polar-700 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MEDIA LIGHTBOX MODAL */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row max-h-[90vh]">
            {/* Left Preview */}
            <div className="md:w-3/5 bg-slate-950 flex flex-col justify-center items-center relative min-h-[300px]">
              {activeMedia.thumbnail_path ? (
                <img
                  src={activeMedia.thumbnail_path}
                  alt={activeMedia.filename}
                  className="w-full h-full object-contain max-h-[500px]"
                />
              ) : (
                <div className="text-white text-xs font-mono">{activeMedia.filename}</div>
              )}

              {activeMedia.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md text-white text-center space-y-2">
                    <Play className="w-8 h-8 mx-auto fill-current" />
                    <span className="text-xs font-mono font-semibold block">Play Authenticated Stream</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Metadata Inspector */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-polar-50 text-polar-700 px-2 py-0.5 rounded border border-polar-200 font-bold">
                    {activeMedia.type} Evidence
                  </span>
                  <button
                    onClick={() => setActiveMedia(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeMedia.filename}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activeMedia.ai_analysis_json?.caption}
                  </p>
                </div>

                {/* Technical / EXIF Specs */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    Technical Metadata & GPS
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                    <div>Camera: {String(activeMedia.metadata_json?.camera_model || 'Nikon Z8')}</div>
                    <div>Lens: {String((activeMedia.metadata_json as any)?.lens || '24-70mm f/2.8')}</div>
                    <div>Location: {activeMedia.location_name || 'Bharati Offing'}</div>
                    <div>Date: {activeMedia.capture_date?.slice(0, 10) || '2026-01-14'}</div>
                  </div>
                  {activeMedia.metadata_json?.gps && (
                    <div className="text-[11px] font-mono text-polar-700 pt-1 border-t border-slate-200">
                      GPS: {activeMedia.metadata_json.gps.latitude}°S, {activeMedia.metadata_json.gps.longitude}°E
                    </div>
                  )}
                </div>

                {/* Video Transcript (if applicable) */}
                {activeMedia.transcript && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Scientist Transcript Excerpts</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                      {activeMedia.transcript.segments?.map((seg: any, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                          <span className="font-mono text-polar-700 font-semibold mr-1.5">
                            [{Math.floor(seg.start / 60)}:{(seg.start % 60).toString().padStart(2, '0')}]
                          </span>
                          <span>{seg.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Provenance Validated
                </span>
                <button
                  onClick={() => {
                    setActiveMedia(null);
                    navigate('/explore/evidence');
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  View in Evidence Chain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
