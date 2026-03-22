-- ============================================================
-- LifeLane AI — Mobile App RLS Policies
-- Run this in the Supabase SQL Editor to enable mobile integration.
-- ============================================================

-- Allow public (anon) users to insert emergencies
CREATE POLICY "Public insert: emergencies" ON emergencies 
FOR INSERT TO public 
WITH CHECK (true);

-- Allow public (anon) users to update their own ambulance location
CREATE POLICY "Public update: ambulances" ON ambulances 
FOR UPDATE TO public 
USING (true)
WITH CHECK (true);

-- Ensure public (anon) users can read needed info
CREATE POLICY "Public read: hospitals" ON hospitals FOR SELECT TO public USING (true);
CREATE POLICY "Public read: signals" ON signals FOR SELECT TO public USING (true);
CREATE POLICY "Public read: emergencies" ON emergencies FOR SELECT TO public USING (true);
CREATE POLICY "Public read: ambulances" ON ambulances FOR SELECT TO public USING (true);
