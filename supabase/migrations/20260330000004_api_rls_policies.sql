-- POLARWEAVE Backend API Access Policies
-- Allows the Node.js Express backend service (using Supabase API key) to perform CRUD operations
-- on core research, ingestion, evidence, and verification tables.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents' AND policyname = 'Allow API read write documents') THEN
        CREATE POLICY "Allow API read write documents" ON public.documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'document_chunks' AND policyname = 'Allow API read write document_chunks') THEN
        CREATE POLICY "Allow API read write document_chunks" ON public.document_chunks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'datasets' AND policyname = 'Allow API read write datasets') THEN
        CREATE POLICY "Allow API read write datasets" ON public.datasets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'observations' AND policyname = 'Allow API read write observations') THEN
        CREATE POLICY "Allow API read write observations" ON public.observations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'measurements' AND policyname = 'Allow API read write measurements') THEN
        CREATE POLICY "Allow API read write measurements" ON public.measurements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'media_assets' AND policyname = 'Allow API read write media_assets') THEN
        CREATE POLICY "Allow API read write media_assets" ON public.media_assets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evidence_links' AND policyname = 'Allow API read write evidence_links') THEN
        CREATE POLICY "Allow API read write evidence_links" ON public.evidence_links FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'knowledge_relationships' AND policyname = 'Allow API read write knowledge_relationships') THEN
        CREATE POLICY "Allow API read write knowledge_relationships" ON public.knowledge_relationships FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'processing_jobs' AND policyname = 'Allow API read write processing_jobs') THEN
        CREATE POLICY "Allow API read write processing_jobs" ON public.processing_jobs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'verification_records' AND policyname = 'Allow API read write verification_records') THEN
        CREATE POLICY "Allow API read write verification_records" ON public.verification_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generated_content' AND policyname = 'Allow API read write generated_content') THEN
        CREATE POLICY "Allow API read write generated_content" ON public.generated_content FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
