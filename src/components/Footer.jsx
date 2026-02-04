import React from 'react';
import { useEvent } from '../contexts/EventContext';
import { motion } from 'framer-motion';

const Footer = () => {
  const { eventData } = useEvent();
  return (
    <footer className="bg-gradient-to-br from-neutral-gray to-gray-800 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        {/* Copyright */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-gray-400"
          >
            © {new Date().getFullYear()} {eventData?.title || 'Binth & Jubílio'} • {eventData?.wedding_date 
              ? new Date(eventData.wedding_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
              : '07 de Março de 2026'} • Maputo, Moçambique
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs text-gold mt-2"
          >
            Feito com ♥ para celebrar nosso amor
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
