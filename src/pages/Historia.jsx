import React from 'react';
import { motion } from 'framer-motion';
import { useEvent } from '../contexts/EventContext';
import beachPhoto from '../assets/beach_smile.jpg';
import DecorativeDivider from '../components/DecorativeDivider';

const Historia = () => {
  const { eventData } = useEvent();
  
  const brideName = eventData?.bride_name || 'Binth';
  const groomName = eventData?.groom_name || 'Jubílio';

  // Fallback story if none exists in DB
  const defaultMilestones = [
    {
      year: '2021',
      title: 'A Primeira Tentativa',
      description: `Em 2021, ${groomName} fez a sua primeira tentativa de aproximação, usando como pretexto uma camisola emprestada. Uma estratégia tímida... Mas Deus já tinha o tempo certo preparado.`,
      image: beachPhoto
    },
    {
      year: '2022',
      title: 'O Recomeço',
      description: `Após uma vigília, ${groomName} voltou a falar com ${brideName}. Ele revelou seu coração, e em dezembro de 2022, ela sentiu que estava pronta para dizer "sim".`,
      image: beachPhoto
    },
    {
       year: eventData?.date ? new Date(eventData.date).getFullYear().toString() : '2026',
       title: 'O Grande Dia',
       description: 'Onde o "para sempre" começa oficialmente diante de Deus e dos homens.',
       image: beachPhoto
    }
  ];

  const storyMilestones = eventData?.story_json?.length > 0 
    ? eventData.story_json 
    : defaultMilestones;

  return (
    <div className="pt-24 pb-20 bg-gradient-to-b from-white to-gray-50 text-neutral-gray">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center mb-8"
        >
          Nossa História
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gold italic mb-16 max-w-2xl mx-auto"
        >
          Uma história escrita com paciência, graça e amor que amadureceu no tempo perfeito
        </motion.p>

        <div className="mb-16 flex justify-center">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            src={eventData?.story_cover_url || eventData?.hero_image_url || beachPhoto} 
            alt={`${brideName} e ${groomName}`}
            className="rounded-3xl shadow-2xl max-h-[500px] w-full max-w-4xl object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2rem] shadow-xl border-l-8 border-gold relative overflow-hidden"
          >
            <p className="text-gray-700 leading-relaxed text-xl relative z-10">
              {eventData?.story_intro || `Esta história começa no desejo de ${groomName}, no desenho silencioso da mulher que ele sonhava ter ao seu lado, e em Deus, que com toda a Sua graça, confirmou esse sonho.`}
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16" />
          </motion.div>

          <DecorativeDivider variant="hearts" />

          {storyMilestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="md:w-1/3 text-center md:text-right">
                <span className="text-6xl font-serif text-gold/20 font-black block leading-none">{milestone.year}</span>
                <h3 className="text-2xl font-serif mt-2">{milestone.title}</h3>
              </div>
              
              <div className="md:w-2/3 bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          ))}

          <DecorativeDivider variant="rings" />

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gold/20 via-gold/5 to-white p-12 rounded-[2.5rem] text-center mt-12 border border-gold/10 shadow-sm"
          >
            <p className="text-2xl font-serif italic leading-relaxed text-neutral-gray mb-4">
              "Amor que amadureceu no tempo perfeito."
            </p>
            <p className="text-gold font-bold tracking-widest uppercase text-sm">
                Rumo ao Casamento de {brideName} & {groomName}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Historia;
