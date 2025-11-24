import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InvitationCard = ({ guestName, tableName, tableLocation, rsvpId }) => {
  const cardRef = useRef(null);

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
    receptionTime: "12:00",
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

  const downloadAsPNG = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = getSafeFilename(guestName, 'png');
        
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (error) {
      console.error('❌ Error generating PNG:', error);
      alert('Erro ao gerar PNG. Tente novamente.');
    }
  };

  const downloadAsPDF = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      const imgWidth = 148; // A5 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(getSafeFilename(guestName, 'pdf'));
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
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
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold/90 text-white rounded-xl font-medium transition-colors shadow-lg shadow-gold/20"
        >
          <Download className="w-5 h-5" />
          Baixar Ticket
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
