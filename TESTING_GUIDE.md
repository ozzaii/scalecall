# Testing Guide - Let's Actually Use This Thing

## Quick Test (Demo Mode - No Keys Needed)

1. **Open the app**: http://localhost:5174
2. **Click "Demo Modu"** or skip at the bottom
3. **Watch the magic**:
   - 5 historical calls load instantly
   - Live call simulation starts after 2 seconds
   - See real-time transcript updates
   - Watch agent handoffs happen
   - All metrics populate with realistic data

## Real Testing with ElevenLabs

### 1. Get Your ElevenLabs API Key
```
1. Go to https://elevenlabs.io
2. Sign up/Login
3. Go to Profile Settings
4. Copy your API key (starts with "xi-")
```

### 2. Create Conversational AI Agents
```
1. In ElevenLabs Dashboard → Conversational AI
2. Create multiple agents:
   - "Orchestrator Agent" (routes calls)
   - "Support Agent" (handles support)
   - "Technical Agent" (technical issues)
3. Copy each agent's ID
```

### 3. Get Gemini API Key
```
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy it (starts with "AIza")
```

### 4. Connect Everything
```
1. Refresh the app
2. Choose "API Anahtarları ile"
3. Enter:
   - ElevenLabs API Key: xi-xxxxx
   - Agent IDs: agent1-id, agent2-id, agent3-id (comma separated)
   - Gemini API Key: AIzaxxxxx
4. Click "Başla"
```

## Testing Scenarios

### Test 1: Single Agent Call
1. Start a call with one agent
2. Watch:
   - Real-time audio visualization
   - Live transcription
   - Speaker detection
   - Sentiment tracking

### Test 2: Multi-Agent Handoff
1. Start with orchestrator agent
2. Say "I need technical help"
3. Watch the handoff:
   - Transfer notification
   - New agent connection
   - Context preservation
   - Journey tracking

### Test 3: Complete Call Analysis
1. End a call
2. See:
   - Full transcript
   - 30+ metrics analysis
   - Call journey visualization
   - Comprehensive insights
   - Risk assessment

## WebSocket Testing

To see if audio is flowing:
1. Open browser console (F12)
2. Look for logs:
   ```
   Connected to ElevenLabs agent: agent-123
   Live audio chunk for conv-123 from agent: 2048 bytes
   ```

## API Testing Commands

### Test ElevenLabs Connection
```bash
curl -X GET "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: YOUR_API_KEY"
```

### Test Gemini Connection
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## Troubleshooting

### "No audio coming through"
- Check browser console for WebSocket errors
- Ensure agent is configured for audio streaming
- Check browser permissions for audio

### "Transcripts not updating"
- Verify agent has transcription enabled
- Check WebSocket connection status
- Look for "transcript_update" events in console

### "Analysis failing"
- Verify Gemini API key is valid
- Check quota limits
- Ensure audio URL is accessible

### "Handoffs not working"
- Agents must be configured to allow transfers
- Check agent IDs are correct
- Verify conversation_id tracking

## Local Storage Reset
If you need to start fresh:
```javascript
// Run in browser console
localStorage.clear()
location.reload()
```

## Mock Testing Without APIs

The demo mode simulates:
- Live audio streaming
- Real-time transcripts
- Agent handoffs
- Full analytics

Perfect for:
- UI/UX testing
- Feature exploration
- Demo presentations
- Development work

## Performance Testing

Monitor in DevTools:
- Network tab: WebSocket messages
- Performance tab: Frame rate
- Memory: Audio buffer usage
- Console: Timing logs

## Production Checklist

Before going live:
- [ ] API keys in environment variables
- [ ] CORS configured for your domain
- [ ] WebSocket proxy configured
- [ ] Audio codec compatibility
- [ ] Error handling tested
- [ ] Analytics tracking enabled
- [ ] Security headers configured