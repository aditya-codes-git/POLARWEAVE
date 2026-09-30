import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parsePdfBuffer } from '../ingestion/parsers/pdfParser.js';
import { parseDocxBuffer } from '../ingestion/parsers/docxParser.js';
import { parseTabularBuffer } from '../ingestion/parsers/tabularParser.js';
import { structureScientificDocument, analyzeImageContent } from '../ai/gemini.js';
import { linkEvidenceCrossModal } from '../ai/linking.js';
import {
  uploadStorageFile,
  createProcessingJob,
  updateProcessingJob,
  getProcessingJobs as fetchProcessingJobs,
  getProcessingJobById as fetchProcessingJobById,
  getJobPackageData,
  createDocument,
  createDataset,
  createMediaAsset,
  createObservation,
  createMeasurements,
  createEvidenceLinks,
  createKnowledgeRelationships
} from '../db/repository.js';
import {
  ProcessingJob,
  Document as PolarDocument,
  Dataset,
  MediaAsset,
  Observation
} from '@polarweave/types';

function getFolderForMime(mime: string, ext?: string): 'documents' | 'datasets' | 'images' | 'videos' {
  if (mime.includes('image') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return 'images';
  if (mime.includes('video') || ['mp4', 'mov', 'webm'].includes(ext || '')) return 'videos';
  if (mime.includes('sheet') || mime.includes('csv') || ['csv', 'xlsx', 'xls'].includes(ext || '')) return 'datasets';
  return 'documents';
}

export async function uploadFiles(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No research files uploaded.' }
      });
    }

    const uploadedInfo = [];
    for (const file of files) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      const folder = getFolderForMime(file.mimetype, ext);
      const storageResult = await uploadStorageFile(folder, file.originalname, file.buffer, file.mimetype);

      uploadedInfo.push({
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        storagePath: storageResult.storagePath,
        publicUrl: storageResult.publicUrl,
        uploadedAt: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: `${files.length} file(s) uploaded and persisted to storage successfully.`,
        files: uploadedInfo
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: err.message || 'File upload error' }
    });
  }
}

