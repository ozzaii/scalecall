import React, { useState } from 'react';
import { Download, FileText, FileJson, Trash2 } from 'lucide-react';
import { CallData } from '../types';
import { storageService } from '../services/storage';
import { cn } from '../lib/utils';

interface Props {
  calls: CallData[];
}

export default function ExportMenu({ calls }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCSV = () => {
    storageService.exportToCSV(calls);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    storageService.exportAnalytics(calls);
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    if (confirm('Tüm geçmişi silmek istediğinizden emin misiniz?')) {
      storageService.clearCalls();
      window.location.reload();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 glass-premium rounded-lg hover:bg-white/10 transition-colors"
        title="Dışa Aktar"
      >
        <Download className="w-5 h-5 text-zinc-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 glass-premium rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-sm">CSV Olarak İndir</span>
              </button>
              
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FileJson className="w-4 h-4 text-zinc-400" />
                <span className="text-sm">Analitik JSON İndir</span>
              </button>
              
              <div className="my-2 border-t border-white/10" />
              
              <button
                onClick={handleClearHistory}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Geçmişi Temizle</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}