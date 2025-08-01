# Supabase Kurulum Adımları

## 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. "Start your project" butonuna tıkla
3. GitHub ile giriş yap
4. "New project" oluştur:
   - Organization: Kendi organization'ını seç
   - Project name: `turkcell-call-analytics`
   - Database Password: Güçlü bir şifre gir
   - Region: `eu-central-1` (Frankfurt) seç
   - Pricing plan: Free (demo için yeterli)

## 2. Database Schema'yı Yükle

1. Supabase Dashboard'da "SQL Editor" sekmesine git
2. "New query" butonuna tıkla
3. `SUPABASE_SCHEMA.sql` dosyasındaki tüm SQL'i kopyala ve yapıştır
4. "Run" butonuna bas

## 3. API Anahtarlarını Al

1. Supabase Dashboard'da "Settings" > "API" sekmesine git
2. Şu değerleri kopyala:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx`

## 4. Frontend'e Bağla

`src/services/supabase.ts` dosyasında şu satırları güncelle:

```typescript
const supabaseUrl = 'https://xxxxx.supabase.co'; // Project URL'ini buraya yapıştır
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx'; // Anon key'i buraya yapıştır
```

## 5. Realtime'ı Aktifleştir (Opsiyonel)

1. Supabase Dashboard'da "Database" > "Replication" sekmesine git
2. `calls` ve `analytics` tablolarını aktifleştir
3. Bu sayede yeni çağrılar otomatik olarak dashboard'a yansır

## Test Etme

1. Supabase Dashboard'da "Table Editor" sekmesine git
2. `calls` tablosuna manuel bir kayıt ekle
3. Dashboard'da görünmesini kontrol et