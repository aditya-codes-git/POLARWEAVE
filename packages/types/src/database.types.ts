export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          role: "admin" | "researcher" | "public";
          avatar_url: string | null;
          institution: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          role?: "admin" | "researcher" | "public";
          avatar_url?: string | null;
          institution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          role?: "admin" | "researcher" | "public";
          avatar_url?: string | null;
          institution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expeditions: {
        Row: {
          id: string;
          title: string;
          code: string;
          description: string;
          region: "Antarctica" | "Arctic" | "Southern Ocean" | "Himalaya";
          start_date: string;
          end_date: string | null;
          status: "active" | "completed" | "archived";
          lead_agency: string;
          stations: string[];
          created_by: string | null;
          created_at: string;
          demo: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          code: string;
          description: string;
          region: "Antarctica" | "Arctic" | "Southern Ocean" | "Himalaya";
          start_date: string;
          end_date?: string | null;
          status?: "active" | "completed" | "archived";
          lead_agency?: string;
          stations?: string[];
          created_by?: string | null;
          created_at?: string;
          demo?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          code?: string;
          description?: string;
          region?: "Antarctica" | "Arctic" | "Southern Ocean" | "Himalaya";
          start_date?: string;
          end_date?: string | null;
          status?: "active" | "completed" | "archived";
          lead_agency?: string;
          stations?: string[];
          created_by?: string | null;
          created_at?: string;
          demo?: boolean;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          region: string;
          station: string | null;
          elevation_m: number | null;
          source: string;
          confidence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          region: string;
          station?: string | null;
          elevation_m?: number | null;
          source?: string;
          confidence?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          region?: string;
          station?: string | null;
          elevation_m?: number | null;
          source?: string;
          confidence?: number;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          filename: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          document_type: string;
          processing_status: "queued" | "processing" | "completed" | "failed" | "needs_review";
          page_count: number | null;
          metadata_json: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          document_type?: string;
          processing_status?: "queued" | "processing" | "completed" | "failed" | "needs_review";
          page_count?: number | null;
          metadata_json?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          storage_path?: string;
          mime_type?: string;
          size_bytes?: number;
          document_type?: string;
          processing_status?: "queued" | "processing" | "completed" | "failed" | "needs_review";
          page_count?: number | null;
          metadata_json?: Json;
          created_by?: string | null;
          created_at?: string;
        };
      };
      observations: {
        Row: {
          id: string;
          expedition_id: string | null;
          title: string;
          description: string;
          research_domain: string;
          observed_at: string | null;
          location_id: string | null;
          location_name: string | null;
          confidence: number;
          confidence_level: "HIGH" | "MEDIUM" | "LOW";
          verification_status: "AI_EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
          created_at: string;
          demo: boolean;
        };
        Insert: {
          id?: string;
          expedition_id?: string | null;
          title: string;
          description: string;
          research_domain: string;
          observed_at?: string | null;
          location_id?: string | null;
          location_name?: string | null;
          confidence?: number;
          confidence_level?: "HIGH" | "MEDIUM" | "LOW";
          verification_status?: "AI_EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
          created_at?: string;
          demo?: boolean;
        };
        Update: {
          id?: string;
          expedition_id?: string | null;
          title?: string;
          description?: string;
          research_domain?: string;
          observed_at?: string | null;
          location_id?: string | null;
          location_name?: string | null;
          confidence?: number;
          confidence_level?: "HIGH" | "MEDIUM" | "LOW";
          verification_status?: "AI_EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
          created_at?: string;
          demo?: boolean;
        };
      };
      evidence_links: {
        Row: {
          id: string;
          knowledge_type: string;
          knowledge_id: string;
          source_type: "pdf" | "docx" | "dataset" | "video" | "image" | "field_note";
          source_id: string;
          source_title: string;
          page_number: number | null;
          row_number: number | null;
          timestamp_start: number | null;
          timestamp_end: number | null;
          excerpt: string;
          media_url: string | null;
          confidence: number;
          verification_status: "AI_EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
          created_at: string;
        };
        Insert: {
          id?: string;
          knowledge_type: string;
          knowledge_id: string;
          source_type: "pdf" | "docx" | "dataset" | "video" | "image" | "field_note";
          source_id: string;
          source_title: string;
          page_number?: number | null;
          row_number?: number | null;
          timestamp_start?: number | null;
          timestamp_end?: number | null;
          excerpt: string;
          media_url?: string | null;
          confidence?: number;
          verification_status?: "AI_EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
          created_at?: string;
        };
        Update: {
          id?: string;
          knowledge_type?: string;
          knowledge_id?: string;
          source_type?: "pdf" | "docx" | "dataset" | "video" | "image" | "field_note";
          source_id?: string;
          source_title?: string;
          page_number?: number | null;
          row_number?: number | null;
          timestamp_start?: number | null;
          timestamp_end?: number | null;
          excerpt?: string;
          media_url?: string | null;
          confidence?: number;
          verification_status?: "AI_EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
          created_at?: string;
        };
      };
      processing_jobs: {
        Row: {
          id: string;
          filename: string;
          file_type: string;
          size_bytes: number;
          status: "queued" | "processing" | "completed" | "failed" | "needs_review";
          current_stage: string;
          stages: Json;
          progress: number;
          error_message: string | null;
          result_summary: Json;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          filename: string;
          file_type: string;
          size_bytes: number;
          status?: "queued" | "processing" | "completed" | "failed" | "needs_review";
          current_stage?: string;
          stages?: Json;
          progress?: number;
          error_message?: string | null;
          result_summary?: Json;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          filename?: string;
          file_type?: string;
          size_bytes?: number;
          status?: "queued" | "processing" | "completed" | "failed" | "needs_review";
          current_stage?: string;
          stages?: Json;
          progress?: number;
          error_message?: string | null;
          result_summary?: Json;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      generated_content: {
        Row: {
          id: string;
          source_knowledge_ids: string[];
          content_type: string;
          audience: string;
          tone: string;
          title: string;
          content: string;
          summary: string;
          citations: Json;
          status: "draft" | "reviewed" | "published";
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_knowledge_ids?: string[];
          content_type: string;
          audience: string;
          tone: string;
          title: string;
          content: string;
          summary: string;
          citations?: Json;
          status?: "draft" | "reviewed" | "published";
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_knowledge_ids?: string[];
          content_type?: string;
          audience?: string;
          tone?: string;
          title?: string;
          content?: string;
          summary?: string;
          citations?: Json;
          status?: "draft" | "reviewed" | "published";
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
