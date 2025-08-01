import { CallData, MultiAgentAnalytics, CallJourneyStep, TranscriptSegment } from '../types';

export class MockDataService {
  private mockCalls: CallData[] = [];
  private activeCall: CallData | null = null;
  private callbacks = {
    onCallStarted: [] as Array<(call: CallData) => void>,
    onCallEnded: [] as Array<(call: CallData) => void>,
    onTranscriptUpdate: [] as Array<(callId: string, transcript: any) => void>,
    onAgentTransfer: [] as Array<(fromCall: CallData, toCall: CallData, reason: string) => void>,
    onConversationMerged: [] as Array<(mergedCall: CallData) => void>,
  };

  initialize() {
    // Generate some historical calls
    this.generateMockCalls();
    
    // Start a live demo call after 2 seconds
    setTimeout(() => this.startMockLiveCall(), 2000);
  }

  private generateMockCalls() {
    const names = ['Ahmet Yılmaz', 'Ayşe Kaya', 'Mehmet Demir', 'Fatma Çelik', 'Ali Özkan'];
    const issues = ['Kargo gecikmesi', 'Ürün iadesi', 'Fatura sorunu', 'Teknik destek', 'Hesap güncelleme'];
    
    for (let i = 0; i < 5; i++) {
      const isMultiAgent = Math.random() > 0.5;
      const startTime = new Date(Date.now() - (i + 1) * 3600000);
      const duration = 180 + Math.floor(Math.random() * 420);
      
      const call: CallData = {
        id: `call-${i + 1}`,
        conversationId: `conv-${i + 1}`,
        startTime,
        endTime: new Date(startTime.getTime() + duration * 1000),
        duration,
        phoneNumber: `+90 5${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        customerName: names[i % names.length],
        status: 'completed',
        agentId: isMultiAgent ? 'multi-agent' : `agent-${i + 1}`,
        agentName: isMultiAgent ? 'Multi-Agent Conversation' : 'Destek Temsilcisi',
        agentType: isMultiAgent ? 'orchestrator' : 'support',
        callJourney: isMultiAgent ? this.generateMockJourney() : undefined,
        transcript: this.generateMockTranscript(duration),
        analytics: this.generateMockAnalytics(issues[i % issues.length], isMultiAgent)
      };
      
      this.mockCalls.push(call);
    }
  }

  private generateMockJourney(): CallJourneyStep[] {
    return [
      {
        agentId: 'agent-orchestrator',
        agentName: 'Yönlendirme Asistanı',
        agentType: 'orchestrator',
        startTime: new Date(Date.now() - 600000),
        endTime: new Date(Date.now() - 480000),
        duration: 120,
        handoffReason: 'Müşteri teknik destek talep etti',
        performance: {
          score: 92,
          highlights: ['Hızlı problem tespiti', 'Doğru yönlendirme'],
          issues: []
        }
      },
      {
        agentId: 'agent-technical',
        agentName: 'Teknik Destek Uzmanı',
        agentType: 'technical',
        startTime: new Date(Date.now() - 480000),
        endTime: new Date(Date.now() - 300000),
        duration: 180,
        handoffReason: 'İleri seviye teknik müdahale gerekiyor',
        performance: {
          score: 88,
          highlights: ['Detaylı açıklama', 'Sabırlı yaklaşım'],
          issues: ['Çözüm süresi uzun']
        }
      },
      {
        agentId: 'agent-senior',
        agentName: 'Kıdemli Teknik Uzman',
        agentType: 'specialist',
        startTime: new Date(Date.now() - 300000),
        endTime: new Date(Date.now() - 60000),
        duration: 240,
        performance: {
          score: 95,
          highlights: ['Sorunu tamamen çözdü', 'Müşteri çok memnun'],
          issues: []
        }
      }
    ];
  }

  private generateMockTranscript(duration: number): any {
    const segments: TranscriptSegment[] = [];
    const speakers = ['agent', 'customer'] as const;
    const agentPhrases = [
      'Merhaba, size nasıl yardımcı olabilirim?',
      'Anlıyorum, hemen kontrol ediyorum.',
      'Bu konuda size yardımcı olabilirim.',
      'Sisteme bakıyorum, lütfen bekleyin.',
      'Sorununuzu çözdüm, başka bir şey var mı?'
    ];
    const customerPhrases = [
      'Merhaba, bir sorunum var.',
      'Siparişim hala gelmedi.',
      'Bu konuda yardıma ihtiyacım var.',
      'Ne kadar sürer acaba?',
      'Teşekkür ederim, çok yardımcı oldunuz.'
    ];
    
    let currentTime = 0;
    for (let i = 0; i < Math.min(duration / 15, 20); i++) {
      const speaker = speakers[i % 2];
      const phrases = speaker === 'agent' ? agentPhrases : customerPhrases;
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      
      segments.push({
        id: `seg-${i}`,
        speaker,
        text,
        startTime: currentTime,
        endTime: currentTime + 10,
        confidence: 0.95 + Math.random() * 0.05,
        sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative'
      });
      
      currentTime += 15;
    }
    
    return {
      segments,
      fullText: segments.map(s => s.text).join(' '),
      confidence: 0.97
    };
  }

  private generateMockAnalytics(issue: string, isMultiAgent: boolean): MultiAgentAnalytics {
    const baseScore = 70 + Math.floor(Math.random() * 25);
    
    return {
      id: `analytics-${Date.now()}`,
      callId: `call-${Date.now()}`,
      summary: `Müşteri ${issue} konusunda yardım talep etti. ${isMultiAgent ? 'Birden fazla temsilci ile' : 'Temsilci tarafından'} sorun başarıyla çözüldü.`,
      keyPoints: [
        `${issue} hakkında şikayet`,
        'Müşteri memnuniyetsizliğini ifade etti',
        'Temsilci anlayışlı ve çözüm odaklı yaklaştı',
        'Sorun kısa sürede çözüldü',
        'Müşteri memnun ayrıldı'
      ],
      sentiment: {
        overall: baseScore > 80 ? 'positive' : baseScore > 60 ? 'neutral' : 'negative',
        score: (baseScore - 50) / 50,
        timeline: this.generateMockSentimentTimeline(),
        breakdown: {
          positive: baseScore > 80 ? 60 : 30,
          neutral: 30,
          negative: baseScore > 80 ? 10 : 40
        }
      },
      emotions: this.generateMockEmotions(),
      topics: [
        { name: issue, relevance: 0.9, sentiment: 'negative', mentions: 5 },
        { name: 'Müşteri Hizmetleri', relevance: 0.8, sentiment: 'positive', mentions: 3 },
        { name: 'Çözüm', relevance: 0.7, sentiment: 'positive', mentions: 4 },
        { name: 'Memnuniyet', relevance: 0.6, sentiment: 'positive', mentions: 2 }
      ],
      actionItems: [
        {
          id: 'action-1',
          description: `${issue} takibi yapılacak`,
          priority: 'high',
          assignee: 'Operasyon Ekibi'
        },
        {
          id: 'action-2',
          description: 'Müşteriye geri dönüş yapılacak',
          priority: 'medium',
          assignee: 'Müşteri İlişkileri'
        }
      ],
      customerSatisfaction: baseScore,
      agentPerformance: {
        empathyScore: 80 + Math.floor(Math.random() * 15),
        clarityScore: 85 + Math.floor(Math.random() * 10),
        resolutionScore: baseScore,
        professionalismScore: 90 + Math.floor(Math.random() * 8),
        overallScore: baseScore + 5,
        strengths: ['Sabırlı yaklaşım', 'Net iletişim', 'Hızlı çözüm'],
        improvements: ['Daha proaktif olabilir', 'Alternatif çözümler sunabilir']
      },
      riskFactors: [
        {
          type: baseScore < 70 ? 'churn' : 'satisfaction',
          severity: baseScore < 70 ? 'high' : 'low',
          description: baseScore < 70 ? 'Müşteri kaybı riski' : 'Müşteri memnun',
          recommendation: baseScore < 70 ? 'Özel indirim teklifi' : 'Mevcut hizmeti sürdür'
        }
      ],
      comprehensiveMetrics: this.generateComprehensiveMetrics(baseScore),
      conversationDynamics: {
        interruptions: 2 + Math.floor(Math.random() * 4),
        talkTimeRatio: { agent: 45, customer: 55 },
        silenceDuration: 5 + Math.floor(Math.random() * 10),
        overlappingTalk: Math.floor(Math.random() * 3),
        turnTakingEfficiency: 80 + Math.floor(Math.random() * 15),
        responseLatency: [0.8, 1.2, 0.9, 1.1, 0.7]
      },
      handoffAnalysis: isMultiAgent ? {
        smoothness: 85 + Math.floor(Math.random() * 10),
        contextRetention: 90 + Math.floor(Math.random() * 8),
        customerConfusion: 10 + Math.floor(Math.random() * 15),
        reasonValidity: 92 + Math.floor(Math.random() * 6),
        timing: 'optimal'
      } : undefined,
      comparativePerformance: {
        vsTeamAverage: -5 + Math.floor(Math.random() * 20),
        vsPreviousCalls: Math.floor(Math.random() * 15),
        improvement: 70 + Math.floor(Math.random() * 20)
      },
      detailedInsights: {
        strengths: [
          {
            category: 'İletişim',
            observation: 'Temsilci net ve anlaşılır konuştu',
            impact: 'high',
            evidence: ['Müşteri tekrar sormadı', 'Açık talimatlar verildi'],
            recommendation: 'Bu yaklaşımı sürdür'
          },
          {
            category: 'Problem Çözme',
            observation: 'Sorun hızla tespit edildi',
            impact: 'high',
            evidence: ['İlk 2 dakikada tanı', 'Doğru çözüm önerisi'],
            recommendation: 'Eğitim materyali olarak kullan'
          }
        ],
        improvements: [
          {
            category: 'Verimlilik',
            observation: 'Çağrı süresi ortalamanın üzerinde',
            impact: 'medium',
            evidence: ['540 saniye sürdü', 'Ortalama 420 saniye'],
            recommendation: 'Süreç optimizasyonu yapılabilir'
          }
        ],
        criticalMoments: [
          {
            timestamp: 120,
            type: 'positive',
            description: 'Müşteri öfkesini yatıştırdı',
            impact: 'Eskalasyon önlendi',
            agentResponse: 'Empati gösterdi ve çözüm sundu'
          }
        ]
      }
    };
  }

  private generateMockSentimentTimeline(): any[] {
    const points = [];
    for (let i = 0; i <= 100; i += 5) {
      const score = Math.sin(i * 0.1) * 0.3 + 0.2 + (Math.random() - 0.5) * 0.3;
      points.push({
        time: i,
        score: Math.max(-1, Math.min(1, score)),
        label: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral'
      });
    }
    return points;
  }

  private generateMockEmotions(): any[] {
    const emotions = ['happy', 'neutral', 'angry', 'surprised', 'sad'];
    return Array.from({ length: 15 }, (_, i) => ({
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      intensity: 0.5 + Math.random() * 0.5,
      timestamp: i * 20,
      speaker: Math.random() > 0.5 ? 'agent' : 'customer'
    }));
  }

  private generateComprehensiveMetrics(baseScore: number): any {
    const variance = () => baseScore + Math.floor(Math.random() * 20) - 10;
    
    return {
      clarity: variance(),
      articulation: variance(),
      pacing: variance(),
      vocabulary: variance(),
      empathy: variance(),
      emotionalAwareness: variance(),
      adaptability: variance(),
      patience: variance(),
      problemIdentification: variance(),
      solutionEffectiveness: variance(),
      creativity: variance(),
      criticalThinking: variance(),
      responsiveness: variance(),
      helpfulness: variance(),
      friendliness: variance(),
      personalization: variance(),
      productKnowledge: variance(),
      processAdherence: variance(),
      efficiency: variance(),
      accuracy: variance(),
      deescalationSkill: variance(),
      upsellAttempts: variance(),
      firstCallResolution: variance(),
      callControl: variance(),
      activeListening: variance(),
      questioningTechnique: variance(),
      sentenceComplexity: variance(),
      grammarAccuracy: variance(),
      toneConsistency: variance(),
      culturalSensitivity: variance(),
      systemUsage: variance(),
      multitasking: variance(),
      dataAccuracy: variance(),
      compliance: variance()
    };
  }

  private startMockLiveCall() {
    const call: CallData = {
      id: 'live-call-1',
      conversationId: 'live-conv-1',
      startTime: new Date(),
      phoneNumber: '+90 555 123 4567',
      customerName: 'Zeynep Yıldırım',
      status: 'active',
      agentId: 'agent-live',
      agentName: 'Canlı Destek Asistanı',
      agentType: 'orchestrator',
      transcript: {
        segments: [],
        fullText: '',
        confidence: 1.0
      }
    };
    
    this.activeCall = call;
    this.callbacks.onCallStarted.forEach(cb => cb(call));
    
    // Simulate transcript updates
    let segmentCount = 0;
    const transcriptInterval = setInterval(() => {
      if (segmentCount < 10) {
        const segment: TranscriptSegment = {
          id: `live-seg-${segmentCount}`,
          speaker: segmentCount % 2 === 0 ? 'agent' : 'customer',
          text: segmentCount === 0 ? 'Merhaba, ben Zeynep. Kargo takibi yapmak istiyorum.' :
                segmentCount === 1 ? 'Tabii, size yardımcı olabilirim. Sipariş numaranız nedir?' :
                'Konuşma devam ediyor...',
          startTime: segmentCount * 10,
          endTime: (segmentCount + 1) * 10,
          confidence: 0.98,
          sentiment: 'neutral'
        };
        
        if (this.activeCall) {
          this.activeCall.transcript!.segments.push(segment);
          this.activeCall.transcript!.fullText += segment.text + ' ';
          
          this.callbacks.onTranscriptUpdate.forEach(cb => 
            cb(this.activeCall!.id, this.activeCall!.transcript!)
          );
        }
        
        segmentCount++;
      } else {
        clearInterval(transcriptInterval);
        
        // Simulate agent transfer
        setTimeout(() => {
          if (this.activeCall) {
            const toCall: CallData = {
              id: 'live-call-2',
              conversationId: 'live-conv-2',
              parentConversationId: 'live-conv-1',
              startTime: new Date(),
              phoneNumber: this.activeCall.phoneNumber,
              customerName: this.activeCall.customerName,
              status: 'active',
              agentId: 'agent-specialist',
              agentName: 'Kargo Takip Uzmanı',
              agentType: 'specialist',
              handoffReason: 'Detaylı kargo sorgusu için uzman desteği',
              transcript: {
                segments: [],
                fullText: '',
                confidence: 1.0
              }
            };
            
            this.callbacks.onAgentTransfer.forEach(cb => 
              cb(this.activeCall!, toCall, toCall.handoffReason!)
            );
            
            // End the call after some time
            setTimeout(() => {
              toCall.status = 'completed';
              toCall.endTime = new Date();
              toCall.duration = 300;
              toCall.analytics = this.generateMockAnalytics('Kargo takibi', true);
              
              const mergedCall = {
                ...toCall,
                id: 'merged-live',
                agentName: 'Multi-Agent Conversation',
                callJourney: this.generateMockJourney()
              };
              
              this.callbacks.onConversationMerged.forEach(cb => cb(mergedCall));
              this.activeCall = null;
            }, 5000);
          }
        }, 3000);
      }
    }, 2000);
  }

  getHistoricalCalls(): CallData[] {
    return this.mockCalls;
  }

  // Event listeners
  onCallStarted(callback: (call: CallData) => void) {
    this.callbacks.onCallStarted.push(callback);
  }

  onCallEnded(callback: (call: CallData) => void) {
    this.callbacks.onCallEnded.push(callback);
  }

  onTranscriptUpdate(callback: (callId: string, transcript: any) => void) {
    this.callbacks.onTranscriptUpdate.push(callback);
  }

  onAgentTransfer(callback: (fromCall: CallData, toCall: CallData, reason: string) => void) {
    this.callbacks.onAgentTransfer.push(callback);
  }

  onConversationMerged(callback: (mergedCall: CallData) => void) {
    this.callbacks.onConversationMerged.push(callback);
  }
}

export const mockDataService = new MockDataService();