-- Consulting bookings database schema

-- Consulting services table
CREATE TABLE consulting_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consulting bookings table
CREATE TABLE consulting_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES consulting_services(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consulting sessions table (for group sessions)
CREATE TABLE consulting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES consulting_bookings(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL, -- 1, 2, 3, 4 for group sessions
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expert chefs table
CREATE TABLE expert_chefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  specialties TEXT[], -- array of specialties
  years_experience INTEGER,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chef assignments to sessions
CREATE TABLE chef_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES consulting_sessions(id) ON DELETE CASCADE,
  chef_id UUID REFERENCES expert_chefs(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- Insert default consulting services
INSERT INTO consulting_services (name, description, price, duration_minutes, max_participants) VALUES
('Individual Consulting', 'One-on-one personalized recipe consultation with expert chefs', 12500, 60, 1),
('Group Consulting', 'Group sessions with recipe experts and community support', 22500, 90, 10);

-- Insert sample expert chefs
INSERT INTO expert_chefs (name, email, bio, specialties, years_experience) VALUES
('Chef Maria Rodriguez', 'maria@sharemyrecipe.com', 'Award-winning chef with 15+ years of experience in Mediterranean cuisine', ARRAY['Mediterranean', 'Italian', 'Spanish'], 15),
('Chef James Chen', 'james@sharemyrecipe.com', 'Expert in Asian fusion and healthy cooking techniques', ARRAY['Asian Fusion', 'Healthy Cooking', 'Vegetarian'], 12),
('Chef Sarah Johnson', 'sarah@sharemyrecipe.com', 'Pastry specialist and baking instructor with a passion for teaching', ARRAY['Pastry', 'Baking', 'Desserts'], 10);

-- Update triggers
CREATE TRIGGER update_consulting_bookings_updated_at 
  BEFORE UPDATE ON consulting_bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consulting_sessions_updated_at 
  BEFORE UPDATE ON consulting_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE consulting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE consulting_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consulting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_assignments ENABLE ROW LEVEL SECURITY;

-- Consulting services: everyone can read
CREATE POLICY "consulting_services_read_policy" ON consulting_services
  FOR SELECT USING (true);

-- Bookings: users can only see their own
CREATE POLICY "consulting_bookings_read_policy" ON consulting_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "consulting_bookings_insert_policy" ON consulting_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consulting_bookings_update_policy" ON consulting_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Sessions: users can only see sessions for their bookings
CREATE POLICY "consulting_sessions_read_policy" ON consulting_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consulting_bookings 
      WHERE consulting_bookings.id = consulting_sessions.booking_id 
      AND consulting_bookings.user_id = auth.uid()
    )
  );

-- Expert chefs: everyone can read
CREATE POLICY "expert_chefs_read_policy" ON expert_chefs
  FOR SELECT USING (true);

-- Chef assignments: read only for users with related sessions
CREATE POLICY "chef_assignments_read_policy" ON chef_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consulting_sessions cs
      JOIN consulting_bookings cb ON cs.booking_id = cb.id
      WHERE cs.id = chef_assignments.session_id 
      AND cb.user_id = auth.uid()
    )
  );

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_consulting_bookings(user_uuid UUID)
RETURNS TABLE (
  booking_id UUID,
  service_name TEXT,
  amount INTEGER,
  status TEXT,
  scheduled_at TIMESTAMP,
  service_duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cs.name,
    cb.amount,
    cb.status,
    cb.scheduled_at,
    cs.duration_minutes
  FROM consulting_bookings cb
  JOIN consulting_services cs ON cb.service_id = cs.id
  WHERE cb.user_id = user_uuid
  ORDER BY cb.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_consulting_session_details(session_uuid UUID)
RETURNS TABLE (
  session_id UUID,
  session_number INTEGER,
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER,
  status TEXT,
  meeting_link TEXT,
  chef_name TEXT,
  chef_specialties TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.session_number,
    cs.scheduled_at,
    cs.duration_minutes,
    cs.status,
    cs.meeting_link,
    ec.name,
    ec.specialties
  FROM consulting_sessions cs
  LEFT JOIN chef_assignments ca ON cs.id = ca.session_id
  LEFT JOIN expert_chefs ec ON ca.chef_id = ec.id
  WHERE cs.id = session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 