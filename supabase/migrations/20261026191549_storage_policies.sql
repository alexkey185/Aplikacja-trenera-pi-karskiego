-- ============================================================
-- Polityki Storage dla bucketu club-logos
-- ============================================================

DROP POLICY IF EXISTS "club-logos: public read" ON storage.objects;
CREATE POLICY "club-logos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'club-logos');

DROP POLICY IF EXISTS "club-logos: authenticated insert" ON storage.objects;
CREATE POLICY "club-logos: authenticated insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'club-logos');

DROP POLICY IF EXISTS "club-logos: authenticated update" ON storage.objects;
CREATE POLICY "club-logos: authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'club-logos');