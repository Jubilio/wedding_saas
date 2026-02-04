import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  MapPin, 
  Globe, 
  Settings, 
  Trash2, 
  Plus, 
  Search, 
  TrendingUp, 
  Activity, 
  Heart,
  Calendar,
  Layout,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, onAuthStateChange } from '../lib/supabase';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import CreateEventModal from '../components/CreateEventModal';
import EditEventModal from '../components/EditEventModal';
import AdminLogin from '../components/AdminLogin';

const OwnerDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalRSVPs, setTotalRSVPs] = useState(0);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    event: null
  });

  // Check authentication state
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setUser(session?.user || null);
      if (!session?.user) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchGlobalStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: eventsData, error: eventsError, count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
      setTotalEvents(eventsCount || 0);

      const { count: rsvpCount, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*', { count: 'exact', head: true });

      if (rsvpError) throw rsvpError;
      setTotalRSVPs(rsvpCount || 0);

    } catch (error) {
      console.error('Error fetching global stats:', error);
      toast.error('Erro ao carregar dados globais.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalStats();
    }
  }, [isAuthenticated, fetchGlobalStats]);

  const handleDeleteEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      event: event
    });
  };

  const confirmDelete = async () => {
    const event = confirmModal.event;
    if (!event) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast.success(`Evento "${event.title}" removido com sucesso.`);
      setEvents(prev => prev.filter(ev => ev.id !== event.id));
      setTotalEvents(prev => prev - 1);
      setConfirmModal({ isOpen: false, event: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao remover evento.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateEvent = async (formData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          date: formData.date,
          owner_email: formData.owner_email,
          groom_name: formData.groom_name,
          bride_name: formData.bride_name,
          groom_parents: formData.groom_parents,
          bride_parents: formData.bride_parents,
          venue_name: formData.venue_name,
          venue_address: formData.venue_address,
          google_maps_url: formData.google_maps_url,
          pix_key: formData.pix_key,
          bank_name: formData.bank_name,
          bank_nib: formData.bank_nib,
          mobile_money_number: formData.mobile_money_number,
          logo_url: formData.logo_url
        })
        .eq('id', formData.id);

      if (error) throw error;

      toast.success(`✅ Evento "${formData.title}" atualizado!`);
      setIsEditModalOpen(false);
      fetchGlobalStats();
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Erro ao atualizar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEvent = async (formData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um evento.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: formData.title,
          slug: formData.slug.toLowerCase(),
          date: formData.date,
          owner_email: formData.owner_email,
          owner_id: user.id
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      const { error: themeError } = await supabase
        .from('theme_configs')
        .insert([{
          event_id: event.id,
          wedding_date: formData.date,
          colors: { primary: '#D4AF37', secondary: '#F9F7F4', text: '#333333' },
          fonts: { heading: "'Outfit', sans-serif", body: "'Outfit', sans-serif" }
        }]);

      if (themeError) console.error('Error creating default theme:', themeError);

      toast.success(`🎉 Evento "${formData.title}" criado com sucesso!`);
      setIsCreateModalOpen(false);
      fetchGlobalStats();

    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Erro ao criar evento: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter(ev => 
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Activity className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="text-gold" />
              Gestão da Plataforma
            </h1>
            <p className="text-gray-500 mt-1">Visão geral de todos os casamentos hospedados</p>
          </div>
          <button 
            className="bg-gold text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-gold/20 hover:bg-gold/90 transition-all flex items-center gap-2 active:scale-95"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            Novo Evento
          </button>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
             <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="text-blue-500" size={24} />
             </div>
             <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total de Casamentos</p>
             <h2 className="text-4xl font-black text-gray-900 mt-1">{totalEvents}</h2>
             <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-bold">
                <TrendingUp size={16} />
                <span>Ativos e em Configuração</span>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
             <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-purple-500" size={24} />
             </div>
             <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Convidados Confirmados</p>
             <h2 className="text-4xl font-black text-gray-900 mt-1">{totalRSVPs}</h2>
             <p className="text-gray-400 text-xs mt-4">Somatória de todos os eventos</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
             <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Globe className="text-orange-500" size={24} />
             </div>
             <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Uptime do Sistema</p>
             <h2 className="text-4xl font-black text-gray-900 mt-1">99.9%</h2>
             <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-bold">
                <Activity size={16} />
                <span>Status: Saudável</span>
             </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gold focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Events Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Evento / Titular</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Slug / URL</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none text-center">Data Criado</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-md ${
                            event.slug === 'binth-jubilio' ? 'from-pink-400 to-purple-500' : 'from-gold to-yellow-600'
                          }`}>
                            {event.title.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{event.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Dono: {event.owner_email || 'Não informado'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <Link 
                        to={`/gestao-casamento-2026?slug=${event.slug}&tab=content`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-gold hover:text-white transition-all group"
                      >
                        <code className="bg-transparent">/{event.slug}</code>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar size={14} className="text-gray-300 mb-1" />
                        <span className="text-xs font-bold text-gray-700">
                          {new Date(event.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 justify-end">
                          <Link 
                            to={`/gestao-casamento-2026?slug=${event.slug}&tab=content`}
                            className="p-2.5 bg-white text-gold rounded-xl hover:bg-gold hover:text-white transition-all shadow-sm border border-gold/20"
                            title="Gerenciar Conteúdo"
                          >
                             <Layout size={18} />
                          </Link>
                          <button 
                             onClick={() => {
                               setEditingEvent(event);
                               setIsEditModalOpen(true);
                             }}
                             className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                             title="Configurações Técnicas"
                          >
                             <Settings size={18} />
                          </button>
                          <button 
                            onClick={() => window.open(`/${event.slug}/rsvp`, '_blank')}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                            title="Ver RSVP"
                          >
                             <Users size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title="Remover Evento"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}

                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                       <Search size={48} className="mx-auto text-gray-100 mb-4" />
                       <p className="text-gray-400 font-medium">Nenhum evento encontrado para "{searchTerm}"</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 text-center">
           <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Wedding platform SaaS v2.0 • Build 2026.02</p>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, event: null })}
        onConfirm={confirmDelete}
        title="Excluir Evento Permanentemente?"
        message={`Atenção: Ao apagar o evento "${confirmModal.event?.title}", TODOS os dados associados (convites, RSVPs, mesas e mensagens) desta wedding serão removidos definitivamente. Esta ação NÃO pode ser desfeita.`}
        confirmText="Sim, Remover Tudo"
        isDangerous={true}
        isLoading={isDeleting}
      />

      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateEvent}
        isLoading={isSubmitting}
      />

      <EditEventModal 
        key={editingEvent?.id || 'new'}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateEvent}
        event={editingEvent}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default OwnerDashboard;
