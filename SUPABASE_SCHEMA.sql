-- Supabase'de çalıştırılacak SQL schema

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  conversation_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  phone_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'transferred', 'failed')),
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('orchestrator', 'support', 'technical', 'sales', 'specialist')),
  audio_url TEXT,
  parent_conversation_id TEXT,
  handoff_reason TEXT,
  handoff_timestamp TIMESTAMPTZ,
  handoff_from_agent JSONB,
  handoff_to_agent JSONB,
  is_part_of_handoff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[],
  sentiment_overall TEXT NOT NULL CHECK (sentiment_overall IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3,2) NOT NULL CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  customer_satisfaction DECIMAL(3,1) NOT NULL CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 5),
  topics JSONB,
  action_items JSONB,
  agent_performance JSONB,
  risk_factors JSONB,
  emotions JSONB,
  analyzed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  speaker TEXT NOT NULL CHECK (speaker IN ('agent', 'customer')),
  text TEXT NOT NULL,
  start_time DECIMAL NOT NULL,
  end_time DECIMAL,
  confidence DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_conversation_id ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_start_time ON calls(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_analytics_call_id ON analytics(call_id);
CREATE INDEX IF NOT EXISTS idx_analytics_analyzed_at ON analytics(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_start_time ON transcripts(start_time);

-- Row Level Security (RLS) - Supabase'de güvenlik için önemli
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON calls;
DROP POLICY IF EXISTS "Enable insert for all users" ON calls;
DROP POLICY IF EXISTS "Enable update for all users" ON calls;
DROP POLICY IF EXISTS "Enable read access for all users" ON analytics;
DROP POLICY IF EXISTS "Enable insert for all users" ON analytics;
DROP POLICY IF EXISTS "Enable read access for all users" ON transcripts;
DROP POLICY IF EXISTS "Enable insert for all users" ON transcripts;

-- Create policies (demo için, production'da daha sıkı yapılmalı)
CREATE POLICY "Enable read access for all users" ON calls FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON calls FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON analytics FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON analytics FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON transcripts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON transcripts FOR INSERT WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();