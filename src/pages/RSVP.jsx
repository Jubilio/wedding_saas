import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RSVPForm from '../components/RSVPForm';

const RSVP = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [inviteData, setInviteData] = React.useState(null);
  const [alreadyResponded, setAlreadyResponded] = React.useState(false);
  const [isDeclined, setIsDeclined] = React.useState(false);

  React.useEffect(() => {
    const validateToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        // Allows testing without token if we want, or block it. 
        // Plan says: "O convidado acesse o link... Digite o seu nome"
        // Strict security: Block if no token.
        // For now, let's keep it strict but friendly.
        setError('Token de convite não encontrado. Use o link enviado o seu convite.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-invite', {
          body: { token }
        });

        if (error || !data.valid) {
          throw new Error(data?.error || 'Convite inválido');
        }

        // data now contains: valid, invite_id, label, max_guests, allow_plus_one, guests, existingRSVP
        
        // Check for existing RSVP
        if (data.existingRSVP) {
           if (data.existingRSVP.attending) {
              // If already confirmed, go straight to ticket
              navigate(`/ticket/${data.existingRSVP.id}`);
              return;
           } else {
              // If declined, show message
              setAlreadyResponded(true);
              setIsDeclined(true);
           }
        }

        setInviteData(data);
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Convite inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
       </div>
     );
  }

  if (alreadyResponded && isDeclined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border-2 border-blue-100"
        >
          <div className="text-4xl mb-4 text-blue-500">💙</div>
          <h2 className="text-2xl font-serif text-blue-700 mb-2">Resposta Registrada</h2>
          <p className="text-gray-600 mb-6">
            Você informou que não poderá comparecer. Agradecemos por nos avisar!
          </p>
          <button 
            onClick={() => navigate('/home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
           <h1 className="text-3xl text-red-500 font-serif mb-4">Acesso Negado</h1>
           <p className="text-gray-600 mb-6">{error}</p>
           <button 
             onClick={() => navigate('/home')}
             className="text-gold font-semibold hover:underline"
           >
             Ir para a página inicial
           </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-8"
        >
          Confirme sua Presença
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Por favor, confirme sua presença até o dia 15 de fevereiro de 2026 para que possamos organizar tudo com muito carinho.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RSVPForm inviteData={inviteData} />
        </motion.div>
      </div>
    </div>
  );
};

export default RSVP;
