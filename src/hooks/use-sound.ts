import { useCallback, useRef } from 'react';

export const useSound = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const playSound = useCallback((frequency: number = 440, duration: number = 100, type: OscillatorType = 'sine') => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContext.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  }, []);

  const playClick = useCallback(() => {
    playSound(600, 50);
  }, [playSound]);

  const playHover = useCallback(() => {
    playSound(400, 30);
  }, [playSound]);

  const playSuccess = useCallback(() => {
    playSound(800, 150);
    setTimeout(() => playSound(1000, 150), 100);
  }, [playSound]);

  const playError = useCallback(() => {
    playSound(200, 200, 'sawtooth');
  }, [playSound]);

  return {
    playClick,
    playHover,
    playSuccess,
    playError,
    playSound
  };
};