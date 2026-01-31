import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import FloatingParticles from '../components/FloatingParticles';
import { Send, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

const MessagesWall = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // 1. Fetch from rsvps
        const { data: rsvpData, error: rsvpError } = await supabase
          .from('rsvps')
          .select('id, guest_name, message, created_at')
          .not('message', 'is', null)
          .neq('message', '')
          .order('created_at', { ascending: false });

        if (rsvpError) console.error('Error fetching rsvp messages:', rsvpError);

        // 2. Fetch from public_messages
        const { data: publicData, error: publicError } = await supabase
          .from('public_messages')
          .select('id, name, message, created_at')
          .order('created_at', { ascending: false });

        if (publicError) console.error('Error fetching public messages:', publicError);

        // 3. Combine and Format
        const rsvpMsgs = (rsvpData || []).map(m => ({
          id: m.id,
          name: m.guest_name || 'Convidado',
          message: m.message,
          date: new Date(m.created_at),
          color: getRandomColor()
        }));

        const publicMsgs = (publicData || []).map(m => ({
          id: m.id,
          name: m.name,
          message: m.message,
          date: new Date(m.created_at),
          color: getRandomColor()
        }));

        const combined = [...rsvpMsgs, ...publicMsgs].sort((a, b) => b.date - a.date);
        setMessages(combined);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newName || !newMessage) {
      toast.error('Preencha seu nome e a mensagem!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('public_messages')
        .insert([{ name: newName, message: newMessage }]);

      if (error) throw error;

      toast.success('Mensagem enviada com carinho! ❤️');
      setNewName('');
      setNewMessage('');
      setShowModal(false);
      // Refresh list
      const fetchMessages = async () => {
        setIsLoading(true);
        // ... (repeated fetch logic is cleaner with a separate function, but keeping it simple for replacement)
        // For simplicity redirect or just wait for next load. 
        // Actually let's just trigger a local refresh
        window.location.reload(); 
      };
      fetchMessages();
    } catch (error) {
       console.error('Error submitting message:', error);
       toast.error('Erro ao enviar mensagem.');
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16 relative">
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
            className="text-gray-500 text-lg max-w-2xl mx-auto mb-8"
          >
            Palavras de carinho, votos de felicidade e amor dos nossos queridos convidados.
          </motion.p>
          
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-gold text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-gold/20 hover:scale-105 transition-transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Deixar uma Mensagem
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 max-w-2xl mx-auto">
            <p className="text-2xl text-gray-400 font-serif mb-4">O mural ainda está vazio...</p>
            <p className="text-gray-500">Seja o primeiro a deixar uma mensagem!</p>
            <button 
              onClick={() => setShowModal(true)}
              className="inline-block mt-6 px-8 py-3 bg-gold text-white rounded-full hover:bg-gold/90 transition-colors"
            >
              Escrever agora
            </button>
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

      {/* Modal para Nova Mensagem */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-serif text-charcoal mb-6">Deixe seu carinho</h2>
              
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none transition-colors"
                    placeholder="Como devemos te chamar?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-gold focus:outline-none resize-none transition-colors"
                    placeholder="Escreva algo especial para nós..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold text-white font-bold py-4 rounded-xl shadow-lg shadow-gold/20 hover:bg-gold/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesWall;
