# Debug Komutları

## 1. Console'da çalıştır (F12 > Console):

```javascript
// LocalStorage'ı temizle ve yenile
localStorage.clear();
location.reload();
```

## 2. WebSocket durumunu kontrol et:

```javascript
// Aktif WebSocket'ları gör
elevenLabsService.wsConnections
```

## 3. Canlı loglara bak:

Console'da şunları görmelisin:
- `WebSocket message from agent_xxx: ...` 
- `Connected to ElevenLabs agent: ...`
- `Conversation history response: ...`

## 4. Test için agent'a bağlan:

1. ElevenLabs Dashboard'a git
2. Herhangi bir agent'ı aç (örn: Orchestrator)
3. "Test Agent" butonuna bas
4. Mikrofon izni ver
5. "Merhaba" de

## 5. Sorun devam ederse:

Console'da şu komutu çalıştır:
```javascript
// Manuel test çağrısı başlat
elevenLabsService.callbacks.onCallStarted[0]({
  id: 'test-' + Date.now(),
  conversationId: 'test-' + Date.now(),
  startTime: new Date(),
  phoneNumber: '5551234567',
  customerName: 'Test Müşteri',
  status: 'active',
  agentId: 'agent_2401k1gvpfa2f61bjd2de7sr5xpb',
  agentName: 'Turkcell Orkestratör',
  agentType: 'orchestrator',
  transcript: { segments: [], fullText: '', confidence: 1.0 }
});
```