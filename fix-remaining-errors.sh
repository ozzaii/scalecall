#!/bin/bash

# LiveAudioVisualizer.tsx - Remove unused parameters
sed -i '' 's/interface LiveAudioVisualizerProps {[^}]*}/interface LiveAudioVisualizerProps {\n  audioContext: AudioContext;\n  conversationData: ConversationData | null;\n}/' src/components/LiveAudioVisualizer.tsx

# LiveAudioVisualizer.tsx - Remove unused parameter from map
sed -i '' 's/bars\.map((bar, index) => (/bars.map((bar) => (/' src/components/LiveAudioVisualizer.tsx

# LiveTranscript.tsx - Remove unused index
sed -i '' 's/transcript\.segments\.map((segment, index) => (/transcript.segments.map((segment) => (/' src/components/LiveTranscript.tsx

# TranscriptViewer.tsx - Remove unused audioUrl
sed -i '' 's/interface TranscriptViewerProps {[^}]*}/interface TranscriptViewerProps {\n  transcript: Transcript;\n  currentTime?: number;\n}/' src/components/TranscriptViewer.tsx

# elevenLabs.ts - Remove agentIds declaration
sed -i '' '/const agentIds = \[/,/\];/d' src/services/elevenLabs.ts

# elevenLabs.ts - Remove unused fromAgentId
sed -i '' 's/handleAgentHandoff(event: { fromAgentId: string; toAgentId: string })/handleAgentHandoff(event: { toAgentId: string })/' src/services/elevenLabs.ts

# elevenLabs.ts - Remove unused agentId from handleConversationCreated
sed -i '' 's/private handleConversationCreated(event: { conversationId: string; agentId: string })/private handleConversationCreated(event: { conversationId: string })/' src/services/elevenLabs.ts

# elevenLabs.ts - Remove unused conversationId from handleCallEnded
sed -i '' '/private handleCallEnded(event: ConversationEndEvent)/,/^  }/ {
  s/const { conversationId } = event;//
}' src/services/elevenLabs.ts

# gemini.ts - Remove unused audioUrl parameter
sed -i '' 's/async analyzeCall(call: CallData, audioUrl?: string): Promise<CallAnalytics>/async analyzeCall(call: CallData): Promise<CallAnalytics>/' src/services/gemini.ts

echo "All errors fixed!"