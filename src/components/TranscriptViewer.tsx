import { useState } from 'react';
import { Transcript } from '../types';
import { cn } from '../lib/utils';
import { formatDuration } from '../lib/utils';
import { Search, Download, Copy, Check, MessageSquare, Bot, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptViewerProps {
  transcript?: Transcript;
  audioUrl?: string;
}

export default function TranscriptViewer({ transcript, audioUrl }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!transcript) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-white/[0.03] backdrop-blur-xl flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
          <MessageSquare className="h-8 w-8 text-white/20" />
        </div>
        <p className="text-white/40 text-sm">
          Transkript mevcut değil
        </p>
      </div>
    );
  }

  const filteredSegments = transcript.segments.filter(segment =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copySegment = (segmentId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(segmentId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTranscript = () => {
    const text = transcript.segments
      .map(s => `[${formatDuration(Math.floor(s.startTime))}] ${s.speaker === 'agent' ? 'Temsilci' : 'Müşteri'}: ${s.text}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transkript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadTranscript}
            className="text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            İndir
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Transkriptte ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/40 focus:bg-white/[0.05] focus:border-white/[0.1]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06]">
          <p className="text-2xl font-semibold text-white/90">
            {transcript.segments.length}
          </p>
          <p className="text-xs text-white/40">
            Segment
          </p>
        </div>
        <div className="text-center p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06]">
          <p className="text-2xl font-semibold text-white/90">
            {transcript.fullText.split(' ').length}
          </p>
          <p className="text-xs text-white/40">
            Kelime
          </p>
        </div>
        <div className="text-center p-4 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.06]">
          <p className="text-2xl font-semibold text-white/90">
            %{Math.round(transcript.confidence * 100)}
          </p>
          <p className="text-xs text-white/40">
            Güven
          </p>
        </div>
      </div>

      {/* Transcript */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-3">
          <AnimatePresence>
            {filteredSegments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group relative rounded-xl transition-all duration-200",
                  segment.speaker === 'agent'
                    ? "bg-gradient-to-r from-blue-500/[0.08] to-blue-500/[0.02]"
                    : "bg-gradient-to-r from-purple-500/[0.08] to-purple-500/[0.02]"
                )}
              >
                <div className="p-4 border border-white/[0.06] rounded-xl backdrop-blur-xl hover:border-white/[0.1] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-xl border",
                          segment.speaker === 'agent'
                            ? "bg-blue-500/10 border-blue-500/20"
                            : "bg-purple-500/10 border-purple-500/20"
                        )}
                      >
                        {segment.speaker === 'agent' ? (
                          <Bot className="h-5 w-5 text-blue-400" />
                        ) : (
                          <User className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          segment.speaker === 'agent' ? "text-blue-400" : "text-purple-400"
                        )}>
                          {segment.speaker === 'agent' ? 'Temsilci' : 'Müşteri'}
                        </p>
                        <p className="text-xs text-white/40">
                          {formatDuration(Math.floor(segment.startTime))} - {formatDuration(Math.floor(segment.endTime))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySegment(segment.id, segment.text)}
                        className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        {copiedId === segment.id ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/80 leading-relaxed pl-13">
                    {segment.text}
                  </p>
                  
                  {segment.confidence < 0.8 && (
                    <div className="flex items-center gap-2 mt-3 pl-13">
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500/20 bg-amber-500/10 text-amber-400"
                      >
                        Düşük Güven: %{Math.round(segment.confidence * 100)}
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {searchQuery && filteredSegments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/40">
            "{searchQuery}" için sonuç bulunamadı
          </p>
        </div>
      )}
    </div>
  );
}