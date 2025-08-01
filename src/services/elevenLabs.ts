import { CallData, Transcript, TranscriptSegment, CallJourneyStep } from '../types';
import { elevenLabsRateLimiter, rateLimitedFetch } from '../utils/rateLimiter';

// Type definitions
interface ConversationEndEvent {
  conversation_id: string;
  end_of_conversation_metadata?: {
    call_duration?: number;
    customer_name?: string;
    tags?: string[];
  };
}

// ElevenLabs API Key - embedded for demo purposes
const ELEVENLABS_API_KEY = 'sk_407a48198719698573b00cd0b1a1e9c12d4f014d7f9f0405';

interface AudioProcessor {
  source: AudioBufferSourceNode;
  isPlaying: boolean;
}

class ElevenLabsService {
  private apiKey: string = ELEVENLABS_API_KEY;
  private activeConversations = new Map<string, CallData>();
  private audioProcessors = new Map<string, AudioProcessor>();
  private audioContext: AudioContext | null = null;
  private lastSeenConversations = new Set<string>();
  private conversationChain = new Map<string, string[]>(); // parentId -> [childIds]
  private conversationParent = new Map<string, string>(); // childId -> parentId
  
  constructor() {
    console.log('ElevenLabsService initialized');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  initialize() {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not set. Please set it using setApiKey()');
      return;
    }

    // Validate API key first
    this.validateApiKey().then(isValid => {
      if (isValid) {
        console.log('ElevenLabs API key validated successfully');
        
        // Start polling for conversation updates instead of WebSocket
        console.log('Starting ElevenLabs conversation polling...');
        this.startPolling();
        
        // Load initial history
        this.loadInitialHistory();
      } else {
        console.error('ElevenLabs API key validation failed - please check your API key');
      }
    });
  }
  
  private async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      
      if (!response.ok) {
        console.error(`API key validation failed with status: ${response.status}`);
        if (response.status === 401 || response.status === 403) {
          console.error('Invalid API key - please check your ElevenLabs API key');
        }
        return false;
      }
      
