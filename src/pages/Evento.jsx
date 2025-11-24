import React from 'react';
import { motion } from 'framer-motion';

const Evento = () => {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-8"
        >
          Informações do Evento
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-600 mb-16 max-w-2xl mx-auto"
        >
          Celebraremos nosso amor em dois momentos especiais
        </motion.p>

        {/* Cerimônia */}
        <div className="max-w-6xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-serif text-center text-gold mb-8"
          >
            Cerimônia Religiosa e Civil
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-2xl font-serif text-neutral-gray mb-6">Detalhes</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">📅 Data:</span>
                  07 de Março de 2026
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">🕐 Horário:</span>
                  10:00
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">📍 Local:</span>
                  MEA Congregação de Mateque<br />
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">👔 Dress Code:</span>
                  Passeio Completo / Formal
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-80 md:h-auto rounded-2xl overflow-hidden shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x1ee6950064394cff%3A0x371c750d8ad6a371!2sMEA%20Congrega%C3%A7%C3%A3o%20de%20Mateque!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee6950064394cff%3A0x371c750d8ad6a371!2sMEA%20Congrega%C3%A7%C3%A3o%20de%20Mateque!5e0!3m2!1spt-PT!2smz!4v1700000000000!5m2!1spt-PT!2smz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa - MEA Congregação de Mateque"
              ></iframe>
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center my-16">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4">
            <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Recepção */}
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-serif text-center text-gold mb-8"
          >
            Recepção (Copo d'Água)
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-2xl font-serif text-neutral-gray mb-6">Detalhes</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">📅 Data:</span>
                  07 de Março de 2026
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">🕐 Horário:</span>
                  12:00
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">📍 Local:</span>
                  THAYANA Eventos<br />
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">🎉 Ambiente:</span>
                  Celebração e confraternização
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-80 md:h-auto rounded-2xl overflow-hidden shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x1ee68ddc04d30457%3A0xc99972a103bd0b80!2sTHAYANA%20Eventos!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee68ddc04d30457%3A0xc99972a103bd0b80!2sTHAYANA%20Eventos!5e0!3m2!1spt-PT!2smz!4v1700000000000!5m2!1spt-PT!2smz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa - THAYANA Eventos"
              ></iframe>
            </motion.div>
          </div>
        </div>

        {/* Notas Importantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-gold/10 to-gold/5 p-8 rounded-2xl"
        >
          <h3 className="text-xl font-serif text-neutral-gray mb-4 text-center">📌 Notas Importantes</h3>
          <ul className="space-y-2 text-gray-600 text-center">
            <li>• A cerimônia religiosa e civil acontecerão no mesmo local (MEA Mateque)</li>
            <li>• Após a cerimônia, seguiremos para a recepção no THAYANA Eventos</li>
            <li>• Recomendamos chegar com 15 minutos de antecedência</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Evento;
