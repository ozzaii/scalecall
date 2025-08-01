# ElevenLabs Console Error Fix

## Error Açıklaması
ElevenLabs konsolunda submit butonuna bastığınızda React Context hatası alıyorsunuz. Bu ElevenLabs'ın kendi web arayüzündeki bir hata, sizin uygulamanızla ilgili değil.

## Çözüm Önerileri

### 1. Tarayıcı Cache Temizleme
```bash
# Chrome/Edge
Ctrl+Shift+R (Windows) veya Cmd+Shift+R (Mac)

# Veya Developer Tools açık iken
Sağ tık "Reload" → "Empty Cache and Hard Reload"
```

### 2. Farklı Tarayıcı Deneyin
- Chrome yerine Firefox veya Safari
- Incognito/Private modda deneyin
- Tarayıcı eklentilerini devre dışı bırakın

### 3. Tool Configuration Alternatif Yöntemi

ElevenLabs konsolunda hata alıyorsanız, transfer tool'u API üzerinden de ekleyebilirsiniz:

```bash
curl -X POST "https://api.elevenlabs.io/v1/convai/agents/YOUR_ORCHESTRATOR_AGENT_ID/tools" \
  -H "xi-api-key: sk_164fb10a4ec892ed584b839541b4fe34dc7f8e01cf381b70" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system",
    "name": "transfer_to_agent",
    "description": "Müşteriyi uygun uzmana yönlendir",
    "params": {
      "system_tool_type": "transfer_to_agent",
      "transfers": [
        {
          "agent_id": "YOUR_SUPPORT_AGENT_ID",
          "name": "Müşteri Destek Uzmanı",
          "description": "Fatura, ödeme, paket bilgileri"
        },
        {
          "agent_id": "YOUR_TECHNICAL_AGENT_ID",
          "name": "Teknik Destek Uzmanı",
          "description": "İnternet, şebeke, cihaz sorunları"
        },
        {
          "agent_id": "YOUR_SALES_AGENT_ID",
          "name": "Satış Uzmanı",
          "description": "Yeni hat, kampanyalar"
        }
      ]
    }
  }'
```

### 4. Basitleştirilmiş Tool Config

Eğer hata devam ediyorsa, daha basit bir config deneyin:

```json
{
  "type": "system",
  "name": "transfer_to_agent",
  "params": {
    "system_tool_type": "transfer_to_agent",
    "transfers": [
      {
        "agent_id": "YOUR_AGENT_ID_HERE",
        "name": "Support"
      }
    ]
  }
}
```

### 5. Manual Transfer Alternatifi

Tool ekleyemiyorsanız, system prompt'ta manuel transfer talimatları verebilirsiniz:

```text
TRANSFER TALİMATLARI:
Müşteri destek için: "Sizi müşteri destek uzmanımıza aktarıyorum. [TRANSFER: support_agent_id]"
Teknik destek için: "Sizi teknik uzmanımıza aktarıyorum. [TRANSFER: technical_agent_id]"
Satış için: "Sizi satış uzmanımıza aktarıyorum. [TRANSFER: sales_agent_id]"
```

### 6. ElevenLabs Support

Eğer sorun devam ediyorsa:
1. ElevenLabs Discord: https://discord.gg/elevenlabs
2. Support ticket: support@elevenlabs.io
3. Console hatası screenshot'ı ile birlikte gönderin

## Test Etme

Transfer tool'u ekledikten sonra test için:

1. Orkestratör agent'a bağlanın
2. "Faturamı öğrenmek istiyorum" deyin
3. Transfer gerçekleşmeli
4. Dashboard'da transfer görünmeli

## Workaround

Tool ekleyemezseniz, tüm agent'ları aynı anda dinleyebilirsiniz:

```typescript
// src/App.tsx güncelleme
const agentIds = [
  'agent_orchestrator_id',
  'agent_support_id', 
  'agent_technical_id',
  'agent_sales_id'
];

// Tüm agent'lar paralel dinlenir
// Transfer yerine yeni conversation başlar
// Dashboard otomatik olarak gruplar
```