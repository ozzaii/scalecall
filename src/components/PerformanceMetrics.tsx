
import { AgentPerformance } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Target, TrendingUp, AlertCircle, CheckCircle2, Heart, MessageSquare, Lightbulb, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface PerformanceMetricsProps {
  performance: AgentPerformance;
}

export default function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const metrics = [
    {
      name: 'Empati',
      score: performance.empathyScore,
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'from-red-500/20 to-red-500/5',
      description: 'Müşteri duygularını anlama ve yanıt verme'
    },
    {
      name: 'Netlik',
      score: performance.clarityScore,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-500/5',
      description: 'Açık ve anlaşılır iletişim'
    },
    {
      name: 'Çözüm',
      score: performance.resolutionScore,
      icon: Lightbulb,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-500/5',
      description: 'Sorun çözme etkinliği'
    },
    {
      name: 'Profesyonellik',
      score: performance.professionalismScore,
      icon: Briefcase,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-500/5',
      description: 'Profesyonel davranış ve tutum'
    }
  ];

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'Mükemmel', color: 'text-emerald-400' };
    if (score >= 80) return { grade: 'Çok İyi', color: 'text-blue-400' };
    if (score >= 70) return { grade: 'İyi', color: 'text-green-400' };
    if (score >= 60) return { grade: 'Orta', color: 'text-yellow-400' };
    return { grade: 'Gelişmeli', color: 'text-red-400' };
  };

  const overallGrade = getScoreGrade(performance.overallScore);

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold text-white/90 mb-2">
              Temsilci Performansı
            </h3>
            <p className="text-white/60">
              Çağrı boyunca gösterilen performansın detaylı analizi
            </p>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-3 py-1 border-white/10 bg-white/[0.03]",
              overallGrade.color
            )}
          >
            {overallGrade.grade}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Overall Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-white/[0.06]"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - performance.overallScore / 100)}`}
                  className="text-blue-400 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white/90">
                  {performance.overallScore}
                </span>
                <span className="text-sm text-white/50">/ 100</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                      metric.bgColor
                    )}>
                      <metric.icon className={cn("h-5 w-5", metric.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">{metric.name}</p>
                      <p className="text-xs text-white/50">{metric.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white/90">{metric.score}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className={cn(
                      "h-2 rounded-full",
                      metric.score >= 80 ? "bg-gradient-to-r from-emerald-400/80 to-emerald-400/40" :
                      metric.score >= 60 ? "bg-gradient-to-r from-blue-400/80 to-blue-400/40" :
                      "bg-gradient-to-r from-amber-400/80 to-amber-400/40"
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="text-lg font-medium text-white/90">Güçlü Yönler</h4>
          </div>
          
          <ul className="space-y-3">
            {performance.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/70">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </Card>

        {/* Areas for Improvement */}
        <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
              <Target className="h-5 w-5 text-amber-400" />
            </div>
            <h4 className="text-lg font-medium text-white/90">Gelişim Alanları</h4>
          </div>
          
          {performance.improvements.length > 0 ? (
            <ul className="space-y-3">
              {performance.improvements.map((improvement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/70">{improvement}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">
              Mükemmel performans! Belirgin bir gelişim alanı tespit edilmedi.
            </p>
          )}
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="bg-white/[0.02] backdrop-blur-xl border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <h4 className="text-lg font-medium text-white/90">
            Performans Önerileri
          </h4>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          {performance.overallScore >= 80
            ? "Mükemmel performans! Bu seviyeyi korumak için müşteri geri bildirimlerini takip etmeye devam edin."
            : performance.overallScore >= 60
            ? "İyi bir performans sergiliyor. Empati ve çözüm odaklı yaklaşımı güçlendirerek daha da gelişebilir."
            : "Gelişim potansiyeli mevcut. Eğitim programlarına katılım ve mentorluk desteği faydalı olabilir."}
        </p>
      </Card>
    </div>
  );
}