import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Check, 
  X, 
  LogOut, 
  RefreshCw, 
  MessageSquare,
  Search,
  Download,
  Link as LinkIcon,
  Layout
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, onAuthStateChange, signOut } from '../lib/supabase';
import AdminLogin from '../components/AdminLogin';
import InviteModal from '../components/InviteModal';
import TableManagement from '../components/TableManagement';
import SeatingChart from '../components/SeatingChart';
import TicketsGallery from '../components/TicketsGallery';
import MessagesManagement from '../components/MessagesManagement';
import ConfirmModal from '../components/ConfirmModal';
import StoryManagement from '../components/StoryManagement';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Multi-tenant states
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [invites, setInvites] = useState([]);
  const [rsvps, setRSVPs] = useState([]);
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get('slug');
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // RSVP Filters
  const [rsvpSearchTerm, setRsvpSearchTerm] = useState('');
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvite, setEditingInvite] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirmar',
    isDangerous: false
  });

  const fetchRSVPs = React.useCallback(async () => {
    if (!selectedEvent?.id) return;
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        table_assignment,
        invites ( label, token )
      `)
      .eq('event_id', selectedEvent.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching RSVPs:", error);
      return;
    }
    
    const flattened = data.map(r => ({
      ...r,
      guestName: r.guest_name || 'Desconhecido',
      inviteLabel: r.invites?.label || 'Sem Convite',
      tableAssignment: r.table_assignment,
      timestamp: new Date(r.created_at)
    }));
    
    setRSVPs(flattened);
  }, [selectedEvent?.id]);

  const fetchInvites = React.useCallback(async () => {
    if (!selectedEvent?.id) return;
    const { data, error } = await supabase
      .from('invites')
      .select(`
        *,
        guests (*)
      `)
      .eq('event_id', selectedEvent.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching invites:", error);
    } else {
      setInvites(data || []);
    }
  }, [selectedEvent?.id]);

  const fetchEvents = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data?.length > 0) {
        // If slug param exists, try to find that specific event
        if (slugParam) {
           const found = data.find(ev => ev.slug === slugParam);
           if (found) {
             setSelectedEvent(found);
           } else {
             setSelectedEvent(data[0]);
           }
        } else if (!selectedEvent) {
          setSelectedEvent(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Erro ao carregar eventos.");
    }
  }, [selectedEvent, slugParam]);

  const fetchData = React.useCallback(async () => {
    if (!selectedEvent) return;
    setIsRefreshing(true);
    try {
      await Promise.all([fetchRSVPs(), fetchInvites()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedEvent, fetchRSVPs, fetchInvites]);

  // Effects
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEvents();
    }
  }, [isAuthenticated, user, fetchEvents]);

  useEffect(() => {
    if (selectedEvent) {
      fetchData();
    }
  }, [selectedEvent, fetchData]);

  const handleOpenAddModal = () => {
    setEditingInvite(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (invite) => {
    setEditingInvite(invite);
    setIsModalOpen(true);
  };

  const handleSaveInvite = async (formData) => {
    if (!selectedEvent) return;
    setIsLoading(true);
    try {
      let inviteId = editingInvite?.id;

      if (editingInvite) {
        const { error } = await supabase
          .from('invites')
          .update({ 
              label: formData.label,
              max_guests: formData.max_guests,
              allow_plus_one: formData.allow_plus_one
          })
          .eq('id', inviteId);
        if (error) throw error;
      } else {
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        const { data, error } = await supabase
          .from('invites')
          .insert([{
            event_id: selectedEvent.id,
            token,
            label: formData.label,
            max_guests: formData.max_guests,
            allow_plus_one: formData.allow_plus_one,
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }])
          .select()
          .single();
        
        if (error) throw error;
        inviteId = data.id;
      }

      // Sync Guests
      if (editingInvite) {
          const newNames = formData.guests.map(g => g.name);
          const toDelete = (editingInvite.guests || []).filter(g => !newNames.includes(g.name));
          for (const g of toDelete) {
              await supabase.from('guests').delete().eq('id', g.id);
          }
      }

      for (const guest of formData.guests) {
          if (editingInvite) {
              const existing = (editingInvite.guests || []).find(g => g.name === guest.name);
              if (!existing) {
                  await supabase.from('guests').insert([{ event_id: selectedEvent.id, invite_id: inviteId, name: guest.name, type: 'principal' }]);
              }
          } else {
              await supabase.from('guests').insert([{ event_id: selectedEvent.id, invite_id: inviteId, name: guest.name, type: 'principal' }]);
          }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving invite:", error);
      toast.error("Erro ao salvar convite: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvite = (inviteId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Convite?',
      message: 'Tem certeza que deseja apagar este convite? Isso apagará também os convidados e confirmações associadas.',
      confirmText: 'Sim, Excluir',
      isDangerous: true,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const { error } = await supabase.from('invites').delete().eq('id', inviteId);
          if (error) throw error;
          toast.success("Convite excluído com sucesso.");
          setInvites(prev => prev.filter(inv => inv.id !== inviteId));
          setRSVPs(prev => prev.filter(r => r.invite_id !== inviteId));
        } catch (error) {
          console.error("Error deleting invite:", error);
          toast.error("Erro ao deletar convite.");
        } finally {
          setIsLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // --- STATS ---
  const stats = React.useMemo(() => {
      const totalInvites = invites.length;
      const totalGuestsListed = invites.reduce((acc, inv) => acc + (inv.max_guests || 0), 0);
      const confirmedGuests = rsvps.filter(r => r.attending).reduce((acc, r) => acc + r.guests_count, 0);
      const declinedGuests = rsvps.filter(r => !r.attending).length; 
      return { totalInvites, totalGuestsListed, confirmedGuests, declinedGuests };
  }, [invites, rsvps]);


  const copyLink = (token) => {
      const url = `${window.location.origin}/${selectedEvent.slug}/rsvp?token=${token}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
  };

  const sendWhatsApp = (invite) => {
    const baseUrl = `${window.location.origin}/${selectedEvent.slug}/rsvp?token=${invite.token}`;
    const guestsNames = invite.guests && invite.guests.length > 0 
      ? invite.guests.map(g => g.name).join(' & ') 
      : (invite.label || 'Convidado');

    const message = `Olá ${guestsNames}! 💕\n\nPreparamos com muito carinho um convite especial para o nosso casamento.\n\n👉 Para acessar o convite e confirmar sua presença, é só clicar no link abaixo:\n${baseUrl}\n\nFicaremos muito felizes com a sua presença! 💖✨`;
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    window.open(`https://${isMobile ? 'api' : 'web'}.whatsapp.com/send?text=${encodedMessage}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8 px-4 font-sans">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-gradient-to-r from-gold to-yellow-500 p-3 rounded-xl shadow-lg shadow-gold/20">
                <Users className="text-white w-8 h-8" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Gestão de Convites</h1>
                  {events.length > 1 && (
                    <select 
                      value={selectedEvent?.id} 
                      onChange={(e) => setSelectedEvent(events.find(ev => ev.id === e.target.value))}
                      className="ml-4 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-gold focus:border-gold block p-2"
                    >
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                  )}
                </div>
                <p className="text-gray-500 font-medium">{selectedEvent?.title || 'Controle de acesso'}</p>
             </div>
          </div>
          
          <div className="flex gap-3">
             <button
              onClick={() => fetchData()}
              disabled={isRefreshing}
              className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-purple-500 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="text-purple-600 w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Gerados</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mb-1">{stats.totalInvites}</p>
            <p className="text-gray-500 text-sm">Convites Enviados</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-blue-500 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <User className="text-blue-600 w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Capacidade</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mb-1">{stats.totalGuestsListed}</p>
            <p className="text-gray-500 text-sm">Máximo de Pessoas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-green-500 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                 <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="text-green-600 w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Confirmados</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mb-1">{stats.confirmedGuests}</p>
            <p className="text-gray-500 text-sm">Vão Comparecer</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-b-4 border-red-500 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                    <X className="text-red-500 w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Recusados</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mb-1">{stats.declinedGuests}</p>
            <p className="text-gray-500 text-sm">Não Comparecerão</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200">
           {['overview', 'rsvps', 'content', 'management', 'seating', 'tickets', 'messages'].map(tab => (
             <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold transition-colors border-b-2 capitalize ${
                activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-gray-500'
              }`}
            >
              {tab === 'overview' ? 'Convites' : tab === 'content' ? 'Conteúdo' : tab === 'management' ? 'Gestão de Mesas' : tab === 'seating' ? 'Mapa de Assentos' : tab === 'tickets' ? 'Galeria' : tab === 'messages' ? 'Mensagens' : 'RSVPs'}
            </button>
           ))}
        </div>

        {/* --- TABS CONTENT --- */}
        {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Lista de Convites</h2>
                        <button onClick={handleOpenAddModal} className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 font-bold shadow-md">
                            + Novo Convite
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Mesa Reservada</th>
                                    <th className="px-6 py-3">Token</th>
                                    <th className="px-6 py-3">Convidados</th>
                                    <th className="px-6 py-3 text-center">Limite</th>
                                    <th className="px-6 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invites.map(invite => (
                                    <tr key={invite.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{invite.label || 'Sem nome'}</td>
                                        <td className="px-6 py-4 font-mono text-sm">{invite.token}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{(invite.guests || []).map(g => g.name).join(', ')}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gold">{invite.max_guests}</td>
                                        <td className="px-6 py-4 flex gap-3 justify-center">
                                            <button onClick={() => copyLink(invite.token)} className="text-blue-600 hover:underline text-sm">🔗 Copiar</button>
                                            <button onClick={() => sendWhatsApp(invite)} className="text-green-600 hover:underline text-sm">💬 Zap</button>
                                            <button onClick={() => handleOpenEditModal(invite)} className="text-gray-400 hover:text-gold">✏️</button>
                                            <button onClick={() => handleDeleteInvite(invite.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- RSVPS TAB --- */}
        {activeTab === 'rsvps' && (
             <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="Buscar..." value={rsvpSearchTerm} onChange={(e) => setRsvpSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:border-gold outline-none" />
                    </div>
                    <select value={rsvpStatusFilter} onChange={(e) => setRsvpStatusFilter(e.target.value)} className="px-4 py-2 border rounded-xl outline-none">
                      <option value="all">Todos os Status</option>
                      <option value="confirmed">Confirmados</option>
                      <option value="declined">Recusados</option>
                    </select>
                    <button onClick={() => fetchData()} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"><Download className="w-4 h-4" /> Exportar</button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <tbody className="divide-y divide-gray-100">
                              {rsvps.filter(r => r.guestName.toLowerCase().includes(rsvpSearchTerm.toLowerCase())).map(rsvp => (
                                  <tr key={rsvp.id}>
                                      <td className="px-6 py-4 font-medium">{rsvp.guestName}</td>
                                      <td className="px-6 py-4">{rsvp.attending ? '✅' : '❌'}</td>
                                      <td className="px-6 py-4">{rsvp.guests_count}</td>
                                      <td className="px-6 py-4">{rsvp.tableAssignment || '-'}</td>
                                      <td className="px-6 py-4 flex gap-2">
                                        <a href={`/${selectedEvent.slug}/ticket/${rsvp.id}`} target="_blank" rel="noreferrer">🎫</a>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                </div>
             </div>
        )}

        {activeTab === 'seating' && <SeatingChart rsvps={rsvps} eventId={selectedEvent?.id} />}
        {activeTab === 'management' && <TableManagement rsvps={rsvps} eventId={selectedEvent?.id} onUpdate={fetchData} />}
        {activeTab === 'content' && <StoryManagement eventId={selectedEvent?.id} event={selectedEvent} />}
        {activeTab === 'tickets' && <TicketsGallery rsvps={rsvps} eventId={selectedEvent?.id} />}
        {activeTab === 'messages' && <MessagesManagement eventId={selectedEvent?.id} />}

      </div>

      <InviteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveInvite} invite={editingInvite} isLoading={isLoading} />
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} confirmText={confirmModal.confirmText} isDangerous={confirmModal.isDangerous} isLoading={isLoading} />
    </div>
  );
};

export default AdminDashboard;
