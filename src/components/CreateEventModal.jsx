import React, { useState, useEffect } from 'react';
import { X, Globe, Calendar, Mail, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const CreateEventModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: '',
    owner_email: '',
    slugEdited: false
  });
  
  const [slugStatus, setSlugStatus] = useState({ loading: false, available: null });
  const [error, setError] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slugEdited) {
      const generated = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setFormData(prev => ({ ...prev, slug: generated }));
    }
  }, [formData.title, formData.slugEdited]);

  // Validate slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (!formData.slug || formData.slug.length < 3) {
        setSlugStatus({ loading: false, available: null });
        return;
      }

      setSlugStatus({ loading: true, available: null });
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id')
          .eq('slug', formData.slug)
          .maybeSingle();
        
        if (error) throw error;
        setSlugStatus({ loading: false, available: !data });
      } catch (err) {
        console.error('Check slug error:', err);
        setSlugStatus({ loading: false, available: null });
      }
    };

    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.slug || !formData.date) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (slugStatus.available === false) {
      setError('Este link (slug) já está em uso.');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gold to-yellow-600 p-8 text-white relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-2xl">
                <Heart size={32} />
             </div>
             <div>
                <h2 className="text-2xl font-bold">Novo Casamento</h2>
                <p className="text-white/80 text-sm">Configure o novo evento na plataforma</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Heart size={14} className="text-gold" /> Nome do Casal / Título
              </label>
              <input 
                type="text"
                required
                placeholder="Ex: Maria & João"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl outline-none transition-all font-medium"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-gold" /> Link do Site (URL)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">jubilio.pt/</span>
                <input 
                  type="text"
                  required
                  style={{ paddingLeft: '5.5rem' }}
                  placeholder="maria-joao"
                  className={`w-full pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl outline-none transition-all font-mono text-sm ${
                    slugStatus.available === false ? 'border-red-200 bg-red-50' : ''
                  }`}
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value, slugEdited: true }))}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                   {slugStatus.loading ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent"></div>
                   ) : slugStatus.available === true ? (
                     <CheckCircle size={20} className="text-green-500" />
                   ) : slugStatus.available === false ? (
                     <AlertCircle size={20} className="text-red-500" />
                   ) : null}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">O link deve ser curto e sem espaços. Ex: binth-jubilio</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-gold" /> Data do Evento
              </label>
              <input 
                type="date"
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl outline-none transition-all font-medium"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={14} className="text-gold" /> Email do Titular
              </label>
              <input 
                type="email"
                placeholder="casal@email.com"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl outline-none transition-all font-medium"
                value={formData.owner_email}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isLoading || slugStatus.available === false || !formData.slug}
                className="flex-1 px-8 py-4 bg-gold text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:bg-gold/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale active:scale-95"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : 'Criar Evento'}
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateEventModal;
