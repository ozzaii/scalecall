-- Analytics tablosunu güncelle (mevcut veriyi koruyarak)

-- Önce mevcut tabloyu yedekle
ALTER TABLE analytics RENAME TO analytics_old;

-- Yeni analytics tablosunu oluştur
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

-- Index'leri ekle
CREATE INDEX IF NOT EXISTS idx_analytics_call_id ON analytics(call_id);
CREATE INDEX IF NOT EXISTS idx_analytics_analyzed_at ON analytics(analyzed_at DESC);

-- RLS'i aktifleştir
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy'leri ekle
CREATE POLICY "Enable read access for all users" ON analytics FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON analytics FOR INSERT WITH CHECK (true);

-- Eski tabloyu sil (opsiyonel - önce kontrol et)
-- DROP TABLE analytics_old;