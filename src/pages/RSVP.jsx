import React from 'react';
import { motion } from 'framer-motion';
import RSVPForm from '../components/RSVPForm';

const RSVP = () => {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-8"
        >
          Confirme sua Presença
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Por favor, confirme sua presença até o dia 15 de fevereiro de 2026 para que possamos organizar tudo com muito carinho.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RSVPForm />
        </motion.div>
      </div>
    </div>
  );
};

export default RSVP;
