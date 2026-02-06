import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Save,
  Users,
  Layout,
  CheckCircle,
  Info,
  Maximize2,
  Gift,
  Smile
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const StoryManagement = ({ eventId, event, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bride_name: '',
    groom_name: '',
    bride_parents: { father: '', mother: '' },
    groom_parents: { father: '', mother: '' },
    date: '',
    venue_name: '',
    venue_address: '',
    google_maps_url: '',
    hero_image_url: '',
    logo_url: '',
    story_intro: '',
    story_cover_url: '',
    contact_phones: [],
    contact_email: '',
    contact_location: '',
    music_url: '',
    template_id: 'classic-gold',
    story_json: [],
    gallery_json: [],
    gift_list_json: []
  });

  // Robust initialization: Only reset form when the event ID actually changes
  useEffect(() => {
    if (event?.id) {
      setFormData({
        bride_name: event.bride_name || '',
        groom_name: event.groom_name || '',
        bride_parents: event.bride_parents || { father: '', mother: '' },
        groom_parents: event.groom_parents || { father: '', mother: '' },
        date: event.date || '',
        venue_name: event.venue_name || '',
        venue_address: event.venue_address || '',
        google_maps_url: event.google_maps_url || '',
        hero_image_url: event.hero_image_url || '',
        logo_url: event.logo_url || '',
        story_intro: event.story_intro || '',
        story_cover_url: event.story_cover_url || '',
        contact_phones: Array.isArray(event.contact_phones) ? event.contact_phones : [],
        contact_email: event.contact_email || '',
        contact_location: event.contact_location || '',
        music_url: event.music_url || '',
        template_id: event.theme_configs?.[0]?.template_id || 'classic-gold',
        story_json: Array.isArray(event.story_json) ? event.story_json : [],
        gallery_json: Array.isArray(event.gallery_json) ? event.gallery_json : [],
        gift_list_json: Array.isArray(event.gift_list_json) ? event.gift_list_json : []
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]); // CRITICAL: Only reset when event ID changes, not on every event prop update

  const handleUpdateNested = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleAddMilestone = () => {
    setFormData(prev => {
      const current = Array.isArray(prev.story_json) ? prev.story_json : [];
      return {
        ...prev,
        story_json: [...current, { year: '', title: '', description: '', image: '' }]
      };
    });
  };

  const handleRemoveMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      story_json: prev.story_json.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateMilestone = (index, field, value) => {
    const newStories = [...formData.story_json];
    newStories[index] = { ...newStories[index], [field]: value };
    setFormData(prev => ({ ...prev, story_json: newStories }));
  };

  // Gallery Management
  const handleAddPhoto = () => {
    setFormData(prev => {
      const current = Array.isArray(prev.gallery_json) ? prev.gallery_json : [];
      return {
        ...prev,
        gallery_json: [...current, { src: '', alt: '', span: 'md:col-span-1 md:row-span-1' }]
      };
    });
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery_json: prev.gallery_json.filter((_, i) => i !== index)
    }));
  };

  const handleUpdatePhoto = (index, field, value) => {
    const newGallery = [...formData.gallery_json];
    newGallery[index] = { ...newGallery[index], [field]: value };
    setFormData(prev => ({ ...prev, gallery_json: newGallery }));
  };
  
  // Contact Management
  const handleAddPhone = () => {
    setFormData(prev => ({ ...prev, contact_phones: [...prev.contact_phones, ''] }));
  };

  const handleUpdatePhone = (index, value) => {
    const newPhones = [...formData.contact_phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, contact_phones: newPhones }));
  };

  const handleRemovePhone = (index) => {
    setFormData(prev => ({ ...prev, contact_phones: prev.contact_phones.filter((_, i) => i !== index) }));
  };

  // Gift List Management
  const handleAddGiftCategory = () => {
    setFormData(prev => ({
      ...prev,
      gift_list_json: [...(prev.gift_list_json || []), { title: '', icon: '🎁', description: '', items: [] }]
    }));
  };

  const handleUpdateGiftCategory = (index, field, value) => {
    const newList = [...formData.gift_list_json];
    newList[index] = { ...newList[index], [field]: value };
    setFormData(prev => ({ ...prev, gift_list_json: newList }));
  };

  const handleRemoveGiftCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      gift_list_json: prev.gift_list_json.filter((_, i) => i !== index)
    }));
  };

  const handleAddGiftItem = (catIndex) => {
    const newList = [...formData.gift_list_json];
    newList[catIndex].items = [...(newList[catIndex].items || []), { name: '', icon: '✨' }];
    setFormData(prev => ({ ...prev, gift_list_json: newList }));
  };

  const handleUpdateGiftItem = (catIndex, itemIndex, field, value) => {
    const newList = [...formData.gift_list_json];
    newList[catIndex].items[itemIndex] = { ...newList[catIndex].items[itemIndex], [field]: value };
    setFormData(prev => ({ ...prev, gift_list_json: newList }));
  };

  const handleRemoveGiftItem = (catIndex, itemIndex) => {
    const newList = [...formData.gift_list_json];
    newList[catIndex].items = newList[catIndex].items.filter((_, i) => i !== itemIndex);
    setFormData(prev => ({ ...prev, gift_list_json: newList }));
  };

  const handleFileUpload = async (file, type, index = null) => {
    if (!file || !eventId) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    toast.loading('Enviando imagem...', { id: 'upload' });
    
    try {
      const { error } = await supabase.storage
        .from('wedding-assets')
        .upload(filePath, file);

      if (error) throw error;

      // Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wedding-assets')
        .getPublicUrl(filePath);

      if (type === 'gallery') {
         handleUpdatePhoto(index, 'src', publicUrl);
      } else if (type === 'milestone') {
         handleUpdateMilestone(index, 'image', publicUrl);
      } else if (type === 'hero') {
         setFormData(prev => ({ ...prev, hero_image_url: publicUrl }));
      } else if (type === 'logo') {
         setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      } else if (type === 'story_cover') {
         setFormData(prev => ({ ...prev, story_cover_url: publicUrl }));
      } else if (type === 'music') {
         setFormData(prev => ({ ...prev, music_url: publicUrl }));
      }

      toast.success('Imagem enviada!', { id: 'upload' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro no upload: ' + error.message, { id: 'upload' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Update Estate core fields (exclude template_id from events table)
      const { 
      template_id, 
      gallery_json, 
      story_json, 
      contact_phones,
      gift_list_json,
      ...eventDataOnly 
    } = formData;

      // 1. Update events table
      const { error: eventError } = await supabase
        .from('events')
        .update({ 
          ...eventDataOnly, 
          gallery_json, 
          story_json, 
          contact_phones,
          gift_list_json
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      // 2. Update/Upsert Theme Config for template_id
      const { error: themeError } = await supabase
        .from('theme_configs')
        .upsert({ 
           event_id: eventId, 
           template_id: template_id 
        }, { onConflict: 'event_id' });

      if (themeError) throw themeError;

      toast.success('Página do casamento atualizada!');
      if (onSave) onSave(); // Refresh dashboard state
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Nomes e Data */}
         <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-pink-50 p-2 rounded-xl text-pink-500"><Heart size={24} /></div>
               <h3 className="text-xl font-bold text-gray-800">Identidade do Evento</h3>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
               <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Logo (Ícone)</label>
                  <div className="relative aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 overflow-hidden flex items-center justify-center group/logo">
                     {formData.logo_url ? (
                       <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                     ) : (<ImageIcon className="text-gray-200" size={24} />)}
                     <label className="absolute inset-0 bg-gold/80 text-white flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer text-xs font-bold font-sans">
                        <ImageIcon size={16} /> Icone
                        <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'logo')} />
                     </label>
                  </div>
               </div>
               <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Capa (Hero)</label>
                  <div className="relative aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 overflow-hidden flex items-center justify-center group/hero">
                     {formData.hero_image_url ? (
                       <img src={formData.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
                     ) : (<ImageIcon className="text-gray-200" size={24} />)}
                     <label className="absolute inset-0 bg-gold/80 text-white flex flex-col items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity cursor-pointer text-xs font-bold font-sans">
                        <ImageIcon size={16} /> Capa
                        <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'hero')} />
                     </label>
                  </div>
               </div>
               <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Trilha Sonora</label>
                  <div className={`relative aspect-square bg-gray-50 rounded-2xl border-2 border-dashed ${formData.music_url ? 'border-green-100' : 'border-gray-100'} overflow-hidden flex items-center justify-center group/music`}>
                     {formData.music_url ? (
                        <div className="text-center">
                           <CheckCircle className="text-green-500 mx-auto" size={24} />
                           <span className="text-[8px] font-bold text-green-600 block mt-1">Carregada</span>
                        </div>
                     ) : (<Calendar className="text-gray-200" size={24} />)}
                     <label className="absolute inset-0 bg-gold/80 text-white flex flex-col items-center justify-center opacity-0 group-hover/music:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold font-sans p-1 text-center">
                        <Plus size={16} /> {formData.music_url ? 'Trocar MP3' : 'Subir MP3'}
                        <input type="file" hidden accept="audio/mpeg,audio/mp3" onChange={(e) => handleFileUpload(e.target.files[0], 'music')} />
                     </label>
                  </div>
               </div>
               <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome da Noiva</label>
                   <input 
                     type="text" 
                     value={formData.bride_name} 
                     onChange={(e) => setFormData({...formData, bride_name: e.target.value})}
                     className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gold outline-none font-medium"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Noivo</label>
                   <input 
                     type="text" 
                     value={formData.groom_name} 
                     onChange={(e) => setFormData({...formData, groom_name: e.target.value})}
                     className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gold outline-none font-medium"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data do Casamento</label>
                   <input 
                     type="date" 
                     value={formData.date} 
                     onChange={(e) => setFormData({...formData, date: e.target.value})}
                     className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gold outline-none font-medium"
                   />
                </div>
              </div>
           </div>

           <div className="mt-10 border-t border-gray-50 pt-8">
               <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 block flex items-center gap-2">
                  🎨 Estilo Visual do Convite
               </label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { id: 'classic-gold', name: 'Classic Gold', color: 'bg-[#D4AF37]', icon: '✨' },
                    { id: 'modern-minimalist', name: 'Modern Sage', color: 'bg-[#8BA888]', icon: '🌿' },
                    { id: 'romantic-floral', name: 'Romantic Pink', color: 'bg-[#E8A0BF]', icon: '🌸' },
                    { id: 'midnight-luxury', name: 'Midnight Gold', color: 'bg-[#0F172A]', icon: '🌙' },
                  ].map((temp) => (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, template_id: temp.id })}
                      className={`relative p-4 rounded-3xl border-2 transition-all text-left ${formData.template_id === temp.id ? 'border-gold bg-gold/5 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                    >
                      <div className={`w-10 h-10 ${temp.color} rounded-xl mb-3 flex items-center justify-center text-xl`}>
                        {temp.icon}
                      </div>
                      <p className="text-sm font-bold text-gray-800">{temp.name}</p>
                      {formData.template_id === temp.id && (
                        <div className="absolute top-4 right-4 text-gold">
                           <CheckCircle size={16} />
                        </div>
                      )}
                    </button>
                  ))}
               </div>
            </div>
         </section>

        {/* Família */}
        <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><Users size={24} /></div>
              <h3 className="text-xl font-bold text-gray-800">Seus Pais (Para Convites Formais)</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <p className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-2">Pais da Noiva</p>
                 <div className="grid grid-cols-1 gap-4">
                    <input placeholder="Nome da Mãe" className="px-5 py-3 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-gold shadow-inner" value={formData.bride_parents.mother} onChange={(e) => handleUpdateNested('bride_parents', 'mother', e.target.value)} />
                    <input placeholder="Nome do Pai" className="px-5 py-3 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-gold shadow-inner" value={formData.bride_parents.father} onChange={(e) => handleUpdateNested('bride_parents', 'father', e.target.value)} />
                 </div>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/10 pb-2">Pais do Noivo</p>
                 <div className="grid grid-cols-1 gap-4">
                    <input placeholder="Nome da Mãe" className="px-5 py-3 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-gold shadow-inner" value={formData.groom_parents.mother} onChange={(e) => handleUpdateNested('groom_parents', 'mother', e.target.value)} />
                    <input placeholder="Nome do Pai" className="px-5 py-3 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-gold shadow-inner" value={formData.groom_parents.father} onChange={(e) => handleUpdateNested('groom_parents', 'father', e.target.value)} />
                 </div>
              </div>
           </div>
        </section>

        {/* Nossa História */}
        <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-purple-50 p-2 rounded-xl text-purple-500"><Info size={24} /></div>
                 <h3 className="text-xl font-bold text-gray-800">Timeline da Nossa História</h3>
              </div>
              <button 
                type="button" 
                onClick={handleAddMilestone}
                className="bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold text-sm hover:bg-gold hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar Marco
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="md:col-span-1 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Foto de Introdução</label>
                 <div className="relative aspect-[4/3] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 overflow-hidden flex items-center justify-center group/storycover">
                    {formData.story_cover_url ? (
                      <img src={formData.story_cover_url} alt="Story Cover" className="w-full h-full object-cover" />
                    ) : (<ImageIcon className="text-gray-200" size={32} />)}
                    <label className="absolute inset-0 bg-gold/80 text-white flex flex-col items-center justify-center opacity-0 group-hover/storycover:opacity-100 transition-opacity cursor-pointer text-xs font-bold text-center p-4">
                       <Maximize2 size={24} className="mb-2" /> Alterar Foto Principal da História
                       <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'story_cover')} />
                    </label>
                 </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Texto de Introdução (Opcional)</label>
                 <textarea 
                   rows={6}
                   value={formData.story_intro}
                   onChange={(e) => setFormData({...formData, story_intro: e.target.value})}
                   placeholder="Conte como tudo começou..."
                   className="w-full px-5 py-4 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-gold outline-none font-medium resize-none shadow-inner"
                 />
                 <p className="text-[10px] text-gray-400 italic px-2">Este texto aparecerá logo no início da página "Nossa História".</p>
              </div>
           </div>

           <div className="border-t border-gray-50 pt-8 mb-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Plus size={12} /> Marcos da Timeline
              </h4>
           </div>
           <div className="space-y-6">
              {formData.story_json.map((milestone, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-3xl relative group border-2 border-transparent hover:border-gold/20 transition-all">
                   <button 
                     type="button" 
                     onClick={() => handleRemoveMilestone(index)}
                     className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Ano</label>
                         <input placeholder="Ex: 2021" className="w-full px-4 py-2 bg-white rounded-xl outline-none shadow-sm" value={milestone.year} onChange={(e) => handleUpdateMilestone(index, 'year', e.target.value)} />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Título do Evento</label>
                         <input placeholder="Ex: O Primeiro Beijo" className="w-full px-4 py-2 bg-white rounded-xl outline-none shadow-sm" value={milestone.title} onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)} />
                      </div>
                      <div className="md:col-span-4 flex flex-col md:flex-row gap-4">
                         <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Descrição Detalhada</label>
                            <textarea placeholder="Conte como foi..." rows={3} className="w-full px-4 py-2 bg-white rounded-xl outline-none resize-none shadow-sm" value={milestone.description} onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)} />
                         </div>
                         <div className="w-full md:w-48 space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 text-center block">Thumbnail (Opcional)</label>
                            <div className="relative h-20 bg-white rounded-xl border border-dashed border-gray-200 overflow-hidden flex items-center justify-center group/img">
                               {milestone.image ? (
                                 <img src={milestone.image} alt="" className="w-full h-full object-cover" />
                               ) : (<ImageIcon className="text-gray-200" size={24} />)}
                               <label className="absolute inset-0 bg-gold/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-xs font-bold">
                                  <ImageIcon size={14} className="mr-1" /> Carregar
                                  <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'milestone', index)} />
                               </label>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
              
              {formData.story_json.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                   <p className="text-gray-400 font-medium">Nenhum marco adicionado. Comece a contar sua história!</p>
                </div>
              )}
           </div>
        </section>

        {/* Canais de Contato */}
        <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><Users size={24} /></div>
                 <h3 className="text-xl font-bold text-gray-800">Canais de Contato</h3>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Telefones / WhatsApp</label>
                    <button type="button" onClick={handleAddPhone} className="text-gold text-[10px] font-bold uppercase hover:underline">+ Adicionar</button>
                 </div>
                 <div className="space-y-2">
                    {formData.contact_phones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2">
                         <input 
                           placeholder="+258 XX XXX XXXX" 
                           className="flex-1 px-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-gold shadow-inner text-sm" 
                           value={phone} 
                           onChange={(e) => handleUpdatePhone(idx, e.target.value)} 
                         />
                         <button type="button" onClick={() => handleRemovePhone(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {formData.contact_phones.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum número cadastrado.</p>}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email de Contato</label>
                    <input 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gold outline-none font-medium" 
                      value={formData.contact_email} 
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Localização (Cidade/Estado)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Maputo, Moçambique" 
                      className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-gold outline-none font-medium" 
                      value={formData.contact_location} 
                      onChange={(e) => setFormData({...formData, contact_location: e.target.value})} 
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Galeria Pública */}
        <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-green-50 p-2 rounded-xl text-green-500"><ImageIcon size={24} /></div>
                 <h3 className="text-xl font-bold text-gray-800">Galeria de Fotos do Site</h3>
              </div>
              <button 
                type="button" 
                onClick={handleAddPhoto}
                className="bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold text-sm hover:bg-gold hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar Foto
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.gallery_json.map((photo, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-3xl relative group border-2 border-transparent hover:border-gold/20 transition-all flex gap-4">
                   <button 
                     type="button" 
                     onClick={() => handleRemovePhoto(index)}
                     className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                   >
                     <Trash2 size={16} />
                   </button>
                   
                   <div className="w-24 h-24 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
                      {photo.src ? (
                        <img src={photo.src} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>
                      )}
                   </div>

                   <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <input 
                          placeholder="URL da Imagem" 
                          className="flex-1 px-4 py-2 bg-white rounded-xl outline-none text-sm shadow-sm" 
                          value={photo.src} 
                          onChange={(e) => handleUpdatePhoto(index, 'src', e.target.value)} 
                        />
                        <label className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 text-gold cursor-pointer hover:bg-gold hover:text-white transition-all flex items-center justify-center">
                           <ImageIcon size={18} />
                           <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'gallery', index)} />
                        </label>
                      </div>
                      <input 
                        placeholder="Legenda (Alt)" 
                        className="w-full px-4 py-2 bg-white rounded-xl outline-none text-sm shadow-sm" 
                        value={photo.alt} 
                        onChange={(e) => handleUpdatePhoto(index, 'alt', e.target.value)} 
                      />
                      <select 
                        className="w-full px-4 py-2 bg-white rounded-xl outline-none text-sm shadow-sm"
                        value={photo.span}
                        onChange={(e) => handleUpdatePhoto(index, 'span', e.target.value)}
                      >
                         <option value="md:col-span-1 md:row-span-1">Padrão (Pequena)</option>
                         <option value="md:col-span-2 md:row-span-1">Larga (Horizontal)</option>
                         <option value="md:col-span-1 md:row-span-2">Alta (Vertical)</option>
                         <option value="md:col-span-2 md:row-span-2">Destaque (Grande)</option>
                      </select>
                   </div>
                </div>
              ))}
           </div>
           
           {formData.gallery_json.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                <p className="text-gray-400 font-medium">Nenhuma foto adicionada. As fotos padrão ficarão visíveis.</p>
             </div>
           )}
        </section>

        {/* Lista de Presentes */}
        <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-rose-50 p-2 rounded-xl text-rose-500"><Gift size={24} /></div>
                 <h3 className="text-xl font-bold text-gray-800">Lista de Presentes</h3>
              </div>
              <button 
                type="button" 
                onClick={handleAddGiftCategory}
                className="bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold text-sm hover:bg-gold hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar Categoria
              </button>
           </div>

           <div className="space-y-8">
              {(formData.gift_list_json || []).map((category, catIdx) => (
                <div key={catIdx} className="p-8 bg-gray-50 rounded-[2rem] relative group border-2 border-transparent hover:border-gold/20 transition-all">
                   <button 
                     type="button" 
                     onClick={() => handleRemoveGiftCategory(catIdx)}
                     className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                   >
                     <Trash2 size={16} />
                   </button>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="space-y-1 md:col-span-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Título da Categoria</label>
                         <input 
                           placeholder="Ex: Cozinha, Sala de Estar..." 
                           className="w-full px-5 py-3 bg-white rounded-2xl border-none outline-none shadow-sm focus:ring-1 focus:ring-gold" 
                           value={category.title} 
                           onChange={(e) => handleUpdateGiftCategory(catIdx, 'title', e.target.value)} 
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Emoji / Ícone</label>
                         <input 
                           placeholder="Ex: 🍽️, 📺" 
                           className="w-full px-5 py-3 bg-white rounded-2xl border-none outline-none shadow-sm focus:ring-1 focus:ring-gold text-center text-xl" 
                           value={category.icon} 
                           onChange={(e) => handleUpdateGiftCategory(catIdx, 'icon', e.target.value)} 
                         />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pequena Descrição</label>
                         <input 
                           placeholder="Ex: Itens para o nosso novo lar..." 
                           className="w-full px-5 py-3 bg-white rounded-2xl border-none outline-none shadow-sm focus:ring-1 focus:ring-gold" 
                           value={category.description} 
                           onChange={(e) => handleUpdateGiftCategory(catIdx, 'description', e.target.value)} 
                         />
                      </div>
                   </div>

                   <div className="bg-white/50 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center px-1">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <Smile size={12} /> Itens Sugeridos
                         </h4>
                         <button 
                           type="button" 
                           onClick={() => handleAddGiftItem(catIdx)}
                           className="text-gold text-[10px] font-bold uppercase hover:underline"
                         >
                           + Novo Item
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(category.items || []).map((item, itemIdx) => (
                           <div key={itemIdx} className="flex gap-2 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100 group/item">
                              <input 
                                placeholder="Emoji" 
                                className="w-12 px-1 py-2 bg-gray-50 rounded-xl text-center outline-none border-none text-lg" 
                                value={item.icon} 
                                onChange={(e) => handleUpdateGiftItem(catIdx, itemIdx, 'icon', e.target.value)} 
                              />
                              <input 
                                placeholder="Nome do Item" 
                                className="flex-1 px-3 py-2 bg-gray-50 rounded-xl outline-none border-none text-sm" 
                                value={item.name} 
                                onChange={(e) => handleUpdateGiftItem(catIdx, itemIdx, 'name', e.target.value)} 
                              />
                              <button 
                                type="button" 
                                onClick={() => handleRemoveGiftItem(catIdx, itemIdx)} 
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                           </div>
                        ))}
                      </div>
                      {(!category.items || category.items.length === 0) && (
                        <p className="text-center text-xs text-gray-300 italic py-4">Nenhum item adicionado à categoria.</p>
                      )}
                   </div>
                </div>
              ))}
           </div>

           {(formData.gift_list_json || []).length === 0 && (
             <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-[2rem]">
                <p className="text-gray-400 font-medium italic">Crie categorias (ex: Cozinha, Sala) e adicione sugestões!</p>
             </div>
           )}
        </section>

        {/* Actions Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-gold text-white py-5 rounded-[2.5rem] font-black text-lg shadow-[0_20px_50px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div> : <Save size={24} />}
             Salvar Todas as Alterações
           </button>
        </div>

      </form>
    </div>
  );
};

export default StoryManagement;
