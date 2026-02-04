import React from 'react';
import { motion } from 'framer-motion';
import { useEvent } from '../contexts/EventContext';

const Evento = () => {
  const { eventData } = useEvent();
  
  const eventDate = eventData?.date 
    ? new Date(eventData.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '07 de Março de 2026';

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
          {eventData?.groom_name && eventData?.bride_name 
            ? `O grande dia de ${eventData.bride_name} & ${eventData.groom_name}`
            : 'Celebraremos nosso amor em dois momentos especiais'}
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
                  {eventDate}
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">🕐 Horário:</span>
                  {eventData?.ceremony_time || '10:00'}
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">📍 Local:</span>
                  {eventData?.venue_name || 'Local a Confirmar'}<br />
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">👔 Dress Code:</span>
                  {eventData?.dress_code || 'Passeio Completo / Formal'}
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-80 md:h-auto rounded-2xl overflow-hidden shadow-lg border border-gray-100"
            >
              {eventData?.google_maps_url ? (
                <iframe
                  src={eventData.google_maps_url.includes('embed') ? eventData.google_maps_url : `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(eventData.venue_name)}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa do Local"
                ></iframe>
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                   <p>Mapa não configurado</p>
                </div>
              )}
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
                  {eventDate}
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">🕐 Horário:</span>
                  {eventData?.reception_time || '14:00'}
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-neutral-gray">📍 Local:</span>
                  {eventData?.reception_venue || eventData?.venue_address || 'Local a Confirmar'}<br />
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
              className="h-80 md:h-auto rounded-2xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center text-gray-400"
            >
               <p>Informações de localização da recepção</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evento;
