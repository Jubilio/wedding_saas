import React, { useState, useEffect, useCallback } from 'react';
import { Users, Move, CheckCircle, HelpCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const TableManagement = ({ rsvps, eventId, onUpdate }) => {
  const [selectedRsvp, setSelectedRsvp] = useState(null);
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    if (!eventId) return;
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('event_id', eventId)
      .order('name', { ascending: true });
    
    if (error) {
      console.error("Error fetching tables:", error);
    } else {
      setTables(data || []);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const confirmedRSVPs = rsvps.filter(r => r.attending);
  
  const getTableGuests = (tableName) => {
    return confirmedRSVPs.filter(r => r.tableAssignment === tableName);
  };

  const unassignedRSVPs = confirmedRSVPs.filter(r => !r.tableAssignment);

  const handleCreateTable = async () => {
    if (!newTableName.trim() || !eventId) return;

    if (tables.some(t => t.name.toLowerCase() === newTableName.trim().toLowerCase())) {
      toast.error("Já existe uma mesa com esse nome.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tables')
        .insert([{ event_id: eventId, name: newTableName.trim(), capacity: 10 }]);

      if (error) throw error;

      toast.success(`✅ Mesa "${newTableName}" criada!`);
      setNewTableName('');
      fetchTables();
    } catch (err) {
      console.error("Error creating table:", err);
      toast.error("Erro ao criar mesa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (tableId, tableName) => {
    const guests = getTableGuests(tableName);
    if (guests.length > 0) {
      toast.error("Remova os convidados desta mesa antes de apagá-la.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)
        .eq('event_id', eventId);

      if (error) throw error;

      toast.success(`🗑️ Mesa "${tableName}" removida.`);
      fetchTables();
    } catch (err) {
      console.error("Error deleting table:", err);
      toast.error("Erro ao remover mesa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToTable = async (tableName) => {
    if (!selectedRsvp) return;

    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ table_assignment: tableName })
        .eq('id', selectedRsvp.id)
        .eq('event_id', eventId);

      if (error) throw error;

      toast.success(`✅ ${selectedRsvp.guestName} atribuído(a) à ${tableName}`);
      setSelectedRsvp(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Erro ao atribuir mesa.");
    }
  };

  const handleUnassign = async (rsvpId) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ table_assignment: null })
        .eq('id', rsvpId)
        .eq('event_id', eventId);

      if (error) throw error;
      toast.success(`✅ Convidado removido da mesa.`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error unassigning:", err);
      toast.error("Erro ao remover da mesa.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gold">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestão de Mesas</h2>
            <p className="text-gray-500">Cada mesa tem capacidade para 10 pessoas</p>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Nome da mesa..."
              className="px-4 py-2 border-2 border-gray-100 rounded-lg focus:ring-gold outline-none focus:border-gold"
              disabled={isLoading}
            />
            <button
              onClick={handleCreateTable}
              disabled={isLoading || !newTableName.trim()}
              className="bg-gold text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Waiting List */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm mb-4">Aguardando Atribuição ({unassignedRSVPs.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {unassignedRSVPs.map(rsvp => (
                  <div 
                    key={rsvp.id}
                    onClick={() => setSelectedRsvp(selectedRsvp?.id === rsvp.id ? null : rsvp)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRsvp?.id === rsvp.id ? 'border-gold bg-gold/5' : 'border-gray-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-gray-800 text-sm">{rsvp.guestName}</p>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{rsvp.guests_count}</span>
                    </div>
                  </div>
                ))}
                {unassignedRSVPs.length === 0 && <p className="text-gray-400 text-center py-10 italic">Tudo em ordem!</p>}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="lg:col-span-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map(table => {
                const guestsInTable = getTableGuests(table.name);
                const currentCount = guestsInTable.reduce((acc, g) => acc + g.guests_count, 0);
                const isFull = currentCount >= table.capacity;

                return (
                  <div 
                    key={table.id}
                    onClick={() => selectedRsvp && !isFull && handleAssignToTable(table.name)}
                    className={`bg-white rounded-2xl shadow-md border-2 transition-all p-5 relative overflow-hidden ${
                      selectedRsvp ? (isFull ? 'opacity-50 cursor-not-allowed' : 'border-blue-400 cursor-pointer') : 'border-transparent'
                    }`}
                  >
                    <div className="absolute top-0 left-0 h-1 bg-gold" style={{ width: `${(currentCount/table.capacity)*100}%` }}></div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-800">{table.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-green-500'}`}>{currentCount}/{table.capacity}</span>
                        {guestsInTable.length === 0 && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id, table.name); }} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                       {guestsInTable.map(guest => (
                         <div key={guest.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded group">
                            <span>{guest.guestName}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleUnassign(guest.id); }} className="text-red-400 opacity-0 group-hover:opacity-100">&times;</button>
                         </div>
                       ))}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TableManagement;
