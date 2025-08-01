# ElevenLabs Agent Transfer (Handoff) Kurulum Rehberi

## Orkestratör Agent Transfer Tool Konfigürasyonu

### 1. ElevenLabs Dashboard'da Tool Ekleme

1. Orkestratör Agent'ınızı açın
2. "Tools" sekmesine gidin
3. "Add System Tool" → "transfer_to_agent" seçin
4. Aşağıdaki konfigürasyonu yapıştırın:

```json
{
  "type": "system",
  "name": "transfer_to_agent",
  "description": "Müşteriyi uygun uzmana yönlendir",
  "params": {
    "system_tool_type": "transfer_to_agent",
    "transfers": [
      {
        "agent_id": "YOUR_SUPPORT_AGENT_ID",
        "name": "Müşteri Destek Uzmanı",
        "description": "Fatura, ödeme, paket bilgileri ve genel müşteri hizmetleri"
      },
      {
        "agent_id": "YOUR_TECHNICAL_AGENT_ID",
        "name": "Teknik Destek Uzmanı",
        "description": "İnternet, şebeke, cihaz ve teknik sorunlar"
      },
      {
        "agent_id": "YOUR_SALES_AGENT_ID",
        "name": "Satış Uzmanı",
        "description": "Yeni hat, paket değişikliği, kampanyalar"
      }
    ],
    "voicemail_message": ""
  },
  "disable_interruptions": false
}
```

### 2. Orkestratör Agent System Prompt Güncelleme

```text
Sen Turkcell'in akıllı müşteri hizmetleri orkestratör ajanısın. Görevin, müşterilerin isteklerini anlamak ve onları doğru uzmana yönlendirmek.

YÖNLENDIRME KURALLARI:
- Fatura, ödeme, borç, paket bilgisi, TL yükleme → transfer_to_agent tool ile "Müşteri Destek Uzmanı"na yönlendir
- İnternet sorunu, bağlantı, modem, şebeke, TV+ → transfer_to_agent tool ile "Teknik Destek Uzmanı"na yönlendir  
- Yeni hat, kampanya, paket değişikliği, tarife → transfer_to_agent tool ile "Satış Uzmanı"na yönlendir

YAKLAŞIM:
1. Müşteriyi kibarca karşıla: "Turkcell'e hoş geldiniz. Ben dijital asistanınızım. Size nasıl yardımcı olabilirim?"
2. Müşterinin isteğini dinle ve anla
3. Uygun uzmanı belirle
4. transfer_to_agent tool'unu kullanarak yönlendir
5. Yönlendirme öncesi müşteriyi bilgilendir: "Anladım, [konu] ile ilgili yardıma ihtiyacınız var. Sizi hemen ilgili uzmanımıza yönlendiriyorum."

ÖNEMLİ: 
- Asla kendin çözmeye çalışma, sadece yönlendir
- Her zaman transfer_to_agent tool'unu kullan
- Müşteriyi bekletmeden hızlıca yönlendir
```

### 3. Diğer Agent'ların Handoff Ayarları

Her specialist agent için:

**Support Agent:**
- Handoff enabled: ✓
- Can transfer to: Technical Agent, Sales Agent
- Transfer reason örnekleri:
  - "Müşterinin teknik bir sorunu var" → Technical
  - "Müşteri yeni kampanyalarla ilgileniyor" → Sales

**Technical Agent:**
- Handoff enabled: ✓
- Can transfer to: Support Agent, Sales Agent
- Transfer reason örnekleri:
  - "Sorun fatura ile ilgili çıktı" → Support
  - "Müşteri fiber + mobil paketi istiyor" → Sales

**Sales Agent:**
- Handoff enabled: ✓
- Can transfer to: Support Agent, Technical Agent
- Transfer reason örnekleri:
  - "Mevcut faturasını kontrol etmek istiyor" → Support
  - "Fiber kurulum randevusu gerekiyor" → Technical

### 4. Transfer Flow Örnekleri

**Örnek 1 - Basit Transfer:**
```
Müşteri: "Merhaba, internetim çok yavaş"
Orkestratör: "Turkcell'e hoş geldiniz. İnternet yavaşlığı sorununuz olduğunu anlıyorum. Sizi hemen teknik destek uzmanımıza yönlendiriyorum."
[transfer_to_agent → Teknik Destek Uzmanı]
Teknik Uzman: "Merhaba, internet bağlantınızla ilgili sorununuzu çözmek için buradayım..."
```

**Örnek 2 - Çoklu Transfer:**
```
Müşteri: "Faturamı ödemek istiyorum"
Orkestratör: "Fatura ödeme işlemi için sizi müşteri destek uzmanımıza yönlendiriyorum."
[transfer_to_agent → Müşteri Destek]
Support: "Faturanızı kontrol ediyorum... Ayrıca size özel fiber kampanyamız var."
Müşteri: "Fiber kampanyasını duymak isterim"
Support: "Sizi satış uzmanımıza yönlendiriyorum, size detaylı bilgi verecek."
[transfer_to_agent → Satış Uzmanı]
```

### 5. WebSocket Event'leri

Dashboard'unuz şu event'leri yakalayacak:

```javascript
// Agent transfer başladığında
{
  "type": "agent_transfer",
  "from_conversation_id": "conv_123",
  "to_conversation_id": "conv_456",
  "from_agent_id": "agent_orchestrator",
  "to_agent_id": "agent_support",
  "transfer_reason": "Fatura sorgusu",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Transfer tamamlandığında
{
  "type": "conversation_ended",
  "conversation_id": "conv_123",
  "agent_id": "agent_orchestrator",
  "status": "transferred",
  "handoff_to": "agent_support"
}
```

### 6. Test Senaryoları

1. **Tek Transfer Testi:**
   - Orkestratöre bağlan
   - "Faturamı öğrenmek istiyorum" de
   - Support'a transfer olmalı
   - Dashboard'da transfer görünmeli

2. **Çift Transfer Testi:**
   - Orkestratör → Support → Sales akışını test et
   - Her transfer dashboard'da görünmeli
   - Call journey doğru oluşmalı

3. **Hata Durumu Testi:**
   - Olmayan bir agent'a transfer dene
   - Fallback mesajı görünmeli
   - Sistem çökmemeli

### 7. Debugging

Konsol logları:
```javascript
// Transfer başarılı
console.log("Agent transfer: Orkestratör → Support (Fatura sorgusu)")

// Transfer event'i alındı
console.log("Transfer event received:", transferData)

// Conversation hierarchy güncellendi
console.log("Updated hierarchy:", conversationHierarchy)
```

### 8. Best Practices

1. **Context Preservation:**
   - Her transfer'de müşteri bilgileri korunmalı
   - Önceki konuşma özeti aktarılmalı

2. **Transfer Reason:**
   - Net ve açıklayıcı olmalı
   - Türkçe yazılmalı
   - 2-5 kelime ideal

3. **Timing:**
   - Transfer 2-3 saniye içinde tamamlanmalı
   - Müşteri bekletilmemeli

4. **Fallback:**
   - Agent müsait değilse voicemail
   - Sistem hatası durumunda orkestratör devam etmeli