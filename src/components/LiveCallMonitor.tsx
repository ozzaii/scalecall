import React, { useEffect, useRef, useState } from 'react';
import { CallData } from '../types';
import { Phone, Mic, MicOff, Volume2, Users, Clock, TrendingUp } from 'lucide-react';
import { formatDuration } from '../lib/utils';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import WaveformVisualizer from './WaveformVisualizer';
import LiveTranscript from './LiveTranscript';
import LiveAudioVisualizer from './LiveAudioVisualizer';

interface LiveCallMonitorProps {
  call: CallData;
}

export default function LiveCallMonitor({ call }: LiveCallMonitorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speakingVolume, setSpeakingVolume] = useState({ agent: 0, customer: 0 });
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - call.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [call.startTime]);

  useEffect(() => {
    // Simulate speaking volume changes
    const volumeInterval = setInterval(() => {
      setSpeakingVolume({
        agent: Math.random() > 0.5 ? Math.random() * 100 : 0,
        customer: Math.random() > 0.5 ? Math.random() * 100 : 0,
      });
    }, 200);

    return () => clearInterval(volumeInterval);
  }, []);

  return (
    <div className="h-full flex flex-col p-8 bg-black">
      {/* Premium dark background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]" />
      </div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-white/[0.02] backdrop-blur-xl flex items-center justify-center border border-white/[0.06]">
                <Phone className="h-8 w-8 text-white/80" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/5"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/10 to-transparent"
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-white/90">
                Canlı Çağrı Devam Ediyor
              </h2>
              <p className="text-white/40">
                {call.customerName || call.phoneNumber} • {call.agentName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-white/40">Süre</p>
              <p className="text-2xl font-semibold text-white/90 tabular-nums">
                {formatDuration(elapsedTime)}
              </p>
            </div>
            
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/20 px-4 py-2">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Aktif
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
        {/* Left Column - Waveform and Stats */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Live Audio Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
              <h3 className="text-lg font-medium text-white/90 mb-4">
                Canlı Ses Akışı
              </h3>
              <LiveAudioVisualizer 
                conversationId={call.conversationId || call.id} 
                isActive={true} 
              />
            </Card>
          </motion.div>

          {/* Speaker Levels */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
              <h3 className="text-lg font-medium text-white/90 mb-4">
                Konuşmacı Aktivitesi
              </h3>
              
              <div className="space-y-4">
                {/* Agent */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {call.agentName}
                      </p>
                      <p className="text-xs text-white/40">Temsilci</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3">
                    {speakingVolume.agent > 0 ? (
                      <Mic className="h-4 w-4 text-white/70" />
                    ) : (
                      <MicOff className="h-4 w-4 text-white/30" />
                    )}
                    <div className="flex-1">
                      <Progress
                        value={speakingVolume.agent}
                        className="h-2 bg-white/[0.06]"
                        indicatorClassName="bg-gradient-to-r from-blue-400/60 to-blue-400/80 transition-all duration-200"
                      />
                    </div>
                    <Volume2 className="h-4 w-4 text-white/30" />
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/20">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {call.customerName || 'Customer'}
                      </p>
                      <p className="text-xs text-white/40">Müşteri</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3">
                    {speakingVolume.customer > 0 ? (
                      <Mic className="h-4 w-4 text-white/70" />
                    ) : (
                      <MicOff className="h-4 w-4 text-white/30" />
                    )}
                    <div className="flex-1">
                      <Progress
                        value={speakingVolume.customer}
                        className="h-2 bg-white/[0.06]"
                        indicatorClassName="bg-gradient-to-r from-purple-400/60 to-purple-400/80 transition-all duration-200"
                      />
                    </div>
                    <Volume2 className="h-4 w-4 text-white/30" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Real-time Metrics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50">Konuşma Oranı</p>
                    <p className="text-2xl font-semibold text-white/90">
                      68%
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50">Duygu Durumu</p>
                    <p className="text-2xl font-semibold text-green-400">
                      Pozitif
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50">Hız</p>
                    <p className="text-2xl font-semibold text-white/90">
                      Normal
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Live Transcript */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col min-h-0"
        >
          <Card className="flex-1 p-6 bg-white/[0.02] backdrop-blur-xl border-white/[0.06] hover:border-white/[0.08] transition-all duration-300 flex flex-col">
            <h3 className="text-lg font-medium text-white/90 mb-4">
              Canlı Transkript
            </h3>
            <LiveTranscript call={call} />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}