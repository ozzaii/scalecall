import React from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

export default function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center bg-black relative">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative inline-block mb-6"
        >
          <div className="h-24 w-24 rounded-full bg-white/[0.02] backdrop-blur-xl flex items-center justify-center mx-auto border border-white/[0.06]">
            <Phone className="h-12 w-12 text-white/80" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        <h2 className="text-2xl font-semibold text-white/90 mb-2">
          Hoş Geldiniz!
        </h2>
        
        <p className="text-white/50 mb-8">
          Analiz etmek için bir çağrı seçin veya yeni bir çağrı başlatın
        </p>
        
        <div className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] text-white shadow-lg group transition-all duration-300"
            >
              Yeni Çağrı Başlat
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full bg-transparent border border-white/[0.06] hover:bg-white/[0.02] hover:border-white/[0.1] transition-all duration-300 text-white/70 hover:text-white/90"
            >
              Çağrı Geçmişini Görüntüle
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}