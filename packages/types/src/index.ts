import { z } from "zod";
export * from "./database.types.js";

// ===================================================
// ENUMS & CONSTANTS
// ===================================================

export type VerificationStatus =
  | "AI_EXTRACTED"
  | "NEEDS_REVIEW"
  | "PENDING_ADMIN_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type UserRole = "admin" | "researcher" | "public";

export type SourceType =
  | "pdf"
  | "docx"
  | "dataset"
  | "video"
  | "image"
  | "field_note";

export type EntityType =
  | "expedition"
  | "location"
  | "researcher"
  | "observation"
  | "dataset"
  | "publication"
  | "media"
  | "report"
  | "activity";

export type OutreachType =
  | "website_article"
  | "public_explainer"
  | "student_explainer"
  | "linkedin_post"
  | "social_caption"
  | "press_release"
  | "newsletter";

export type OutreachAudience =
  | "public"
  | "student"
  | "educator"
  | "researcher"
  | "media";

export type OutreachTone =
  | "scientific"
  | "accessible"
  | "educational"
  | "institutional";

// ===================================================
// DOMAIN MODELS
// ===================================================

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  institution?: string;
  organization?: string;
  designation?: string;
  country?: string;
  research_domain?: string;
  affiliation?: string;
  explorer_interest?: string;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Expedition {
  id: string;
  title: string;
  code: string;
  description: string;
  region: "Antarctica" | "Arctic" | "Southern Ocean" | "Himalaya";
  start_date: string;
  end_date?: string;
  status: "active" | "completed" | "archived";
  lead_agency: string;
  stations: string[];
  created_by?: string;
  created_at: string;
  demo?: boolean;
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  station?: string;
  elevation_m?: number;
  source: string;
  confidence: number;
}

export interface Document {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  document_type: "expedition_report" | "field_notes" | "scientific_paper" | "protocol" | "other";
  processing_status: "queued" | "processing" | "completed" | "failed";
  processing_job_id?: string;
  page_count?: number;
  metadata_json?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  page_number: number;
  section?: string;
  content: string;
  token_count?: number;
  embedding?: number[];
  created_at: string;
}

export interface DatasetColumn {
  name: string;
  datatype: "numeric" | "string" | "date" | "coordinate" | "boolean";
  description?: string;
  unit?: string;
}

export interface Dataset {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  source_document_id?: string;
  processing_job_id?: string;
  row_count: number;
  column_count: number;
  columns?: DatasetColumn[];
  schema_json?: Record<string, unknown>;
  preview_data?: Record<string, unknown>[];
  processing_status: "queued" | "processing" | "completed" | "failed";
  region?: string;
  expedition_id?: string;
  created_at: string;
}

export interface Observation {
  id: string;
  expedition_id?: string;
  expedition_title?: string;
  title: string;
  description: string;
  research_domain:
    | "Glaciology"
    | "Oceanography"
    | "Atmospheric Sciences"
    | "Biology & Ecology"
    | "Geology & Geophysics"
    | "Meteorology"
    | "Cryosphere Dynamics"
    | "General Science"
    | "Other";
  observed_at?: string;
  location_id?: string;
  location_name?: string;
  confidence: number; // 0.0 to 1.0 (Extraction confidence)
  confidence_level: ConfidenceLevel;
  verification_status: VerificationStatus;
  created_at: string;
  created_by?: string;
  created_by_name?: string;
  demo?: boolean;
  processing_job_id?: string;
  source_file_id?: string;
  source_file_name?: string;
  excerpt?: string;
  page_number?: number;
}

export interface Measurement {
  id: string;
  observation_id: string;
  variable: string;
  value: number;
  unit: string;
  timestamp?: string;
  source_dataset_id?: string;
  source_dataset_name?: string;
  source_row?: number;
  confidence: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  doi?: string;
  publication_date?: string;
  abstract: string;
  expedition_id?: string;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  storage_path: string;
  type: "image" | "video" | "audio";
  thumbnail_path?: string;
  expedition_id?: string;
  location_id?: string;
  location_name?: string;
  capture_date?: string;
  processing_job_id?: string;
  metadata_json?: {
    exif?: Record<string, unknown>;
    gps?: { latitude: number; longitude: number; altitude?: number };
    camera_model?: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  };
  ai_analysis_json?: {
    caption?: string;
    detected_entities?: string[];
    confidence?: number;
    is_authoritative_gps?: boolean;
    raw_analysis?: Record<string, unknown>;
    status?: string;
    error?: string | null;
    [key: string]: unknown;
  };
  transcript?: {
    segments: Array<{
      start: number;
      end: number;
      text: string;
      speaker?: string;
      topic?: string;
    }>;
    full_text: string;
  };
  duration_seconds?: number;
  processing_status: "queued" | "processing" | "completed" | "failed";
  created_at: string;
}

export interface EvidenceLink {
  id: string;
  knowledge_type: EntityType;
  knowledge_id: string;
  source_type: SourceType;
  source_id: string;
  source_title: string;
  page_number?: number;
  row_number?: number;
  timestamp_start?: number;
  timestamp_end?: number;
  excerpt: string;
  media_url?: string;
  confidence: number; // 0.0 to 1.0
  verification_status: VerificationStatus;
  processing_job_id?: string;
  created_at: string;
}

export interface KnowledgeEntity {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  confidence: number;
  verification_status: VerificationStatus;
}

