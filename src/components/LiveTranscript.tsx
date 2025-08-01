import React, { useEffect, useRef, useState } from 'react';
import { CallData, TranscriptSegment } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface LiveTranscriptProps {
  call: CallData;
}

export default function LiveTranscript({ call }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState<'agent' | 'customer' | null>(null);
  
  // Mock transcript for demonstration
  const [mockSegments, setMockSegments] = useState<TranscriptSegment[]>([
    {
      id: '1',
      speaker: 'agent',
      text: 'Good morning! Thank you for calling customer support. My name is Alex. How can I help you today?',
      startTime: 0,
      endTime: 5,
      confidence: 0.98,
      sentiment: 'positive'
    },
    {
      id: '2',
      speaker: 'customer',
      text: 'Hi Alex, I\'m having some issues with my recent order. It was supposed to arrive yesterday but I haven\'t received it yet.',
      startTime: 6,
      endTime: 12,
      confidence: 0.95,
      sentiment: 'negative'
    }
  ]);

  // Simulate live transcript updates
  useEffect(() => {
    const messages = [
      { speaker: 'agent', text: 'I\'m really sorry to hear that. Let me look into that for you right away. Can I have your order number please?', sentiment: 'positive' },
      { speaker: 'customer', text: 'Yes, it\'s ORDER-12345. I ordered it last week and selected express shipping.', sentiment: 'neutral' },
      { speaker: 'agent', text: 'Thank you. I can see your order here. It looks like there was a delay at our distribution center. I sincerely apologize for the inconvenience.', sentiment: 'positive' },
      { speaker: 'customer', text: 'This is really frustrating. I needed this for an important event today.', sentiment: 'negative' },
      { speaker: 'agent', text: 'I completely understand your frustration, and I\'m truly sorry this happened. Let me see what I can do to make this right for you immediately.', sentiment: 'positive' },
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length) {
        const msg = messages[messageIndex];
        setIsTyping(msg.speaker as 'agent' | 'customer');
        
        setTimeout(() => {
          setMockSegments(prev => [...prev, {
            id: `${prev.length + 1}`,
            speaker: msg.speaker as 'agent' | 'customer',
            text: msg.text,
            startTime: prev[prev.length - 1]?.endTime || 0,
            endTime: (prev[prev.length - 1]?.endTime || 0) + 5,
            confidence: 0.95 + Math.random() * 0.05,
            sentiment: msg.sentiment as 'positive' | 'negative' | 'neutral'
          }]);
          setIsTyping(null);
        }, 1500);
        
        messageIndex++;
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mockSegments]);

  const segments = call.transcript?.segments || mockSegments;

  return (
    <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                segment.speaker === 'agent' ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium",
                  segment.speaker === 'agent'
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                )}
              >
                {segment.speaker === 'agent' ? 'A' : 'C'}
              </div>
              
              <div
                className={cn(
                  "flex-1 max-w-[80%]",
                  segment.speaker === 'customer' && "text-right"
                )}
              >
                <div
                  className={cn(
                    "inline-block p-3 rounded-lg",
                    segment.speaker === 'agent'
                      ? "bg-gray-100 dark:bg-gray-800 text-left"
                      : "bg-blue-100 dark:bg-blue-900/20 text-left"
                  )}
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {segment.text}
                  </p>
                  
                  {segment.sentiment && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          segment.sentiment === 'positive' && "text-emerald-600 dark:text-emerald-400",
                          segment.sentiment === 'negative' && "text-red-600 dark:text-red-400",
                          segment.sentiment === 'neutral' && "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {segment.sentiment === 'positive' ? 'pozitif' : segment.sentiment === 'negative' ? 'negatif' : 'nötr'}
                      </Badge>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        %{Math.round(segment.confidence * 100)} güven
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-3",
                isTyping === 'agent' ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium",
                  isTyping === 'agent'
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                )}
              >
                {isTyping === 'agent' ? 'A' : 'C'}
              </div>
              
              <div
                className={cn(
                  "inline-block p-3 rounded-lg",
                  isTyping === 'agent'
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "bg-blue-100 dark:bg-blue-900/20"
                )}
              >
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}