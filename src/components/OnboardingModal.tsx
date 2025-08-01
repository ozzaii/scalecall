import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Sparkles, Zap, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { elevenLabsService } from '../services/elevenLabs';
import { geminiService } from '../services/gemini';


interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (useMockData: boolean) => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [agentIds, setAgentIds] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    
    if (elevenLabsKey) {
      elevenLabsService.setApiKey(elevenLabsKey);
      const ids = agentIds.split(',').map(id => id.trim()).filter(Boolean);
      elevenLabsService.initialize(ids);
    }
    
    if (geminiKey) {
      geminiService.setApiKey(geminiKey);
    }
    
    // Save to localStorage
    localStorage.setItem('elevenlabs_api_key', elevenLabsKey);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('agent_ids', agentIds);
    
    setTimeout(() => {
      setIsLoading(false);
      onComplete(false);
    }, 1500);
  };

  const handleMockMode = () => {
    onComplete(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <div
              className="w-full max-w-2xl glass glass-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-8 pb-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25"
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-center text-gradient mb-2">
                    Hoş Geldiniz!
                  </h2>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Hadi sistemi yapılandıralım ve başlayalım
                  </p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold">Nasıl başlamak istersiniz?</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          API anahtarlarınızla gerçek verileri kullanabilir veya demo modunda başlayabilirsiniz
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setStep(2)}
                          className="p-6 rounded-xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 group"
                        >
                          <Key className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            API Anahtarları ile
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ElevenLabs ve Gemini'yi bağlayın
                          </p>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleMockMode}
                          className="p-6 rounded-xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 group"
                        >
                          <Database className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Demo Modu
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Örnek verilerle keşfedin
                          </p>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                  
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ElevenLabs API Anahtarı
                          </label>
                          <Input
                            type="password"
                            placeholder="xi-..."
                            value={elevenLabsKey}
                            onChange={(e) => setElevenLabsKey(e.target.value)}
                            className="glass glass-border"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ElevenLabs hesabınızdan alın
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Agent ID'leri (opsiyonel)
                          </label>
                          <Input
                            placeholder="agent1, agent2, agent3"
                            value={agentIds}
                            onChange={(e) => setAgentIds(e.target.value)}
                            className="glass glass-border"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Virgülle ayırarak birden fazla agent ekleyin
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gemini API Anahtarı
                          </label>
                          <Input
                            type="password"
                            placeholder="AIza..."
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="glass glass-border"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Google AI Studio'dan alın
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          Geri
                        </Button>
                        <Button
                          onClick={handleSetup}
                          disabled={isLoading || (!elevenLabsKey && !geminiKey)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Bağlanıyor...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Başla
                            </div>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Skip button */}
              <button
                onClick={handleMockMode}
                className="w-full p-4 text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border-t border-gray-200 dark:border-gray-800"
              >
                Demo moduyla devam et →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}