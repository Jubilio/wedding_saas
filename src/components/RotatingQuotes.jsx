import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RotatingQuotes = () => {
  const quotes = [
    "O amor é paciente, o amor é bondoso.",
    "Onde há amor, há vida.",
    "O amor não é apenas olhar um para o outro, mas olhar juntos na mesma direção.",
    "Amar não é olhar um para o outro, é olhar juntos na mesma direção.",
    "O verdadeiro amor nunca se desgasta. Quanto mais se dá, mais se tem.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="py-16 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="relative h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <p className="text-2xl md:text-3xl font-serif italic text-center text-gray-700 px-8">
                "{quotes[currentIndex]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-gold w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RotatingQuotes;
