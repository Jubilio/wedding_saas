import React, { useState, useEffect, useCallback } from 'react';
import { Download, Eye, RefreshCw, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

const TicketsGallery = ({ rsvps, eventId }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    ticket: null
  });

  const fetchTickets = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      // Tickets are stored in a folder structure: tickets/{eventId}/{filename}
      const { data: files, error } = await supabase.storage
        .from('wedding-photos')
        .list(`tickets/${eventId}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        // Folder might not exist yet if no tickets generated
        if (error.message.includes('not found')) {
            setTickets([]);
            return;
        }
        throw error;
      };

      const ticketList = (files || [])
        .filter(file => file.name.endsWith('.png'))
        .map(file => {
          const rsvpId = file.name.replace('ticket-', '').replace('.png', '');
          const rsvp = rsvps.find(r => r.id === rsvpId);
          
          const { data: { publicUrl } } = supabase.storage
            .from('wedding-photos')
            .getPublicUrl(`tickets/${eventId}/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            url: publicUrl,
            rsvpId,
            guestName: rsvp?.guestName || 'Desconhecido',
            inviteLabel: rsvp?.inviteLabel || 'Sem convite',
            createdAt: file.created_at || file.updated_at,
          };
        });

      setTickets(ticketList);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Erro ao carregar tickets.');
    } finally {
      setIsLoading(false);
    }
  }, [rsvps, eventId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleDownload = async (ticket) => {
    try {
      const response = await fetch(ticket.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticket.guestName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Ticket baixado!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Erro ao baixar ticket.');
    }
  };

  const handleDelete = (ticket) => {
    setConfirmModal({
      isOpen: true,
      ticket: ticket
    });
  };

  const confirmDelete = async () => {
    const ticket = confirmModal.ticket;
    if (!ticket || !eventId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from('wedding-photos')
        .remove([`tickets/${eventId}/${ticket.name}`]);

      if (error) throw error;

      toast.success('Ticket removido com sucesso!');
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      setConfirmModal({ isOpen: false, ticket: null });
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast.error('Erro ao remover ticket.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!eventId) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gold">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Galeria de Tickets</h2>
            <p className="text-gray-500">Visualize e baixe todos os tickets gerados para este evento</p>
          </div>
          <button onClick={fetchTickets} disabled={isLoading} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
        <div className="bg-gold/10 p-3 rounded-xl"><ImageIcon className="w-6 h-6 text-gold" /></div>
        <div>
          <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
          <p className="text-gray-500 text-sm">Tickets Gerados</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center"><RefreshCw className="animate-spin text-gold mx-auto" /></div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum ticket gerado ainda para este evento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-lg overflow-hidden relative group">
              <div className="aspect-[3/4] cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                <img src={ticket.url} alt={ticket.guestName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 border-t">
                <h3 className="font-bold text-sm truncate">{ticket.guestName}</h3>
                <div className="flex gap-2 mt-3">
                   <button onClick={() => handleDownload(ticket)} className="flex-1 bg-gold text-white text-xs py-2 rounded-lg font-bold">Baixar</button>
                   <button onClick={() => handleDelete(ticket)} className="bg-red-50 text-red-500 p-2 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedTicket(null)}>
           <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <img src={selectedTicket.url} alt="Ticket Full" className="w-full h-auto rounded-xl" />
              <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 bg-white rounded-full p-2"><X size={20} /></button>
           </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, ticket: null })} onConfirm={confirmDelete} title="Excluir Ticket?" message="Deseja realmente apagar este ticket?" confirmText="Sim, Apagar" isDangerous={true} isLoading={isDeleting} />
    </div>
  );
};

export default TicketsGallery;