export async function processFiles(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No files provided for processing.' }
      });
    }

    const jobId = `job_${uuidv4().slice(0, 8)}`;
    const jobName = files.length === 1 ? files[0].originalname : `${files.length} research files (${files[0].originalname} + ${files.length - 1} more)`;

    // 1. Initial Job State
    const initialJob: ProcessingJob = {
      id: jobId,
      filename: jobName,
      file_type: files.length === 1 ? files[0].mimetype : 'multipart/form-data',
      size_bytes: files.reduce((acc, f) => acc + f.size, 0),
      status: 'processing',
      current_stage: 'uploaded',
      progress: 15,
      stages: [
        { name: 'uploaded', label: 'Files received & validated in storage', status: 'completed', progress: 100, detail: `${files.length} file(s) validated` },
        { name: 'parsed', label: 'Deterministic document & media parsing', status: 'active', progress: 50, detail: 'Parsing text, structures, and visual content' },
        { name: 'extracted', label: 'Metadata & entity extraction', status: 'pending', progress: 0, detail: 'Extracting features and measurements' },
        { name: 'structured', label: 'Observation structuring', status: 'pending', progress: 0, detail: 'Mapping into verified scientific record' },
        { name: 'linked', label: 'Cross-file evidence linking', status: 'pending', progress: 0, detail: 'Establishing provenance traces to uploaded sources' },
        { name: 'indexed', label: 'Knowledge indexing', status: 'pending', progress: 0, detail: 'Connecting semantic graph and updating repository' }
      ],
      started_at: new Date().toISOString()
    };

    await createProcessingJob(initialJob);

    const processedDocuments: PolarDocument[] = [];
    const processedDatasets: Dataset[] = [];
    const processedMedia: MediaAsset[] = [];
    const newlyCreatedObs: Observation[] = [];

    // 2. Stage: parsed
    await updateProcessingJob(jobId, {
      current_stage: 'parsed',
      progress: 35,
      stages: initialJob.stages.map((s) => s.name === 'parsed' ? { ...s, status: 'active', progress: 80 } : s)
    });

    for (const f of files) {
      const ext = f.originalname.split('.').pop()?.toLowerCase();
      const folder = getFolderForMime(f.mimetype, ext);
      const { storagePath, publicUrl } = await uploadStorageFile(folder, f.originalname, f.buffer, f.mimetype);

      if (ext === 'pdf') {
        const docId = `doc_${uuidv4().slice(0, 8)}`;
        let pdfData = { numpages: 1, info: {}, text: '', pages: [] as Array<{ pageNumber: number; text: string }> };
        let parseSuccess = false;
        try {
          pdfData = await parsePdfBuffer(f.buffer);
          parseSuccess = true;
        } catch (e: any) {
          console.warn(`[POLARWEAVE Ingest] PDF parser note for ${f.originalname}:`, e?.message);
          pdfData.text = `Document ${f.originalname} uploaded to archive. Non-standard encoding detected; manual verification recommended.`;
          pdfData.pages = [{ pageNumber: 1, text: pdfData.text }];
        }

        const doc: PolarDocument = {
          id: docId,
          filename: f.originalname,
          storage_path: storagePath,
          mime_type: f.mimetype,
          size_bytes: f.size,
          document_type: 'expedition_report',
          processing_status: parseSuccess ? 'completed' : 'failed',
          processing_job_id: jobId,
          page_count: pdfData.numpages || 1,
          metadata_json: {
            ...(pdfData.info || {}),
            parse_mode: parseSuccess ? 'extracted' : 'scanned_fallback'
          },
          created_at: new Date().toISOString()
        };

        const chunks = pdfData.pages.map((p) => ({
          page_number: p.pageNumber,
          section: `Page ${p.pageNumber}`,
          content: p.text,
          token_count: Math.ceil(p.text.length / 4)
        }));

        await createDocument(doc, chunks);
        processedDocuments.push(doc);

        console.log(`[POLARWEAVE Ingest] job_id=${jobId} file_id=${docId} name=${f.originalname} text_len=${pdfData.text.length}`);

        // Structure scientific knowledge strictly from the parsed PDF
        try {
          const structuring = await structureScientificDocument(f.originalname, pdfData.text, pdfData.pages);
          for (const ob of structuring.observations) {
            const obsId = `obs_${uuidv4().slice(0, 8)}`;
            const newObs: Observation = {
              id: obsId,
              expedition_id: structuring.expedition ? undefined : undefined,
              expedition_title: structuring.expedition || undefined,
              title: ob.title,
              description: ob.description,
              research_domain: ob.research_domain,
              observed_at: ob.observed_at || new Date().toISOString(),
              location_name: ob.location || 'Unspecified Location',
              confidence: ob.confidence,
              confidence_level: ob.confidence > 0.85 ? 'HIGH' : ob.confidence > 0.6 ? 'MEDIUM' : 'LOW',
              verification_status: 'NEEDS_REVIEW',
              processing_job_id: jobId,
              source_file_id: docId,
              source_file_name: f.originalname,
              excerpt: ob.excerpt,
              page_number: ob.page_number || undefined,
              created_at: new Date().toISOString(),
              created_by: req.user?.id || 'usr_researcher_sharma',
              created_by_name: req.user?.name || 'Dr. Rajesh Sharma',
              demo: false
            };

            await createObservation(newObs);
            newlyCreatedObs.push(newObs);

            if (ob.measurements && ob.measurements.length > 0) {
              const msrs = ob.measurements.map((m) => ({
                id: `msr_${uuidv4().slice(0, 8)}`,
                observation_id: obsId,
                variable: m.variable,
                value: m.value,
                unit: m.unit || '',
                confidence: ob.confidence
              }));
              await createMeasurements(msrs);
            }
          }
        } catch (structErr: any) {
          console.warn(`[POLARWEAVE Ingest] Structuring error for ${f.originalname}:`, structErr?.message);
        }
      } else if (ext === 'txt' || ext === 'text' || ext === 'md') {
        const docId = `doc_${uuidv4().slice(0, 8)}`;
        const textContent = f.buffer.toString('utf-8');
        const doc: PolarDocument = {
          id: docId,
          filename: f.originalname,
          storage_path: storagePath,
          mime_type: f.mimetype || 'text/plain',
          size_bytes: f.size,
          document_type: 'field_notes',
          processing_status: 'completed',
          processing_job_id: jobId,
          page_count: 1,
          metadata_json: { title: f.originalname },
          created_at: new Date().toISOString()
        };

        const chunks = [{
          page_number: 1,
          section: 'Section 1',
          content: textContent,
          token_count: Math.ceil(textContent.length / 4)
        }];

        await createDocument(doc, chunks);
        processedDocuments.push(doc);

        try {
          const structuring = await structureScientificDocument(f.originalname, textContent, [{ pageNumber: 1, text: textContent }]);
          for (const ob of structuring.observations) {
            const obsId = `obs_${uuidv4().slice(0, 8)}`;
            const newObs: Observation = {
              id: obsId,
              expedition_id: undefined,
              expedition_title: structuring.expedition || undefined,
              title: ob.title,
              description: ob.description,
              research_domain: ob.research_domain,
              observed_at: ob.observed_at || new Date().toISOString(),
              location_name: ob.location || 'Unspecified Location',
              confidence: ob.confidence,
              confidence_level: ob.confidence > 0.85 ? 'HIGH' : ob.confidence > 0.6 ? 'MEDIUM' : 'LOW',
              verification_status: 'NEEDS_REVIEW',
              processing_job_id: jobId,
              source_file_id: docId,
              source_file_name: f.originalname,
              excerpt: ob.excerpt || textContent.slice(0, 200),
              page_number: 1,
              created_at: new Date().toISOString(),
              created_by: req.user?.id || 'usr_researcher_sharma',
              created_by_name: req.user?.name || 'Dr. Rajesh Sharma',
              demo: false
            };

            await createObservation(newObs);
            newlyCreatedObs.push(newObs);

            if (ob.measurements && ob.measurements.length > 0) {
              const msrs = ob.measurements.map((m) => ({
                id: `msr_${uuidv4().slice(0, 8)}`,
                observation_id: obsId,
                variable: m.variable,
                value: m.value,
                unit: m.unit || '',
                confidence: ob.confidence
              }));
              await createMeasurements(msrs);
            }
          }
        } catch (structErr: any) {
          console.warn(`[POLARWEAVE Ingest] Structuring error for ${f.originalname}:`, structErr?.message);
        }
      } else if (ext === 'docx') {
        const docId = `doc_${uuidv4().slice(0, 8)}`;
        try {
          const docxData = await parseDocxBuffer(f.buffer);
          const doc: PolarDocument = {
            id: docId,
            filename: f.originalname,
            storage_path: storagePath,
            mime_type: f.mimetype,
            size_bytes: f.size,
            document_type: 'field_notes',
            processing_status: 'completed',
            processing_job_id: jobId,
            page_count: docxData.paragraphs.length > 0 ? Math.ceil(docxData.paragraphs.length / 5) : 1,
            metadata_json: { title: f.originalname },
            created_at: new Date().toISOString()
          };

          const chunks = docxData.paragraphs.map((p, idx) => ({
            page_number: Math.floor(idx / 5) + 1,
            section: `Paragraph ${idx + 1}`,
            content: p,
            token_count: Math.ceil(p.length / 4)
          }));

          await createDocument(doc, chunks);
          processedDocuments.push(doc);

          const fullText = docxData.paragraphs.join('\n');
          const structuring = await structureScientificDocument(f.originalname, fullText);
          for (const ob of structuring.observations) {
            const obsId = `obs_${uuidv4().slice(0, 8)}`;
            const newObs: Observation = {
              id: obsId,
              title: ob.title,
              description: ob.description,
              research_domain: ob.research_domain,
              observed_at: ob.observed_at || new Date().toISOString(),
              location_name: ob.location || 'Unspecified Location',
              confidence: ob.confidence,
              confidence_level: ob.confidence > 0.85 ? 'HIGH' : 'MEDIUM',
              verification_status: 'NEEDS_REVIEW',
              processing_job_id: jobId,
              source_file_id: docId,
              source_file_name: f.originalname,
              excerpt: ob.excerpt,
              created_at: new Date().toISOString(),
              created_by: req.user?.id || 'usr_researcher_sharma',
              created_by_name: req.user?.name || 'Dr. Rajesh Sharma',
              demo: false
            };
            await createObservation(newObs);
            newlyCreatedObs.push(newObs);
          }
        } catch (e: any) {
          console.error('DOCX parsing error:', e?.message);
        }
      } else if (ext === 'csv' || ext === 'xlsx') {
        const dtsId = `dts_${uuidv4().slice(0, 8)}`;
        try {
          const tabData = parseTabularBuffer(f.buffer);
          const dataset: Dataset = {
            id: dtsId,
            title: f.originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            filename: f.originalname,
            file_path: storagePath,
            row_count: tabData.rowCount,
            column_count: tabData.columns.length,
            columns: tabData.columns,
            preview_data: tabData.previewRows,
            processing_status: 'completed',
            processing_job_id: jobId,
            created_at: new Date().toISOString()
          };

          await createDataset(dataset);
          processedDatasets.push(dataset);
        } catch (e: any) {
          console.error('Tabular parsing error:', e?.message);
        }
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        const mediaId = `med_${uuidv4().slice(0, 8)}`;
        console.log(`[POLARWEAVE Ingest] job_id=${jobId} file_id=${mediaId} analyzing image=${f.originalname}`);

        let imageAnalysis: any = null;
        let imageProcessingError: string | null = null;

        try {
          imageAnalysis = await analyzeImageContent(f.originalname, f.buffer, f.mimetype);
        } catch (visionErr: any) {
          console.error(`[POLARWEAVE Ingest] Image vision error for ${f.originalname}:`, visionErr?.message || visionErr);
          imageProcessingError = visionErr?.message || 'Vision analysis failed';
        }

        const media: MediaAsset = {
          id: mediaId,
          filename: f.originalname,
          storage_path: storagePath,
          type: 'image',
          thumbnail_path: publicUrl || storagePath,
          processing_job_id: jobId,
          capture_date: new Date().toISOString(),
          metadata_json: {
            source: 'Direct Upload',
            filename: f.originalname,
            error: imageProcessingError || undefined
          },
          ai_analysis_json: imageAnalysis ? {
            caption: imageAnalysis.caption,
            detected_entities: imageAnalysis.detected_entities,
            confidence: imageAnalysis.confidence,
            raw_analysis: imageAnalysis.raw_ai_analysis
          } : {
            status: 'processing_error',
            error: imageProcessingError
          },
          processing_status: imageProcessingError ? 'failed' : 'completed',
          created_at: new Date().toISOString()
        };

        await createMediaAsset(media);
        processedMedia.push(media);

        // If image analysis succeeded and detected an observation, create structured observation
        if (imageAnalysis && (imageAnalysis.has_observation || imageAnalysis.observation_title)) {
          const obsId = `obs_${uuidv4().slice(0, 8)}`;
          const imgObs: Observation = {
            id: obsId,
            title: imageAnalysis.observation_title || `Visual record: ${f.originalname}`,
            description: imageAnalysis.observation_description || imageAnalysis.caption,
            research_domain: (imageAnalysis.research_domain as any) || (imageAnalysis.is_polar_related ? 'Glaciology' : 'Biology & Ecology'),
            observed_at: new Date().toISOString(),
            location_name: imageAnalysis.is_polar_related ? 'Polar Field Site' : 'Unspecified Location',
            confidence: imageAnalysis.confidence,
            confidence_level: imageAnalysis.confidence > 0.85 ? 'HIGH' : 'MEDIUM',
            verification_status: 'NEEDS_REVIEW',
            processing_job_id: jobId,
            source_file_id: mediaId,
            source_file_name: f.originalname,
            excerpt: imageAnalysis.caption,
            demo: false,
            created_at: new Date().toISOString(),
            created_by: req.user?.id || 'usr_researcher_sharma',
            created_by_name: req.user?.name || 'Dr. Rajesh Sharma'
          };

          await createObservation(imgObs);
          newlyCreatedObs.push(imgObs);
        }
      } else if (['mp4', 'mov', 'webm'].includes(ext || '')) {
        const mediaId = `med_${uuidv4().slice(0, 8)}`;
        const media: MediaAsset = {
          id: mediaId,
          filename: f.originalname,
          storage_path: storagePath,
          type: 'video',
          thumbnail_path: publicUrl || storagePath,
          processing_job_id: jobId,
          capture_date: new Date().toISOString(),
          metadata_json: { source: 'Direct Upload', filename: f.originalname },
          transcript: {
            full_text: `Media recording ${f.originalname} ingested into research package.`,
            segments: [
              { start: 0, end: 10, text: `Media recording ${f.originalname} ingested.` }
            ]
          },
          duration_seconds: 60,
          processing_status: 'completed',
          created_at: new Date().toISOString()
        };

        await createMediaAsset(media);
        processedMedia.push(media);
      }
    }

    // 3. Stage: linked & indexed
    await updateProcessingJob(jobId, {
      current_stage: 'linked',
      progress: 80
    });

    const linking = linkEvidenceCrossModal({
      observations: newlyCreatedObs,
      datasets: processedDatasets,
      documents: processedDocuments,
      media: processedMedia,
      processingJobId: jobId
    });

    if (linking.evidenceLinks.length > 0) {
      await createEvidenceLinks(linking.evidenceLinks);
    }
    if (linking.relationships.length > 0) {
      await createKnowledgeRelationships(linking.relationships);
    }

    // 4. Finalize Job
    const completedStages = initialJob.stages.map((s) => ({
      ...s,
      status: 'completed' as const,
      progress: 100
    }));

    const resultSummary = {
      entities_detected: processedDocuments.length + processedDatasets.length + processedMedia.length,
      observations_found: newlyCreatedObs.length,
      locations_matched: new Set(newlyCreatedObs.map((o) => o.location_name).filter(Boolean)).size,
      files_processed: files.length,
      evidence_links_count: linking.evidenceLinks.length,
      persisted_to_postgresql: true,
      storage_bucket: 'polarweave-assets'
    };

    const finalJob = await updateProcessingJob(jobId, {
      status: 'completed',
      current_stage: 'completed',
      progress: 100,
      stages: completedStages,
      result_summary: resultSummary,
      completed_at: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      data: {
        job: finalJob || initialJob,
        extracted_observations: newlyCreatedObs,
        evidence_links_count: linking.evidenceLinks.length
      }
    });
  } catch (err: any) {
    console.error('[POLARWEAVE Ingest] Processing error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'PROCESSING_ERROR', message: err.message || 'Error processing research material' }
    });
  }
}

