-- POLARWEAVE Storage Bucket & Policies Migration
-- Provision polarweave-assets bucket with folder conventions:
-- documents/, datasets/, images/, videos/, thumbnails/, generated/

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('polarweave-assets', 'polarweave-assets', true, 104857600)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Enable storage policies on objects for polarweave-assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access polarweave-assets'
    ) THEN
        CREATE POLICY "Public Access polarweave-assets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'polarweave-assets');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Insert polarweave-assets'
    ) THEN
        CREATE POLICY "Insert polarweave-assets"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'polarweave-assets');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Update polarweave-assets'
    ) THEN
        CREATE POLICY "Update polarweave-assets"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'polarweave-assets');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Delete polarweave-assets'
    ) THEN
        CREATE POLICY "Delete polarweave-assets"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'polarweave-assets');
    END IF;
END $$;
