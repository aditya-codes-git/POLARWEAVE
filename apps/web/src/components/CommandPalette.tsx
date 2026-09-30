import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UploadCloud,
  FileCheck,
  Share2,
  Database,
  Compass,
  Film,
  Sparkles,
  Layers,
  Settings,
  Globe,
  Bookmark,
  BookOpen,
  Shield,
  X
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAskTheEvidence?: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenAskTheEvidence }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { role } = useRole();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items = role === 'public'
    ? [
        {
          category: 'Explore',
          name: 'Explore Polar Knowledge',
          hint: 'Editorial discovery home',
          icon: Globe,
          action: () => { navigate('/explore'); onClose(); }
        },
        {
          category: 'Explore',
          name: 'Knowledge Library',
          hint: 'Browse verified observations & scientific records',
          icon: Bookmark,
          action: () => { navigate('/explore/knowledge'); onClose(); }
        },
        {
          category: 'Explore',
          name: 'Polar Expeditions',
          hint: 'Antarctic, Arctic and Southern Ocean missions',
          icon: Compass,
          action: () => { navigate('/explore/expeditions'); onClose(); }
        },
        {
          category: 'Explore',
          name: 'Research & Publications',
          hint: 'Scientific papers and observational datasets',
          icon: Database,
          action: () => { navigate('/explore/research'); onClose(); }
        },
        {
          category: 'Explore',
          name: 'Media Library',
          hint: 'Authenticated photography & field footage',
          icon: Film,
          action: () => { navigate('/explore/media'); onClose(); }
        },
        {
          category: 'Learn',
          name: 'Science Explainers',
          hint: 'Educational polar science stories',
          icon: Sparkles,
          action: () => { navigate('/explore/explainers'); onClose(); }
        },
        {
          category: 'Learn',
          name: 'Topics & Taxonomy',
          hint: 'Cryosphere, oceanography, biology themes',
          icon: BookOpen,
          action: () => { navigate('/explore/topics'); onClose(); }
        },
        {
          category: 'Evidence',
          name: 'Explore Evidence',
          hint: 'Public source-grounded provenance chain',
          icon: Shield,
          action: () => { navigate('/explore/evidence'); onClose(); }
        },
        {
          category: 'Evidence',
          name: 'Knowledge Graph',
          hint: 'Interactive semantic relationship canvas',
          icon: Compass,
          action: () => { navigate('/explore/knowledge-graph'); onClose(); }
        },
        {
          category: 'Search',
          name: 'Global Search',
          hint: 'Search verified polar science records',
          icon: Search,
          action: () => { navigate('/explore/search'); onClose(); }
        },
        {
          category: 'Actions',
          name: 'Ask the Evidence',
          hint: 'Source-grounded scientific Q&A',
          icon: Sparkles,
          action: () => { onClose(); onOpenAskTheEvidence?.(); }
        }
      ]
    : [
        {
          category: 'Actions',
          name: 'Upload Research Materials',
          hint: 'Drop PDFs, CSVs, media packages',
          icon: UploadCloud,
          action: () => { navigate('/workspace/ingest'); onClose(); }
        },
        {
          category: 'Actions',
          name: 'Ask the Evidence',
          hint: 'Source-grounded scientific Q&A',
          icon: Sparkles,
          action: () => { onClose(); onOpenAskTheEvidence?.(); }
        },
        {
          category: 'Actions',
          name: 'Review Pending Verifications',
          hint: 'Scientific sign-off queue',
          icon: FileCheck,
          action: () => { navigate('/workspace/review'); onClose(); }
        },
        {
          category: 'Actions',
          name: 'Create Outreach Content',
          hint: 'Transform verified facts into explainers',
          icon: Share2,
          action: () => { navigate('/workspace/outreach'); onClose(); }
        },
        {
          category: 'Navigation',
          name: 'Evidence Trace Explorer',
          hint: 'Explore multi-modal provenance chains',
          icon: Layers,
          action: () => { navigate('/workspace/evidence'); onClose(); }
        },
        {
          category: 'Navigation',
          name: 'Knowledge Network Graph',
          hint: 'View connected polar science relationships',
          icon: Compass,
          action: () => { navigate('/workspace/knowledge'); onClose(); }
        },
        {
          category: 'Navigation',
          name: 'Expedition Catalog',
          hint: 'Antarctic, Arctic & Southern Ocean campaigns',
          icon: Compass,
          action: () => { navigate('/workspace/expeditions'); onClose(); }
        },
        {
          category: 'Navigation',
          name: 'Tabular Datasets',
          hint: 'Sensor feeds and ice borehole records',
          icon: Database,
          action: () => { navigate('/workspace/datasets'); onClose(); }
        },
        {
          category: 'Navigation',
          name: 'Media & Timestamped Videos',
          hint: 'Audio-synchronized transcripts & EXIF photos',
          icon: Film,
          action: () => { navigate('/workspace/media'); onClose(); }
        },
        {
          category: 'Navigation',
          name: 'Settings & Cloud Status',
          hint: 'Supabase & Gemini API configuration',
          icon: Settings,
          action: () => { navigate('/workspace/settings'); onClose(); }
        }
      ];

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.hint.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (filtered.length > 0) {
        filtered[0].action();
      } else if (search.trim()) {
        const dest = role === 'public'
          ? `/explore/search?q=${encodeURIComponent(search.trim())}`
          : `/workspace/search?q=${encodeURIComponent(search.trim())}`;
        navigate(dest);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-xl bg-white rounded-xl shadow-elevated border border-slate-200 overflow-hidden z-10"
          >
            {/* Input Bar */}
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder={role === 'public' ? 'Search polar science or jump to page...' : 'Type a command or jump to screen...'}
                className="w-full bg-transparent border-0 focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
              <span className="text-[11px] font-mono text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded">
                ESC
              </span>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-polar-100 group-hover:text-polar-700 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-polar-700 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.hint}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      {item.category}
                    </span>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No commands matching "{search}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span className="font-mono">POLARWEAVE v1.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
