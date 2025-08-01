-- Analytics tablosunu düzelt
DROP TABLE IF EXISTS analytics CASCADE;

-- Yeni analytics tablosunu oluştur
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  sentiment_overall TEXT NOT NULL DEFAULT 'neutral',
  sentiment_score DECIMAL(3,2) DEFAULT 0.5,
  customer_satisfaction DECIMAL(3,1) DEFAULT 3.0,
  topics JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  agent_performance JSONB DEFAULT '{}',
  risk_factors JSONB DEFAULT '[]',
  emotions JSONB DEFAULT '[]',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index'leri ekle (IF NOT EXISTS ile)
CREATE INDEX IF NOT EXISTS idx_analytics_call_id ON analytics(call_id);
CREATE INDEX IF NOT EXISTS idx_analytics_analyzed_at ON analytics(analyzed_at DESC);

-- RLS'i aktifleştir
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy'leri ekle (önce sil)
DROP POLICY IF EXISTS "Enable read access for all users" ON analytics;
DROP POLICY IF EXISTS "Enable insert for all users" ON analytics;
DROP POLICY IF EXISTS "Enable update for all users" ON analytics;

CREATE POLICY "Enable read access for all users" ON analytics FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON analytics FOR UPDATE USING (true);