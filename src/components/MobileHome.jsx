import React from 'react';
import { motion } from 'framer-motion';
import Countdown from './Countdown';
import FloatingParticles from './FloatingParticles';
import RotatingQuotes from './RotatingQuotes';

// Assets
import heroImage from '../assets/hero.jpg';
import beachKiss from '../assets/beach_kiss.jpg';
import beachHug from '../assets/beach_hug.jpg';
import beachHoldHands from '../assets/beach_hold_hands.jpg';
import beachSmile from '../assets/beach_smile.jpg';
import brideBench from '../assets/bride_bench.jpg';

const MobileHome = () => {
  const storyMilestones = [
    {
      year: '2021',
      title: 'A Primeira Tentativa',
      description: 'Em 2021, Jubílio fez a sua primeira tentativa de aproximação, usando como pretexto uma camisola emprestada. Uma estratégia tímida... Mas Deus já tinha o tempo certo preparado.',
      image: beachHoldHands
    },
    {
      year: '2022',
      title: 'O Recomeço',
      description: 'Após uma vigília, Jubílio voltou a falar com Binth. Jubílio revelou seu coração, e em dezembro de 2022, Binth sentiu que estava pronta para dizer "sim".',
      image: beachHug
    },
    {
      year: '2023',
      title: 'O Primeiro Encontro',
      description: 'Tiveram o primeiro encontro como namorados no D\'bambu — o lugar favorito de Jubílio, que se tornou ainda mais especial desde aquele dia.',
      image: beachKiss
    },
    {
      year: '2024',
      title: 'Distância que Fortaleceu',
      description: 'A distância física entre Maputo e Pemba não enfraqueceu o que estavam construindo. Em 5 de dezembro, selaram o propósito de casar com o anel de compromisso.',
      image: beachSmile
    },
    {
        year: '2025',
        title: 'Rumo ao Grande Dia',
        description: '2025 trouxe as famílias mais próximas, o pedido formal e a confirmação de que Deus estava — e sempre esteve — no centro de tudo.',
        image: brideBench
    }
  ];

  return (
    <div className="relative bg-white overflow-hidden pb-10">
      <FloatingParticles count={10} />

      {/* 1. Hero Mobile (100vh) */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 px-6">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-5xl font-serif text-white mb-4 leading-tight"
          >
            Binth <br /> <span className="text-gold">&</span> <br /> Jubílio
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-12 h-[2px] bg-gold mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white text-lg tracking-[0.2em] font-light mb-8"
          >
            07.03.2026
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="animate-bounce"
          >
            <div className="text-white/60 text-sm">Role para conhecer nossa história</div>
            <div className="text-gold text-2xl">↓</div>
          </motion.div>
        </div>
      </section>

      {/* 2. Welcome Message */}
      <section className="py-20 px-8 bg-neutral-50 text-center">
        <motion.h2 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="text-3xl font-serif text-neutral-800 mb-6"
        >
          Bem-vindos
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-600 leading-relaxed font-light"
        >
          Com grande alegria, convidamo-lo para celebrar connosco o nosso casamento. 
          Que a nossa história te inspire tanto quanto nos inspira.
        </motion.p>
      </section>

      {/* 3. Interleaved Story & Photos */}
      <div className="space-y-0">
        {storyMilestones.map((milestone, index) => (
          <React.Fragment key={index}>
            {/* Story Card */}
            <div className="px-8 py-20 bg-white">
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-4"
              >
                <span className="text-gold font-serif text-5xl opacity-40 leading-none">
                  {milestone.year}
                </span>
                <h3 className="text-2xl font-serif text-neutral-800">
                  {milestone.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {milestone.description}
                </p>
              </motion.div>
            </div>

            {/* Photo Section (Interleaved) */}
            <div className="h-[70vh] relative overflow-hidden">
               <motion.div
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${milestone.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
               />
               <div className="absolute inset-0 bg-black/10" />
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* 4. Final Story Section */}
      <section className="py-24 px-8 bg-gold/5 text-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
         >
            <h3 className="text-2xl font-serif text-gold mb-4 italic">O Tempo Perfeito</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
               "Uma história escrita com paciência, graça e amor que amadureceu no tempo perfeito."
            </p>
         </motion.div>
      </section>

      {/* 5. Event Details (Integrated) */}
      <section className="py-20 px-8 bg-white overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <h2 className="text-3xl font-serif text-neutral-800 mb-2">O Grande Dia</h2>
          <div className="w-12 h-[2px] bg-gold mx-auto" />
        </motion.div>

        <div className="space-y-12">
          {/* Ceremony */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-neutral-50 p-6 rounded-3xl border border-gold/10"
          >
            <h3 className="text-xl font-serif text-gold mb-4 flex items-center">
              <span className="mr-2">💒</span> Cerimônia
            </h3>
            <div className="space-y-3 text-gray-600 text-sm">
              <p><span className="font-semibold text-neutral-800">Local:</span> MEA Congregação de Mateque</p>
              <p><span className="font-semibold text-neutral-800">Horário:</span> 10:00h</p>
              <p><span className="font-semibold text-neutral-800">Traje:</span> Passeio Completo</p>
            </div>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=MEA+Congregação+de+Mateque"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center text-gold font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm"
            >
              📍 Ver no Mapa
            </a>
          </motion.div>

          {/* Reception */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-neutral-50 p-6 rounded-3xl border border-gold/10"
          >
            <h3 className="text-xl font-serif text-gold mb-4 flex items-center">
              <span className="mr-2">🥂</span> Recepção
            </h3>
            <div className="space-y-3 text-gray-600 text-sm">
              <p><span className="font-semibold text-neutral-800">Local:</span> THAYANA Eventos</p>
              <p><span className="font-semibold text-neutral-800">Horário:</span> 14:00h</p>
              <p><span className="font-semibold text-neutral-800">Destaque:</span> Celebração e Confraternização</p>
            </div>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=THAYANA+Eventos" 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center text-gold font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm"
            >
              📍 Ver no Mapa
            </a>
          </motion.div>
        </div>
      </section>

      {/* 6. Countdown Mobile */}
      <section className="py-20 bg-neutral-50">
        <div className="px-6 text-center mb-10">
          <h2 className="text-3xl font-serif text-neutral-800">
             Faltam apenas...
          </h2>
        </div>
        <Countdown targetDate="2026-03-07T10:00:00" />
      </section>

      {/* 7. Rotating Quotes */}
      <div className="px-6 pb-20">
        <RotatingQuotes />
      </div>
    </div>
  );
};

export default MobileHome;
