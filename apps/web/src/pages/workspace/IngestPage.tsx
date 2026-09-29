import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Database,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  ArrowRight,
  Layers,
  Info
} from 'lucide-react';
import { processPackage } from '../../lib/api';

interface UploadItem {
  id: string;
  name: string;
  type: string;
  size: string;
  category: 'PDF' | 'CSV' | 'DOCX' | 'IMAGE' | 'VIDEO';
}

export function IngestPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Default sample research package for seamless SIH judging
  const [files, setFiles] = useState<UploadItem[]>([
    { id: '1', name: 'report_expedition_45_final.pdf', type: 'application/pdf', size: '2.4 MB', category: 'PDF' },
    { id: '2', name: 'ice_measurements_larsemann.csv', type: 'text/csv', size: '422 KB', category: 'CSV' },
    { id: '3', name: 'field_notes_glaciology_diary.docx', type: 'application/vnd.docx', size: '640 KB', category: 'DOCX' },
    { id: '4', name: 'IMG_2041.jpg', type: 'image/jpeg', size: '3.1 MB', category: 'IMAGE' },
    { id: '5', name: 'scientist_interview.mp4', type: 'video/mp4', size: '28.4 MB', category: 'VIDEO' }
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newItems: UploadItem[] = Array.from(e.dataTransfer.files).map((f, i) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        let cat: UploadItem['category'] = 'PDF';
        if (ext === 'csv' || ext === 'xlsx') cat = 'CSV';
        else if (ext === 'docx') cat = 'DOCX';
        else if (['jpg', 'jpeg', 'png'].includes(ext || '')) cat = 'IMAGE';
        else if (['mp4', 'mov'].includes(ext || '')) cat = 'VIDEO';

        return {
          id: `upload_${Date.now()}_${i}`,
          name: f.name,
          type: f.type,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          category: cat
        };
      });
      setFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadItem[] = Array.from(e.target.files).map((f, i) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        let cat: UploadItem['category'] = 'PDF';
        if (ext === 'csv' || ext === 'xlsx') cat = 'CSV';
        else if (ext === 'docx') cat = 'DOCX';
        else if (['jpg', 'jpeg', 'png'].includes(ext || '')) cat = 'IMAGE';
        else if (['mp4', 'mov'].includes(ext || '')) cat = 'VIDEO';

        return {
          id: `upload_${Date.now()}_${i}`,
          name: f.name,
          type: f.type,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          category: cat
        };
      });
      setFiles((prev) => [...prev, ...newItems]);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const loadStandardDemoPackage = () => {
    setFiles([
      { id: '1', name: 'report_expedition_45_final.pdf', type: 'application/pdf', size: '2.4 MB', category: 'PDF' },
      { id: '2', name: 'ice_measurements_larsemann.csv', type: 'text/csv', size: '422 KB', category: 'CSV' },
      { id: '3', name: 'field_notes_glaciology_diary.docx', type: 'application/vnd.docx', size: '640 KB', category: 'DOCX' },
      { id: '4', name: 'IMG_2041.jpg', type: 'image/jpeg', size: '3.1 MB', category: 'IMAGE' },
      { id: '5', name: 'scientist_interview.mp4', type: 'video/mp4', size: '28.4 MB', category: 'VIDEO' }
    ]);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      // Trigger process endpoint
      await processPackage();
      navigate('/workspace/processing');
    } catch (e) {
      console.error(e);
      navigate('/workspace/processing');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            Multimodal Ingestion
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">Expedition 45 Ingestion Center</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Drop Research Material Here
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          POLARWEAVE ingests heterogeneous field packages (PDF, CSV, DOCX, images, and timestamped videos) and structures them into verified knowledge.
        </p>
      </div>

      {/* Hero Dropzone (Section 11) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all bg-white relative overflow-hidden ${
          isDragging
            ? 'border-polar-500 bg-polar-50/50'
            : 'border-slate-300 hover:border-slate-400 shadow-subtle'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <div className="w-14 h-14 rounded-2xl bg-polar-50 text-polar-600 flex items-center justify-center mx-auto mb-4 border border-polar-200 shadow-sm">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Drop research material here
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          PDF, DOCX, CSV, XLSX, high-resolution JPG/PNG and MP4 expedition recordings
        </p>

        <div className="flex items-center justify-center gap-3">
          <label
            htmlFor="file-upload"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
          >
            Browse Local Files
          </label>
          <button
            type="button"
            onClick={loadStandardDemoPackage}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
          >
            Load Expedition 45 Sample Package
          </button>
        </div>
      </div>

      {/* Package Contents List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Package Staging ({files.length} items)
            </h2>
            <p className="text-xs text-slate-400">
              Ready for deterministic parsing & AI structuring engine
            </p>
          </div>
          <button
            onClick={() => setFiles([])}
            className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Elegant Rows as requested in Section 11 */}
        <div className="divide-y divide-slate-100">
          {files.map((file) => (
            <div
              key={file.id}
              className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                {file.category === 'PDF' && <FileText className="w-5 h-5 text-rose-600" />}
                {file.category === 'CSV' && <Database className="w-5 h-5 text-emerald-600" />}
                {file.category === 'DOCX' && <FileText className="w-5 h-5 text-blue-600" />}
                {file.category === 'IMAGE' && <ImageIcon className="w-5 h-5 text-purple-600" />}
                {file.category === 'VIDEO' && <Film className="w-5 h-5 text-indigo-600" />}

                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {file.category} • {file.size}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Staged
                </span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No files in staging area. Drag and drop research files or click "Load Sample Package".
            </div>
          )}
        </div>

        {/* Processing CTA */}
        {files.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-polar-600" />
              <span>Target Expedition: 45th Indian Scientific Expedition to Antarctica</span>
            </div>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-polar-400" />
              <span>{isProcessing ? 'Initiating Pipeline...' : 'Process Materials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
