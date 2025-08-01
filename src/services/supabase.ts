import { createClient } from '@supabase/supabase-js';
import { CallData, CallAnalytics } from '../types';

// Supabase credentials
const supabaseUrl = 'https://stiodelubisouckcutwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aW9kZWx1Ymlzb3Vja2N1dHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjY0ODMsImV4cCI6MjA2OTYwMjQ4M30.Qn7ovma3mwMaT6S7S1Wm_QzI_EzYki-gCLmvpR7lLgw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbCall {
  id: string;
  conversation_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  phone_number: string;
  customer_name: string;
  status: string;
  agent_id: string;
  agent_name: string;
  agent_type: string;
  audio_url?: string;
  parent_conversation_id?: string;
  handoff_reason?: string;
  handoff_timestamp?: string;
  handoff_from_agent?: any;
  handoff_to_agent?: any;
  is_part_of_handoff?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbAnalytics {
  id: string;
  call_id: string;
  conversation_id: string;
  summary: string;
  key_points: string[];
  sentiment_overall: string;
  sentiment_score: number;
  customer_satisfaction: number;
  topics: any[];
  action_items: any[];
  agent_performance: any;
  risk_factors: any[];
  emotions: any[];
  analyzed_at: string;
  created_at?: string;
}

export interface DbTranscript {
  id: string;
  call_id: string;
  conversation_id: string;
  speaker: 'agent' | 'customer';
  text: string;
  start_time: number;
  end_time?: number;
  confidence: number;
  created_at?: string;
}

class SupabaseService {
  // Çağrı kaydet veya güncelle
  async upsertCall(call: CallData): Promise<DbCall | null> {
    try {
      // Ensure dates are valid
      const startTime = call.startTime instanceof Date && !isNaN(call.startTime.getTime()) 
        ? call.startTime.toISOString() 
        : new Date().toISOString();
        
      const endTime = call.endTime instanceof Date && !isNaN(call.endTime.getTime())
        ? call.endTime.toISOString()
        : undefined;
      
      const dbCall: Partial<DbCall> = {
        id: call.id,
        conversation_id: call.conversationId,
        start_time: startTime,
        end_time: endTime,
        duration: call.duration,
        phone_number: call.phoneNumber,
        customer_name: call.customerName,
        status: call.status,
        agent_id: call.agentId,
        agent_name: call.agentName,
        agent_type: call.agentType || 'support',
        audio_url: call.audioUrl,
        parent_conversation_id: call.parentConversationId,
        handoff_reason: call.handoffReason,
        handoff_timestamp: call.handoffTimestamp instanceof Date && !isNaN(call.handoffTimestamp.getTime())
          ? call.handoffTimestamp.toISOString()
          : undefined,
        handoff_from_agent: call.handoffFromAgent,
        handoff_to_agent: call.handoffToAgent,
        is_part_of_handoff: call.isPartOfHandoff,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('calls')
        .upsert(dbCall)
        .select()
        .single();

      if (error) {
        console.error('Error upserting call:', error);
        return null;
      }

      // Transcript'leri de kaydet
      if (call.transcript?.segments.length) {
        await this.saveTranscripts(call.id, call.conversationId, call.transcript.segments);
      }

      return data;
    } catch (error) {
      console.error('Failed to upsert call:', error);
      return null;
    }
  }

  // Analiz kaydet
  async saveAnalytics(callId: string, conversationId: string, analytics: CallAnalytics): Promise<DbAnalytics | null> {
    try {
      // First check if analytics already exists for this call
      const { data: existing } = await supabase
        .from('analytics')
        .select('id')
        .eq('call_id', callId)
        .single();

      const dbAnalytics: Partial<DbAnalytics> = {
        id: existing?.id || analytics.id || `analytics_${callId}_${Date.now()}`,
        call_id: callId,
        conversation_id: conversationId,
        summary: analytics.summary,
        key_points: analytics.keyPoints,
        sentiment_overall: analytics.sentiment.overall,
        sentiment_score: analytics.sentiment.score,
        customer_satisfaction: analytics.customerSatisfaction,
        topics: analytics.topics,
        action_items: analytics.actionItems,
        agent_performance: analytics.agentPerformance,
        risk_factors: analytics.riskFactors,
        emotions: analytics.emotions,
        analyzed_at: new Date().toISOString()
      };

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('analytics')
        .upsert(dbAnalytics)
        .select()
        .single();

      if (error) {
        console.error('Error saving analytics:', error);
        // If it's a foreign key error, the call might not exist yet
        if (error.code === '23503') {
          console.error('Call does not exist yet, skipping analytics save for:', callId);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to save analytics:', error);
      return null;
    }
  }

  // Transcript'leri kaydet
  async saveTranscripts(callId: string, conversationId: string, segments: any[]): Promise<void> {
    try {
      const transcripts: Partial<DbTranscript>[] = segments.map(segment => ({
        id: `transcript_${callId}_${segment.id || Date.now()}_${Math.random()}`,
        call_id: callId,
        conversation_id: conversationId,
        speaker: segment.speaker,
        text: segment.text,
        start_time: segment.startTime,
        end_time: segment.endTime,
        confidence: segment.confidence || 1.0
      }));

      const { error } = await supabase
        .from('transcripts')
        .insert(transcripts);

      if (error) {
        console.error('Error saving transcripts:', error);
      }
    } catch (error) {
      console.error('Failed to save transcripts:', error);
    }
  }

  // Çağrıları getir
  async getCalls(limit: number = 50): Promise<CallData[]> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching calls:', error);
        return [];
      }

      return (data || []).map(this.mapDbCallToCallData);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
      return [];
    }
  }

