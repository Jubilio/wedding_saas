import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InvitationCard from '../components/InvitationCard';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';

const TicketPage = () => {
  const { eventData } = useEvent();
  const { rsvpId } = useParams();
  const [rsvp, setRsvp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRsvp = async () => {
      if (!rsvpId) {
        setError('ID do ticket não fornecido.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('rsvps')
          .select(`
            *,
            invites ( label, token )
          `)
          .eq('id', rsvpId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Ticket não encontrado.');

        setRsvp({
          ...data,
          guestName: data.guest_name,
          inviteLabel: data.invites?.label || 'Mesa Reservada'
        });
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Não foi possível carregar o ticket. Verifique o link.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRsvp();
  }, [rsvpId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando seu ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !rsvp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ticket não encontrado</h1>
          <p className="text-gray-500 mb-6">{error || 'O ticket solicitado não existe ou foi removido.'}</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-medium hover:bg-gold/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Seu Ticket de Confirmação</h1>
          <p className="text-gray-500">Apresente este ticket na entrada do evento</p>
        </div>

        {/* Ticket Card */}
        <InvitationCard
          guestName={rsvp.guestName}
          tableName={rsvp.inviteLabel}
          rsvpId={rsvp.id}
        />

        {/* Mural CTA */}
        <div className="mt-8 bg-rose-50 rounded-3xl p-8 text-center border border-rose-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
           <p className="text-2xl mb-4">📸 ✍️</p>
           <h3 className="text-xl font-serif text-rose-800 mb-2">Que tal deixar uma mensagem?</h3>
           <p className="text-rose-600/80 text-sm mb-6">
             Agora que confirmou sua presença, aproveite para deixar um recado especial (ou uma foto!) no nosso Mural de Afeto.
           </p>
           <Link 
             to={`/${eventData?.slug || 'binth-jubilio'}/mensagens`}
             className="inline-flex items-center gap-2 bg-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-105 transition-all"
           >
             Ir para o Mural
           </Link>
        </div>

        {/* Support Section */}
        {(eventData?.contact_phones?.length > 0 || eventData?.contact_email) && (
          <div className="mt-12 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dúvidas ou problemas com o ticket?</p>
             <div className="flex flex-wrap justify-center gap-3">
                {eventData.contact_phones?.map((phone, idx) => (
                  <a 
                    key={idx} 
                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 text-[10px] font-bold text-gray-600 hover:text-gold transition-colors"
                  >
                    💬 Zap: {phone}
                  </a>
                ))}
             </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
