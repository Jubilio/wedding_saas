import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { searchGuest, validateGuest, parseCompanionName } from '../utils/guestUtils';
import InvitationCard from './InvitationCard';
import DOMPurify from 'dompurify';

const RSVPForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    companionName: '',
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
  const [hasCompanion, setHasCompanion] = useState(false);

  // Sanitize input to prevent XSS using DOMPurify
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], // Strip all HTML tags
      KEEP_CONTENT: true // Keep the text content
    });
  };

  const handleNameChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setFormData({ ...formData, name: value });
    
    // Search for suggestions
    if (value.length >= 3) {
      const results = searchGuest(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    // Clear validation when typing
    setValidatedGuest(null);
    setHasCompanion(false);
    setErrors({ ...errors, name: '' });
  };

  const selectSuggestion = (guest) => {
    const { principalName, companionAllowed } = parseCompanionName(guest.name);
    
    setFormData({ 
      ...formData, 
      name: principalName,
      companionName: '' // Reset companion name
    });
    
    setValidatedGuest(guest);
    setHasCompanion(companionAllowed);
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

    // Validate name
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Por favor, insira seu nome completo';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Nome muito longo (máximo 200 caracteres)';
    } else {
      // Check if guest is in the list
      if (!validatedGuest) {
         // Try to find exact match first
         let guest = validateGuest(formData.name);
         
         if (!guest) {
            newErrors.name = 'Nome não encontrado na lista. Por favor, selecione uma das sugestões.';
         } else {
            setValidatedGuest(guest);
            const { companionAllowed } = parseCompanionName(guest.name);
            setHasCompanion(companionAllowed);
         }
      }
    }

    // Validate companion name if applicable
    if (hasCompanion && formData.companionName && formData.companionName.length > 200) {
      newErrors.companionName = 'Nome do acompanhante muito longo';
    }

    // Validate attending
    if (!formData.attending) {
      newErrors.attending = 'Por favor, confirme sua presença';
    }

    // Validate guests number
    if (formData.guests < 1 || formData.guests > 10) {
      newErrors.guests = 'Número de convidados deve estar entre 1 e 10';
    }

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = 'Por favor, insira seu telefone';
    } else if (formData.phone.length < 9 || formData.phone.length > 20) {
      newErrors.phone = 'Telefone inválido';
    }

    // Validate dietary restrictions length
    // Validate message length
    if (formData.message && formData.message.length > 1000) {
      newErrors.message = 'Mensagem muito longa (máximo 1000 caracteres)';
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

    // Firebase is now connected and ready to use
    const DEV_MODE = false; // Set to true only for local testing without Firebase

    try {
      // Construct final name: "Principal e Companion" if companion name is provided
      const finalName = (hasCompanion && formData.companionName.trim())
        ? `${formData.name} e ${formData.companionName.trim()}`
        : formData.name;

      const rsvpData = {
        name: finalName,
        originalName: validatedGuest?.name || formData.name, // Keep track of original list name
        attending: formData.attending === 'yes',
        guests: parseInt(formData.guests),
        phone: formData.phone,
        message: formData.message,
        guestGroup: validatedGuest?.group || 'Desconhecido',
        groupId: validatedGuest?.groupId || null,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      };


      
      let docRef;
      
      if (DEV_MODE) {
        // Mock Firebase response for testing

        const mockId = 'mock-rsvp-' + Date.now();
        docRef = { id: mockId };
        
        // Simulate persistence via localStorage
        const existingData = JSON.parse(localStorage.getItem('mock_rsvps') || '[]');
        const newRsvp = { ...rsvpData, id: mockId, timestamp: new Date().toISOString() }; // Store date as string for JSON
        localStorage.setItem('mock_rsvps', JSON.stringify([newRsvp, ...existingData]));
        
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Real Firebase submission
        docRef = await addDoc(collection(db, 'rsvps'), rsvpData);
      }



      setSubmittedRsvpId(docRef.id);
      setSubmitted(true);
      
      // Reset form after 15 seconds (give time to download card)
      setTimeout(() => {
        setFormData({
          name: '',
          companionName: '',
          attending: '',
          guests: 1,
          message: '',
          phone: '',
        });
        setValidatedGuest(null);
        setHasCompanion(false);
        setSubmitted(false);
        setSubmittedRsvpId(null);
      }, 15000);
    } catch (error) {
      console.error('❌ Error submitting RSVP:', error);
      setErrors({ submit: 'Erro ao enviar confirmação. Verifique sua conexão e tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
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
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Casamento de Binth & Jubílio')}&dates=20260307T100000/20260307T220000&details=${encodeURIComponent('Celebrar o amor de Binth & Jubílio! ❤️\n\nConfira mais detalhes no site: https://binthjubilio.netlify.app/')}&location=${encodeURIComponent('Maputo, Moçambique')}&sf=true&output=xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <span>📅</span>
                  Adicionar ao Calendário
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Olá! Confirmo minha presença no casamento de Binth & Jubílio! 💍\n\nNome: ${
                      (hasCompanion && formData.companionName.trim()) 
                        ? `${formData.name} e ${formData.companionName.trim()}` 
                        : formData.name
                    }\nMesa: ${validatedGuest?.group || 'A definir'}\n\nEstou muito feliz em fazer parte deste momento! ✨`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <span>📱</span>
                  Enviar no WhatsApp
                </a>
              </div>
            </div>
            
            <InvitationCard
              guestName={(hasCompanion && formData.companionName.trim()) 
                ? `${formData.name} e ${formData.companionName.trim()}` 
                : formData.name}
              tableName={validatedGuest?.group || 'A definir'}
              tableLocation={validatedGuest?.groupId || ''}
              rsvpId={submittedRsvpId}
            />
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
                placeholder="Digite seu nome..."
              />
              
              {validatedGuest && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Convidado validado - Grupo: {validatedGuest.group}
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
                      <p className="text-sm text-gray-500">{guest.group}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Companion Name Input - Only shown if allowed */}
            <AnimatePresence>
              {hasCompanion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome do Acompanhante (Opcional)
                  </label>
                  <input
                    type="text"
                    name="companionName"
                    value={formData.companionName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Digite o nome do seu acompanhante..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Caso venha sozinho(a), deixe este campo vazio.
                  </p>
                  {errors.companionName && (
                    <p className="text-sm text-red-600 mt-1">{errors.companionName}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attending */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Irá comparecer? *
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

            {/* Number of Guests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Convidados *
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                max="10"
                value={formData.guests}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {errors.guests && (
                <p className="text-sm text-red-600 mt-1">{errors.guests}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="+258 XX XXX XXXX"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Message to Couple */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deixe uma mensagem de carinho para os noivos (Opcional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                placeholder="Escreva algo especial para Binth & Jubílio..."
              />
              {errors.message && (
                <p className="text-sm text-red-600 mt-1">{errors.message}</p>
              )}
            </div>

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
              className="w-full bg-gold hover:bg-gold/90 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar Presença'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RSVPForm;
