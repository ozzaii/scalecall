import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Radio, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';

interface LiveAudioVisualizerProps {
  isActive: boolean;
}

export default function LiveAudioVisualizer({ isActive }: LiveAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<'agent' | 'customer' | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    analyserRef.current.smoothingTimeConstant = 0.8;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Visualization loop
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;

      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average / 255);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      // Create gradient based on speaker
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      if (currentSpeaker === 'agent') {
        gradient.addColorStop(0, 'rgb(59, 130, 246)');
        gradient.addColorStop(0.5, 'rgb(147, 51, 234)');
        gradient.addColorStop(1, 'rgb(236, 72, 153)');
      } else {
        gradient.addColorStop(0, 'rgb(34, 197, 94)');
        gradient.addColorStop(0.5, 'rgb(168, 85, 247)');
        gradient.addColorStop(1, 'rgb(251, 146, 60)');
      }

      ctx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = currentSpeaker === 'agent' ? 'rgb(147, 51, 234)' : 'rgb(34, 197, 94)';
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    setIsListening(true);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsListening(false);
    };
  }, [isActive, currentSpeaker]);

  // Simulate speaker changes in demo mode
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentSpeaker(prev => prev === 'agent' ? 'customer' : 'agent');
      }, 3000 + Math.random() * 2000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "p-2 rounded-full",
              isListening ? "bg-red-500/20" : "bg-gray-500/20"
            )}
          >
            {isListening ? (
              <Radio className="h-5 w-5 text-red-500" />
            ) : (
              <MicOff className="h-5 w-5 text-gray-500" />
            )}
          </motion.div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn(
              "transition-all duration-300",
              currentSpeaker === 'agent' 
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : currentSpeaker === 'customer'
                ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30"
                : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
            )}>
              {currentSpeaker === 'agent' ? (
                <>
                  <Mic className="h-3 w-3 mr-1" />
                  Temsilci Konuşuyor
                </>
              ) : currentSpeaker === 'customer' ? (
                <>
                  <Volume2 className="h-3 w-3 mr-1" />
                  Müşteri Konuşuyor
                </>
              ) : (
                <>
                  <Activity className="h-3 w-3 mr-1" />
                  Bekleniyor
                </>
              )}
            </Badge>
            
            {isListening && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center gap-1"
              >
                <span className="block w-1 h-1 bg-red-500 rounded-full" />
                <span className="text-xs text-red-500 font-medium">CANLI</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Audio Level Meter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Ses Seviyesi</span>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-all duration-100",
                audioLevel > 0.7 ? "bg-red-500" :
                audioLevel > 0.5 ? "bg-yellow-500" :
                audioLevel > 0.3 ? "bg-green-500" :
                "bg-blue-500"
              )}
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Visualizer */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl" />
        <div className="relative glass glass-border rounded-xl p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-48 rounded-lg bg-black/50"
          />
          
          {/* Overlay Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
            {isListening && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl"
              />
            )}
          </div>

          {/* Speaker Indicators */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <motion.div
              animate={{ scale: currentSpeaker === 'agent' ? 1.1 : 1, opacity: currentSpeaker === 'agent' ? 1 : 0.5 }}
              className="flex items-center gap-2 text-blue-500"
            >
              <Mic className="h-4 w-4" />
              <span className="text-sm font-medium">Temsilci</span>
            </motion.div>
            
            <motion.div
              animate={{ scale: currentSpeaker === 'customer' ? 1.1 : 1, opacity: currentSpeaker === 'customer' ? 1 : 0.5 }}
              className="flex items-center gap-2 text-green-500"
            >
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium">Müşteri</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Frequency Bands */}
      <div className="grid grid-cols-5 gap-2">
        {['Bas', 'Orta-Bas', 'Orta', 'Orta-Tiz', 'Tiz'].map((band) => (
          <div key={band} className="text-center">
            <div className="h-20 glass glass-border rounded-lg p-2 flex flex-col justify-end">
              <motion.div
                className="bg-gradient-to-t from-blue-500 to-purple-500 rounded"
                animate={{ height: `${20 + Math.random() * 60}%` }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{band}</p>
          </div>
        ))}
      </div>
    </div>
  );
}