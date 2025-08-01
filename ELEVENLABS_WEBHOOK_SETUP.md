# ElevenLabs Webhook Kurulumu

ElevenLabs WebSocket'ları telefon çağrıları için tasarlanmış. Browser'dan takip etmek için webhook kullanmamız gerekiyor.

## Alternatif Çözüm: Polling

WebSocket yerine periyodik olarak conversation history'yi çekebiliriz:

```javascript
// src/services/elevenLabs.ts güncelleme
private startPolling() {
  // Her 5 saniyede bir yeni çağrıları kontrol et
  setInterval(async () => {
    try {
      const calls = await this.getConversationHistory(10);
      // Yeni veya güncellenmiş çağrıları bul
      this.processNewCalls(calls);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000);
}
```

## Gerçek Çözüm: Test Widget'ı Kullan

1. ElevenLabs Dashboard'da agent'ı aç
2. "Widget" sekmesine git
3. Widget'ı kopyala ve test et
4. Veya doğrudan "Test Agent" butonunu kullan

## Test Etme:

1. **ElevenLabs'da Test:**
   - Agent sayfasında "Test Agent" butonuna bas
   - Mikrofon izni ver
   - Konuş

2. **Webhook Ayarı (Opsiyonel):**
   - Conversational AI Settings'e git
   - Post-Call Webhook ekle
   - URL: Senin backend'in (örn: https://yourapp.com/webhook/elevenlabs)

3. **Phone Test:**
   - Eğer phone number aldıysan, oradan ara
   - Gerçek telefon çağrısı WebSocket'lara yansır

## Sorun:
Browser'dan ElevenLabs WebSocket'larına direkt bağlanamıyoruz çünkü:
- CORS kısıtlamaları
- Authentication yöntemi
- WebSocket protokol farkları

## Çözüm Önerileri:
1. Test için ElevenLabs Dashboard'ını kullan
2. Production için webhook kur
3. Veya kendi backend'inde proxy WebSocket oluştur