import { CallData, Transcript, TranscriptSegment } from '../types';
import { supabaseService } from './supabase';

class ElevenLabsService {
  private apiKey: string = 'sk_164fb10a4ec892ed584b839541b4fe34dc7f8e01cf381b70';
  private wsConnections: Map<string, WebSocket> = new Map(); // Multiple WS for multiple agents
  private activeConversations: Map<string, CallData> = new Map(); // Track all active conversations
  private conversationHierarchy: Map<string, string[]> = new Map(); // Parent -> Children mapping
  private callbacks = {
    onCallStarted: [] as Array<(call: CallData) => void>,
    onCallEnded: [] as Array<(call: CallData) => void>,
    onTranscriptUpdate: [] as Array<(callId: string, transcript: Transcript) => void>,
    onError: [] as Array<(error: Error) => void>,
    onAgentTransfer: [] as Array<(fromCall: CallData, toCall: CallData, reason: string) => void>,
    onConversationMerged: [] as Array<(mergedCall: CallData) => void>,
    onAudioChunk: [] as Array<(conversationId: string, audioData: ArrayBuffer, speaker: 'agent' | 'customer') => void>,
  };
  
  private audioContext: AudioContext | null = null;
  private audioQueue: Map<string, Array<{ buffer: ArrayBuffer; speaker: 'agent' | 'customer' }>> = new Map();
  private audioProcessors: Map<string, any> = new Map();

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  initialize(agentIds: string[] = []) {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not set. Please set it using setApiKey()');
      return;
    }

    // Start polling for conversation updates instead of WebSocket
    console.log('Starting ElevenLabs conversation polling...');
    this.startPolling();
    
    // Load initial history
    this.loadInitialHistory();
    
