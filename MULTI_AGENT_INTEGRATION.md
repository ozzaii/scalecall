# Multi-Agent Integration Guide for ElevenLabs

This dashboard now supports multiple ElevenLabs agents with seamless handoff tracking and comprehensive analytics.

## How to Connect Your Multiple Agents

### 1. Initialize with Agent IDs

```javascript
// In your App.tsx or main component
import { elevenLabsService } from './services/elevenLabs';

// Option 1: Initialize with specific agent IDs
elevenLabsService.initialize(['agent_1_id', 'agent_2_id', 'agent_3_id']);

// Option 2: Initialize without IDs (monitors all agents)
elevenLabsService.initialize();
```

### 2. Set Your API Keys

```javascript
// Set ElevenLabs API key
elevenLabsService.setApiKey('your_elevenlabs_api_key');

// Set Gemini API key for comprehensive analytics
geminiService.setApiKey('your_gemini_api_key');
```

## How Agent Handoffs Work

### Call Flow
1. **Initial Agent** - Customer connects to the orchestrator/router agent
2. **Handoff Decision** - Based on customer needs, orchestrator transfers to specialist
3. **Context Preservation** - All conversation context is maintained during transfer
4. **Multiple Handoffs** - Support for complex scenarios with multiple transfers
5. **Final Resolution** - Last agent completes the call

### Data Management

#### During Active Calls
- Each agent connection maintains its own `conversation_id`
- Parent-child relationships track the handoff chain
- Real-time updates show current active agent

#### After Call Completion
When all agents in a chain complete their portions:
1. Individual call segments are merged into a comprehensive call record
2. Complete journey is preserved showing all agents involved
3. Unified transcript combines all conversations
4. Comprehensive metrics analyze the entire interaction

### Tracking Structure
```
Root Conversation (Orchestrator)
├── Child Conversation 1 (Support Agent)
└── Child Conversation 2 (Technical Specialist)
    └── Child Conversation 3 (Senior Technical)
```

## Comprehensive Metrics

The system now tracks 30+ metrics across 8 categories:

### 1. Communication Quality
- Clarity
- Articulation  
- Pacing
- Vocabulary

### 2. Emotional Intelligence
- Empathy
- Emotional Awareness
- Adaptability
- Patience

### 3. Problem Solving
- Problem Identification
- Solution Effectiveness
- Creativity
- Critical Thinking

### 4. Customer Experience
- Responsiveness
- Helpfulness
- Friendliness
- Personalization

### 5. Professional Skills
- Product Knowledge
- Process Adherence
- Efficiency
- Accuracy

### 6. Advanced Metrics
- De-escalation Skill
- Upsell Attempts
- First Call Resolution
- Call Control
- Active Listening
- Questioning Technique

### 7. Linguistic Analysis
- Sentence Complexity
- Grammar Accuracy
- Tone Consistency
- Cultural Sensitivity

### 8. Technical Performance
- System Usage
- Multitasking
- Data Accuracy
- Compliance

## Handoff Analysis

Special metrics for multi-agent calls:
- **Smoothness**: How seamless was the transition
- **Context Retention**: Information preserved across handoff  
- **Customer Confusion**: Level of confusion caused
- **Reason Validity**: Was the handoff necessary
- **Timing**: Optimal, early, or late

## UI Features

### Call Journey Visualization
- Visual timeline of all agents involved
- Performance scores for each segment
- Handoff reasons and timing
- Agent-specific highlights and issues

### Comprehensive Metrics Dashboard
- Detailed breakdown of all 30+ metrics
- Visual progress bars with color coding
- Conversation dynamics analysis
- Comparative performance tracking

### Enhanced Call Cards
- Multi-agent indicator showing number of agents
- Real-time status for active calls
- Sentiment and satisfaction scores
- Agent type badges

## WebSocket Events

The system listens for these ElevenLabs events:
- `conversation_started` - New call initiated
- `conversation_ended` - Call completed
- `transcript_update` - Real-time transcript
- `agent_transfer` - Handoff between agents
- `audio_chunk` - Audio streaming data

## Best Practices

1. **Agent Naming Convention**
   - Use descriptive names: "Support Agent", "Technical Specialist"
   - Include type in name for auto-detection

2. **Handoff Reasons**
   - Always provide clear handoff reasons
   - Use consistent terminology

3. **Performance Tracking**
   - Review multi-agent metrics regularly
   - Identify patterns in handoff success

4. **Scaling Considerations**
   - System handles unlimited agents
   - Optimized for real-time performance
   - Automatic reconnection on failures

## Example Integration

```javascript
// Listen for agent transfers
elevenLabsService.onAgentTransfer((fromCall, toCall, reason) => {
  console.log(`Transfer: ${fromCall.agentName} → ${toCall.agentName}`);
  console.log(`Reason: ${reason}`);
});

// Listen for merged conversations
elevenLabsService.onConversationMerged((mergedCall) => {
  console.log(`Complete journey: ${mergedCall.callJourney.length} agents`);
  console.log(`Total duration: ${mergedCall.duration}s`);
});

// Get call journey for any conversation
const journey = await elevenLabsService.getCallJourney(conversationId);
```

## Troubleshooting

### Calls Not Merging
- Ensure all agents in chain have completed
- Check parent-child relationships are set correctly
- Verify conversation IDs match

### Missing Metrics
- Confirm Gemini API key is set
- Check audio URLs are accessible
- Verify transcript data is available

### WebSocket Issues
- Auto-reconnect handles most failures
- Check API key permissions
- Monitor console for connection errors

The system is now fully equipped to handle complex multi-agent scenarios with comprehensive tracking and analysis!