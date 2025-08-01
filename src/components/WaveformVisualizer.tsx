import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  isActive: boolean;
  audioData?: number[];
}

export default function WaveformVisualizer({ isActive, audioData }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let phase = 0;
    const animate = () => {
      if (!isActive) return;

      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Generate waveform data
      const bars = 100;
      const barWidth = width / bars;
      const centerY = height / 2;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.5, '#14b8a6');
      gradient.addColorStop(1, '#06b6d4');

      ctx.fillStyle = gradient;
      ctx.strokeStyle = gradient;

      // Draw waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const amplitude = audioData
          ? audioData[i] || 0
          : Math.sin((i + phase) * 0.1) * Math.sin((i + phase * 2) * 0.05) * 0.5 + 
            Math.random() * 0.1;
        
        const barHeight = Math.abs(amplitude) * height * 0.4;
        
        // Draw smooth curve
        const cp1x = x + barWidth * 0.5;
        const cp1y = centerY - barHeight;
        const cp2x = x + barWidth * 0.5;
        const cp2y = centerY + barHeight;
        
        ctx.quadraticCurveTo(cp1x, cp1y, x + barWidth, centerY);
      }

      ctx.lineTo(width, centerY);
      ctx.strokeStyle = gradient;
      ctx.stroke();

      // Draw bars
      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const amplitude = audioData
          ? audioData[i] || 0
          : Math.sin((i + phase) * 0.1) * Math.sin((i + phase * 2) * 0.05) * 0.5 + 
            Math.random() * 0.1;
        
        const barHeight = Math.abs(amplitude) * height * 0.4;
        
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x + barWidth * 0.2, centerY - barHeight, barWidth * 0.6, barHeight * 2);
        ctx.globalAlpha = 1;
      }

      phase += 0.05;
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isActive) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, audioData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-48 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Aktif ses yok</p>
        </div>
      )}
    </motion.div>
  );
}