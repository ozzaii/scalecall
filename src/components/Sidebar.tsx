import { useState } from 'react';
import { cn } from '../lib/utils';
import { CallData } from '../types';
import { formatTime, formatDate, formatDuration } from '../lib/utils';
import { Phone, PhoneIncoming, Search, Clock, TrendingUp, TrendingDown, Minus, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
  calls: CallData[];
  activeCall: CallData | null;
  onCallSelect: (call: CallData) => void;
}

export default function Sidebar({ calls, activeCall, onCallSelect }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredCalls = calls.filter(call => {
    if (filter !== 'all' && call.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        call.phoneNumber.includes(query) ||
        call.customerName?.toLowerCase().includes(query) ||
        call.agentName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const groupedCalls = filteredCalls.reduce((acc, call) => {
    const date = formatDate(call.startTime);
    if (!acc[date]) acc[date] = [];
    acc[date].push(call);
    return acc;
  }, {} as Record<string, CallData[]>);

  return (
    <div className="w-96 glass-premium flex flex-col relative">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <h1 className="text-2xl font-bold text-white/90 mb-1">
          Çağrı Analitiği
        </h1>
        <p className="text-sm text-white/40">
          Yapay zeka destekli gerçek zamanlı içgörüler
        </p>
      </div>

      {/* Search and Filter */}
      <div className="p-4 space-y-3 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Çağrıları ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/30 focus:bg-white/[0.04] focus:border-white/[0.08] focus:ring-0 transition-all duration-300"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={cn(
              "flex-1 transition-all duration-300",
              filter === 'all' ? "bg-white/10 text-white border-transparent" : "bg-transparent text-white/60 border-white/[0.06] hover:bg-white/[0.02] hover:text-white/80"
            )}
          >
            Tümü
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
            className={cn(
              "flex-1 transition-all duration-300",
              filter === 'active' ? "bg-white/10 text-white border-transparent" : "bg-transparent text-white/60 border-white/[0.06] hover:bg-white/[0.02] hover:text-white/80"
            )}
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Aktif
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
            className={cn(
              "flex-1 transition-all duration-300",
              filter === 'completed' ? "bg-white/10 text-white border-transparent" : "bg-transparent text-white/60 border-white/[0.06] hover:bg-white/[0.02] hover:text-white/80"
            )}
          >
            Tamamlandı
          </Button>
        </div>
      </div>

      {/* Calls List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <AnimatePresence>
            {Object.entries(groupedCalls).map(([date, dateCalls]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
                  {date}
                </h3>
                
                <div className="space-y-2">
                  {dateCalls.map((call) => (
                    <CallCard
                      key={call.id}
                      call={call}
                      isActive={activeCall?.id === call.id}
                      onClick={() => onCallSelect(call)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredCalls.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">
                Çağrı bulunamadı
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface CallCardProps {
  call: CallData;
  isActive: boolean;
  onClick: () => void;
}

function CallCard({ call, isActive, onClick }: CallCardProps) {
  const sentiment = call.analytics?.sentiment.overall;
  const satisfactionScore = call.analytics?.customerSatisfaction;
  
  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-500 text-left group relative overflow-hidden",
        isActive
          ? "bg-white/[0.06] border-white/[0.12]"
          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.08]"
      )}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/[0.02] group-hover:to-transparent transition-all duration-700" />
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {call.status === 'active' ? (
            <div className="relative">
              <PhoneIncoming className="h-4 w-4 text-white/70" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/90"></span>
              </span>
            </div>
          ) : (
            <Phone className="h-4 w-4 text-white/30" />
          )}
          
          <span className="font-medium text-white/90">
            {call.customerName || call.phoneNumber}
          </span>
        </div>
        
        <span className="text-xs text-white/40">
          {formatTime(call.startTime)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-white/60">
          {call.agentName}
        </span>
        {call.callJourney && call.callJourney.length > 1 && (
          <>
            <span className="text-white/20">•</span>
            <span className="text-sm text-white/40 flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {call.callJourney.length} temsilci
            </span>
          </>
        )}
        {call.duration && (
          <>
            <span className="text-white/20">•</span>
            <span className="text-sm text-white/40 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration)}
            </span>
          </>
        )}
      </div>
      
      {call.analytics && (
        <div className="flex items-center gap-2">
          {sentiment && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs capitalize bg-white/[0.06] border-white/[0.06] text-white/70"
              )}
            >
              {sentiment === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
              {sentiment === 'negative' && <TrendingDown className="h-3 w-3 mr-1" />}
              {sentiment === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
              {sentiment === 'positive' ? 'Pozitif' : sentiment === 'negative' ? 'Negatif' : 'Nötr'}
            </Badge>
          )}
          
          {satisfactionScore !== undefined && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 w-3 rounded-full transition-all duration-300",
                      i < Math.round(satisfactionScore) 
                        ? "bg-gradient-to-r from-white/40 to-white/60" 
                        : "bg-white/[0.06]"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-white/50 ml-1">
                {satisfactionScore.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}