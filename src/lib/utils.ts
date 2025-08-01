import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || !isFinite(dateObj.getTime())) {
    return '--:--';
  }
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || !isFinite(dateObj.getTime())) {
    return 'Geçersiz Tarih';
  }
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Bugün';
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Dün';
  } else {
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(dateObj);
  }
}

export function getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'negative':
      return 'text-red-600 dark:text-red-400';
    case 'neutral':
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function getSentimentBgColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return 'bg-emerald-50 dark:bg-emerald-900/20';
    case 'negative':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'neutral':
      return 'bg-gray-50 dark:bg-gray-800/50';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20';
  if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
}