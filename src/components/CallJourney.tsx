
import { motion } from 'framer-motion';
import { CallJourneyStep } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, User, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatDuration, formatTime } from '../lib/utils';
import { cn } from '../lib/utils';

interface CallJourneyProps {
  journey: CallJourneyStep[];
}

export default function CallJourney({ journey }: CallJourneyProps) {
  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'specialist':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'support':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'sales':
        return 'bg-gradient-to-r from-orange-500 to-amber-500';
      case 'technical':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getAgentTypeLabel = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return 'Yönlendirici';
      case 'specialist':
        return 'Uzman';
      case 'support':
        return 'Destek';
      case 'sales':
        return 'Satış';
      case 'technical':
        return 'Teknik';
      default:
        return 'Temsilci';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 glass glass-border">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Çağrı Yolculuğu
        </h3>
        
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50" />
          
          <div className="space-y-6">
            {journey.map((step, index) => (
              <motion.div
                key={`${step.agentId}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  {/* Timeline Node */}
                  <div className="relative z-10">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
                      getAgentTypeColor(step.agentType)
                    )}>
                      <User className="h-8 w-8 text-white" />
                    </div>
                    {index < journey.length - 1 && (
                      <motion.div
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600 rotate-90" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <Card className="p-5 glass hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {step.agentName}
                          </h4>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {getAgentTypeLabel(step.agentType)}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(step.startTime)}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            {formatDuration(step.duration)}
                          </p>
                        </div>
                      </div>
                      
                      {step.handoffReason && (
                        <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Transfer Nedeni:</span> {step.handoffReason}
                          </p>
                        </div>
                      )}
                      
                      {step.performance && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Performans Skoru
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  className={cn(
                                    "h-full rounded-full",
                                    step.performance.score >= 80 ? "bg-gradient-to-r from-emerald-500 to-green-500" :
                                    step.performance.score >= 60 ? "bg-gradient-to-r from-yellow-500 to-amber-500" :
                                    "bg-gradient-to-r from-red-500 to-orange-500"
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${step.performance.score}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {step.performance.score}%
                              </span>
                            </div>
                          </div>
                          
                          {step.performance.highlights.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                Güçlü Yönler
                              </p>
                              <ul className="space-y-0.5">
                                {step.performance.highlights.map((highlight, i) => (
                                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span>{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {step.performance.issues.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                Geliştirilmesi Gerekenler
                              </p>
                              <ul className="space-y-0.5">
                                {step.performance.issues.map((issue, i) => (
                                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: journey.length * 0.1 + 0.2 }}
          className="mt-8 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Temsilci</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {journey.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Süre</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatDuration(journey.reduce((sum, step) => sum + step.duration, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ortalama Performans</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(
                  journey.reduce((sum, step) => sum + (step.performance?.score || 0), 0) / journey.length
                )}%
              </p>
            </div>
          </div>
        </motion.div>
      </Card>
    </div>
  );
}