  // Get analytics for multiple calls
  async getAnalyticsForCalls(callIds: string[]): Promise<Map<string, CallAnalytics>> {
    const analyticsMap = new Map<string, CallAnalytics>();
    
    if (callIds.length === 0) return analyticsMap;

    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .in('call_id', callIds);

      if (error) {
        console.error('Error fetching analytics:', error);
        return analyticsMap;
      }

      (data || []).forEach(dbAnalytics => {
        const analytics = this.mapDbAnalyticsToAnalytics(dbAnalytics);
        analyticsMap.set(dbAnalytics.call_id, analytics);
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }

    return analyticsMap;
  }

  // Tek çağrı getir (analiz ve transcript'lerle birlikte)
  async getCallWithDetails(callId: string): Promise<{ call: CallData; analytics?: CallAnalytics; transcripts?: any[] } | null> {
    try {
      // Çağrıyı getir
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

      if (callError || !callData) {
        console.error('Error fetching call:', callError);
        return null;
      }

      // Analizi getir
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('*')
        .eq('call_id', callId)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .single();

      // Transcript'leri getir
      const { data: transcriptsData } = await supabase
        .from('transcripts')
        .select('*')
        .eq('call_id', callId)
        .order('start_time', { ascending: true });

      const call = this.mapDbCallToCallData(callData);
      
      // Transcript'leri call'a ekle
      if (transcriptsData?.length) {
        call.transcript = {
          segments: transcriptsData.map(t => ({
            id: t.id,
            speaker: t.speaker,
            text: t.text,
            startTime: t.start_time,
            endTime: t.end_time,
            confidence: t.confidence
          })),
          fullText: transcriptsData.map(t => t.text).join(' '),
          confidence: 1.0
        };
      }

      return {
        call,
        analytics: analyticsData ? this.mapDbAnalyticsToAnalytics(analyticsData) : undefined,
        transcripts: transcriptsData || []
      };
    } catch (error) {
      console.error('Failed to fetch call details:', error);
      return null;
    }
  }

  // Database'den gelen veriyi CallData'ya çevir
  private mapDbCallToCallData(dbCall: DbCall): CallData {
    return {
      id: dbCall.id,
      conversationId: dbCall.conversation_id,
      startTime: new Date(dbCall.start_time),
      endTime: dbCall.end_time ? new Date(dbCall.end_time) : undefined,
      duration: dbCall.duration,
      phoneNumber: dbCall.phone_number,
      customerName: dbCall.customer_name,
      status: dbCall.status as any,
      agentId: dbCall.agent_id,
      agentName: dbCall.agent_name,
      agentType: dbCall.agent_type as any,
      audioUrl: dbCall.audio_url,
      parentConversationId: dbCall.parent_conversation_id,
      handoffReason: dbCall.handoff_reason,
      handoffTimestamp: dbCall.handoff_timestamp ? new Date(dbCall.handoff_timestamp) : undefined,
      handoffFromAgent: dbCall.handoff_from_agent,
      handoffToAgent: dbCall.handoff_to_agent,
      isPartOfHandoff: dbCall.is_part_of_handoff,
      transcript: {
        segments: [],
        fullText: '',
        confidence: 1.0
      }
    };
  }

  // Database'den gelen veriyi CallAnalytics'e çevir
  private mapDbAnalyticsToAnalytics(dbAnalytics: DbAnalytics): CallAnalytics {
    return {
      id: dbAnalytics.id,
      callId: dbAnalytics.call_id,
      summary: dbAnalytics.summary,
      keyPoints: dbAnalytics.key_points || [],
      sentiment: {
        overall: dbAnalytics.sentiment_overall as any,
        score: dbAnalytics.sentiment_score,
        timeline: [],
        breakdown: {
          positive: 0.3,
          negative: 0.1,
          neutral: 0.6
        }
      },
      emotions: dbAnalytics.emotions || [],
      topics: dbAnalytics.topics || [],
      actionItems: dbAnalytics.action_items || [],
      customerSatisfaction: dbAnalytics.customer_satisfaction,
      agentPerformance: dbAnalytics.agent_performance,
      riskFactors: dbAnalytics.risk_factors || []
    };
  }

  // Realtime subscription for new calls
  subscribeToNewCalls(callback: (call: CallData) => void) {
    return supabase
      .channel('calls-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'calls' 
        }, 
        (payload) => {
          const call = this.mapDbCallToCallData(payload.new as DbCall);
          callback(call);
        }
      )
      .subscribe();
  }

  // Realtime subscription for call updates
  subscribeToCallUpdates(callback: (call: CallData) => void) {
    return supabase
      .channel('calls-updates-channel')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'calls' 
        }, 
        (payload) => {
          const call = this.mapDbCallToCallData(payload.new as DbCall);
          callback(call);
        }
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();