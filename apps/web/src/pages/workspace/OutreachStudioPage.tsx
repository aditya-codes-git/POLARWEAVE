import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Share2,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  Database,
  Film,
  Send,
  Download,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react';
import { getObservations, generateOutreach, getOutreachList } from '../../lib/api';
import {
  Observation,
  GeneratedContent,
  OutreachType,
  OutreachAudience,
  OutreachTone,
  ContentCitation
} from '@polarweave/types';
import { DomainBadge } from '../../components/ui/badges';

export function OutreachStudioPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedObsId, setSelectedObsId] = useState<string>('');
  const [contentType, setContentType] = useState<OutreachType>('student_explainer');
  const [audience, setAudience] = useState<OutreachAudience>('student');
  const [tone, setTone] = useState<OutreachTone>('accessible');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active generated piece
  const [activeContent, setActiveContent] = useState<GeneratedContent | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<ContentCitation | null>(null);

  useEffect(() => {
    getObservations().then((list) => {
      // Filter for verified observations only (Section 24)
      const verified = list.filter((o) => o.verification_status === 'VERIFIED');
      const usable = verified.length > 0 ? verified : list;
      setObservations(usable);
      if (usable.length > 0) {
        setSelectedObsId(usable[0].id);
      }
    });

    getOutreachList().then((list) => {
      if (list.length > 0) {
        setActiveContent(list[0]);
        if (list[0].citations?.length > 0) {
          setSelectedCitation(list[0].citations[0]);
        }
      }
    });
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateOutreach({
        source_knowledge_ids: [selectedObsId],
        content_type: contentType,
        audience,
        tone
      });
      setActiveContent(generated);
      if (generated.citations.length > 0) {
        setSelectedCitation(generated.citations[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (activeContent) {
      navigator.clipboard.writeText(`${activeContent.title}\n\n${activeContent.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-polar-700 bg-polar-50 px-2 py-0.5 rounded border border-polar-200">
            Dissemination Engine
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-mono">Evidence-Locked Outreach Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Outreach Studio
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Transform verified scientific polar research into audience-targeted articles, student explainers, and press dispatches with permanent citation anchors.
        </p>
      </div>

      {/* Main Grid: Left Generator Form & Right Live Editor with Source Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SOURCE & CALIBRATION (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              1. Grounding Knowledge Source
            </h2>
            <p className="text-xs text-slate-800 font-medium">
              Verified observations only (No hallucination)
            </p>
          </div>

          {/* Select Observation */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Verified Fact Source:
            </label>
            <select
              value={selectedObsId}
              onChange={(e) => setSelectedObsId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-polar-500 focus:bg-white"
            >
              {observations.map((obs) => (
                <option key={obs.id} value={obs.id}>
                  {obs.title}
                </option>
              ))}
            </select>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Content Format:
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as OutreachType)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-polar-500 focus:bg-white"
            >
              <option value="student_explainer">Student Explainer (K-12 & University)</option>
              <option value="public_explainer">Public Science Explainer</option>
              <option value="website_article">MoES Portal Article</option>
              <option value="press_release">Official Press Release (PIB / Media)</option>
              <option value="linkedin_post">LinkedIn / Research Network Post</option>
              <option value="social_caption">Social Media Caption & Highlights</option>
              <option value="newsletter">Polar Science Monthly Digest</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Target Audience:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['student', 'public', 'media', 'educator'] as const).map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setAudience(aud)}
                  className={`p-2 rounded-lg text-xs font-medium capitalize border transition-all text-center ${
                    audience === aud
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Narrative Tone:
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as OutreachTone)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-polar-500 focus:bg-white"
            >
              <option value="accessible">Accessible & Engaging</option>
              <option value="scientific">Strict Scientific & Rigorous</option>
              <option value="educational">Educational & Explanatory</option>
              <option value="institutional">Institutional & Authoritative</option>
            </select>
          </div>

          {/* Generate CTA Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-polar-400" />
            <span>{isGenerating ? 'Synthesizing with Citations...' : 'Generate Audience Content'}</span>
          </button>
        </div>

        {/* RIGHT COLUMN: GENERATED CONTENT & SOURCE RAIL (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-6">
          {activeContent ? (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-polar-50 text-polar-700 border border-polar-200 font-semibold">
                      {activeContent.content_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 capitalize">
                      Audience: {activeContent.audience}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {activeContent.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => alert('Published to MoES Polar Science Dissemination Portal!')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Dissemination</span>
                  </button>
                </div>
              </div>

              {/* Body Text with Clickable Citation Badges (Section 25) */}
              <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-100 space-y-4">
                <div className="text-xs text-slate-500 italic pb-2 border-b border-slate-200/60 font-mono">
                  Summary: {activeContent.summary}
                </div>

                <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-line font-sans">
                  {activeContent.content}
                </div>
              </div>

              {/* EVIDENCE-LOCKED CITATION RAIL (Section 25) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-900">
                      Generated from {activeContent.citations.length} Verified Evidence Sources
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click citation to inspect ground-truth
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeContent.citations.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedCitation(c)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedCitation?.citation_label === c.citation_label
                          ? 'border-polar-500 bg-polar-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-bold text-polar-700">
                          {c.citation_label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {c.page_or_row_or_time || 'Source'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {c.source_title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-mono">
                        "{c.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select an observation on the left and click "Generate Audience Content"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
