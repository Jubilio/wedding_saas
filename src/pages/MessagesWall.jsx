import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import FloatingParticles from '../components/FloatingParticles';

const MessagesWall = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from Local Storage (DEV_MODE persistence)
    const localData = JSON.parse(localStorage.getItem('mock_rsvps') || '[]');
    
    // In a real scenario, we would merge with Firestore here.
    // For now, let's prioritize local data since we are in simulated mode.
    
    const validMessages = localData
      .filter(rsvp => rsvp.message && rsvp.message.trim().length > 0)
      .map(rsvp => ({
        id: rsvp.id,
        name: rsvp.name,
        message: rsvp.message,
        date: new Date(rsvp.timestamp),
        color: getRandomColor() // Assign a random pastel color
      }))
      .sort((a, b) => b.date - a.date);

    setMessages(validMessages);
    setIsLoading(false);
  }, []);

  // Pastel colors for cards
  const colors = [
    'bg-rose-50 border-rose-100',
    'bg-blue-50 border-blue-100', 
    'bg-amber-50 border-amber-100',
    'bg-emerald-50 border-emerald-100',
    'bg-purple-50 border-purple-100',
    'bg-pink-50 border-pink-100'
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-6xl text-charcoal mb-4"
          >
            Mural de Afeto
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Palavras de carinho, votos de felicidade e amor dos nossos queridos convidados.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 max-w-2xl mx-auto">
            <p className="text-2xl text-gray-400 font-serif mb-4">O mural ainda está vazio...</p>
            <p className="text-gray-500">Seja o primeiro a deixar uma mensagem confirmando sua presença!</p>
            <a href="/rsvp" className="inline-block mt-6 px-8 py-3 bg-gold text-white rounded-full hover:bg-gold/90 transition-colors">
              Deixar uma Mensagem
            </a>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`break-inside-avoid rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border ${msg.color} relative group`}
              >
                <div className="absolute -top-3 -left-3 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                  ❝
                </div>
                
                <p className="text-gray-700 font-serif text-lg leading-relaxed mb-6 relative z-10">
                  {msg.message}
                </p>
                
                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{msg.name}</p>
                    <p className="text-xs text-gray-400">
                      {msg.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div className="text-2xl opacity-50">
                    ❤️
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesWall;
