import { useEffect, useRef } from 'react';
import { EmotionData } from '../types';
import { motion } from 'framer-motion';

interface EmotionRadarProps {
  emotions: EmotionData[];
}

export default function EmotionRadar({ emotions }: EmotionRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Aggregate emotions
    const emotionTypes = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral'] as const;
    const emotionLabels = {
      happy: 'Mutlu',
      sad: 'Üzgün',
      angry: 'Kızgın',
      surprised: 'Şaşırmış',
      fearful: 'Korkmuş',
      disgusted: 'İğrenmiş',
      neutral: 'Nötr'
    };
    
    const emotionColors = {
      happy: '#10b981',
      sad: '#3b82f6',
      angry: '#ef4444',
      surprised: '#f59e0b',
      fearful: '#8b5cf6',
      disgusted: '#6366f1',
      neutral: '#6b7280'
    };

    const emotionData = emotionTypes.map(type => {
      const emotionsOfType = emotions.filter(e => e.emotion === type);
      const avgIntensity = emotionsOfType.length > 0
        ? emotionsOfType.reduce((sum, e) => sum + e.intensity, 0) / emotionsOfType.length
        : 0;
      return { type, intensity: avgIntensity };
    });

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw radar background
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      
      for (let j = 0; j < emotionTypes.length; j++) {
        const angle = (j * 2 * Math.PI) / emotionTypes.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * (i / levels);
        const y = centerY + Math.sin(angle) * radius * (i / levels);
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes
    emotionTypes.forEach((_, index) => {
      const angle = (index * 2 * Math.PI) / emotionTypes.length - Math.PI / 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    });

    // Draw data
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 2;

    emotionData.forEach((data, index) => {
      const angle = (index * 2 * Math.PI) / emotionTypes.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * data.intensity;
      const y = centerY + Math.sin(angle) * radius * data.intensity;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw points
    emotionData.forEach((data, index) => {
      const angle = (index * 2 * Math.PI) / emotionTypes.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * data.intensity;
      const y = centerY + Math.sin(angle) * radius * data.intensity;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = emotionColors[data.type];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw labels
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    emotionTypes.forEach((type, index) => {
      const angle = (index * 2 * Math.PI) / emotionTypes.length - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      ctx.fillStyle = emotionColors[type];
      ctx.fillText(emotionLabels[type], x, y);
      
      // Draw percentage
      const percentage = Math.round(emotionData[index].intensity * 100);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText(`${percentage}%`, x, y + 15);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [emotions]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-64"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </motion.div>
  );
}