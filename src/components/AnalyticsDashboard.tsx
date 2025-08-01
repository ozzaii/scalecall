import React from 'react';
import { CallData } from '../types';
import { Card } from './ui/card';
import { Phone, Clock, TrendingUp, Users, BarChart3, Activity, Award, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDuration, cn } from '../lib/utils';

interface AnalyticsDashboardProps {
  calls: CallData[];
}

export default function AnalyticsDashboard({ calls }: AnalyticsDashboardProps) {
  // Calculate metrics
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed').length;
  const activeCalls = calls.filter(c => c.status === 'active').length;
  
  const callsWithDuration = calls.filter(c => c.duration);
  const avgDuration = callsWithDuration.length > 0
    ? callsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / callsWithDuration.length
    : 0;
  
  const avgSatisfaction = calls
    .filter(c => c.analytics?.customerSatisfaction !== undefined)
    .reduce((sum, c) => sum + (c.analytics?.customerSatisfaction || 0), 0) / 
    calls.filter(c => c.analytics?.customerSatisfaction !== undefined).length || 0;
  
  const sentimentCounts = calls.reduce((acc, call) => {
    const sentiment = call.analytics?.sentiment.overall;
    if (sentiment) {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get top performing agents
  const agentStats = calls.reduce((acc, call) => {
    if (!call.analytics) return acc;
    
    if (!acc[call.agentName]) {
      acc[call.agentName] = {
        name: call.agentName,
        calls: 0,
        totalScore: 0,
        avgScore: 0
      };
    }
    
    acc[call.agentName].calls++;
    acc[call.agentName].totalScore += call.analytics.agentPerformance?.overallScore || 0;
    acc[call.agentName].avgScore = acc[call.agentName].totalScore / acc[call.agentName].calls;
    
    return acc;
  }, {} as Record<string, { name: string; calls: number; totalScore: number; avgScore: number }>);

  const topAgents = Object.values(agentStats)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  return (
    <div className="p-8 space-y-6 bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white/90 mb-2">
              Analitik Gösterge Paneli
            </h1>
            <p className="text-white/50">
              Çağrı merkezi performansınızın genel görünümü
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50 mb-1">
                  Toplam Çağrı
                </p>
                <p className="text-3xl font-semibold text-white/90">
                  {totalCalls}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-white/40">{activeCalls} aktif</span>
                  </div>
                  <span className="text-white/20">•</span>
                  <span className="text-xs text-white/40">{completedCalls} tamamlandı</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl flex items-center justify-center border border-white/[0.08]">
                <Phone className="h-5 w-5 text-white/60" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50 mb-1">
                  Ortalama Süre
                </p>
                <p className="text-3xl font-semibold text-white/90">
                  {formatDuration(Math.floor(avgDuration))}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-white/20 to-white/40 rounded-full"
                        style={{ width: `${Math.min((avgDuration / 300) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40">5 dk</span>
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl flex items-center justify-center border border-white/[0.08]">
                <Clock className="h-5 w-5 text-white/60" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50 mb-1">
                  Müşteri Memnuniyeti
                </p>
                <p className="text-3xl font-semibold text-white/90">
                  {avgSatisfaction.toFixed(1)}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 w-6 rounded-full transition-all duration-300",
                          i < Math.round(avgSatisfaction) 
                            ? "bg-gradient-to-r from-green-400/60 to-green-400/80" 
                            : "bg-white/[0.06]"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl flex items-center justify-center border border-white/[0.08]">
                <TrendingUp className="h-5 w-5 text-white/60" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-white/50 mb-2">
                  Duygu Dağılımı
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs text-white/40">Pozitif</div>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400/40 to-green-400/60 rounded-full"
                        style={{ width: totalCalls > 0 ? `${(sentimentCounts.positive || 0) / totalCalls * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-white/50 w-8 text-right">{sentimentCounts.positive || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs text-white/40">Nötr</div>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-white/20 to-white/30 rounded-full"
                        style={{ width: totalCalls > 0 ? `${(sentimentCounts.neutral || 0) / totalCalls * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-white/50 w-8 text-right">{sentimentCounts.neutral || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 text-xs text-white/40">Negatif</div>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-400/40 to-red-400/60 rounded-full"
                        style={{ width: totalCalls > 0 ? `${(sentimentCounts.negative || 0) / totalCalls * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-white/50 w-8 text-right">{sentimentCounts.negative || 0}</span>
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl flex items-center justify-center border border-white/[0.08] ml-4">
                <Activity className="h-5 w-5 text-white/60" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* Call Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06]">
            <h3 className="text-lg font-medium text-white/90 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Çağrı Hacmi
            </h3>
            
            {/* Simple bar chart representation */}
            <div className="space-y-3">
              {(() => {
                // Group calls by day of week
                const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                const callsByDay = new Array(7).fill(0);
                
                calls.forEach(call => {
                  const date = new Date(call.startTime);
                  const dayOfWeek = date.getDay();
                  callsByDay[dayOfWeek]++;
                });
                
                // Get weekdays only (Monday to Friday)
                const weekdayData = [
                  { day: 'Pazartesi', count: callsByDay[1] },
                  { day: 'Salı', count: callsByDay[2] },
                  { day: 'Çarşamba', count: callsByDay[3] },
                  { day: 'Perşembe', count: callsByDay[4] },
                  { day: 'Cuma', count: callsByDay[5] }
                ];
                
                const maxCalls = Math.max(...weekdayData.map(d => d.count), 1);
                
                return weekdayData.map((data, index) => (
                  <div key={data.day} className="flex items-center gap-3">
                    <span className="text-sm text-white/50 w-20">
                      {data.day}
                    </span>
                    <div className="flex-1 h-8 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.count / maxCalls) * 100}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-400/60 to-purple-400/60"
                      />
                    </div>
                    <span className="text-sm text-white/90 w-12 text-right">
                      {data.count}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </Card>
        </motion.div>

        {/* Top Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06]">
            <h3 className="text-lg font-medium text-white/90 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              En İyi Temsilciler
            </h3>
            
            <div className="space-y-3">
              {topAgents.map((agent, index) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                        index === 0 ? "bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 text-yellow-400 border border-yellow-400/20" :
                        index === 1 ? "bg-gradient-to-br from-gray-300/20 to-gray-300/5 text-gray-300 border border-gray-300/20" :
                        index === 2 ? "bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-orange-400 border border-orange-400/20" :
                        "bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400 border border-blue-400/20"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white/90">
                        {agent.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {agent.calls} çağrı
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-white/90">
                      {Math.round(agent.avgScore)}
                    </p>
                    <p className="text-xs text-white/50">
                      puan
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06]">
          <h3 className="text-lg font-medium text-white/90 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Son Aktiviteler
          </h3>
          
          <div className="space-y-4">
            {calls.slice(0, 5).map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    call.status === 'active' ? "bg-emerald-500" : "bg-gray-400"
                  )} />
                  <div>
                    <p className="font-medium text-white/90">
                      {call.customerName || call.phoneNumber}
                    </p>
                    <p className="text-sm text-white/50">
                      {call.agentName} • {new Date(call.startTime).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {call.analytics && (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      call.analytics.sentiment.overall === 'positive' ? "text-emerald-400" :
                      call.analytics.sentiment.overall === 'negative' ? "text-red-400" :
                      "text-gray-400"
                    )}>
                      {call.analytics.sentiment.overall === 'positive' ? 'Pozitif' :
                       call.analytics.sentiment.overall === 'negative' ? 'Negatif' : 'Nötr'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                      <span className="text-sm text-white/50">
                        {call.analytics.customerSatisfaction.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}