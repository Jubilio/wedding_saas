import React, { useState, useEffect, useCallback } from 'react';
import { Download, Eye, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const TicketsGallery = ({ rsvps }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    ticket: null
  });

  // Fetch all tickets from Supabase Storage
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: files, error } = await supabase.storage
        .from('wedding-photos')
        .list('tickets', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Map files to ticket objects with URLs and guest info
      const ticketList = (files || [])
        .filter(file => file.name.endsWith('.png'))
        .map(file => {
          // Extract RSVP ID from filename (ticket-{rsvpId}.png)
          const rsvpId = file.name.replace('ticket-', '').replace('.png', '');
          const rsvp = rsvps.find(r => r.id === rsvpId);
          
          const { data: { publicUrl } } = supabase.storage
            .from('wedding-photos')
            .getPublicUrl(`tickets/${file.name}`);

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
  }, [rsvps]);

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
    if (!ticket) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from('wedding-photos')
        .remove([`tickets/${ticket.name}`]);

      if (error) throw error;

      toast.success('Ticket removido com sucesso!');
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      setConfirmModal({ isOpen: false, ticket: null });
      if (selectedTicket?.id === ticket.id) setSelectedTicket(null);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast.error('Erro ao remover ticket.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gold">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Galeria de Tickets</h2>
            <p className="text-gray-500">Visualize e baixe todos os tickets gerados</p>
          </div>
          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <div className="bg-gold/10 p-3 rounded-xl">
            <ImageIcon className="w-6 h-6 text-gold" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
            <p className="text-gray-500 text-sm">Tickets Gerados</p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum ticket gerado ainda.</p>
          <p className="text-gray-300 text-sm">Os tickets aparecem aqui quando os convidados baixam ou compartilham seus convites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow"
            >
              {/* Thumbnail */}
              <div 
                className="relative aspect-[3/4] bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setSelectedTicket(ticket)}
              >
                <img
                  src={ticket.url}
                  alt={`Ticket de ${ticket.guestName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{ticket.guestName}</h3>
                <p className="text-xs text-gray-400 truncate mb-3">{ticket.inviteLabel}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(ticket)}
                    className="flex-1 bg-gold/10 hover:bg-gold/20 text-gold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                  <button
                    onClick={() => handleDelete(ticket)}
                    className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-all active:scale-95"
                    title="Excluir ticket"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, ticket: null })}
        onConfirm={confirmDelete}
        title="Excluir Ticket Permanente?"
        message={`Deseja realmente apagar o ticket de ${confirmModal.ticket?.guestName}? O arquivo será removido do servidor.`}
        confirmText="Sim, Apagar"
        isDangerous={true}
        isLoading={isDeleting}
      />

      {/* Lightbox Modal */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedTicket(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedTicket.url}
              alt={`Ticket de ${selectedTicket.guestName}`}
              className="w-full h-auto"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownload(selectedTicket)}
                className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-white border-t">
              <h3 className="font-bold text-gray-800">{selectedTicket.guestName}</h3>
              <p className="text-sm text-gray-500">{selectedTicket.inviteLabel}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsGallery;
