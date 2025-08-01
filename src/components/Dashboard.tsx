
import { CallData, CallAnalytics } from '../types';
import LiveCallMonitor from './LiveCallMonitor';
import CallDetails from './CallDetails';
import AnalyticsDashboard from './AnalyticsDashboard';
import EmptyState from './EmptyState';
// import MetricsDebug from './MetricsDebug';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  activeCall: CallData | null;
  isLiveCall: boolean;
  analytics: CallAnalytics | null;
  isLoading: boolean;
  calls: CallData[];
}

export default function Dashboard({
  activeCall,
  isLiveCall,
  analytics,
  isLoading,
  calls
}: DashboardProps) {
  if (!activeCall && calls.length === 0) {
    return <EmptyState />;
  }

  if (!activeCall) {
    return <AnalyticsDashboard calls={calls} />;
  }

  return (
    <div className="h-full bg-black overflow-auto">
      <AnimatePresence mode="wait">
        {isLiveCall ? (
          <motion.div
            key="live-call"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <LiveCallMonitor call={activeCall} />
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center">
              <div className="relative mb-8">
                <div className="h-24 w-24 mx-auto">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/[0.06]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full bg-black"
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full bg-white/[0.04]"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-6 rounded-full bg-black flex items-center justify-center"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                  </motion.div>
                </div>
              </div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-medium text-white/90 mb-2"
              >
                Çağrı Analiz Ediliyor
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-white/40"
              >
                Ses Gemini AI ile işleniyor...
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="mt-6 h-1 bg-white/10 rounded-full max-w-xs mx-auto"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="call-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <CallDetails call={activeCall} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}