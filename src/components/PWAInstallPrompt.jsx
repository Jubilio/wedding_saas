import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';

    const handler = (e) => {
      e.preventDefault();
      if (!isStandalone && !isDismissed) {
        setDeferredPrompt(e);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Optionally save in session that user dismissed it
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[100] md:max-w-md md:left-auto md:right-8"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gold/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
              <Download size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-gray truncate">Instalar App</h4>
              <p className="text-xs text-gray-500">Aceda ao convite mais rápido!</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-gold text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
