import { useState } from 'react';
import { CallData, MultiAgentAnalytics } from '../types';
import { motion } from 'framer-motion';
import { Phone, Clock, Calendar, User, Headphones, FileText, BarChart3, Brain, AlertTriangle, Activity, Sparkles } from 'lucide-react';
import { formatDuration, formatDate, formatTime, cn } from '../lib/utils';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SentimentChart from './SentimentChart';
import EmotionRadar from './EmotionRadar';
import AudioPlayer from './AudioPlayer';
import PerformanceMetrics from './PerformanceMetrics';
import ActionItems from './ActionItems';
import RiskAssessment from './RiskAssessment';
import ComprehensiveMetrics from './ComprehensiveMetrics';
import CallJourney from './CallJourney';

interface CallDetailsProps {
  call: CallData;
}

export default function CallDetails({ call }: CallDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const analytics = call.analytics;

  if (!analytics) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-white/[0.03] backdrop-blur-xl flex items-center justify-center mx-auto border border-white/[0.06]">
            <Brain className="h-10 w-10 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">
            Bu çağrı için analiz mevcut değil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-black">
      {/* Premium Black Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] backdrop-blur-2xl border-b border-white/[0.06] px-8 py-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl flex items-center justify-center border border-white/[0.08] shadow-2xl shadow-black/50">
              <Phone className="h-6 w-6 text-white/80" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white/90">
                {call.customerName || call.phoneNumber}
              </h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/50">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(call.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(call.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <Headphones className="h-4 w-4" />
                  <span>{formatDuration(call.duration || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                "border-white/10 bg-white/[0.03] backdrop-blur-xl",
                call.status === 'active' ? 'text-green-400 border-green-400/20' : 'text-white/60'
              )}
            >
              {call.status === 'active' ? 'Devam Ediyor' : 'Tamamlandı'}
            </Badge>
            <Badge 
              variant="outline"
              className="border-white/10 bg-white/[0.03] backdrop-blur-xl text-white/60"
            >
              {call.agentName}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1">Memnuniyet</p>
                <p className="text-2xl font-semibold text-white/90">{analytics.customerSatisfaction.toFixed(1)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1">Duygu</p>
                <p className="text-2xl font-semibold text-white/90 capitalize">
                  {analytics.sentiment.overall === 'positive' ? 'Pozitif' : 
                   analytics.sentiment.overall === 'negative' ? 'Negatif' : 'Nötr'}
                </p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                analytics.sentiment.overall === 'positive' ? 'bg-gradient-to-br from-green-500/20 to-green-500/5' :
                analytics.sentiment.overall === 'negative' ? 'bg-gradient-to-br from-red-500/20 to-red-500/5' :
                'bg-gradient-to-br from-gray-500/20 to-gray-500/5'
              )}>
                <Activity className={cn(
                  "h-5 w-5",
                  analytics.sentiment.overall === 'positive' ? 'text-green-400' :
                  analytics.sentiment.overall === 'negative' ? 'text-red-400' :
                  'text-gray-400'
                )} />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1">Performans</p>
                <p className="text-2xl font-semibold text-white/90">{analytics.agentPerformance.overallScore}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-1">Risk</p>
                <p className="text-2xl font-semibold text-white/90">{analytics.riskFactors.length}</p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                analytics.riskFactors.length > 0 
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5' 
                  : 'bg-gradient-to-br from-gray-500/20 to-gray-500/5'
              )}>
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  analytics.riskFactors.length > 0 ? 'text-amber-400' : 'text-gray-400'
                )} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs with Black Theme */}
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-white/[0.02] backdrop-blur-xl p-1.5 rounded-xl border border-white/[0.06]">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/60 transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/60 transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analitik
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/60 transition-all duration-200"
            >
              <User className="h-4 w-4 mr-2" />
              Performans
            </TabsTrigger>
            <TabsTrigger 
              value="actions"
              className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/60 transition-all duration-200"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Aksiyonlar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Summary Card */}
              <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
                <h3 className="text-lg font-medium text-white/90 mb-4">
                  Çağrı Özeti
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {analytics.summary}
                </p>
                
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-white/80">Önemli Noktalar</h4>
                  <ul className="space-y-2">
                    {analytics.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-white/60">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/40 mt-1.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Topics Card */}
              <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
                <h3 className="text-lg font-medium text-white/90 mb-4">
                  Konular
                </h3>
                <div className="space-y-3">
                  {analytics.topics.map((topic, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/80">{topic.name}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs border-white/10 bg-white/[0.03]",
                            topic.sentiment === 'positive' ? 'text-green-400 border-green-400/20' :
                            topic.sentiment === 'negative' ? 'text-red-400 border-red-400/20' :
                            'text-white/60'
                          )}
                        >
                          {topic.sentiment === 'positive' ? 'Pozitif' :
                           topic.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                        </Badge>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-white/20 to-white/40 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${topic.relevance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Audio Player */}
            {call.audioUrl && (
              <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
                <h3 className="text-lg font-medium text-white/90 mb-4">
                  Ses Kaydı
                </h3>
                <AudioPlayer audioUrl={call.audioUrl} transcript={undefined} />
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
                <h3 className="text-lg font-medium text-white/90 mb-6">
                  Duygu Analizi
                </h3>
                <SentimentChart data={analytics.sentiment?.timeline} />
              </Card>

              {/* Emotion Radar */}
              {analytics.emotions && analytics.emotions.length > 0 ? (
                <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
                  <h3 className="text-lg font-medium text-white/90 mb-6">
                    Duygusal Yoğunluk
                  </h3>
                  <EmotionRadar emotions={analytics.emotions} />
                </Card>
              ) : (
                <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
                  <h3 className="text-lg font-medium text-white/90 mb-6">
                    Duygusal Yoğunluk
                  </h3>
                  <div className="text-center py-12">
                    <p className="text-white/40 text-sm">
                      Duygu verisi mevcut değil
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Sentiment Breakdown */}
            <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
              <h3 className="text-lg font-medium text-white/90 mb-6">
                Duygu Durumu Dağılımı
              </h3>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-white/[0.06]"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - analytics.sentiment.breakdown.positive)}`}
                        className="text-green-500 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-400">
                        {Math.round(analytics.sentiment.breakdown.positive * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 mt-3">Pozitif</p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-white/[0.06]"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - analytics.sentiment.breakdown.neutral)}`}
                        className="text-gray-400 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-400">
                        {Math.round(analytics.sentiment.breakdown.neutral * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 mt-3">Nötr</p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-white/[0.06]"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - analytics.sentiment.breakdown.negative)}`}
                        className="text-red-500 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-red-400">
                        {Math.round(analytics.sentiment.breakdown.negative * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 mt-3">Negatif</p>
                </div>
              </div>
            </Card>
          </TabsContent>


          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics performance={analytics.agentPerformance} />
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            {(analytics.actionItems.length > 0 || analytics.riskFactors.length > 0) ? (
              <div className="grid grid-cols-2 gap-6">
                {analytics.actionItems.length > 0 && (
                  <ActionItems items={analytics.actionItems} />
                )}
                {analytics.riskFactors.length > 0 && (
                  <RiskAssessment risks={analytics.riskFactors} />
                )}
              </div>
            ) : (
              <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-12">
                <div className="text-center">
                  <p className="text-white/40">No action items or risk factors identified</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Multi-Agent Tabs */}
          {call.callJourney && call.callJourney.length > 1 && (
            <>
              <TabsContent value="journey">
                <CallJourney journey={call.callJourney} />
              </TabsContent>
              
              <TabsContent value="comprehensive">
                <ComprehensiveMetrics analytics={analytics as MultiAgentAnalytics} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}