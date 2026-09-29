import { Request, Response } from 'express';
import { memoryStore } from '../db/supabase.js';

export async function getEvidenceByKnowledgeId(req: Request, res: Response) {
  const { knowledgeId } = req.params;

  const links = memoryStore.evidenceLinks.filter((e) => e.knowledge_id === knowledgeId);
  const observation = memoryStore.observations.find((o) => o.id === knowledgeId);

  // Group evidence by source type
  const grouped = {
    reports: links.filter((l) => l.source_type === 'pdf' || l.source_type === 'docx'),
    datasets: links.filter((l) => l.source_type === 'dataset'),
    videos: links.filter((l) => l.source_type === 'video'),
    images: links.filter((l) => l.source_type === 'image'),
    field_notes: links.filter((l) => l.source_type === 'field_note')
  };

  return res.status(200).json({
    success: true,
    data: {
      knowledge_id: knowledgeId,
      knowledge_title: observation?.title || 'Scientific Knowledge Fact',
      confidence: observation?.confidence || 0.94,
      verification_status: observation?.verification_status || 'VERIFIED',
      total_sources: links.length,
      evidence_chain: links,
      grouped_sources: grouped
    }
  });
}
