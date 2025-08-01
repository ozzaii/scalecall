import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Transcript } from '../types';
import { formatDuration } from '../lib/utils';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string;
  transcript?: Transcript;
}

export default function AudioPlayer({ audioUrl, transcript }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const changeVolume = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value[0];
    setVolume(value[0]);
  };

  const changePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    audio.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
    >
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Waveform visualization placeholder */}
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ses dalgası</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={seek}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <span>{formatDuration(Math.floor(duration))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={skipBackward}
            className="h-10 w-10"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            className="h-12 w-12"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={skipForward}
            className="h-10 w-10"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Playback speed */}
          <Button
            variant="outline"
            size="sm"
            onClick={changePlaybackRate}
            className="min-w-[60px]"
          >
            {playbackRate}x
          </Button>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={changeVolume}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* Transcript segments indicator */}
      {transcript && transcript.segments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Transkript segmentleri
          </p>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
            {transcript.segments.map((segment, index) => {
              const startPercent = (segment.startTime / duration) * 100;
              const widthPercent = ((segment.endTime - segment.startTime) / duration) * 100;
              
              return (
                <div
                  key={segment.id}
                  className={`absolute h-full rounded-full ${
                    segment.speaker === 'agent'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                  }`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    opacity: 0.6
                  }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Temsilci</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Müşteri</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}