      const userData = await response.json();
      console.log('ElevenLabs user data:', userData);
      return true;
    } catch (error) {
      console.error('Failed to validate API key:', error);
      return false;
    }
  }

  private async initializeWebSocket(agentId: string): Promise<WebSocket | null> {
    try {
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation/websocket?agent_id=${agentId}&xi_api_key=${this.apiKey}`;
      const ws = new WebSocket(wsUrl);
      
      return new Promise((resolve) => {
        ws.onopen = () => {
          console.log(`WebSocket connected for agent ${agentId}`);
          resolve(ws);
        };
        
        ws.onerror = (error) => {
          console.error(`WebSocket error for agent ${agentId}:`, error);
          resolve(null);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data, agentId);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log(`WebSocket closed for agent ${agentId}`);
          // Attempt to reconnect after 10 seconds
          setTimeout(() => {
            console.log(`Attempting to reconnect WebSocket for agent ${agentId}`);
            this.initializeWebSocket(agentId);
          }, 10000);
        };
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      return null;
    }
  }
  
  // Note: WebSocket monitoring removed as it requires agent-specific connections
  
  private handleWebSocketMessage(data: any, agentId?: string) {
    console.log('WebSocket message:', data);
    
    // Handle different message types
    switch (data.type) {
      case 'conversation_initiation_metadata':
      case 'conversation_started':
        this.handleConversationInit(data, agentId);
        break;
      case 'transcript':
      case 'transcript_update':
        this.handleTranscriptUpdate(data);
        break;
      case 'conversation_ended':
      case 'end_of_conversation':
        this.handleConversationEnd(data);
        break;
      case 'handoff':
      case 'agent_handoff':
        this.handleHandoff(data);
        break;
      case 'agent_transfer':
      case 'transfer':
        this.handleAgentTransfer(data);
        break;
      case 'audio_chunk':
      case 'audio':
        this.handleAudioChunk(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }
  
  private handleConversationInit(data: any, agentId?: string) {
    console.log(`Conversation initiated: ${data.conversation_id} on agent ${agentId}`);
  }
  
  private handleAgentTransfer(data: any) {
    const fromCall = this.activeConversations.get(data.from_conversation_id);
    
    if (fromCall) {
      // Create new call data for the transfer
      const toCall: CallData = {
        id: data.to_conversation_id,
        conversationId: data.to_conversation_id,
        phoneNumber: fromCall.phoneNumber,
        customerName: fromCall.customerName,
        agentId: data.to_agent_id || 'agent_specialist',
        agentName: data.to_agent_name || 'Specialist Agent',
        startTime: new Date(),
        status: 'active',
        transcript: { segments: [], fullText: '', confidence: 0.95 },
        tags: fromCall.tags ? [...fromCall.tags] : [],
        handoffFromId: data.from_conversation_id,
        callJourney: []
      };
      
      // Update conversation chain
      this.conversationParent.set(data.to_conversation_id, data.from_conversation_id);
      const existingChildren = this.conversationChain.get(data.from_conversation_id) || [];
      this.conversationChain.set(data.from_conversation_id, [...existingChildren, data.to_conversation_id]);
      
      // Mark the "from" call as having a handoff
      fromCall.handoffTimestamp = new Date();
      fromCall.handoffToId = data.to_conversation_id;
      
      // Store the new call
      this.activeConversations.set(data.to_conversation_id, toCall);
      
      // Notify about handoff
      this.callbacks.onHandoff.forEach(cb => cb(data.from_conversation_id, data.to_conversation_id));
      
      console.log(`Agent transfer: ${data.from_conversation_id} -> ${data.to_conversation_id}`);
    }
  }
  
  private handleHandoff(data: any) {
    console.log('Handoff event:', data);
    
    const fromId = data.from_conversation_id || data.conversationId;
    const toId = data.to_conversation_id || data.targetConversationId;
    
    if (fromId && toId) {
      // Update conversation chain
      this.conversationParent.set(toId, fromId);
      const existingChildren = this.conversationChain.get(fromId) || [];
      this.conversationChain.set(fromId, [...existingChildren, toId]);
      
      // Notify callbacks
      this.callbacks.onHandoff.forEach(cb => cb(fromId, toId));
    }
  }
  
  private handleConversationEnd(data: ConversationEndEvent) {
    console.log('Conversation ended:', data);
    
    const conversationId = data.conversation_id;
    const call = this.activeConversations.get(conversationId);
    
    if (call) {
      call.endTime = new Date();
      call.status = 'completed';
      
      if (data.end_of_conversation_metadata) {
        const metadata = data.end_of_conversation_metadata;
        if (metadata.call_duration) {
          call.duration = metadata.call_duration;
        }
        if (metadata.customer_name) {
          call.customerName = metadata.customer_name;
        }
        if (metadata.tags) {
          call.tags = [...new Set([...(call.tags || []), ...metadata.tags])];
        }
      }
      
      // Calculate duration if not provided
      if (!call.duration && call.startTime && call.endTime) {
        call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
      }
      
      // Get complete call chain for journey
      call.callJourney = this.getCompleteCallJourney(conversationId);
      
      // Notify callbacks
      this.callbacks.onCallEnded.forEach(cb => cb(call));
      
      // Clean up
      this.activeConversations.delete(conversationId);
    }
  }
  
  private handleTranscriptUpdate(data: any) {
    const conversationId = data.conversation_id;
    const call = this.activeConversations.get(conversationId);
    
    if (call && data.text) {
      const segment: TranscriptSegment = {
        id: Date.now().toString(),
        speaker: data.role || 'agent',
        text: data.text,
        startTime: data.start_time || Date.now() / 1000,
        endTime: data.end_time || Date.now() / 1000,
        confidence: data.confidence || 0.9,
        sentiment: data.sentiment
      };
      
      if (call.transcript) {
        call.transcript.segments.push(segment);
        call.transcript.fullText = call.transcript.segments
          .map(s => `${s.speaker}: ${s.text}`)
          .join('\n');
      }
      
      // Notify callbacks
      this.callbacks.onTranscriptUpdate.forEach(cb => cb(conversationId, segment));
    }
  }
  
  async createCall(phoneNumber: string, agentId?: string): Promise<string> {
    const mockCall: CallData = {
      id: `call_${Date.now()}`,
      conversationId: `conv_${Date.now()}`,
      phoneNumber,
      customerName: 'Test Customer',
      agentId: agentId || 'agent_default',
      agentName: 'AI Agent',
      startTime: new Date(),
      status: 'active',
      transcript: { segments: [], fullText: '', confidence: 0.95 },
      tags: [],
      callJourney: []
    };
    
    this.activeConversations.set(mockCall.id, mockCall);
    this.callbacks.onCallStarted.forEach(cb => cb(mockCall));
    
    return mockCall.id;
  }

  async endCall(conversationId: string): Promise<void> {
    const call = this.activeConversations.get(conversationId);
    if (call) {
      call.status = 'completed';
      call.endTime = new Date();
      call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
      
      this.callbacks.onCallEnded.forEach(cb => cb(call));
      this.activeConversations.delete(conversationId);
    }
  }

  async getCallAudio(conversationId: string): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await rateLimitedFetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        },
        elevenLabsRateLimiter,
        'audio'
      );

      if (!response.ok) {
        console.warn(`Failed to get audio: ${response.statusText}`);
        return null;
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to get call audio:', error);
      return null;
    }
  }

  async getConversationTranscript(conversationId: string): Promise<Transcript | null> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await rateLimitedFetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        },
        elevenLabsRateLimiter,
        'transcript'
      );

      if (!response.ok) {
        console.warn(`Failed to get conversation details: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log('Conversation details:', data);

      // Extract transcript from the response
      if (data.transcript) {
        const segments: TranscriptSegment[] = data.transcript.map((item: any, index: number) => ({
          id: `seg_${index}`,
          speaker: item.role === 'agent' ? 'agent' : 'customer',
          text: item.message,
          startTime: item.timestamp || index * 2,
          endTime: item.timestamp ? item.timestamp + 2 : (index + 1) * 2,
          sentiment: item.sentiment
        }));

        return {
          segments,
          fullText: segments.map(s => `${s.speaker}: ${s.text}`).join('\n'),
          confidence: 0.95
        };
      }

      // Alternative format
      if (data.messages) {
        const segments: TranscriptSegment[] = data.messages.map((item: any, index: number) => ({
          id: `seg_${index}`,
          speaker: item.role === 'agent' ? 'agent' : 'customer', 
          text: item.content || item.text || item.message,
          startTime: item.timestamp || index * 2,
          endTime: item.timestamp ? item.timestamp + 2 : (index + 1) * 2,
          sentiment: item.sentiment
        }));

        return {
          segments,
          fullText: segments.map(s => `${s.speaker}: ${s.text}`).join('\n'),
          confidence: 0.95
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get conversation transcript:', error);
      return null;
    }
  }

  async getConversationHistory(limit: number = 50): Promise<CallData[]> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await rateLimitedFetch(
        `https://api.elevenlabs.io/v1/convai/conversations?page_size=${limit}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        },
        elevenLabsRateLimiter,
        'history'
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error ${response.status}:`, errorText);
        throw new Error(`Failed to get conversation history: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Conversation history response:', data);

      // Handle different response formats
      // The API returns an object with a conversations array
      const conversations = data.conversations || [];
      
      if (!Array.isArray(conversations)) {
        console.warn('Unexpected response format - expected conversations array:', data);
        return [];
      }
      
      console.log(`Found ${conversations.length} conversations`);

      return conversations.map((conv: any) => {
        // Parse dates safely
        const parseDate = (dateStr: any): Date => {
          if (!dateStr) return new Date();
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? new Date() : date;
        };
        
        const startTime = parseDate(conv.created_at || conv.start_time || conv.timestamp);
        const endTime = conv.ended_at ? parseDate(conv.ended_at) : undefined;
        
        return {
          id: conv.id || conv.conversation_id || `conv_${Date.now()}_${Math.random()}`,
          conversationId: conv.id || conv.conversation_id || `conv_${Date.now()}_${Math.random()}`,
          phoneNumber: conv.metadata?.phone_number || conv.phone_number || 'Unknown',
          customerName: conv.metadata?.customer_name || conv.customer_name || null,
          agentId: conv.agent_id || conv.metadata?.agent_id || 'agent_default',
          agentName: conv.metadata?.agent_name || conv.agent_name || 'AI Agent',
          startTime,
          endTime,
          status: conv.status === 'active' ? 'active' : 'completed',
          duration: conv.duration || (endTime && startTime ? 
            Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 
            undefined),
          transcript: { segments: [], fullText: '', confidence: 0.95 },
          tags: conv.metadata?.tags || conv.tags || [],
          audioUrl: conv.audio_url,
          handoffFromId: conv.metadata?.handoff_from_id,
          handoffToId: conv.metadata?.handoff_to_id,
          handoffTimestamp: conv.metadata?.handoff_timestamp ? parseDate(conv.metadata.handoff_timestamp) : undefined,
          callJourney: []
        };
      });
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  // Callback management
  private callbacks = {
    onCallStarted: [] as ((call: CallData) => void)[],
    onCallEnded: [] as ((call: CallData) => void)[],
    onCallUpdated: [] as ((call: CallData) => void)[],
    onTranscriptUpdate: [] as ((conversationId: string, segment: TranscriptSegment) => void)[],
    onAudioData: [] as ((conversationId: string, audioData: ArrayBuffer, speaker: 'agent' | 'customer') => void)[],
    onHandoff: [] as ((fromId: string, toId: string) => void)[]
  };

  onCallStarted(callback: (call: CallData) => void) {
    this.callbacks.onCallStarted.push(callback);
  }

  onCallEnded(callback: (call: CallData) => void) {
    this.callbacks.onCallEnded.push(callback);
  }

  onCallUpdated(callback: (call: CallData) => void) {
    this.callbacks.onCallUpdated.push(callback);
  }

  onTranscriptUpdate(callback: (conversationId: string, segment: TranscriptSegment) => void) {
    this.callbacks.onTranscriptUpdate.push(callback);
  }

  onAudioData(callback: (conversationId: string, audioData: ArrayBuffer, speaker: 'agent' | 'customer') => void) {
    this.callbacks.onAudioData.push(callback);
  }

  onHandoff(callback: (fromId: string, toId: string) => void) {
    this.callbacks.onHandoff.push(callback);
  }

  getActiveCall(conversationId: string): CallData | null {
    return this.activeConversations.get(conversationId) || null;
  }

  getAllActiveCalls(): CallData[] {
    return Array.from(this.activeConversations.values());
  }

  // Helper methods for call chain management
  private findRootConversation(conversationId: string): string {
    let current = conversationId;
    while (this.conversationParent.has(current)) {
      current = this.conversationParent.get(current)!;
    }
    return current;
  }
  
  private getAllCallsInChain(rootId: string): string[] {
    const chain: string[] = [rootId];
    const queue = [rootId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = this.conversationChain.get(current) || [];
      children.forEach(child => {
        if (!chain.includes(child)) {
          chain.push(child);
          queue.push(child);
        }
      });
    }
    
    return chain;
  }
  
  private getCompleteCallJourney(conversationId: string): CallJourneyStep[] {
    const journey: CallJourneyStep[] = [];
    const rootId = this.findRootConversation(conversationId);
    const chainIds = this.getAllCallsInChain(rootId);
    
    // Build journey from the chain
    chainIds.forEach(id => {
      const call = this.activeConversations.get(id);
      if (call) {
        journey.push({
          agentId: call.agentId,
          agentName: call.agentName,
          agentType: call.agentType || 'support',
          startTime: call.startTime,
          endTime: call.endTime,
          duration: call.duration || 0,
          handoffReason: this.conversationParent.has(id) ? 'Escalation' : undefined
        });
      }
    });
    
    return journey.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  getCompleteCallChain(conversationId: string): CallData[] {
    const rootId = this.findRootConversation(conversationId);
    const chainIds = this.getAllCallsInChain(rootId);
    const calls: CallData[] = [];
    
    chainIds.forEach(id => {
      const call = this.activeConversations.get(id);
      if (call) {
        calls.push(call);
      }
    });
    
    return calls;
  }

  private handleAudioChunk(data: any) {
    const conversationId = data.conversation_id;
    const audioData = data.audio_data; // Base64 encoded audio
    const speaker = data.speaker || 'agent';
    
    if (audioData) {
      // Convert base64 to ArrayBuffer
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Notify listeners
      this.callbacks.onAudioData.forEach(cb => 
        cb(conversationId, bytes.buffer, speaker)
      );
    }
  }

  // Process and play audio chunks
  async processAudioChunk(conversationId: string, audioData: ArrayBuffer) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    try {
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      // Create or get processor for this conversation
      let processor = this.audioProcessors.get(conversationId);
      if (!processor || !processor.isPlaying) {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        
        processor = { source, isPlaying: true };
        this.audioProcessors.set(conversationId, processor);
        
        source.onended = () => {
          processor!.isPlaying = false;
        };
      }
    } catch (error) {
      console.error('Failed to process audio chunk:', error);
    }
  }

  // Stop audio playback for a conversation
  stopAudio(conversationId: string) {
    const processor = this.audioProcessors.get(conversationId);
    if (processor && processor.isPlaying) {
      processor.source.stop();
      processor.isPlaying = false;
    }
  }

  // Get live audio stream for a conversation
  getLiveAudioStream(): MediaStream | null {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const destination = this.audioContext.createMediaStreamDestination();
    return destination.stream;
  }

  // Connection status management
  isConnected(): boolean {
    return this.pollingInterval !== null;
  }

  // Polling management
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastPollTime: number = 0;
  private pollErrors: number = 0;
  private backoffDelay: number = 10000; // Start with 10 seconds to avoid initial rate limits
  private readonly MAX_BACKOFF_DELAY = 60000; // Max 60 seconds
  private readonly RATE_LIMIT_THRESHOLD = 5; // Number of 429s before backing off significantly

  private async loadInitialHistory() {
    try {
      const history = await this.getConversationHistory(30);
      console.log(`Loaded ${history.length} historical conversations`);
      
      // Mark all as seen
      history.forEach(call => {
        this.lastSeenConversations.add(call.id);
      });
    } catch (error) {
      console.error('Failed to load initial history:', error);
    }
  }

  private startPolling() {
    // Use exponential backoff with jitter
    const pollWithBackoff = async () => {
      const now = Date.now();
      const timeSinceLastPoll = now - this.lastPollTime;
      
      // Ensure minimum time between polls
      if (timeSinceLastPoll < this.backoffDelay) {
        const waitTime = this.backoffDelay - timeSinceLastPoll;
        setTimeout(pollWithBackoff, waitTime);
        return;
      }

      try {
        this.lastPollTime = now;
        const conversations = await this.getConversationHistory(10);
        
        // Reset backoff on success
        this.pollErrors = 0;
        this.backoffDelay = Math.max(10000, this.backoffDelay * 0.9); // Gradually reduce backoff, minimum 10 seconds
        
        conversations.forEach(conv => {
          const isNew = !this.lastSeenConversations.has(conv.id);
          const isActive = conv.status === 'active';
          
          if (isNew) {
            console.log('New conversation detected:', conv.id);
            this.lastSeenConversations.add(conv.id);
            
            if (isActive) {
              // New active call
              this.callbacks.onCallStarted.forEach(cb => cb(conv));
            } else {
              // Completed call we haven't seen
              this.callbacks.onCallEnded.forEach(cb => cb(conv));
            }
          } else if (!isActive && this.activeConversations.has(conv.id)) {
            // Previously active call that ended
            console.log('Conversation ended:', conv.id);
            this.callbacks.onCallEnded.forEach(cb => cb(conv));
            this.activeConversations.delete(conv.id);
          }
        });
        
      } catch (error: any) {
        console.error('Polling error:', error);
        this.pollErrors++;
        
        // Check if it's a rate limit error
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          console.warn('Rate limit hit, backing off...');
          // Exponential backoff for rate limits
          this.backoffDelay = Math.min(this.backoffDelay * 2, this.MAX_BACKOFF_DELAY);
          
          // Add jitter to prevent thundering herd
          const jitter = Math.random() * 5000; // 0-5 seconds jitter
          this.backoffDelay += jitter;
        } else if (this.pollErrors > this.RATE_LIMIT_THRESHOLD) {
          // Too many errors, increase backoff
          this.backoffDelay = Math.min(this.backoffDelay * 1.5, this.MAX_BACKOFF_DELAY);
        }
      }
      
      // Schedule next poll
      this.pollingInterval = setTimeout(pollWithBackoff, this.backoffDelay);
    };
    
    // Start polling with initial delay
    console.log(`Starting polling with ${this.backoffDelay}ms interval`);
    this.pollingInterval = setTimeout(pollWithBackoff, this.backoffDelay);
  }

  disconnect() {
    // Stop polling
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Clean up audio resources
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Clear all data
    this.activeConversations.clear();
    this.audioProcessors.clear();
    this.lastSeenConversations.clear();
    this.conversationChain.clear();
    this.conversationParent.clear();
    
    console.log('ElevenLabs service disconnected');
  }
}

export const elevenLabsService = new ElevenLabsService();