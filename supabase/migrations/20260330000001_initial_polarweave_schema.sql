-- ===================================================
-- POLARWEAVE — CORE DATABASE SCHEMA
-- SIH26063: Integrated Polar Science Outreach & Knowledge Repository
-- ===================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Try enabling pgvector if available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension is not available in this Postgres instance. Proceeding with standard columns.';
END $$;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'researcher', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status_type AS ENUM ('AI_EXTRACTED', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidence_level_type AS ENUM ('HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE processing_status_type AS ENUM ('queued', 'processing', 'completed', 'failed', 'needs_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role_type NOT NULL DEFAULT 'researcher',
    avatar_url TEXT,
    institution TEXT DEFAULT 'National Centre for Polar and Ocean Research (NCPOR)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EXPEDITIONS
CREATE TABLE IF NOT EXISTS public.expeditions (
    id TEXT PRIMARY KEY DEFAULT ('exp_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    region TEXT NOT NULL CHECK (region IN ('Antarctica', 'Arctic', 'Southern Ocean', 'Himalaya')),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('active', 'completed', 'archived')),
    lead_agency TEXT NOT NULL DEFAULT 'National Centre for Polar and Ocean Research (NCPOR)',
    stations TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    demo BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. LOCATIONS
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY DEFAULT ('loc_' || substr(md5(random()::text), 1, 12)),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    region TEXT NOT NULL,
    station TEXT,
    elevation_m DOUBLE PRECISION,
    source TEXT NOT NULL DEFAULT 'NCPOR Polar Registry',
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RESEARCHERS
CREATE TABLE IF NOT EXISTS public.researchers (
    id TEXT PRIMARY KEY DEFAULT ('res_' || substr(md5(random()::text), 1, 12)),
    full_name TEXT NOT NULL,
    institution TEXT NOT NULL,
    designation TEXT,
    domain TEXT,
    email TEXT,
    expeditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DOCUMENTS (Unstructured files)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY DEFAULT ('doc_' || substr(md5(random()::text), 1, 12)),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'expedition_report',
    processing_status processing_status_type NOT NULL DEFAULT 'queued',
    page_count INTEGER,
    metadata_json JSONB DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DOCUMENT CHUNKS (For Evidence Excerpt & Search)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id TEXT PRIMARY KEY DEFAULT ('chk_' || substr(md5(random()::text), 1, 12)),
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    section TEXT,
    content TEXT NOT NULL,
    token_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. DATASETS
CREATE TABLE IF NOT EXISTS public.datasets (
    id TEXT PRIMARY KEY DEFAULT ('dts_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    source_document_id TEXT REFERENCES public.documents(id) ON DELETE SET NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    schema_json JSONB DEFAULT '[]'::JSONB,
    preview_data JSONB DEFAULT '[]'::JSONB,
    processing_status processing_status_type NOT NULL DEFAULT 'completed',
    region TEXT,
    expedition_id TEXT REFERENCES public.expeditions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. OBSERVATIONS (Core Scientific Fact)
CREATE TABLE IF NOT EXISTS public.observations (
    id TEXT PRIMARY KEY DEFAULT ('obs_' || substr(md5(random()::text), 1, 12)),
    expedition_id TEXT REFERENCES public.expeditions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    research_domain TEXT NOT NULL,
    observed_at TIMESTAMPTZ,
    location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
    location_name TEXT,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    confidence_level confidence_level_type NOT NULL DEFAULT 'HIGH',
    verification_status verification_status_type NOT NULL DEFAULT 'AI_EXTRACTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    demo BOOLEAN NOT NULL DEFAULT FALSE
);

-- 11. MEASUREMENTS
CREATE TABLE IF NOT EXISTS public.measurements (
    id TEXT PRIMARY KEY DEFAULT ('msr_' || substr(md5(random()::text), 1, 12)),
    observation_id TEXT NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
    variable TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    timestamp TIMESTAMPTZ,
    source_dataset_id TEXT REFERENCES public.datasets(id) ON DELETE SET NULL,
    source_row INTEGER,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.95
);

-- 12. PUBLICATIONS
CREATE TABLE IF NOT EXISTS public.publications (
    id TEXT PRIMARY KEY DEFAULT ('pub_' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    journal TEXT,
    doi TEXT,
    publication_date DATE,
    abstract TEXT NOT NULL,
    expedition_id TEXT REFERENCES public.expeditions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS public.media_assets (
    id TEXT PRIMARY KEY DEFAULT ('med_' || substr(md5(random()::text), 1, 12)),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
    thumbnail_path TEXT,
    expedition_id TEXT REFERENCES public.expeditions(id) ON DELETE SET NULL,
    location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
    location_name TEXT,
    capture_date TIMESTAMPTZ,
    metadata_json JSONB DEFAULT '{}'::JSONB,
    ai_analysis_json JSONB DEFAULT '{}'::JSONB,
    transcript JSONB DEFAULT '{}'::JSONB,
    duration_seconds DOUBLE PRECISION,
    processing_status processing_status_type NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. EVIDENCE LINKS (CRITICAL DIFFERENTIATOR)
CREATE TABLE IF NOT EXISTS public.evidence_links (
    id TEXT PRIMARY KEY DEFAULT ('evi_' || substr(md5(random()::text), 1, 12)),
    knowledge_type TEXT NOT NULL,
    knowledge_id TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'docx', 'dataset', 'video', 'image', 'field_note')),
    source_id TEXT NOT NULL,
    source_title TEXT NOT NULL,
    page_number INTEGER,
    row_number INTEGER,
    timestamp_start DOUBLE PRECISION,
    timestamp_end DOUBLE PRECISION,
    excerpt TEXT NOT NULL,
    media_url TEXT,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    verification_status verification_status_type NOT NULL DEFAULT 'AI_EXTRACTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. KNOWLEDGE RELATIONSHIPS (Semantic Graph)
CREATE TABLE IF NOT EXISTS public.knowledge_relationships (
    id TEXT PRIMARY KEY DEFAULT ('rel_' || substr(md5(random()::text), 1, 12)),
    source_entity_type TEXT NOT NULL,
    source_entity_id TEXT NOT NULL,
    target_entity_type TEXT NOT NULL,
    target_entity_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    label TEXT,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. PROCESSING JOBS (Multimodal Ingestion Pipeline)
CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id TEXT PRIMARY KEY DEFAULT ('job_' || substr(md5(random()::text), 1, 12)),
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    status processing_status_type NOT NULL DEFAULT 'queued',
    current_stage TEXT NOT NULL DEFAULT 'uploaded',
    stages JSONB NOT NULL DEFAULT '[]'::JSONB,
    progress INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    result_summary JSONB DEFAULT '{}'::JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 17. VERIFICATION RECORDS (Human in the loop audit trail)
CREATE TABLE IF NOT EXISTS public.verification_records (
    id TEXT PRIMARY KEY DEFAULT ('ver_' || substr(md5(random()::text), 1, 12)),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'edited', 'rejected')),
    notes TEXT,
    previous_value JSONB,
    new_value JSONB,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. GENERATED OUTREACH CONTENT
CREATE TABLE IF NOT EXISTS public.generated_content (
    id TEXT PRIMARY KEY DEFAULT ('out_' || substr(md5(random()::text), 1, 12)),
    source_knowledge_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    content_type TEXT NOT NULL,
    audience TEXT NOT NULL,
    tone TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    citations JSONB NOT NULL DEFAULT '[]'::JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. INDEXES
CREATE INDEX IF NOT EXISTS idx_obs_expedition ON public.observations(expedition_id);
CREATE INDEX IF NOT EXISTS idx_obs_location ON public.observations(location_id);
CREATE INDEX IF NOT EXISTS idx_obs_verification ON public.observations(verification_status);
CREATE INDEX IF NOT EXISTS idx_obs_domain ON public.observations(research_domain);
CREATE INDEX IF NOT EXISTS idx_evidence_knowledge ON public.evidence_links(knowledge_id, knowledge_type);
CREATE INDEX IF NOT EXISTS idx_evidence_source ON public.evidence_links(source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_rel_source ON public.knowledge_relationships(source_entity_id, source_entity_type);
CREATE INDEX IF NOT EXISTS idx_rel_target ON public.knowledge_relationships(target_entity_id, target_entity_type);
CREATE INDEX IF NOT EXISTS idx_media_expedition ON public.media_assets(expedition_id);
CREATE INDEX IF NOT EXISTS idx_datasets_expedition ON public.datasets(expedition_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(processing_status);

-- 20. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Public can read verified observations, publications, locations, expeditions, media
CREATE POLICY "Public read published expeditions" ON public.expeditions FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public read researchers" ON public.researchers FOR SELECT USING (true);
CREATE POLICY "Public read verified observations" ON public.observations FOR SELECT USING (verification_status = 'VERIFIED' OR demo = true);
CREATE POLICY "Public read datasets" ON public.datasets FOR SELECT USING (true);
CREATE POLICY "Public read publications" ON public.publications FOR SELECT USING (true);
CREATE POLICY "Public read media" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Public read evidence" ON public.evidence_links FOR SELECT USING (true);
CREATE POLICY "Public read knowledge relations" ON public.knowledge_relationships FOR SELECT USING (true);
CREATE POLICY "Public read published outreach" ON public.generated_content FOR SELECT USING (status = 'published');

-- Authenticated researchers & admins have full management
CREATE POLICY "Auth full access profiles" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access expeditions" ON public.expeditions FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access documents" ON public.documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access datasets" ON public.datasets FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access observations" ON public.observations FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access measurements" ON public.measurements FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access publications" ON public.publications FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access media" ON public.media_assets FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access evidence" ON public.evidence_links FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access knowledge relations" ON public.knowledge_relationships FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access processing jobs" ON public.processing_jobs FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access verification" ON public.verification_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access generated content" ON public.generated_content FOR ALL TO authenticated USING (true);