    // DO NOT try to connect WebSockets - they don't work from browser
    return; // Exit here to prevent WebSocket attempts
  }

  private connectToAgent(agentId: string) {
    try {
      // ElevenLabs WebSocket endpoint with API key in query
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation/websocket?agent_id=${agentId}&xi_api_key=${this.apiKey}`;
      console.log(`Connecting to WebSocket for agent: ${agentId}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`Connected to ElevenLabs agent: ${agentId}`);
        this.wsConnections.set(agentId, ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data, agentId);
        } catch (error) {
          console.error(`Failed to parse WebSocket message for agent ${agentId}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for agent ${agentId}:`, error);
        this.callbacks.onError.forEach(cb => cb(new Error(`WebSocket connection error for agent ${agentId}`)));
      };

      ws.onclose = (event) => {
        console.log(`Disconnected from agent ${agentId}`, event.code, event.reason);
        this.wsConnections.delete(agentId);
        
        // Auto-reconnect logic
        if (!event.wasClean && event.code !== 1000) {
          console.log(`Attempting to reconnect to agent ${agentId} in 5 seconds...`);
          setTimeout(() => {
            if (!this.wsConnections.has(agentId)) {
              this.connectToAgent(agentId);
            }
          }, 5000);
        }
      };
    } catch (error) {
      console.error(`Failed to connect to agent ${agentId}:`, error);
      this.callbacks.onError.forEach(cb => cb(error as Error));
    }
  }

  private connectToMonitoringWebSocket() {
    try {
      // Connect to a general monitoring endpoint (if available)
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversations?xi-api-key=${this.apiKey}`);
      
      ws.onopen = () => {
        console.log('Connected to ElevenLabs monitoring WebSocket');
        this.wsConnections.set('monitoring', ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse monitoring WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Monitoring WebSocket error:', error);
        this.callbacks.onError.forEach(cb => cb(new Error('Monitoring WebSocket connection error')));
      };

      ws.onclose = () => {
        console.log('Disconnected from monitoring WebSocket');
        this.wsConnections.delete('monitoring');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectToMonitoringWebSocket(), 5000);
      };
    } catch (error) {
      console.error('Failed to initialize monitoring WebSocket:', error);
      this.callbacks.onError.forEach(cb => cb(error as Error));
    }
  }

  private handleWebSocketMessage(data: any, agentId?: string) {
    console.log(`WebSocket message from ${agentId}:`, data.type, data);
    
    switch (data.type) {
      case 'conversation_initiation_metadata':
      case 'conversation_init':
      case 'conversation.init':
        this.handleConversationInit(data, agentId);
        break;
      case 'conversation_started':
      case 'conversation.started':
      case 'call_started':
        this.handleCallStarted(data, agentId);
        break;
      case 'conversation_ended':
      case 'conversation.ended':
      case 'call_ended':
        this.handleCallEnded(data, agentId);
        break;
      case 'transcript_update':
      case 'transcript.update':
      case 'transcription':
        this.handleTranscriptUpdate(data, agentId);
        break;
      case 'agent_transfer':
      case 'transfer':
        this.handleAgentTransfer(data, agentId);
        break;
      case 'audio_chunk':
      case 'audio':
        this.handleAudioChunk(data, agentId);
        break;
      default:
        console.log('Unknown message type:', data.type, 'Full data:', data);
        // Try to handle as a general update
        if (data.conversation_id) {
          this.handleGeneralUpdate(data, agentId);
        }
    }
  }
  
  private handleGeneralUpdate(data: any, agentId?: string) {
    // Handle any conversation update
    if (data.status === 'active' && !this.activeConversations.has(data.conversation_id)) {
      // New conversation detected
      this.handleCallStarted({
        ...data,
        type: 'conversation_started'
      }, agentId);
    }
  }

  private handleConversationInit(data: any, agentId?: string) {
    console.log(`Conversation initiated: ${data.conversation_id} on agent ${agentId}`);
  }

  private handleAgentTransfer(data: any, fromAgentId?: string) {
    const fromCall = this.activeConversations.get(data.from_conversation_id);
    
    if (fromCall) {
      // Create new call data for the transfer
      const toCall: CallData = {
        id: data.to_conversation_id,
        conversationId: data.to_conversation_id,
        parentConversationId: data.from_conversation_id,
        startTime: new Date(),
        phoneNumber: fromCall.phoneNumber,
        customerName: fromCall.customerName,
        status: 'active',
        agentId: data.to_agent_id,
        agentName: data.to_agent_name || 'Specialist Agent',
        agentType: data.to_agent_type || 'specialist',
        handoffReason: data.transfer_reason,
        handoffTimestamp: new Date(),
        handoffFromAgent: {
          id: fromCall.agentId,
          name: fromCall.agentName,
          type: fromCall.agentType || 'orchestrator'
        },
        isPartOfHandoff: true,
        transcript: {
          segments: [],
          fullText: '',
          confidence: 1.0
        }
      };

      // Update from call status
      fromCall.status = 'transferred';
      fromCall.handoffToAgent = {
        id: data.to_agent_id,
        name: data.to_agent_name || 'Specialist Agent',
        type: data.to_agent_type || 'specialist'
      };

      // Track the handoff
      this.activeConversations.set(toCall.conversationId, toCall);
      
      // Update hierarchy
      const parentId = fromCall.parentConversationId || fromCall.conversationId;
      const children = this.conversationHierarchy.get(parentId) || [];
      children.push(toCall.conversationId);
      this.conversationHierarchy.set(parentId, children);

      // Notify callbacks
      this.callbacks.onAgentTransfer.forEach(cb => cb(fromCall, toCall, data.transfer_reason));
    }
  }

  private handleCallStarted(data: any, agentId?: string) {
    console.log('Call started event:', data, 'agentId:', agentId);
    
    const call: CallData = {
      id: data.conversation_id || `conv_${Date.now()}`,
      conversationId: data.conversation_id || `conv_${Date.now()}`,
      startTime: data.start_time ? new Date(data.start_time) : new Date(),
      phoneNumber: data.phone_number || data.caller_phone_number || 'Unknown',
      customerName: data.customer_name || data.caller_name || 'Müşteri',
      status: 'active',
      agentId: agentId || data.agent_id || 'unknown',
      agentName: this.getAgentName(agentId || data.agent_id),
      agentType: data.agent_type || this.determineAgentType(data.agent_name || ''),
      transcript: {
        segments: [],
        fullText: '',
        confidence: 1.0
      }
    };

    // Store the active conversation
    this.activeConversations.set(call.conversationId, call);

    // If this is the first call in a chain, initialize hierarchy
    if (!call.parentConversationId) {
      this.conversationHierarchy.set(call.conversationId, []);
    }

    this.callbacks.onCallStarted.forEach(cb => cb(call));
    
    // Supabase'e kaydet
    supabaseService.upsertCall(call).catch(err => 
      console.error('Failed to save call to Supabase:', err)
    );
  }

  private handleCallEnded(data: any, agentId?: string) {
    const activeCall = this.activeConversations.get(data.conversation_id);
    
    if (activeCall) {
      // Update the active call with end data
      activeCall.endTime = new Date(data.end_time || new Date());
      activeCall.duration = data.duration;
      activeCall.audioUrl = data.audio_url;
      activeCall.status = 'completed';
      activeCall.transcript = data.transcript || activeCall.transcript;

      // Check if this is part of a handoff chain
      if (activeCall.parentConversationId || this.hasChildConversations(activeCall.conversationId)) {
        // This call is part of a handoff chain
        this.handleHandoffChainCompletion(activeCall);
      } else {
        // Simple call completion
        this.callbacks.onCallEnded.forEach(cb => cb(activeCall));
        
        // Supabase'e güncelle
        supabaseService.upsertCall(activeCall).catch(err => 
          console.error('Failed to update call in Supabase:', err)
        );
      }

      // Remove from active conversations
      this.activeConversations.delete(data.conversation_id);
    } else {
      // Fallback for calls we didn't track from the start
      const call: CallData = {
        id: data.conversation_id,
        conversationId: data.conversation_id,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        duration: data.duration,
        phoneNumber: data.phone_number || 'Unknown',
        customerName: data.customer_name,
        audioUrl: data.audio_url,
        status: 'completed',
        agentId: agentId || data.agent_id,
        agentName: data.agent_name || 'AI Agent',
        agentType: data.agent_type || this.determineAgentType(data.agent_name),
        transcript: data.transcript
      };

      this.callbacks.onCallEnded.forEach(cb => cb(call));
      
      // Supabase'e kaydet
      supabaseService.upsertCall(call).catch(err => 
        console.error('Failed to save completed call to Supabase:', err)
      );
    }
  }

  private handleTranscriptUpdate(data: any) {
    const segment: TranscriptSegment = {
      id: data.segment_id,
      speaker: data.speaker === 'agent' ? 'agent' : 'customer',
      text: data.text,
      startTime: data.start_time,
      endTime: data.end_time,
      confidence: data.confidence || 0.95
    };

    const transcript: Transcript = {
      segments: [segment],
      fullText: data.text,
      confidence: data.confidence || 0.95
    };

    this.callbacks.onTranscriptUpdate.forEach(cb => 
      cb(data.conversation_id, transcript)
    );
  }

  async getCallAudio(conversationId: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get audio: ${response.statusText}`);
      }

      const data = await response.json();
      return data.audio_url;
    } catch (error) {
      console.error('Failed to get call audio:', error);
      throw error;
    }
  }

  async getConversationTranscript(conversationId: string): Promise<Transcript | null> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to get conversation details: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      if (!data.transcript || !Array.isArray(data.transcript)) {
        return null;
      }

      // Convert ElevenLabs transcript format to our format
      const segments: TranscriptSegment[] = [];
      let fullText = '';
      let segmentId = 0;

      if (data.transcript && Array.isArray(data.transcript)) {
        data.transcript.forEach((turn: any) => {
          if (turn.message) {
            const segment: TranscriptSegment = {
              id: `seg_${segmentId++}`,
              speaker: turn.role === 'agent' ? 'agent' : 'customer',
              text: turn.message,
              startTime: turn.time_in_call_secs || 0,
              endTime: turn.time_in_call_secs ? turn.time_in_call_secs + 2 : 2, // Estimate 2 seconds per turn
              confidence: 0.95
            };
            segments.push(segment);
            fullText += (fullText ? ' ' : '') + turn.message;
          }
        });
      }

      return {
        segments,
        fullText,
        confidence: 0.95
      };
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
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?limit=${limit}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversation history: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Conversation history response:', data);
      
      // Handle different response formats
      const conversations = data.conversations || data.data || [];
      
      const calls = await Promise.all(conversations.map(async (conv: any) => {
        // console.log('Processing conversation:', conv);
        
        // Parse dates safely - handle Unix timestamps in seconds
        let startTime = new Date();
        if (conv.start_time_unix_secs) {
          startTime = new Date(conv.start_time_unix_secs * 1000); // Convert seconds to milliseconds
        } else if (conv.start_time) {
          startTime = new Date(conv.start_time);
        }
        
        let endTime = undefined;
        if (conv.end_time_unix_secs) {
          endTime = new Date(conv.end_time_unix_secs * 1000);
        } else if (conv.end_time) {
          endTime = new Date(conv.end_time);
        } else if (conv.call_duration_secs && conv.start_time_unix_secs) {
          // Calculate end time from start + duration
          endTime = new Date((conv.start_time_unix_secs + conv.call_duration_secs) * 1000);
        }
        
        const call: CallData = {
          id: conv.conversation_id || conv.id || `conv_${Date.now()}_${Math.random()}`,
          conversationId: conv.conversation_id || conv.id,
          startTime: startTime,
          endTime: endTime,
          duration: conv.call_duration_secs || conv.duration || 0,
          phoneNumber: conv.phone_number || conv.caller_phone_number || 'Unknown',
          customerName: conv.customer_name || conv.caller_name || 'Müşteri',
          audioUrl: conv.audio_url || conv.recording_url,
          status: conv.status === 'done' || conv.status === 'completed' ? 'completed' : 'active',
          agentId: conv.agent_id || 'unknown',
          agentName: this.getAgentName(conv.agent_id || 'unknown'),
          agentType: this.determineAgentType(conv.agent_name || ''),
          transcript: { segments: [], fullText: '', confidence: 1.0 }
        };

        // Fetch detailed transcript if message_count > 0
        if (conv.message_count > 0 && conv.conversation_id) {
          try {
            const transcript = await this.getConversationTranscript(conv.conversation_id);
            if (transcript) {
              call.transcript = transcript;
            }
          } catch (err) {
            console.warn(`Failed to fetch transcript for ${conv.conversation_id}:`, err);
          }
        }

        return call;
      }));

      return calls;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }

  // Event listeners
  onCallStarted(callback: (call: CallData) => void) {
    this.callbacks.onCallStarted.push(callback);
  }

  onCallEnded(callback: (call: CallData) => void) {
    this.callbacks.onCallEnded.push(callback);
  }

  onTranscriptUpdate(callback: (callId: string, transcript: Transcript) => void) {
    this.callbacks.onTranscriptUpdate.push(callback);
  }

  onError(callback: (error: Error) => void) {
    this.callbacks.onError.push(callback);
  }

  private getAgentName(agentId: string): string {
    // Map agent IDs to friendly names
    const agentNames: Record<string, string> = {
      'agent_2401k1gvpfa2f61bjd2de7sr5xpb': 'Turkcell Orkestratör',
      'agent_8601k1gwxk5vf6ga8nphd7ksd85w': 'Turkcell Müşteri Destek',
      'agent_4801k1j0zt4nfn5t5q9tqhrzhj0k': 'Turkcell Teknik Destek',
      'agent_9401k1j14dpne7kr0kzr8a7cj29x': 'Turkcell Satış Uzmanı'
    };
    
    return agentNames[agentId] || agentId;
  }

  private determineAgentType(agentName: string): 'orchestrator' | 'specialist' | 'support' | 'sales' | 'technical' {
    const name = agentName.toLowerCase();
    if (name.includes('orchestrator') || name.includes('orkestratör') || name.includes('router')) return 'orchestrator';
    if (name.includes('support') || name.includes('destek') || name.includes('müşteri')) return 'support';
    if (name.includes('sales') || name.includes('satış')) return 'sales';
    if (name.includes('technical') || name.includes('teknik')) return 'technical';
    return 'specialist';
  }

  private hasChildConversations(conversationId: string): boolean {
    const children = this.conversationHierarchy.get(conversationId);
    return children ? children.length > 0 : false;
  }

  private handleHandoffChainCompletion(completedCall: CallData) {
    // Find the root conversation
    const rootId = this.findRootConversation(completedCall.conversationId);
    const allCallsInChain = this.getAllCallsInChain(rootId);

    // Check if all calls in the chain are completed
    const allCompleted = allCallsInChain.every(call => 
      call.status === 'completed' || call.status === 'transferred'
    );

    if (allCompleted) {
      // Merge all calls into a comprehensive call data
      const mergedCall = this.mergeCallChain(allCallsInChain);
      this.callbacks.onConversationMerged.forEach(cb => cb(mergedCall));
    }
  }

  private findRootConversation(conversationId: string): string {
    const activeCall = this.activeConversations.get(conversationId);
    if (!activeCall || !activeCall.parentConversationId) {
      return conversationId;
    }
    return this.findRootConversation(activeCall.parentConversationId);
  }

  private getAllCallsInChain(rootId: string): CallData[] {
    const calls: CallData[] = [];
    const queue = [rootId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const call = this.activeConversations.get(currentId);
      
      if (call) {
        calls.push(call);
      }

      const children = this.conversationHierarchy.get(currentId) || [];
      queue.push(...children);
    }

    return calls;
  }

  private mergeCallChain(calls: CallData[]): CallData {
    // Sort calls by start time
    const sortedCalls = calls.sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );

    const firstCall = sortedCalls[0];
    const lastCall = sortedCalls[sortedCalls.length - 1];

    // Build call journey
    const callJourney: CallJourneyStep[] = sortedCalls.map(call => ({
      agentId: call.agentId,
      agentName: call.agentName,
      agentType: call.agentType || 'specialist',
      startTime: call.startTime,
      endTime: call.endTime,
      duration: call.duration || 0,
      handoffReason: call.handoffReason,
      performance: {
        score: call.analytics?.agentPerformance?.overallScore || 0,
        highlights: call.analytics?.agentPerformance?.strengths || [],
        issues: call.analytics?.agentPerformance?.improvements || []
      }
    }));

    // Merge transcripts
    const mergedTranscript: Transcript = {
      segments: [],
      fullText: '',
      confidence: 1.0
    };

    sortedCalls.forEach(call => {
      if (call.transcript) {
        mergedTranscript.segments.push(...call.transcript.segments);
        mergedTranscript.fullText += (mergedTranscript.fullText ? ' ' : '') + call.transcript.fullText;
      }
    });

    // Create merged call data
    const mergedCall: CallData = {
      id: `merged_${firstCall.conversationId}`,
      conversationId: firstCall.conversationId,
      startTime: firstCall.startTime,
      endTime: lastCall.endTime,
      duration: lastCall.endTime ? 
        (lastCall.endTime.getTime() - firstCall.startTime.getTime()) / 1000 : 0,
      phoneNumber: firstCall.phoneNumber,
      customerName: firstCall.customerName,
      status: 'completed',
      agentId: 'multi-agent',
      agentName: 'Multi-Agent Conversation',
      agentType: 'orchestrator',
      callJourney,
      transcript: mergedTranscript,
      isPartOfHandoff: true
    };

    return mergedCall;
  }

  // New event listener for agent transfers
  onAgentTransfer(callback: (fromCall: CallData, toCall: CallData, reason: string) => void) {
    this.callbacks.onAgentTransfer.push(callback);
  }

  // New event listener for merged conversations
  onConversationMerged(callback: (mergedCall: CallData) => void) {
    this.callbacks.onConversationMerged.push(callback);
  }

  // Get complete call journey for a conversation
  async getCallJourney(conversationId: string): Promise<CallData[]> {
    const rootId = this.findRootConversation(conversationId);
    return this.getAllCallsInChain(rootId);
  }

  private handleAudioChunk(data: any, agentId?: string) {
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
      
      // Initialize audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Queue the audio chunk
      if (!this.audioQueue.has(conversationId)) {
        this.audioQueue.set(conversationId, []);
      }
      this.audioQueue.get(conversationId)!.push({ buffer: bytes.buffer, speaker });
      
      // Notify listeners
      this.callbacks.onAudioChunk.forEach(cb => cb(conversationId, bytes.buffer, speaker));
      
      // Process audio queue
      this.processAudioQueue(conversationId);
    }
  }

  private async processAudioQueue(conversationId: string) {
    const queue = this.audioQueue.get(conversationId);
    if (!queue || queue.length === 0 || !this.audioContext) return;
    
    // Get or create audio processor for this conversation
    let processor = this.audioProcessors.get(conversationId);
    if (!processor) {
      processor = {
        isPlaying: false,
        nextStartTime: 0
      };
      this.audioProcessors.set(conversationId, processor);
    }
    
    if (processor.isPlaying) return;
    processor.isPlaying = true;
    
    while (queue.length > 0) {
      const { buffer, speaker } = queue.shift()!;
      
      try {
        // Decode audio data
        const audioBuffer = await this.audioContext.decodeAudioData(buffer.slice(0));
        
        // Create buffer source
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Add some processing based on speaker
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = speaker === 'agent' ? 0.8 : 1.0;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Schedule playback
        const startTime = Math.max(this.audioContext.currentTime, processor.nextStartTime);
        source.start(startTime);
        
        // Update next start time
        processor.nextStartTime = startTime + audioBuffer.duration;
        
        // Wait for this chunk to finish
        await new Promise(resolve => {
          source.onended = resolve;
        });
      } catch (error) {
        console.error('Error processing audio chunk:', error);
      }
    }
    
    processor.isPlaying = false;
  }

  // Get live audio stream for a conversation
  getLiveAudioStream(conversationId: string): MediaStream | null {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const destination = this.audioContext.createMediaStreamDestination();
    
    // This would connect to the live audio processing
    // For now, return the stream that can be used for visualization
    return destination.stream;
  }

  // New event listener for audio chunks
  onAudioChunk(callback: (conversationId: string, audioData: ArrayBuffer, speaker: 'agent' | 'customer') => void) {
    this.callbacks.onAudioChunk.push(callback);
  }

  private pollingInterval: NodeJS.Timeout | null = null;
  private lastSeenConversations: Set<string> = new Set();

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
    // Poll every 3 seconds for new conversations
    this.pollingInterval = setInterval(async () => {
      try {
        const conversations = await this.getConversationHistory(10);
        
        conversations.forEach(conv => {
          const isNew = !this.lastSeenConversations.has(conv.id);
          const isActive = conv.status === 'active';
          
          if (isNew) {
            console.log('New conversation detected:', conv.id);
            this.lastSeenConversations.add(conv.id);
            
            if (isActive) {
              // New active call
              this.callbacks.onCallStarted.forEach(cb => cb(conv));
              // Don't save here - let App.tsx handle database saves
            } else {
              // Completed call we haven't seen
              this.callbacks.onCallEnded.forEach(cb => cb(conv));
              // Don't save here - let App.tsx handle database saves
            }
          } else if (!isActive && this.activeConversations.has(conv.id)) {
            // Previously active call that ended
            console.log('Conversation ended:', conv.id);
            this.callbacks.onCallEnded.forEach(cb => cb(conv));
            this.activeConversations.delete(conv.id);
            // Don't save here - let App.tsx handle database saves
          }
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Back to 3 seconds
  }

  disconnect() {
    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Clean up audio resources
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioQueue.clear();
    this.audioProcessors.clear();
    
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
    this.activeConversations.clear();
    this.conversationHierarchy.clear();
  }
}

export const elevenLabsService = new ElevenLabsService();