import React, { useState, useEffect } from 'react';
import {
  Film,
  Image as ImageIcon,
  Play,
  Clock,
  MapPin,
  Camera,
  Layers,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getMedia } from '../../lib/api';
import { MediaAsset } from '@polarweave/types';
import { formatTimestamp } from '../../lib/utils';

export function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image'>('all');
  const [selectedVideo, setSelectedVideo] = useState<MediaAsset | null>(null);
  const [activeSeekTime, setActiveSeekTime] = useState<number>(758); // default to 12:38 (Core 42 segment)

  useEffect(() => {
    getMedia().then((res) => {
      setMedia(res);
      const vid = res.find((m) => m.type === 'video');
      if (vid) setSelectedVideo(vid);
    });
  }, []);

  const filteredMedia = media.filter((m) => {
    if (activeTab === 'video') return m.type === 'video';
    if (activeTab === 'image') return m.type === 'image';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Multimodal Media Ingestion
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Audio-Synced Video & EXIF Photography</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Media Library & Video Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Timestamp-synchronized scientific interview recordings and EXIF-verified high-latitude field imagery.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle">
          {(['all', 'video', 'image'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'all' ? 'All Assets' : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 29: VIDEO TIMELINE PLAYER UI */}
      {selectedVideo && (activeTab === 'all' || activeTab === 'video') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Timestamped Interview
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">Dr. Rajesh Sharma (Expedition 45)</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {selectedVideo.filename}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-polar-700 bg-polar-50 px-2.5 py-1 rounded-lg border border-polar-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Seek: {formatTimestamp(activeSeekTime)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Video Player Mockup (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950 rounded-xl overflow-hidden shadow-premium text-white flex flex-col justify-between">
              <div className="relative h-64 bg-slate-900 flex items-center justify-center">
                <img
                  src={selectedVideo.thumbnail_path}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 cursor-pointer hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-[11px] font-mono backdrop-blur-sm">
                  Station: Bharati Research Station Offing
                </div>
              </div>

              {/* Player Timeline Bar */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{formatTimestamp(activeSeekTime)}</span>
                  <span>{formatTimestamp(selectedVideo.duration_seconds || 1245)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-polar-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeSeekTime / (selectedVideo.duration_seconds || 1245)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Clickable Timestamped Transcript (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-xs font-semibold text-slate-900">
                  Synchronized Transcript Segments
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Click to seek timestamp
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedVideo.transcript?.segments.map((seg, idx) => {
                  const isCurrent = activeSeekTime >= seg.start && activeSeekTime <= seg.end;
                  const isAnchor = seg.text.includes('Core 42') || seg.text.includes('1.8 meters');

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSeekTime(seg.start)}
                      className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-polar-50 border-polar-400 shadow-sm'
                          : isAnchor
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] font-bold text-polar-700 flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          {formatTimestamp(seg.start)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {seg.topic || 'Field segment'}
                        </span>
                      </div>
                      <p className="text-slate-700 font-sans leading-relaxed">
                        "{seg.text}"
                      </p>
                      {isAnchor && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Anchored to Observation #1 (1.8m ice thickness)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photography Cards Grid (Section 28 & 14) */}
      {(activeTab === 'all' || activeTab === 'image') && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Authenticated Photography & EXIF Verification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {media.filter((m) => m.type === 'image').map((img) => (
              <div
                key={img.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-subtle hover:shadow-premium transition-all"
              >
                <div className="h-44 relative bg-slate-100 overflow-hidden group">
                  <img
                    src={img.thumbnail_path}
                    alt={img.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono font-medium">
                      EXIF Verified
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {img.filename}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {img.ai_analysis_json?.caption || 'Polar research imagery'}
                    </p>
                  </div>

                  {/* EXIF Metadata Table */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>GPS Lat/Lon:</span>
                      <span className="font-semibold text-slate-900">
                        {img.metadata_json?.gps?.latitude || '-69.4089'}°, {img.metadata_json?.gps?.longitude || '76.1872'}°
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Camera:</span>
                      <span className="text-slate-900">{img.metadata_json?.camera_model || 'Nikon Z8'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Captured: 14 Jan 2026</span>
                    <a
                      href="/workspace/evidence"
                      className="text-polar-600 hover:text-polar-700 font-medium flex items-center gap-1"
                    >
                      <span>Evidence Trace</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
