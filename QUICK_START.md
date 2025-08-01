# Turkcell AI Dashboard - Hızlı Başlangıç

## Sistem Çalıştırma

```bash
npm run dev
```

Tarayıcıda: http://localhost:5174

## Gömülü API Anahtarları

✅ **ElevenLabs API Key:** Sisteme gömülü
✅ **Gemini API Key:** Sisteme gömülü

## Agent ID'leri Güncelleme

`src/App.tsx` dosyasında 21-26. satırlar:

```typescript
const agentIds = [
  'agent_xxxxx', // Sizin gerçek agent ID'leriniz
  'agent_yyyyy', 
  'agent_zzzzz',
  'agent_aaaaa'
];
```

## Test Akışı

1. **Sistem Başlatma**
   - Terminal: `npm run dev`
   - Otomatik olarak API'lere bağlanır
   - Geçmiş çağrıları yükler

2. **Canlı Çağrı Simülasyonu**
   - ElevenLabs agent'larınıza çağrı yapın
   - Dashboard'da otomatik görünür
   - Gerçek zamanlı ses ve transkript

3. **Multi-Agent Test**
   - Orkestratör ile başlayın
   - "Faturamı öğrenmek istiyorum" → Support Agent
   - "İnternetim yok" → Technical Agent  
   - "Yeni paket almak istiyorum" → Sales Agent

## Dashboard Özellikleri

### Sol Panel - Çağrı Listesi
- Aktif çağrılar üstte
- Tamamlanan çağrılar tarih sıralı
- Multi-agent çağrılar birleşik gösterim

### Ana Panel - Çağrı Detayları
- Canlı transkript
- Ses vizualizasyonu
- Duygu analizi
- Agent performans metrikleri

### Sağ Panel - Analitik
- 30+ detaylı metrik
- Risk faktörleri
- Aksiyon öğeleri
- Agent handoff journey

## Konsol Komutları

Tarayıcı konsolunda kullanışlı komutlar:

```javascript
// Aktif çağrıları görüntüle
elevenLabsService.activeConversations

// WebSocket durumu
elevenLabsService.wsConnections

// Ses context durumu
elevenLabsService.audioContext.state
```

## Sorun Giderme

**"WebSocket bağlanamıyor"**
- API anahtarını kontrol edin
- Agent ID'lerin doğru olduğundan emin olun

**"Ses gelmiyor"**
- Tarayıcı ses iznini kontrol edin
- Konsoldaki audio chunk loglarını kontrol edin

**"Analiz yapılamıyor"**
- Gemini API kotanızı kontrol edin
- Ses dosyası URL'sinin erişilebilir olduğundan emin olun

## Türkçe UI Elemanları

- ✅ Tüm başlıklar Türkçe
- ✅ Metrikler Türkçe açıklamalı
- ✅ Hata mesajları Türkçe
- ✅ Toast bildirimleri Türkçe

## Canlı Demo İçin

1. ElevenLabs'da test çağrısı başlatın
2. Dashboard'u açık tutun
3. Çağrı otomatik görünecek
4. Bitince analiz sonuçları gelecek

---

💡 **İpucu:** İlk kurulumda `AGENT_SETUP_GUIDE.md` dosyasını okuyun.