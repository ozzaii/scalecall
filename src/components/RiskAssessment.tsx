import React from 'react';
import { RiskFactor } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, TrendingDown, Shield, UserX, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface RiskAssessmentProps {
  risks: RiskFactor[];
}

export default function RiskAssessment({ risks }: RiskAssessmentProps) {
  const getRiskIcon = (type: RiskFactor['type']) => {
    switch (type) {
      case 'churn':
        return <UserX className="h-5 w-5" />;
      case 'escalation':
        return <TrendingDown className="h-5 w-5" />;
      case 'compliance':
        return <Shield className="h-5 w-5" />;
      case 'satisfaction':
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getRiskColor = (severity: RiskFactor['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          text: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800'
        };
    }
  };

  const riskTypeLabels = {
    churn: 'Kayıp Riski',
    escalation: 'Yükseltme Riski',
    compliance: 'Uyumluluk Riski',
    satisfaction: 'Memnuniyet Riski'
  };

  const severityLabels = {
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük'
  };

  const sortedRisks = [...risks].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  if (risks.length === 0) {
    return (
      <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Risk Tespit Edilmedi
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Bu çağrıda herhangi bir risk faktörü bulunmamaktadır
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Risk Değerlendirmesi
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {risks.filter(r => r.severity === 'high').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yüksek Risk
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                {risks.filter(r => r.severity === 'medium').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Orta Risk
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {risks.filter(r => r.severity === 'low').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Düşük Risk
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Risk Details */}
      <div className="space-y-4">
        {sortedRisks.map((risk, index) => {
          const colors = getRiskColor(risk.severity);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "p-6 border",
                colors.bg,
                colors.border
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    risk.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                    risk.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  )}>
                    <div className={colors.text}>
                      {getRiskIcon(risk.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {riskTypeLabels[risk.type]}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={cn("ml-2", colors.text)}
                      >
                        {severityLabels[risk.severity]} Risk
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {risk.description}
                    </p>
                    
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <ChevronRight className={cn("h-5 w-5 mt-0.5 flex-shrink-0", colors.text)} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Önerilen Aksiyon
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {risk.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Risk Mitigation Summary */}
      {risks.some(r => r.severity === 'high') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Acil Müdahale Gerekiyor
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Yüksek risk faktörleri tespit edildi. Müşteri kaybını önlemek için hızlı aksiyon alınması önerilir.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Müşteri ile 24 saat içinde proaktif iletişim kurulmalı</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Yönetici seviyesinde destek sağlanmalı</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Telafi edici çözümler sunulmalı</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}