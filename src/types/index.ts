export interface CallData {
  id: string;
  conversationId: string;
  parentConversationId?: string; // For tracking handoffs
  startTime: Date;
  endTime?: Date;
  duration?: number;
  phoneNumber: string;
  customerName?: string;
  audioUrl?: string;
  transcript?: Transcript;
  analytics?: CallAnalytics;
  status: 'active' | 'completed' | 'failed' | 'transferred';
  agentId: string;
  agentName: string;
  agentType?: 'orchestrator' | 'specialist' | 'support' | 'sales' | 'technical';
  handoffReason?: string;
  handoffTimestamp?: Date;
  handoffFromAgent?: {
    id: string;
    name: string;
    type: string;
  };
  handoffToAgent?: {
    id: string;
    name: string;
    type: string;
  };
  isPartOfHandoff?: boolean;
  callJourney?: CallJourneyStep[];
  tags?: string[];
  handoffFromId?: string;
  handoffToId?: string;
}

export interface Transcript {
  segments: TranscriptSegment[];
  fullText: string;
  confidence: number;
}

export interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface CallAnalytics {
  id: string;
  callId: string;
  summary: string;
  keyPoints: string[];
  sentiment: SentimentAnalysis;
  emotions: EmotionData[];
  topics: Topic[];
  actionItems: ActionItem[];
  customerSatisfaction: number;
  agentPerformance: AgentPerformance;
  riskFactors: RiskFactor[];
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  score: number;
  timeline: SentimentPoint[];
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface SentimentPoint {
  time: number;
  score: number;
  label: 'positive' | 'negative' | 'neutral';
}

export interface EmotionData {
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral';
  intensity: number;
  timestamp: number;
  speaker: 'agent' | 'customer';
}

export interface Topic {
  name: string;
  relevance: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  mentions: number;
}

export interface ActionItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: Date;
}

export interface AgentPerformance {
  empathyScore: number;
  clarityScore: number;
  resolutionScore: number;
  professionalismScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

export interface RiskFactor {
  type: 'churn' | 'escalation' | 'compliance' | 'satisfaction';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface CallJourneyStep {
  agentId: string;
  agentName: string;
  agentType: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  handoffReason?: string;
  performance?: {
    score: number;
    highlights: string[];
    issues: string[];
  };
}

export interface ComprehensiveMetrics {
  // Communication Quality
  clarity: number;
  articulation: number;
  pacing: number;
  vocabulary: number;
  
  // Emotional Intelligence
  empathy: number;
  emotionalAwareness: number;
  adaptability: number;
  patience: number;
  
  // Problem Solving
  problemIdentification: number;
  solutionEffectiveness: number;
  creativity: number;
  criticalThinking: number;
  
  // Customer Experience
  responsiveness: number;
  helpfulness: number;
  friendliness: number;
  personalization: number;
  
  // Professional Skills
  productKnowledge: number;
  processAdherence: number;
  efficiency: number;
  accuracy: number;
  
  // Advanced Metrics
  deescalationSkill: number;
  upsellAttempts: number;
  firstCallResolution: number;
  callControl: number;
  activeListening: number;
  questioningTechnique: number;
  
  // Linguistic Analysis
  sentenceComplexity: number;
  grammarAccuracy: number;
  toneConsistency: number;
  culturalSensitivity: number;
  
  // Technical Performance
  systemUsage: number;
  multitasking: number;
  dataAccuracy: number;
  compliance: number;
}

export interface ConversationDynamics {
  interruptions: number;
  talkTimeRatio: { agent: number; customer: number };
  silenceDuration: number;
  overlappingTalk: number;
  turnTakingEfficiency: number;
  responseLatency: number[];
}

export interface MultiAgentAnalytics extends CallAnalytics {
  comprehensiveMetrics: ComprehensiveMetrics;
  conversationDynamics: ConversationDynamics;
  handoffAnalysis?: {
    smoothness: number;
    contextRetention: number;
    customerConfusion: number;
    reasonValidity: number;
    timing: 'optimal' | 'early' | 'late';
  };
  comparativePerformance?: {
    vsTeamAverage: number;
    vsPreviousCalls: number;
    improvement: number;
  };
  detailedInsights: {
    strengths: DetailedInsight[];
    improvements: DetailedInsight[];
    criticalMoments: CriticalMoment[];
  };
}

export interface DetailedInsight {
  category: string;
  observation: string;
  impact: 'high' | 'medium' | 'low';
  evidence: string[];
  recommendation: string;
}

export interface CriticalMoment {
  timestamp: number;
  type: 'positive' | 'negative' | 'turning_point';
  description: string;
  impact: string;
  agentResponse: string;
  alternativeApproach?: string;
}