import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EasterEgg = () => {
  const [showSecret, setShowSecret] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 === 5) {
      setShowSecret(true);
      setTimeout(() => {
        setShowSecret(false);
        setClickCount(0);
      }, 5000);
    }
  };

  return (
    <>
      {/* Hidden clickable area in header logo */}
      <div onClick={handleLogoClick} className="cursor-pointer" />
      
      {/* Secret Message */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
          >
            <div className="bg-gradient-to-br from-gold/90 to-gold/70 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-md mx-4 pointer-events-auto">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <p className="text-3xl text-center mb-4">🎉✨💕</p>
                <p className="text-white text-center font-serif text-xl mb-2">
                  Descobriu o nosso segredo!
                </p>
                <p className="text-white/90 text-center text-sm">
                  Obrigado por explorar nosso site com tanto carinho. 
                  Mal podemos esperar para celebrar consigo!
                </p>
                <p className="text-white text-center font-serif text-lg mt-4">
                  - Binth & Jubílio ♥
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EasterEgg;
