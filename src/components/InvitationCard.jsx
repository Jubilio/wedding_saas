import React, { useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

const InvitationCard = ({ guestName, tableName, rsvpId, onActionComplete }) => {
  const cardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  // Format table name to show only the part after " - "
  const formatTableName = (name) => {
    if (!name) return "A definir";
    const parts = name.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : name;
  };

  // Event details - matching Evento.jsx
  const eventDetails = {
    couple: "Binth & Jubílio",
    date: "07 de Março de 2026",
    ceremonyTime: "10:00",
    receptionTime: "14:00",
    ceremonyVenue: "MEA Congregação de Mateque",
    receptionVenue: "THAYANA Eventos",
    fullTableName: formatTableName(tableName)
  };

  const getSafeFilename = (name, extension) => {
    const safeName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    
    return `convite-${safeName}.${extension}`;
  };

  // Unified upload helper
  const uploadTicket = async (blob) => {
    if (!rsvpId) return null;
    
    // Deterministic filename: ticket-{rsvpId}.png
    const filename = `ticket-${rsvpId}.png`;
    const path = `tickets/${filename}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(path, blob, { 
          contentType: 'image/png',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(path);
        
      return publicUrl;
    } catch (error) {
      console.error("Auto-upload failed:", error);
      return null;
    }
  };

  const handleActionComplete = () => {
    if (onActionComplete) {
       // Small delay to allow download to start
       setTimeout(onActionComplete, 2000); 
    }
  };

  const downloadAsPNG = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // 1. Download locally
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = getSafeFilename(guestName, 'png');
        
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 2. Background Upload
        await uploadTicket(blob);

        // 3. User Feedback & Close
        toast.success('Ticket baixado com sucesso!');
        handleActionComplete();
      }, 'image/png');

    } catch {
      toast.error('Erro ao gerar imagem. Tente novamente.');
    }
  };

  const shareToWhatsApp = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Não foi possível gerar a imagem');

      // 1. Upload
      const publicUrl = await uploadTicket(blob);
      if (!publicUrl) throw new Error('Erro ao salvar ticket online');

      // 2. Share
      const message = `Olá! Binth & Jubílio, aqui está o meu ticket de confirmação para o vosso casamento! 💍✨\n\nTicket: ${publicUrl}\n\nMal posso esperar por este momento! ❤️`;
      const encodedMessage = encodeURIComponent(message);
      
      // Device detection logic
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
          ? `https://api.whatsapp.com/send?text=${encodedMessage}`
          : `https://web.whatsapp.com/send?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      // 3. Close
      handleActionComplete();
    } catch {
      toast.error(`Erro ao compartilhar: Tente baixar o ticket manualmente.`);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Ticket Card Preview */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col relative mx-auto"
        style={{ maxWidth: '400px', minHeight: '600px' }}
      >
        {/* Top Section: Header */}
        <div className="bg-gradient-to-b from-[#F9F5F0] to-white p-10 text-center relative">
          <h1 className="font-serif text-3xl text-[#C8A56F] mb-3 tracking-wide font-medium">
            {eventDetails.couple}
          </h1>
          <div className="w-12 h-[1px] bg-[#C8A56F]/30 mx-auto mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium">
            CONVITE OFICIAL
          </p>
        </div>

        {/* Middle Section: Content */}
        <div className="px-8 pb-12 bg-white flex-1 flex flex-col justify-center">
          
          {/* Guest Name - No Title, Large Serif */}
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl text-gray-800 leading-tight">
              {guestName}
            </h2>
          </div>

          {/* Table Assignment */}
          <div className="bg-[#FAFAFA] border border-gray-100 rounded-2xl p-8 text-center mb-8">
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-3">Mesa Reservada</p>
            <p className="font-serif text-3xl text-[#C8A56F]">
              {eventDetails.fullTableName}
            </p>
          </div>

          {/* Timeline Grid - Balanced & Legible */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ceremony Card */}
            <div className="bg-[#F9F5F0] p-6 rounded-2xl border border-[#EFE8DD] text-center flex flex-col justify-center h-full">
              <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-wider">Cerimônia</p>
              <p className="font-serif text-2xl text-gray-800 font-medium mb-1">{eventDetails.ceremonyTime}</p>
              <p className="text-[11px] text-gray-500 leading-tight px-1">
                {eventDetails.ceremonyVenue}
              </p>
            </div>

            {/* Reception Card */}
            <div className="bg-[#F9F5F0] p-6 rounded-2xl border border-[#EFE8DD] text-center flex flex-col justify-center h-full">
              <p className="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-wider">Recepção</p>
              <p className="font-serif text-2xl text-gray-800 font-medium mb-1">{eventDetails.receptionTime}</p>
              <p className="text-[11px] text-gray-500 leading-tight px-1">
                {eventDetails.receptionVenue}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decoration (Optional, to balance space) */}
        <div className="pb-8 text-center">
           <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em]">
             07 . 03 . 2026
           </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={downloadAsPNG}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gold text-gold hover:bg-gold/5 rounded-xl font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          Baixar Ticket
        </button>
        <button
          onClick={shareToWhatsApp}
          disabled={isSharing}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50"
        >
          {isSharing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
          {isSharing ? 'Preparando...' : 'Enviar no WhatsApp'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Apresente este ticket na recepção do evento.
        </p>
      </div>
    </div>
  );
};

export default InvitationCard;
