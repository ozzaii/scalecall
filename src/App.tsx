import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
import { CallData, CallAnalytics } from './types';
import { elevenLabsService } from './services/elevenLabs';
import { geminiService } from './services/gemini';
import { healthCheckService } from './services/healthCheck';
import { storageService } from './services/storage';
import { supabaseService } from './services/supabase';
import { Toaster } from './components/ui/toaster';
import { toast } from './components/ui/use-toast';

function App() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [isLiveCall, setIsLiveCall] = useState(false);
  // const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load calls from Supabase first, then sync with ElevenLabs
    const loadCalls = async () => {
      try {
        // STEP 1: Try to load from Supabase first
        console.log('Loading calls from Supabase...');
        const supabaseCalls = await supabaseService.getCalls(50);
        let callsWithAnalytics: CallData[] = [];
        
        if (supabaseCalls.length > 0) {
          console.log(`Found ${supabaseCalls.length} calls in Supabase`);
          
          
          // Load analytics separately with better error handling
          const callIds = supabaseCalls.map(c => c.id);
          const analyticsMap = await supabaseService.getAnalyticsForCalls(callIds);
          console.log(`Loaded analytics for ${analyticsMap.size} calls`);
          
          // Merge calls with their analytics
          callsWithAnalytics = supabaseCalls.map(call => {
            return {
              ...call,
              analytics: analyticsMap.get(call.id) // Don't add default analysis here
            };
          });
          
          setCalls(callsWithAnalytics);
          toast({
            title: "Database Loaded",
            description: `${callsWithAnalytics.length} calls loaded from database`,
          });
        }
        
        // STEP 2: Sync with ElevenLabs for new calls
        console.log('Syncing with ElevenLabs...');
        const elevenLabsCalls = await elevenLabsService.getConversationHistory(30);
        console.log(`ElevenLabs returned ${elevenLabsCalls.length} calls`);
        
        // Find new calls not in database
        const existingCallIds = new Set(supabaseCalls.map(c => c.id));
        const newCalls = elevenLabsCalls.filter(call => !existingCallIds.has(call.id));
        
        if (newCalls.length > 0) {
          console.log(`Found ${newCalls.length} new calls to save`);
          
          // Save new calls to database
          for (const call of newCalls) {
            await supabaseService.upsertCall(call);
          }
          
          // Update UI with all calls (merge new calls with existing)
          // Deduplicate calls by ID
          const callMap = new Map<string, CallData>();
          callsWithAnalytics.forEach(call => callMap.set(call.id, call));
          newCalls.forEach(call => callMap.set(call.id, call));
          const allCalls = Array.from(callMap.values());
          setCalls(allCalls);
          
          // Only analyze the LATEST completed call without analytics
          const completedCallsWithoutAnalytics = newCalls
            .filter(call => !call.analytics && call.duration && call.duration > 0 && call.status === 'completed')
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
          
          if (completedCallsWithoutAnalytics.length > 0) {
            // Only analyze the most recent one
            const latestCall = completedCallsWithoutAnalytics[0];
            console.log(`Analyzing latest completed call: ${latestCall.id}`);
            await processCallsWithoutAnalytics([latestCall]);
          }
        }
      } catch (error) {
        console.error('Failed to load calls:', error);
        // Fallback to localStorage
        const savedCalls = storageService.loadCalls();
        if (savedCalls.length > 0) {
          setCalls(savedCalls);
        }
      }
    };
    
    // Process calls that don't have analytics - with rate limiting
    const processCallsWithoutAnalytics = async (calls: CallData[]) => {
      const forceRegenerate = localStorage.getItem('forceRegenerate') === 'true';
      
      const callsToAnalyze = calls.filter(call => {
        // Skip if no duration
        if (!call.duration || call.duration <= 0) return false;
        
        // Skip if already has complete analytics
        if (call.analytics && 
            call.analytics.sentiment?.timeline && 
            call.analytics.sentiment.timeline.length > 0 &&
            call.analytics.emotions && 
            call.analytics.emotions.length > 0) {
          console.log(`Skipping call ${call.id} - already has complete analytics`);
          return false;
        }
        
        if (forceRegenerate) {
          // Force regenerate if missing timeline or emotions
          return call.duration && call.duration > 0 && (
            !call.analytics ||
            !call.analytics.sentiment?.timeline || 
            call.analytics.sentiment.timeline.length === 0 ||
            !call.analytics.emotions ||
            call.analytics.emotions.length === 0
          );
        }
        // Normal: only analyze calls without any analytics
        return !call.analytics;
      });
      
      console.log(`Found ${callsToAnalyze.length} calls to analyze`);
      
      // ONLY analyze the single most recent call
      const limitedCalls = callsToAnalyze.slice(0, 1);
      
      if (limitedCalls.length < callsToAnalyze.length) {
        console.warn(`Rate limiting: Only analyzing ${limitedCalls.length} of ${callsToAnalyze.length} calls`);
        toast({
          title: "Rate Limiting Applied",
          description: `Only analyzing ${limitedCalls.length} calls to avoid API limits. Others will be analyzed later.`,
        });
      }
      
      for (const call of limitedCalls) {
        try {
          // Try Gemini first, fallback to default analysis
          let analysis;
          try {
            analysis = await geminiService.analyzeCall(call);
            console.log(`Analyzed call ${call.id} with Gemini`);
          } catch (geminiError) {
            console.warn(`Gemini failed for ${call.id}, using default analysis:`, geminiError);
            analysis = geminiService.getDefaultAnalysis(call);
          }
          
          // IMPORTANT: Save analytics to Supabase
          const saved = await supabaseService.saveAnalytics(call.id, call.conversationId, analysis);
          if (saved) {
            console.log(`Saved analytics for call ${call.id} to database`);
          }
          
          // Update local state
          setCalls(prev => prev.map(c => 
            c.id === call.id ? { ...c, analytics: analysis } : c
          ));
          
          // Delay to avoid rate limiting (10 seconds between calls)
          await new Promise(resolve => setTimeout(resolve, 10000));
        } catch (error) {
          console.error(`Failed to analyze call ${call.id}:`, error);
        }
      }
      
      if (callsToAnalyze.length > 0) {
        toast({
          title: "Analiz Tamamlandı",
          description: `${callsToAnalyze.length} adet çağrı analiz edildi`,
        });
      }
      
      // Clear the flag after processing
      if (forceRegenerate) {
        localStorage.removeItem('forceRegenerate');
      }
    };
    
    loadCalls();

    // Start health checks
    healthCheckService.startAutoCheck();

    // Initialize with embedded keys
    elevenLabsService.initialize();
    
    // Set up real-time listeners
    elevenLabsService.onCallStarted((call) => {
      setActiveCall(call);
      setIsLiveCall(true);
      setCalls(prev => {
        const updated = [call, ...prev];
        storageService.saveCalls(updated); // Auto-save
        return updated;
      });
      toast({
        title: "Yeni Çağrı Başladı",
        description: `${call.customerName || 'Müşteri'} ile görüşme başladı`,
      });
    });

    elevenLabsService.onCallEnded(async (call) => {
      setIsLiveCall(false);
      
      // Don't analyze yet if this is part of a handoff chain
      if (!call.isPartOfHandoff) {
        setIsLoading(true);
        try {
          // First save/update the call to ensure it exists in database
          await supabaseService.upsertCall(call);
          
          // Get audio analysis from Gemini
          let analysis: CallAnalytics | undefined;
          if (call.audioUrl) {
            analysis = await geminiService.analyzeCallAudio(call.audioUrl);
            // setAnalytics(analysis);
          }
          
          // Save analytics to Supabase if we have analysis
          if (analysis) {
            const savedAnalytics = await supabaseService.saveAnalytics(call.id, call.conversationId, analysis);
            if (savedAnalytics) {
              console.log('Analytics saved successfully for call:', call.id);
            }
            
            // Update call with analysis
            setCalls(prev => {
              const updated = prev.map(c => 
                c.id === call.id ? { ...c, analytics: analysis } : c
              );
              storageService.saveCalls(updated); // Auto-save
              return updated;
            });
          }
        } catch (error) {
          console.error('Failed to analyze call:', error);
          toast({
            title: "Analiz Hatası",
            description: "Çağrı analizi yapılamadı",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });

    elevenLabsService.onTranscriptUpdate((conversationId, segment) => {
      // Update transcript by adding the new segment
      setCalls(prev => prev.map(call => {
        if (call.conversationId === conversationId && call.transcript) {
          const updatedTranscript = {
            ...call.transcript,
            segments: [...call.transcript.segments, segment],
            fullText: [...call.transcript.segments, segment]
              .map(s => `${s.speaker}: ${s.text}`)
              .join('\n')
          };
          return { ...call, transcript: updatedTranscript };
        }
        return call;
      }));
      
      if (activeCall?.conversationId === conversationId) {
        setActiveCall(prev => {
          if (prev && prev.transcript) {
            const updatedTranscript = {
              ...prev.transcript,
              segments: [...prev.transcript.segments, segment],
              fullText: [...prev.transcript.segments, segment]
                .map(s => `${s.speaker}: ${s.text}`)
                .join('\n')
            };
            return { ...prev, transcript: updatedTranscript };
          }
          return prev;
        });
      }
    });

    // Note: Agent transfer handling can be added here when supported

    // Note: Conversation merging and audio chunk handling can be added here when supported by the service

    // Subscribe to real-time updates from Supabase
    const unsubscribeNewCalls = supabaseService.subscribeToNewCalls((call) => {
      setCalls(prev => {
        // Check if call already exists
        if (prev.some(c => c.id === call.id)) return prev;
        return [call, ...prev];
      });
    });
    
    const unsubscribeCallUpdates = supabaseService.subscribeToCallUpdates((call) => {
      setCalls(prev => prev.map(c => 
        c.id === call.id ? call : c
      ));
      
      if (activeCall?.id === call.id) {
        setActiveCall(call);
      }
    });

    return () => {
      elevenLabsService.disconnect();
      unsubscribeNewCalls?.unsubscribe();
      unsubscribeCallUpdates?.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative flex h-screen bg-black">
        {/* Premium dark background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black" />
        </div>
        
        <Sidebar 
          calls={calls}
          activeCall={activeCall}
          onCallSelect={setActiveCall}
        />
        
        <main className="flex-1 overflow-auto">
          <Dashboard
            activeCall={activeCall}
            isLiveCall={isLiveCall}
            isLoading={isLoading}
            calls={calls}
            onCallUpdate={(updatedCall) => {
              setCalls(prev => prev.map(c => 
                c.id === updatedCall.id ? updatedCall : c
              ));
              if (activeCall?.id === updatedCall.id) {
                setActiveCall(updatedCall);
              }
            }}
          />
        </main>
        
        <ConnectionStatus />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;