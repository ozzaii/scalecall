import { useEffect, useRef } from 'react';
import { SentimentPoint } from '../types';
import { motion } from 'framer-motion';

interface SentimentChartProps {
  data?: SentimentPoint[];
}

export default function SentimentChart({ data = [] }: SentimentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('SentimentChart data:', data);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      console.log('Canvas size:', rect.width, 'x', rect.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw sentiment areas
    const positiveGradient = ctx.createLinearGradient(0, padding, 0, height / 2);
    positiveGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
    positiveGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    const negativeGradient = ctx.createLinearGradient(0, height / 2, 0, height - padding);
    negativeGradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
    negativeGradient.addColorStop(1, 'rgba(239, 68, 68, 0.15)');

    // Positive area
    ctx.fillStyle = positiveGradient;
    ctx.fillRect(padding, padding, chartWidth, chartHeight / 2 - padding);

    // Negative area
    ctx.fillStyle = negativeGradient;
    ctx.fillRect(padding, height / 2, chartWidth, chartHeight / 2);

    // Draw data line
    if (data && data.length > 0) {
      const xStep = chartWidth / (data.length - 1);
      const centerY = height / 2;
      const yScale = chartHeight / 2;

      // Create gradient for line
      const lineGradient = ctx.createLinearGradient(padding, 0, width - padding, 0);
      lineGradient.addColorStop(0, '#3b82f6');
      lineGradient.addColorStop(0.5, '#8b5cf6');
      lineGradient.addColorStop(1, '#ec4899');

      // Draw line
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + index * xStep;
        const y = centerY - point.score * yScale;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = padding + (index - 1) * xStep;
          const prevY = centerY - data[index - 1].score * yScale;
          const cp1x = prevX + xStep / 3;
          const cp1y = prevY;
          const cp2x = x - xStep / 3;
          const cp2y = y;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }
      });

      ctx.stroke();

      // Draw points
      data.forEach((point, index) => {
        const x = padding + index * xStep;
        const y = centerY - point.score * yScale;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = point.label === 'positive' ? '#10b981' : point.label === 'negative' ? '#ef4444' : '#6b7280';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Pozitif', padding - 10, padding + 10);
    ctx.fillText('Nötr', padding - 10, height / 2);
    ctx.fillText('Negatif', padding - 10, height - padding - 10);

    // Draw time labels
    ctx.textAlign = 'center';
    ctx.fillText('Başlangıç', padding, height - padding + 20);
    ctx.fillText('Bitiş', width - padding, height - padding + 20);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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