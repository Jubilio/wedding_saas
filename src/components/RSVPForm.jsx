import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import InvitationCard from './InvitationCard';
import DOMPurify from 'dompurify';
import { useEvent } from '../contexts/EventContext';


const RSVPForm = ({ inviteData }) => {
  const navigate = useNavigate();
  const { eventSlug, eventData } = useEvent();
  const [formData, setFormData] = useState({
    name: '',
    attending: '',
    guests: 1,
    message: '',
    phone: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [validatedGuest, setValidatedGuest] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedRsvpId, setSubmittedRsvpId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rules from inviteData
  const { invite_id, event_id, label, max_guests, allow_plus_one, guests: allowedGuests } = inviteData || {};

  // Sanitize input
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true 
    });
  };

  const handleNameChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setFormData({ ...formData, name: value });
    
    // Search suggestions in the provided list
    if (value.length >= 2 && allowedGuests) {
      const results = allowedGuests.filter(g => 
        g.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    setValidatedGuest(null);
    setErrors({ ...errors, name: '' });
  };

  const selectSuggestion = (guest) => {
    setFormData({ 
      ...formData, 
      name: guest.name
    });
    setValidatedGuest(guest);
    setShowSuggestions(false);
    setSuggestions([]);
    setErrors({ ...errors, name: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value) });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Por favor, insira seu nome completo';
    } else if (!validatedGuest && allowedGuests) {
       const match = allowedGuests.find(g => g.name.toLowerCase() === formData.name.toLowerCase());
       if (!match) {
          newErrors.name = 'Nome não encontrado neste convite.';
       } else {
          setValidatedGuest(match);
       }
    }

    if (!formData.attending) {
      newErrors.attending = 'Por favor, confirme sua presença';
    }

    // Only validate details if attending
    if (formData.attending === 'yes') {
        if (formData.guests < 1 || formData.guests > max_guests) {
            newErrors.guests = `Número de convidados inválido (Max: ${max_guests})`;
        }

        if (!formData.phone) {
            newErrors.phone = 'Por favor, insira seu telefone';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Determine Display Name (Main Guest + Companions)
      let displayName = formData.name;
      const count = parseInt(formData.guests);
      
      if (count > 1) {
        if (allowedGuests && allowedGuests.length > 1) {
          // Join names from the pre-defined list if available
          displayName = allowedGuests.slice(0, count).map(g => g.name).join(' & ');
        } else {
          // Fallback if list is not available or mismatching
          displayName = `${formData.name} & Acompanhante`;
        }
      }

      const { data, error } = await supabase.functions.invoke('submit-rsvp', {
        body: {
          invite_id,
          event_id,
          guest_name: displayName, // Save the combined name to DB
          attending: formData.attending === 'yes',
          guests_count: formData.attending === 'yes' ? count : 0,
          phone: formData.phone,
          message: formData.message,
        }
      });
      
      if (error) throw new Error(error.message || 'Erro ao enviar.');
      if (!data?.success) throw new Error(data?.message || 'Erro desconhecido.');
      
      setSubmittedRsvpId(data.rsvpId);
      setSubmitted(true);
      
    } catch (error) {
      console.error('❌ Error submitting RSVP:', error);
      setErrors({ submit: error.message || 'Erro ao enviar confirmação.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
      setFormData({
        name: '',
        attending: '',
        guests: 1,
        message: '',
        phone: '',
      });
      setValidatedGuest(null);
      setSubmitted(false);
      setSubmittedRsvpId(null);
      navigate(`/${eventSlug}/home`);
  };

  if (!inviteData) {
      return (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
              <p>Carregando dados do convite...</p>
          </div>
      );
  }

  // Consistent display name for UI preview
  const getTicketDisplayName = () => {
    const count = parseInt(formData.guests);
    if (count > 1) {
      if (allowedGuests && allowedGuests.length > 1) {
        return allowedGuests.slice(0, count).map(g => g.name).join(' & ');
      }
      return `${formData.name} & Acompanhante`;
    }
    return formData.name;
  };

  // Consistent table name selection
  const getTicketTableName = () => {
    if (label) return label;
    if (eventData?.title) return eventData.title;
    return 'Mesa Reservada';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence>
        {submitted && formData.attending === 'yes' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 text-center">
              <p className="text-4xl mb-4">🎉</p>
              <h3 className="text-2xl font-serif text-green-700 mb-2">
                Confirmação Recebida!
              </h3>
              <p className="text-green-600 mb-4">
                Obrigado por confirmar sua presença. Seu convite personalizado está pronto!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Casamento de ' + (eventData?.title || 'Binth & Jubílio'))}&dates=20260307T100000/20260307T220000&details=${encodeURIComponent('Celebrar o amor de ' + (eventData?.title || 'Binth & Jubílio') + '! ❤️\n\nConfira mais detalhes no site: ' + window.location.origin + '/' + eventSlug)}&location=${encodeURIComponent('Maputo, Moçambique')}&sf=true&output=xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  <span>📅</span>
                  Adicionar ao Calendário
                </a>
              </div>
            </div>
            
            {/* InvitationCard Preview */}
            <InvitationCard
              guestName={getTicketDisplayName()}
              tableName={getTicketTableName()}
              rsvpId={submittedRsvpId}
              onActionComplete={handleClose}
            />

            <div className="flex justify-center">
                <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 underline text-sm"
                >
                    Fechar e voltar ao início
                </button>
            </div>
          </motion.div>
        ) : submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-8 text-center"
          >
            <p className="text-4xl mb-4">💙</p>
            <h3 className="text-2xl font-serif text-blue-700 mb-2">
              Resposta Recebida!
            </h3>
            <p className="text-blue-600">
              Sentiremos sua falta, mas agradecemos por nos avisar.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6 relative"
          >
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              </div>
            )}

            {/* Name with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  errors.name ? 'border-red-500' : validatedGuest ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="Escreva seu nome ou apelido..."
              />
              
              {validatedGuest && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Convidado validado
                </p>
              )}
              
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full mt-1 bg-white border-2 border-gold rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {suggestions.map((guest, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(guest)}
                      className="w-full text-left px-4 py-3 hover:bg-gold/10 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-semibold text-gray-800">{guest.name}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Attending */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Irá comparecer ao evento? *
              </label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="attending"
                    value="yes"
                    checked={formData.attending === 'yes'}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="mr-2 accent-gold"
                  />
                  <span className="text-gray-700">Sim, estarei presente!</span>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="attending"
                    value="no"
                    checked={formData.attending === 'no'}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="mr-2 accent-gold"
                  />
                  <span className="text-gray-700">Não poderei comparecer</span>
                </label>
              </div>
              {errors.attending && (
                <p className="text-sm text-red-600 mt-1">{errors.attending}</p>
              )}
            </div>

            {/* Dynamic Guest Selector based on max_guests and allow_plus_one */}
            <AnimatePresence>
              {formData.attending === 'yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  {max_guests === 2 && allow_plus_one ? (
                    /* Plus One Logic */
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Como você virá? *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer bg-gray-50 p-3 rounded-lg border-2 border-transparent transition-all hover:bg-gray-100">
                          <input
                            type="radio"
                            name="guests"
                            value="1"
                            checked={parseInt(formData.guests) === 1}
                            onChange={handleChange}
                            className="mr-2 accent-gold"
                          />
                          <span className="text-gray-700 text-sm">Sozinho(a)</span>
                        </label>
                        <label className="flex-1 cursor-pointer bg-gray-50 p-3 rounded-lg border-2 border-transparent transition-all hover:bg-gray-100">
                          <input
                            type="radio"
                            name="guests"
                            value="2"
                            checked={parseInt(formData.guests) === 2}
                            onChange={handleChange}
                            className="mr-2 accent-gold"
                          />
                          <span className="text-gray-700 text-sm">Com Acompanhante</span>
                        </label>
                      </div>
                    </div>
                  ) : max_guests > 1 ? (
                    /* Group Logic */
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantas pessoas do seu grupo irão? (Máximo: {max_guests}) *
                      </label>
                      <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl">
                        <input
                          type="range"
                          name="guests"
                          min="1"
                          max={max_guests}
                          value={formData.guests}
                          onChange={handleChange}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold"
                        />
                        <div className="flex flex-col items-center justify-center bg-gold/10 rounded-lg px-4 py-2 border border-gold/20 min-w-[60px]">
                          <span className="text-2xl font-serif text-gold font-bold">
                            {formData.guests}
                          </span>
                          <span className="text-[10px] text-gold/60 uppercase font-semibold">Pessoas</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic text-center">Deslize para selecionar a quantidade total confirmada.</p>
                    </div>
                  ) : null}

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp para receber fotos do evento *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+258 XX XXX XXXX"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Message to Couple */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deixe uma mensagem para os noivos (Opcional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                      placeholder="Alguma restrição alimentar ou mensagem especial?"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold/90 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : 'Confirmar Presença'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RSVPForm;
