-- RUN THIS IN SUPABASE SQL EDITOR
-- NOTE: The user indicated the table name is "Realstate -1"

-- 1. Enable RLS
ALTER TABLE "Realstate -1" ENABLE ROW LEVEL SECURITY;

-- 2. Allow public access
CREATE POLICY "Enable read access for all users" ON "Realstate -1"
FOR SELECT
TO anon
USING (true);
