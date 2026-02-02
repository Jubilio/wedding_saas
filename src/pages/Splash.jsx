import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import weddingLogo from '../assets/wedding_icon/wedding_icon.png';

const Splash = ({ isAutomatic = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/music/someday.mp3');
    audioRef.current.loop = true;

    // If automatic, try to play and countdown
    if (isAutomatic) {
      // Set preference immediately so MusicPlayer picks it up later
      localStorage.setItem('musicPlaying', 'true');
      
      const play = () => {
        if (!audioRef.current) return;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
            window.removeEventListener('click', play);
            window.removeEventListener('touchstart', play);
          }).catch(() => {
            console.log("Autoplay waiting for interaction in Splash...");
          });
        }
      };

      // Try autoplay
      play();

      // Listen for interaction to unlock if blocked
      window.addEventListener('click', play);
      window.addEventListener('touchstart', play);

      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => {
        clearInterval(timer);
        window.removeEventListener('click', play);
        window.removeEventListener('touchstart', play);
        if (audioRef.current) audioRef.current.pause();
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isAutomatic]);

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
          .catch(() => {
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
            .catch(() => {
              console.log("Playback failed");
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
        className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-16 max-w-2xl w-full mx-auto"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="text-center">
          {/* Logo Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 md:mb-8 flex justify-center"
          >
            <img 
              src={weddingLogo} 
              alt="B&J Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
          </motion.div>
          
          {/* Parents Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8 md:mb-10 text-neutral-gray/80"
          >
            <p className="text-[10px] md:text-sm font-serif italic mb-4 md:mb-6 tracking-wide">
              Com a Benção de Deus e de Seus Pais,
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-8">
              <div className="text-center">
                <p className="text-[11px] md:text-base font-medium tracking-tight">Ana V. Ngovene</p>
                <p className="text-[11px] md:text-base font-medium tracking-tight">Mário H. Buque</p>
              </div>

              <span className="text-base md:text-xl text-gold font-serif italic opacity-60 my-0.5 md:my-0">&</span>

              <div className="text-center">
                <p className="text-[11px] md:text-base font-medium tracking-tight">Cezartina S. Sitoe</p>
                <p className="text-[11px] md:text-base font-medium tracking-tight">Filiano J. Maússe</p>
              </div>
            </div>
          </motion.div>

          {/* Names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 md:mb-12"
          >
            <h1 className="text-4xl md:text-7xl font-serif text-neutral-gray mb-2 md:mb-4">
              Binth
            </h1>
            <div className="flex items-center justify-center gap-3 md:gap-4 my-4 md:my-6">
              <div className="w-12 md:w-16 h-px bg-neutral-gray/30"></div>
              <span className="text-xl md:text-2xl text-neutral-gray/50 font-light">&</span>
              <div className="w-12 md:w-16 h-px bg-neutral-gray/30"></div>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif text-neutral-gray">
              Jubílio
            </h1>
          </motion.div>

          {/* Date */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-10 md:mb-16"
          >
            <div className="w-px h-8 md:h-12 bg-neutral-gray/20 mx-auto mb-3 md:mb-4"></div>
            <p className="text-xs md:text-base tracking-[0.3em] text-neutral-gray/70 uppercase">
              07 • Março • 2026
            </p>
            <div className="w-px h-8 md:h-12 bg-neutral-gray/20 mx-auto mt-3 md:mb-4"></div>
          </motion.div>

          {/* Button with pulse animation or Countdown */}
          {!isAutomatic ? (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
              }}
              transition={{ duration: 0.8, delay: 0.9 }}
              onClick={handleEnter}
              className="relative bg-neutral-gray text-white px-10 md:px-12 py-3 md:py-4 rounded-full text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
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
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col items-center gap-3 md:gap-4"
            >
              <div className="flex items-center gap-2 md:gap-3 text-gold">
                <div className="animate-spin w-4 h-4 md:w-5 md:h-5 border-2 border-gold border-t-transparent rounded-full"></div>
                <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold">Carregando seu convite</span>
              </div>
              <p className="text-[9px] md:text-[10px] text-neutral-gray/40 uppercase tracking-widest">
                Aguarde {countdown} segundos...
              </p>
            </motion.div>
          )}
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