export interface KnowledgeRelationship {
  id: string;
  source_entity_type: EntityType;
  source_entity_id: string;
  target_entity_type: EntityType;
  target_entity_id: string;
  relationship_type:
    | "OBSERVED_AT"
    | "PART_OF_EXPEDITION"
    | "RECORDED_IN"
    | "MEASURED_BY"
    | "PUBLISHED_IN"
    | "DOCUMENTED_BY"
    | "SUPPORTS_OBSERVATION"
    | "CAPTURED_BY";
  label?: string;
  confidence: number;
  status: "suggested" | "verified" | "rejected";
  created_at: string;
}

export interface ProcessingStageInfo {
  name: string;
  label: string;
  status: "pending" | "active" | "completed" | "failed";
  progress: number; // 0 to 100
  detail?: string;
}

export interface ProcessingJob {
  id: string;
  filename: string;
  title?: string;
  original_filename?: string;
  created_by?: string;
  created_by_name?: string;
  file_type: string;
  size_bytes: number;
  status: "queued" | "processing" | "completed" | "failed" | "needs_review";
  current_stage: string;
  stages: ProcessingStageInfo[];
  progress: number;
  error_message?: string;
  result_summary?: {
    entities_detected: number;
    observations_found: number;
    locations_matched: number;
    evidence_links_count: number;
  };
  started_at: string;
  completed_at?: string;
}

export interface VerificationRecord {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  reviewer_id: string;
  reviewer_name: string;
  status: "approved" | "edited" | "rejected";
  notes?: string;
  previous_value?: string;
  new_value?: string;
  reviewed_at: string;
}

export interface ContentCitation {
  citation_label: string;
  knowledge_id: string;
  source_title: string;
  source_type: SourceType;
  page_or_row_or_time?: string;
  excerpt: string;
}

export interface GeneratedContent {
  id: string;
  source_knowledge_ids: string[];
  content_type: OutreachType;
  audience: OutreachAudience;
  tone: OutreachTone;
  title: string;
  content: string;
  summary: string;
  citations: ContentCitation[];
  status: "draft" | "reviewed" | "published";
  created_by?: string;
  created_at: string;
}

// ===================================================
// ZOD SCHEMAS FOR STRUCTURED AI EXTRACTION & API VALIDATION
// ===================================================

export const ExtractedEntitySchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  source_reference: z.string().nullable().optional(),
  page_number: z.number().nullable().optional(),
  row_number: z.number().nullable().optional(),
  timestamp_seconds: z.number().nullable().optional(),
  confidence: z.number().min(0).max(1),
  reason: z.string().nullable().optional(),
});

export const ExtractedObservationSchema = z.object({
  title: z.string(),
  description: z.string(),
  research_domain: z.enum([
    "Glaciology",
    "Oceanography",
    "Atmospheric Sciences",
    "Biology & Ecology",
    "Geology & Geophysics",
    "Meteorology",
    "Cryosphere Dynamics",
    "General Science",
    "Other",
  ]),
  observed_at: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  measurements: z
    .array(
      z.object({
        variable: z.string(),
        value: z.number(),
        unit: z.string().nullable().optional().default(''),
      })
    )
    .default([]),
  confidence: z.number().min(0).max(1),
  source_reference: z.string(),
  page_number: z.number().nullable().optional(),
  excerpt: z.string(),
});

export const ScientificStructuringOutputSchema = z.object({
  title: z.string().nullable().optional().transform(v => v || "Untitled Document"),
  content_type: z.string().nullable().optional().transform(v => v || "document"),
  expedition: z.string().nullable().optional(),
  locations: z.array(ExtractedEntitySchema).default([]),
  researchers: z.array(ExtractedEntitySchema).default([]),
  research_domains: z.array(z.string()).default([]),
  observations: z.array(ExtractedObservationSchema).default([]),
  datasets: z
    .array(
      z.object({
        title: z.string(),
        variables: z.array(z.string()),
        unit_summary: z.string().optional(),
        row_estimate: z.number().optional(),
      })
    )
    .default([]),
  publications: z.array(z.string()).default([]),
  media_references: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  summary: z.string().nullable().optional().transform(v => v || ""),
});

export type ScientificStructuringOutput = z.infer<
  typeof ScientificStructuringOutputSchema
>;

// Outreach Generation Request Schema
export const OutreachGenerationRequestSchema = z.object({
  source_knowledge_ids: z.array(z.string()).min(1),
  content_type: z.enum([
    "website_article",
    "public_explainer",
    "student_explainer",
    "linkedin_post",
    "social_caption",
    "press_release",
    "newsletter",
  ]),
  audience: z.enum(["public", "student", "educator", "researcher", "media"]),
  tone: z.enum(["scientific", "accessible", "educational", "institutional"]),
  expedition_id: z.string().optional(),
});

export type OutreachGenerationRequest = z.infer<
  typeof OutreachGenerationRequestSchema
>;

// Review Action Schema
export const ReviewActionSchema = z.object({
  action: z.enum(["approve", "edit", "reject"]),
  notes: z.string().optional(),
  edited_data: z.record(z.unknown()).optional(),
  reviewer_id: z.string().optional(),
  reviewer_name: z.string().optional(),
});

export type ReviewAction = z.infer<typeof ReviewActionSchema>;

// Global Search Filter Schema
export const SearchQuerySchema = z.object({
  query: z.string(),
  type: z.string().optional(),
  expedition: z.string().optional(),
  region: z.string().optional(),
  year: z.string().optional(),
  research_domain: z.string().optional(),
  verification_state: z.string().optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Unified API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
