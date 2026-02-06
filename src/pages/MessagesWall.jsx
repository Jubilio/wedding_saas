import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import FloatingParticles from '../components/FloatingParticles';
import { Send, Plus, X, Camera, Heart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEvent } from '../contexts/EventContext';

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
  const { eventData } = useEvent();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
          .select('id, name, message, created_at, image_url, likes_count')
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
          image_url: m.image_url,
          likes_count: m.likes_count || 0,
          date: new Date(m.created_at),
          color: getRandomColor(),
          is_public: true
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande! Máximo 5MB');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLike = async (msgId, isPublic) => {
    if (!isPublic) return; // RSVPs are immutable here for simplicity

    // Optimistic update
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, likes_count: (m.likes_count || 0) + 1 } : m
    ));

    try {
      const { data } = await supabase
        .from('public_messages')
        .select('likes_count')
        .eq('id', msgId)
        .single();
      
      await supabase
        .from('public_messages')
        .update({ likes_count: (data?.likes_count || 0) + 1 })
        .eq('id', msgId);
    } catch (err) {
      console.error('Error liking:', err);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `mural/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('wedding-assets')
      .upload(fileName, selectedFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('wedding-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newName || !newMessage) {
      toast.error('Preencha seu nome e a mensagem!');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from('public_messages')
        .insert([{ 
          name: newName, 
          message: newMessage, 
          image_url: imageUrl,
          event_id: eventData?.id 
        }]);

      if (error) throw error;

      toast.success('Mensagem enviada com carinho! ❤️');
      setNewName('');
      setNewMessage('');
      setSelectedFile(null);
      setImagePreview(null);
      setShowModal(false);
      
      // Refresh list locally instead of reload
      const fetchMessages = async () => {
        // ... same fetch logic but maybe just append would be better. 
        // For now, reload is simpler but let's just use window.location.reload() 
        // as per original file or just fetch again.
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
                className={`break-inside-avoid rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border ${msg.color} relative group overflow-hidden ${msg.image_url ? 'pt-4 px-4 pb-6' : 'p-8'}`}
              >
                {msg.image_url && (
                  <div className="mb-4 overflow-hidden rounded-xl bg-white p-2 shadow-inner group-hover:rotate-1 transition-transform duration-500">
                    <img 
                      src={msg.image_url} 
                      alt="Polaroid" 
                      className="w-full aspect-[4/3] object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="absolute -top-3 -left-3 text-4xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  ❝
                </div>
                
                <p className="text-gray-700 font-serif text-lg leading-relaxed mb-6 relative z-10">
                  {msg.message}
                </p>
                
                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <div>
                    <p className="font-bold text-gray-800 text-sm italic">~ {msg.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      {msg.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  {msg.is_public && (
                    <button 
                      onClick={() => handleLike(msg.id, true)}
                      className="flex items-center gap-1 group/heart"
                    >
                      <span className="text-xs font-bold text-rose-400 group-hover/heart:scale-110 transition-transform">
                        {msg.likes_count || ''}
                      </span>
                      <Heart className={`w-5 h-5 transition-colors ${msg.likes_count > 0 ? 'fill-rose-400 text-rose-400' : 'text-gray-300 group-hover/heart:text-rose-400'}`} />
                    </button>
                  )}
                  {!msg.is_public && <div className="text-xl opacity-20">🤍</div>}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-serif">Acompanhar com uma foto?</label>
                  <div className="flex flex-col gap-4">
                    {imagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-50 border-2 border-dashed border-gray-200 group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gold/50 transition-all group">
                        <Camera className="w-8 h-8 text-gray-300 group-hover:text-gold transition-colors mb-2" />
                        <span className="text-sm text-gray-400 group-hover:text-gold">Clique para adicionar foto (Opcional)</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

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
