import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Countdown from '../components/Countdown';
import FloatingParticles from '../components/FloatingParticles';
import RotatingQuotes from '../components/RotatingQuotes';
import heroImage from '../assets/hero.jpg';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="pt-16 relative">
      <FloatingParticles count={15} />
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        {/* Content (Fixed, not affected by parallax) */}
        <div className="max-w-4xl px-4 relative z-10">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif mb-4"
          >
            Binth & Jubílio
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl mb-2"
          >
            07 de Março de 2026
          </motion.p>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-lg md:text-xl"
          >
            Maputo, Moçambique
          </motion.p>
          
          {/* Save the Date Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
            className="mt-8"
          >
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gold blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-full px-8 py-3">
                <p className="text-white font-serif text-sm tracking-widest uppercase">
                  ✨ Save the Date ✨
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Welcome Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4"
      >
        <div className="container mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif text-neutral-gray mb-6"
          >
            <span className="font-light">Bem-</span><span className="font-bold">vindos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            <span className="float-left text-6xl font-serif text-gold leading-none pr-2 pt-1">C</span>
            om grande alegria, convidamo-lo/a para celebrar connosco o nosso casamento.
            Será uma honra partilhar este momento especial com pessoas tão queridas.
          </motion.p>
        </div>
      </motion.section>

      {/* Countdown Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gold/5"
      >
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-12"
          >
            <span className="font-light">Contagem</span> <span className="font-bold text-gold">Regressiva</span>
          </motion.h2>
          <Countdown targetDate="2026-03-07T10:00:00" />
        </div>
      </motion.section>

      {/* Rotating Quotes */}
      <RotatingQuotes />
    </div>
  );
};

export default Home;
