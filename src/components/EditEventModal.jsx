import React, { useState } from 'react';
import { X, Globe, Calendar, Mail, Heart, CheckCircle, AlertCircle, Info, MapPin, CreditCard, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    type="button"
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm ${
      activeTab === id ? 'bg-gold text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const EditEventModal = ({ isOpen, onClose, onSave, event, isLoading }) => {
  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState({
    id: event?.id || null,
    title: event?.title || '',
    slug: event?.slug || '',
    date: event?.date || '',
    owner_email: event?.owner_email || '',
    groom_name: event?.groom_name || '',
    bride_name: event?.bride_name || '',
    groom_parents: event?.groom_parents || { father: '', mother: '' },
    bride_parents: event?.bride_parents || { father: '', mother: '' },
    venue_name: event?.venue_name || '',
    venue_address: event?.venue_address || '',
    google_maps_url: event?.google_maps_url || '',
    pix_key: event?.pix_key || '',
    bank_name: event?.bank_name || '',
    bank_nib: event?.bank_nib || '',
    mobile_money_number: event?.mobile_money_number || '',
    logo_url: event?.logo_url || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateNested = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-white relative flex-shrink-0">
          <button type="button" onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-3 rounded-2xl"><Layout size={32} /></div>
             <div>
                <h2 className="text-2xl font-bold">Editar Evento</h2>
                <p className="text-white/60 text-sm">{formData.title} • {formData.slug}</p>
             </div>
          </div>
        </div>

        <div className="bg-gray-50 p-2 flex gap-2 border-b border-gray-100 flex-shrink-0">
            <TabButton id="basics" label="Geral" icon={Info} activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="family" label="Família" icon={Heart} activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="venue" label="Local" icon={MapPin} activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="finance" label="Contribuição" icon={CreditCard} activeTab={activeTab} onClick={setActiveTab} />
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'basics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Casal / Título</label>
                 <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Noivo (Exibição)</label>
                 <input type="text" placeholder="Jubílio" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.groom_name || ''} onChange={(e) => setFormData({...formData, groom_name: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Noiva (Exibição)</label>
                 <input type="text" placeholder="Binth" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.bride_name || ''} onChange={(e) => setFormData({...formData, bride_name: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</label>
                 <input type="date" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} />
               </div>
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email do Titular</label>
                 <input type="email" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.owner_email || ''} onChange={(e) => setFormData({...formData, owner_email: e.target.value})} />
               </div>
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Link do Logo (URL)</label>
                 <input type="url" placeholder="https://..." className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.logo_url || ''} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} />
               </div>
            </div>
          )}

          {activeTab === 'family' && (
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p className="md:col-span-2 text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-2">Pais da Noiva</p>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mãe</label>
                        <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.bride_parents.mother || ''} onChange={(e) => updateNested('bride_parents', 'mother', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pai</label>
                        <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.bride_parents.father || ''} onChange={(e) => updateNested('bride_parents', 'father', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p className="md:col-span-2 text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-2">Pais do Noivo</p>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mãe</label>
                        <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.groom_parents.mother || ''} onChange={(e) => updateNested('groom_parents', 'mother', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pai</label>
                        <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.groom_parents.father || ''} onChange={(e) => updateNested('groom_parents', 'father', e.target.value)} />
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'venue' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Local</label>
                    <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.venue_name || ''} onChange={(e) => setFormData({...formData, venue_name: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço</label>
                    <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.venue_address || ''} onChange={(e) => setFormData({...formData, venue_address: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Link Google Maps</label>
                    <input type="url" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.google_maps_url || ''} onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})} />
                </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chave PIX / Digital</label>
                    <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.pix_key || ''} onChange={(e) => setFormData({...formData, pix_key: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banco</label>
                    <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.bank_name || ''} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NIB / Conta</label>
                    <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.bank_nib || ''} onChange={(e) => setFormData({...formData, bank_nib: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">M-Pesa / Mobile Money</label>
                    <input type="text" className="w-full px-5 py-3 bg-gray-100 border-none rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none" value={formData.mobile_money_number || ''} onChange={(e) => setFormData({...formData, mobile_money_number: e.target.value})} />
                </div>
            </div>
          )}

          <div className="pt-8 flex gap-4 bg-white sticky bottom-0 border-t border-gray-50 -mx-8 px-8 py-4 mt-8">
              <button type="button" onClick={onClose} className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95">Cancelar</button>
              <button type="submit" disabled={isLoading} className="flex-1 px-8 py-4 bg-gold text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:bg-gold/90 transition-all flex items-center justify-center gap-2 active:scale-95">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : 'Salvar Alterações'}
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditEventModal;
