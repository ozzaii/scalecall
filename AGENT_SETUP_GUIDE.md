# Turkcell Agent Setup Guide

## ElevenLabs Agent Kurulumu

### 1. Agent ID'leri Güncelleme

`src/App.tsx` dosyasında, 21-26. satırlarda bulunan agent ID'lerini ElevenLabs'dan aldığınız gerçek ID'lerle değiştirin:

```typescript
const agentIds = [
  'agent_xxxxx', // Orkestratör Agent ID'nizi buraya
  'agent_yyyyy', // Support Agent ID'nizi buraya
  'agent_zzzzz', // Technical Agent ID'nizi buraya
  'agent_aaaaa'  // Sales Agent ID'nizi buraya
];
```

### 2. ElevenLabs'da Agent Oluşturma

1. [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai) adresine gidin
2. "Create Agent" butonuna tıklayın
3. Her agent için:
   - Name: Agent tipine göre isim verin (Turkcell Orkestratör, Turkcell Destek, vb.)
   - Language: Turkish
   - Voice: Türkçe ses modeli seçin
   - System Prompt: `TURKCELL_AGENT_PROMPTS.md` dosyasından ilgili promptu kopyalayın

### 3. Agent Ayarları

Her agent için şu ayarları yapın:

**Orkestratör Agent:**
- First Message: "Turkcell'e hoş geldiniz. Ben dijital asistanınızım. Size nasıl yardımcı olabilirim?"
- Enable Handoff: ✓
- Handoff Agents: Diğer 3 ajanı ekleyin

**Support Agent:**
- First Message: "Müşteri destek hattına hoş geldiniz. Size nasıl yardımcı olabilirim?"
- Knowledge Base: Fatura, paket, ödeme bilgileri ekleyin

**Technical Agent:**
- First Message: "Teknik destek hattındasınız. Yaşadığınız teknik sorunu öğrenebilir miyim?"
- Knowledge Base: Teknik çözümler, modem ayarları, APN bilgileri

**Sales Agent:**
- First Message: "Turkcell satış hattına hoş geldiniz. Yeni kampanyalarımızdan yararlanmak ister misiniz?"
- Knowledge Base: Güncel kampanyalar, paket detayları

### 4. WebSocket Bağlantısı Test Etme

Tarayıcı konsolunda (F12) şu logları görmelisiniz:
```
Connected to ElevenLabs agent: agent_xxxxx
Connected to ElevenLabs agent: agent_yyyyy
Connected to ElevenLabs agent: agent_zzzzz
Connected to ElevenLabs agent: agent_aaaaa
```

### 5. Test Senaryoları

**Senaryo 1 - Fatura Sorgusu:**
1. Orkestratör ajana: "Faturamı öğrenmek istiyorum"
2. Otomatik olarak Support Agent'a transfer olmalı
3. Support Agent fatura detaylarını vermeli

**Senaryo 2 - İnternet Sorunu:**
1. Orkestratör ajana: "İnternetim çok yavaş"
2. Technical Agent'a transfer olmalı
3. Technical Agent troubleshooting adımlarını uygulamalı

**Senaryo 3 - Yeni Hat:**
1. Orkestratör ajana: "Yeni hat almak istiyorum"
2. Sales Agent'a transfer olmalı
3. Sales Agent paket önerilerinde bulunmalı

### 6. Canlı Sistem Entegrasyonu

Gerçek Turkcell sistemleriyle entegrasyon için:

1. **CRM Entegrasyonu:**
   - Müşteri bilgileri API endpoint
   - Fatura ve paket sorgulama servisleri
   - Hat durumu kontrol servisleri

2. **Teknik Sistemler:**
   - Şebeke durumu API
   - Modem/fiber durumu kontrol
   - Arıza kayıt sistemi

3. **Satış Sistemleri:**
   - Güncel kampanya bilgileri
   - Stok durumu
   - Online satış onay sistemi

### 7. Monitoring ve Analytics

Dashboard'da görmeniz gerekenler:
- Gerçek zamanlı çağrı akışı
- Agent transfer görselleştirmesi
- 30+ metrik analizi
- Müşteri memnuniyet skoru
- Risk faktörleri

### 8. Production Checklist

- [ ] Tüm agent ID'leri güncellendi
- [ ] Agent promptları Türkçe olarak ayarlandı
- [ ] WebSocket bağlantıları test edildi
- [ ] Handoff mekanizması çalışıyor
- [ ] Gemini analiz servisi aktif
- [ ] Ses kayıt ve oynatma test edildi
- [ ] Error handling mekanizmaları aktif
- [ ] Monitoring altyapısı hazır