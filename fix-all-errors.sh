#!/bin/bash

# Fix unused variables
echo "Fixing unused variables..."

# AnalyticsDashboard.tsx - Remove unused dayNames
sed -i '' '251d' src/components/AnalyticsDashboard.tsx

# AudioPlayer.tsx - Remove unused index parameter
sed -i '' 's/{segments\.map((segment, index) => (/{segments.map((segment) => (/' src/components/AudioPlayer.tsx

# Dashboard.tsx - Remove unused analytics
sed -i '' '/analytics: state\.analytics,/d' src/components/Dashboard.tsx

# LiveAudioVisualizer.tsx - Remove unused parameters
sed -i '' 's/{ audioContext, conversationId, conversationData, onAudioData }/{ audioContext, conversationData }/' src/components/LiveAudioVisualizer.tsx

# LiveTranscript.tsx - Remove unused index
sed -i '' 's/{transcript\.segments\.map((segment, index) => (/{transcript.segments.map((segment) => (/' src/components/LiveTranscript.tsx

# OnboardingModal.tsx - Remove unused X import
sed -i '' 's/import { X, /import { /' src/components/OnboardingModal.tsx

# TranscriptViewer.tsx - Remove unused audioUrl
sed -i '' 's/{ transcript, currentTime, audioUrl }/{ transcript, currentTime }/' src/components/TranscriptViewer.tsx

# WaveformVisualizer.tsx - Remove unused cp2x and cp2y
sed -i '' '/const cp2x =/d' src/components/WaveformVisualizer.tsx
sed -i '' '/const cp2y =/d' src/components/WaveformVisualizer.tsx

# elevenLabs.ts - Remove unused variables
sed -i '' '/const agentIds =/d' src/services/elevenLabs.ts
sed -i '' 's/{ fromAgentId, toAgentId }/{ toAgentId }/' src/services/elevenLabs.ts
sed -i '' 's/{ conversationId, agentId }/{ conversationId }/' src/services/elevenLabs.ts
sed -i '' 's/const { conversationId } = event;//' src/services/elevenLabs.ts

# gemini.ts - Remove unused audioUrl
sed -i '' 's/async analyzeCall(call: CallData, audioUrl?: string)/async analyzeCall(call: CallData)/' src/services/gemini.ts

echo "All unused variables fixed!"