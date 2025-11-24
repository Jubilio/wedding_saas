import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleEnter = () => {
    // Start music when entering the site
    if (audioRef.current && !isPlaying) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            localStorage.setItem('musicPlaying', 'true');
          })
          .catch(error => {
            // Autoplay was prevented, user needs to interact first
            console.log("Autoplay prevented - user interaction required");
          });
      }
    }
    navigate('/home');
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem('musicPlaying', 'false');
      } else {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              localStorage.setItem('musicPlaying', 'true');
            })
            .catch(error => {
              console.log("Playback failed:", error);
            });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center relative overflow-hidden p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border border-gold rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-gold rounded-full"></div>
      </div>

      {/* Card with depth effect */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-16 max-w-2xl w-full"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="text-center">
          {/* Rings Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 flex justify-center"
          >
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="text-gold">
              <circle cx="20" cy="30" r="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="40" cy="30" r="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </motion.div>

          {/* Names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-neutral-gray mb-4">
              Binth
            </h1>
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="w-16 h-px bg-neutral-gray/30"></div>
              <span className="text-2xl text-neutral-gray/50 font-light">&</span>
              <div className="w-16 h-px bg-neutral-gray/30"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-neutral-gray">
              Jubílio
            </h1>
          </motion.div>

          {/* Date */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-16"
          >
            <div className="w-px h-12 bg-neutral-gray/20 mx-auto mb-4"></div>
            <p className="text-sm md:text-base tracking-[0.3em] text-neutral-gray/70 uppercase">
              07 • Março • 2026
            </p>
            <div className="w-px h-12 bg-neutral-gray/20 mx-auto mt-4"></div>
          </motion.div>

          {/* Button with pulse animation */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
            }}
            transition={{ duration: 0.8, delay: 0.9 }}
            onClick={handleEnter}
            className="relative bg-neutral-gray text-white px-12 py-4 rounded-full text-sm tracking-[0.2em] uppercase hover:bg-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {/* Pulsing ring effect */}
            <motion.span
              className="absolute inset-0 rounded-full bg-gold"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="relative z-10">♥ Ver Convite ♥</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Music Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        onClick={toggleMusic}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          isPlaying 
            ? 'border-gold bg-gold/10 text-gold' 
            : 'border-neutral-gray/30 text-neutral-gray hover:border-gold hover:bg-gold/10'
        }`}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};

export default Splash;
