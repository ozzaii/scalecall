
import { motion } from 'framer-motion';
import { ComprehensiveMetrics as Metrics, MultiAgentAnalytics } from '../types';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Brain, MessageSquare, Users, Star, Settings, Mic, Globe, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

interface ComprehensiveMetricsProps {
  analytics: MultiAgentAnalytics;
}

interface MetricGroup {
  title: string;
  icon: React.ReactNode;
  metrics: { key: keyof Metrics; label: string; value: number }[];
}

export default function ComprehensiveMetrics({ analytics }: ComprehensiveMetricsProps) {
  const { comprehensiveMetrics, conversationDynamics, handoffAnalysis, comparativePerformance } = analytics;

  const metricGroups: MetricGroup[] = [
    {
      title: 'İletişim Kalitesi',
      icon: <MessageSquare className="h-5 w-5" />,
      metrics: [
        { key: 'clarity', label: 'Netlik', value: comprehensiveMetrics.clarity },
        { key: 'articulation', label: 'Artikülasyon', value: comprehensiveMetrics.articulation },
        { key: 'pacing', label: 'Tempo', value: comprehensiveMetrics.pacing },
        { key: 'vocabulary', label: 'Kelime Hazinesi', value: comprehensiveMetrics.vocabulary }
      ]
    },
    {
      title: 'Duygusal Zeka',
      icon: <Brain className="h-5 w-5" />,
      metrics: [
        { key: 'empathy', label: 'Empati', value: comprehensiveMetrics.empathy },
        { key: 'emotionalAwareness', label: 'Duygusal Farkındalık', value: comprehensiveMetrics.emotionalAwareness },
        { key: 'adaptability', label: 'Uyum Yeteneği', value: comprehensiveMetrics.adaptability },
        { key: 'patience', label: 'Sabır', value: comprehensiveMetrics.patience }
      ]
    },
    {
      title: 'Problem Çözme',
      icon: <Settings className="h-5 w-5" />,
      metrics: [
        { key: 'problemIdentification', label: 'Problem Tespiti', value: comprehensiveMetrics.problemIdentification },
        { key: 'solutionEffectiveness', label: 'Çözüm Etkinliği', value: comprehensiveMetrics.solutionEffectiveness },
        { key: 'creativity', label: 'Yaratıcılık', value: comprehensiveMetrics.creativity },
        { key: 'criticalThinking', label: 'Eleştirel Düşünme', value: comprehensiveMetrics.criticalThinking }
      ]
    },
    {
      title: 'Müşteri Deneyimi',
      icon: <Users className="h-5 w-5" />,
      metrics: [
        { key: 'responsiveness', label: 'Yanıt Verme', value: comprehensiveMetrics.responsiveness },
        { key: 'helpfulness', label: 'Yardımseverlik', value: comprehensiveMetrics.helpfulness },
        { key: 'friendliness', label: 'Samimiyet', value: comprehensiveMetrics.friendliness },
        { key: 'personalization', label: 'Kişiselleştirme', value: comprehensiveMetrics.personalization }
      ]
    },
    {
      title: 'Profesyonel Beceriler',
      icon: <Star className="h-5 w-5" />,
      metrics: [
        { key: 'productKnowledge', label: 'Ürün Bilgisi', value: comprehensiveMetrics.productKnowledge },
        { key: 'processAdherence', label: 'Süreç Uyumu', value: comprehensiveMetrics.processAdherence },
        { key: 'efficiency', label: 'Verimlilik', value: comprehensiveMetrics.efficiency },
        { key: 'accuracy', label: 'Doğruluk', value: comprehensiveMetrics.accuracy }
      ]
    },
    {
      title: 'Gelişmiş Metrikler',
      icon: <Shield className="h-5 w-5" />,
      metrics: [
        { key: 'deescalationSkill', label: 'Gerilimi Azaltma', value: comprehensiveMetrics.deescalationSkill },
        { key: 'upsellAttempts', label: 'Satış Girişimleri', value: comprehensiveMetrics.upsellAttempts },
        { key: 'firstCallResolution', label: 'İlk Çağrı Çözümü', value: comprehensiveMetrics.firstCallResolution },
        { key: 'callControl', label: 'Çağrı Kontrolü', value: comprehensiveMetrics.callControl }
      ]
    },
    {
      title: 'Dil Analizi',
      icon: <Globe className="h-5 w-5" />,
      metrics: [
        { key: 'sentenceComplexity', label: 'Cümle Karmaşıklığı', value: comprehensiveMetrics.sentenceComplexity },
        { key: 'grammarAccuracy', label: 'Dilbilgisi Doğruluğu', value: comprehensiveMetrics.grammarAccuracy },
        { key: 'toneConsistency', label: 'Ton Tutarlılığı', value: comprehensiveMetrics.toneConsistency },
        { key: 'culturalSensitivity', label: 'Kültürel Duyarlılık', value: comprehensiveMetrics.culturalSensitivity }
      ]
    },
    {
      title: 'Teknik Performans',
      icon: <Mic className="h-5 w-5" />,
      metrics: [
        { key: 'systemUsage', label: 'Sistem Kullanımı', value: comprehensiveMetrics.systemUsage },
        { key: 'multitasking', label: 'Çoklu Görev', value: comprehensiveMetrics.multitasking },
        { key: 'dataAccuracy', label: 'Veri Doğruluğu', value: comprehensiveMetrics.dataAccuracy },
        { key: 'compliance', label: 'Uyumluluk', value: comprehensiveMetrics.compliance }
      ]
    }
  ];

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (value >= 75) return 'text-green-600 dark:text-green-400';
    if (value >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (value >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    if (value >= 75) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (value >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (value >= 40) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl glass glass-border">
          <TabsTrigger value="metrics">Detaylı Metrikler</TabsTrigger>
          <TabsTrigger value="dynamics">Konuşma Dinamikleri</TabsTrigger>
          <TabsTrigger value="handoff">Transfer Analizi</TabsTrigger>
          <TabsTrigger value="comparison">Karşılaştırma</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metricGroups.map((group, index) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass glass-border hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400">
                      {group.icon}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {group.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {group.metrics.map((metric) => (
                      <div key={metric.key} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {metric.label}
                          </span>
                          <span className={cn("text-sm font-medium", getMetricColor(metric.value))}>
                            {metric.value}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={metric.value} className="h-2" />
                          <motion.div
                            className={cn("absolute inset-0 h-2 rounded-full", getProgressColor(metric.value))}
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dynamics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 glass glass-border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Konuşma Dinamikleri
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kesintiler</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {conversationDynamics.interruptions} kez
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sessizlik Süresi</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {conversationDynamics.silenceDuration} saniye
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Üst Üste Konuşma</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {conversationDynamics.overlappingTalk} kez
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Konuşma Oranı</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Temsilci</span>
                      <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${conversationDynamics.talkTimeRatio.agent}%` }}
                        >
                          {conversationDynamics.talkTimeRatio.agent}%
                        </div>
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${conversationDynamics.talkTimeRatio.customer}%` }}
                        >
                          {conversationDynamics.talkTimeRatio.customer}%
                        </div>
                      </div>
                      <span className="text-sm">Müşteri</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sıra Alma Verimliliği</p>
                    <div className="flex items-center gap-2">
                      <Progress value={conversationDynamics.turnTakingEfficiency} className="flex-1" />
                      <span className="text-sm font-medium">{conversationDynamics.turnTakingEfficiency}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ortalama Yanıt Süresi</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(conversationDynamics.responseLatency.reduce((a, b) => a + b, 0) / conversationDynamics.responseLatency.length).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="handoff" className="space-y-6">
          {handoffAnalysis ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 glass glass-border">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                  Transfer Analizi
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Transfer Akıcılığı</p>
                      <div className="flex items-center gap-2">
                        <Progress value={handoffAnalysis.smoothness} className="flex-1" />
                        <span className={cn("text-sm font-medium", getMetricColor(handoffAnalysis.smoothness))}>
                          {handoffAnalysis.smoothness}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bağlam Korunması</p>
                      <div className="flex items-center gap-2">
                        <Progress value={handoffAnalysis.contextRetention} className="flex-1" />
                        <span className={cn("text-sm font-medium", getMetricColor(handoffAnalysis.contextRetention))}>
                          {handoffAnalysis.contextRetention}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Müşteri Karmaşası</p>
                      <div className="flex items-center gap-2">
                        <Progress value={handoffAnalysis.customerConfusion} className="flex-1" />
                        <span className={cn("text-sm font-medium", getMetricColor(100 - handoffAnalysis.customerConfusion))}>
                          {handoffAnalysis.customerConfusion}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Transfer Gerekliliği</p>
                      <div className="flex items-center gap-2">
                        <Progress value={handoffAnalysis.reasonValidity} className="flex-1" />
                        <span className={cn("text-sm font-medium", getMetricColor(handoffAnalysis.reasonValidity))}>
                          {handoffAnalysis.reasonValidity}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-lg px-4 py-2",
                        handoffAnalysis.timing === 'optimal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        handoffAnalysis.timing === 'early' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      )}
                    >
                      Transfer Zamanlaması: {
                        handoffAnalysis.timing === 'optimal' ? 'Optimal' :
                        handoffAnalysis.timing === 'early' ? 'Erken' : 'Geç'
                      }
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-12 glass glass-border">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Bu çağrı için transfer analizi bulunmuyor.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 glass glass-border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Karşılaştırmalı Performans
              </h3>
              
              {comparativePerformance ? (
                <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Takım Ortalamasına Göre</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400 dark:bg-gray-500" />
                      <motion.div
                        className={cn(
                          "absolute inset-y-0 rounded-lg",
                          comparativePerformance.vsTeamAverage >= 0 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                            : "bg-gradient-to-r from-red-500 to-orange-500"
                        )}
                        initial={{ 
                          left: comparativePerformance.vsTeamAverage >= 0 ? '50%' : `${50 + comparativePerformance.vsTeamAverage / 2}%`,
                          right: comparativePerformance.vsTeamAverage >= 0 ? `${50 - comparativePerformance.vsTeamAverage / 2}%` : '50%'
                        }}
                        animate={{ 
                          left: comparativePerformance.vsTeamAverage >= 0 ? '50%' : `${50 + comparativePerformance.vsTeamAverage / 2}%`,
                          right: comparativePerformance.vsTeamAverage >= 0 ? `${50 - comparativePerformance.vsTeamAverage / 2}%` : '50%'
                        }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className={cn(
                      "text-lg font-semibold min-w-[60px] text-right",
                      comparativePerformance.vsTeamAverage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {comparativePerformance.vsTeamAverage > 0 ? '+' : ''}{comparativePerformance.vsTeamAverage}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Önceki Çağrılara Göre</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400 dark:bg-gray-500" />
                      <motion.div
                        className={cn(
                          "absolute inset-y-0 rounded-lg",
                          comparativePerformance.vsPreviousCalls >= 0 
                            ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                        )}
                        initial={{ 
                          left: comparativePerformance.vsPreviousCalls >= 0 ? '50%' : `${50 + comparativePerformance.vsPreviousCalls / 2}%`,
                          right: comparativePerformance.vsPreviousCalls >= 0 ? `${50 - comparativePerformance.vsPreviousCalls / 2}%` : '50%'
                        }}
                        animate={{ 
                          left: comparativePerformance.vsPreviousCalls >= 0 ? '50%' : `${50 + comparativePerformance.vsPreviousCalls / 2}%`,
                          right: comparativePerformance.vsPreviousCalls >= 0 ? `${50 - comparativePerformance.vsPreviousCalls / 2}%` : '50%'
                        }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className={cn(
                      "text-lg font-semibold min-w-[60px] text-right",
                      comparativePerformance.vsPreviousCalls >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {comparativePerformance.vsPreviousCalls > 0 ? '+' : ''}{comparativePerformance.vsPreviousCalls}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Genel Gelişim</p>
                  <div className="flex items-center gap-4">
                    <Progress value={comparativePerformance.improvement} className="flex-1 h-12" />
                    <span className={cn(
                      "text-lg font-semibold min-w-[60px] text-right",
                      getMetricColor(comparativePerformance.improvement)
                    )}>
                      {comparativePerformance.improvement}%
                    </span>
                  </div>
                </div>
              </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Karşılaştırma verisi mevcut değil
                </p>
              )}
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}