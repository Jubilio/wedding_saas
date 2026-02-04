import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  MessageSquare, 
  RefreshCw, 
  Search,
  User,
  Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

const MessagesManagement = ({ eventId }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    messageData: null
  });

  const fetchMessages = useCallback(async () => {
    if (!eventId) return;
    setIsRefreshing(true);
    try {
      // 1. Fetch from rsvps
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('id, guest_name, message, created_at')
        .eq('event_id', eventId)
        .not('message', 'is', null)
        .neq('message', '');

      if (rsvpError) console.error('Error fetching RSVP messages:', rsvpError);

      // 2. Fetch from public_messages
      const { data: publicData, error: publicError } = await supabase
        .from('public_messages')
        .select('id, name, message, created_at')
        .eq('event_id', eventId);

      if (publicError) console.error('Error fetching public messages:', publicError);

      // 3. Combine and tag
      const rsvpMsgs = (rsvpData || []).map(m => ({
        id: m.id,
        name: m.guest_name,
        message: m.message,
        date: new Date(m.created_at),
        type: 'rsvp',
        originalId: m.id
      }));

      const publicMsgs = (publicData || []).map(m => ({
        id: `public-${m.id}`,
        name: m.name,
        message: m.message,
        date: new Date(m.created_at),
        type: 'public',
        originalId: m.id
      }));

      const combined = [...rsvpMsgs, ...publicMsgs].sort((a, b) => b.date - a.date);
      setMessages(combined);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao buscar mensagens.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = (msg) => {
    setConfirmModal({
      isOpen: true,
      messageData: msg
    });
  };

  const confirmDelete = async () => {
    const msg = confirmModal.messageData;
    if (!msg) return;

    setIsDeleting(true);
    try {
      if (msg.type === 'rsvp') {
        const { error } = await supabase
          .from('rsvps')
          .update({ message: null })
          .eq('id', msg.originalId)
          .eq('event_id', eventId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('public_messages')
          .delete()
          .eq('id', msg.originalId)
          .eq('event_id', eventId);
        
        if (error) throw error;
      }

      toast.success('Mensagem removida com sucesso!');
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      setConfirmModal({ isOpen: false, messageData: null });
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Erro ao remover mensagem.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <RefreshCw className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-xl focus:border-gold outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-gold outline-none bg-white font-medium"
            >
              <option value="all">Todas as Fontes</option>
              <option value="rsvp">💬 RSVP</option>
              <option value="public">🌍 Mural</option>
            </select>
          </div>
          <button onClick={fetchMessages} disabled={isRefreshing} className="p-2.5 bg-gray-50 text-gray-400 hover:text-gold rounded-xl transition-all">
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="break-inside-avoid bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${msg.type === 'rsvp' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} flex items-center gap-1`}>
                {msg.type === 'rsvp' ? <User size={10} /> : <Globe size={10} />}
                {msg.type === 'rsvp' ? 'RSVP' : 'Público'}
              </span>
              <button onClick={() => handleDelete(msg)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
            </div>
            <p className="text-gray-700 font-serif leading-relaxed mb-4 text-sm">"{msg.message}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400">
              <span className="font-bold text-gray-800">{msg.name}</span>
              <span>{msg.date.toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Nenhuma mensagem encontrada.</p>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, messageData: null })}
        onConfirm={confirmDelete}
        title="Remover Mensagem?"
        message="Tem certeza que deseja remover esta mensagem? Esta ação não pode ser desfeita."
        confirmText="Sim, Remover"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MessagesManagement;
