import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvent } from '../contexts/EventContext';

const Presentes = () => {
  const { eventData } = useEvent();
  
  const brideName = eventData?.bride_name || 'Binth';
  const groomName = eventData?.groom_name || 'Jubílio';
  const pixKey = eventData?.pix_key || 'jubilio.pix@email.com';

  const defaultGiftCategories = [
    {
      title: 'Casa das Loiças',
      icon: '🍽️',
      description: 'Sugestões de itens para equipar a nossa cozinha e mesa.',
      items: [
        { name: 'Tostadeira', icon: '🥪' },
        { name: 'Torreadeira', icon: '🍞' },
        { name: 'Air-fryer', icon: '🍟' },
        { name: 'Chaleira elétrica', icon: '🫖' },
        { name: 'Dispensador de cereais', icon: '🥣' },
        { name: 'Panelas com tampa de vidro', icon: '🥘' },
        { name: 'Jogo de talheres', icon: '🍴' },
        { name: 'Pratos de porcelana', icon: '🍽️' },
        { name: 'Taças de vidro', icon: '🥂' },
        { name: 'Chávenas', icon: '☕' },
        { name: 'Varinha mágica', icon: '🪄' },
        { name: 'Boleiro', icon: '🍰' },
      ],
    },
    {
      title: 'Loja da Hisense',
      icon: '📺',
      description: 'Complementos e aparelhos eletrónicos para o nosso lar.',
      items: [
        { name: 'Geleira', icon: '❄️' },
        { name: 'Geladeira', icon: '🍦' },
        { name: 'Micro-ondas', icon: '⏲️' },
        { name: 'TV', icon: '📺' },
        { name: 'AC', icon: '🌬️' },
      ],
    },
    {
      title: 'Experiências & Memórias',
      icon: '✈️',
      description: 'Presentes que se transformam em momentos inesquecíveis.',
      items: [
        { name: 'Contribuição para Lua-de-mel', icon: '🏝️' },
        { name: 'Jantar Romântico', icon: '🍷' },
        { name: 'Sessão Fotográfica', icon: '📸' },
        { name: 'Fundo "Primeiros Dias"', icon: '💝' },
      ],
    },
  ];

  const giftCategories = (eventData?.gift_list_json && eventData.gift_list_json.length > 0) 
    ? eventData.gift_list_json 
    : defaultGiftCategories;

  return (
    <div className="pt-24 pb-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-8"
        >
          Lista de Presentes
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12 bg-gradient-to-r from-gold/10 to-gold/5 p-8 rounded-2xl border-l-4 border-gold"
        >
          <p className="text-xl font-serif text-neutral-gray mb-4 italic text-center">
            A vossa presença será sempre o nosso maior presente.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Estamos a iniciar a nossa vida juntos com simplicidade, amor e propósito. Optámos por preparar uma lista leve, prática e pensada para acompanhar esta nova etapa da nossa família.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Esta lista existe apenas para quem desejar abençoar o nosso caminho. Cada gesto, grande ou pequeno, será recebido com gratidão e carinho.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h3 className="text-2xl font-serif text-center text-neutral-gray mb-8">
            Formas de Contribuição
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-neutral-gray mb-4">Transferência Bancária</h3>
              <div className="space-y-4 text-gray-600 text-sm">
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-gold mb-1">Conta {groomName}</p>
                  <p><span className="font-bold">Banco:</span> {eventData?.bank_name || 'Millennium BIM'}</p>
                  <p><span className="font-bold">NIB:</span> {eventData?.bank_nib || '000100000040665901857'}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-bold text-xs uppercase tracking-wider text-gold mb-1">PIX / Chave Digital</p>
                  <p><span className="font-bold">Chave:</span> {pixKey}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-600 font-bold text-2xl">M</span>
              </div>
              <h3 className="text-xl font-serif text-neutral-gray mb-4">M-Pesa / Mobile Money</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-bold">Número:</span> {eventData?.mobile_money_number || '84 577 9565'}</p>
                <p><span className="font-bold">Nome:</span> {brideName}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {giftCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">{category.icon}</span>
                <h2 className="text-2xl md:text-3xl font-serif text-neutral-gray mb-3">
                  {category.title}
                </h2>
                <p className="text-gray-500 italic">{category.description}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: itemIndex * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{item.icon}</span>
                      <p className="text-gray-700 leading-relaxed pt-1">{item.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-16 bg-white p-8 rounded-2xl shadow-lg text-center border-t-4 border-gold"
        >
          <p className="text-lg font-serif text-neutral-gray italic leading-relaxed mb-4">
            Estamos a construir a nossa casa com fé, calma e sabedoria.<br />
            Cada gesto, oração e palavra de carinho fazem parte da nossa caminhada.
          </p>
          <p className="text-gold font-semibold">
            Obrigado por celebrarem este dia connosco e por fazerem parte da nossa história.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Presentes;