export async function getJobs(req: Request, res: Response) {
  const jobs = await fetchProcessingJobs();
  return res.status(200).json({
    success: true,
    data: jobs
  });
}

export async function getJobById(req: Request, res: Response) {
  const id = String(req.params.id);
  const job = await fetchProcessingJobById(id);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Job ${id} not found.` }
    });
  }
  return res.status(200).json({
    success: true,
    data: job
  });
}

export async function getJobPackage(req: Request, res: Response) {
  const id = String(req.params.id);
  const pkg = await getJobPackageData(id);
  if (!pkg) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Research package for job ${id} not found.` }
    });
  }
  return res.status(200).json({
    success: true,
    data: pkg
  });
}

export async function updateJob(req: Request, res: Response) {
  const id = String(req.params.id);
  const existingJob = await fetchProcessingJobById(id);
  if (!existingJob) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Job ${id} not found.` }
    });
  }

  // Authorization check:
  // - Admin can rename any package
  // - Researcher can rename their own package (or any package if created_by is unassigned)
  const caller = req.user;
  const isAdm = caller?.role === 'admin';
  const isOwner = !existingJob.created_by || (caller?.id && existingJob.created_by === caller.id);

  if (!isAdm && !isOwner) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You can only rename your own submitted packages.' }
    });
  }

  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'A non-empty package title is required.' }
    });
  }

  const cleanTitle = title.trim();
  const updated = await updateProcessingJob(id, {
    title: cleanTitle,
    original_filename: existingJob.original_filename || existingJob.filename
  });

  return res.status(200).json({
    success: true,
    data: updated
  });
}
