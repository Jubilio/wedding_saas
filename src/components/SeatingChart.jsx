import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SeatingChart = ({ rsvps, eventId }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);

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

  const tableData = tables.map((table, idx) => {
    const guestsInTable = rsvps.filter(r => r.attending && r.tableAssignment === table.name);
    const confirmedCount = guestsInTable.reduce((sum, r) => sum + (r.guests_count || 0), 0);
    
    let status = 'empty';
    if (confirmedCount >= table.capacity) status = 'full';
    else if (confirmedCount > 0) status = 'partial';

    return {
      ...table,
      index: idx,
      confirmedCount,
      status,
      guests: guestsInTable
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'full': return 'bg-green-500 border-green-600 text-white shadow-green-200';
      case 'partial': return 'bg-blue-500 border-blue-600 text-white shadow-blue-200';
      default: return 'bg-white border-gray-200 text-gray-400';
    }
  };

  const getSeats = (tableGuests, capacity) => {
    const seats = Array(capacity).fill(null);
    let seatIndex = 0;

    tableGuests.forEach(rsvp => {
      for (let i = 0; i < rsvp.guests_count; i++) {
        if (seatIndex < capacity) {
          seats[seatIndex] = i === 0 ? rsvp.guestName : `${rsvp.guestName} (Acomp.)`;
          seatIndex++;
        }
      }
    });

    return seats;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-gray-800">Mapa do Salão</h2>
          <p className="text-gray-500">Cada mesa possui capacidade para <span className="font-bold text-gold">10 lugares</span></p>
        </div>
        <div className="flex gap-4 p-2 bg-gray-50 rounded-xl">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="w-3 h-3 rounded-full bg-green-500"></div> Cheia
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Ocupada
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="w-3 h-3 rounded-full bg-white border border-gray-200"></div> Vazia
           </div>
        </div>
      </div>

      {tableData.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhuma mesa criada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {tableData.map((table) => (
            <motion.div
              key={table.id}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setSelectedTable(table)}
              className={`relative aspect-square rounded-[2.5rem] border-2 shadow-lg cursor-pointer flex flex-col items-center justify-center text-center p-4 transition-all ${getStatusColor(table.status)}`}
            >
              <h3 className="font-bold text-xs uppercase tracking-tighter mb-2">{table.name}</h3>
              <div className="flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded-full">
                 <span className="text-xs font-black">{table.confirmedCount}</span>
                 <span className="text-[10px] opacity-60">/ {table.capacity}</span>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                  {[...Array(table.capacity)].map((_, i) => {
                      const angle = (i * (360 / table.capacity)) * (Math.PI / 180);
                      const x = Math.cos(angle) * 45;
                      const y = Math.sin(angle) * 45;
                      const isOccupied = i < table.confirmedCount;
                      return <div key={i} style={{ left: `calc(50% + ${x}%)`, top: `calc(50% + ${y}%)`, transform: 'translate(-50%, -50%)' }} className={`absolute w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-white' : 'bg-gray-200'}`} />;
                  })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setSelectedTable(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedTable(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
              <div className="bg-gradient-to-br from-gold/10 to-transparent p-10 text-center border-b border-gray-100">
                <h3 className="text-4xl font-serif font-bold italic text-gray-800">{selectedTable.name}</h3>
                <span className={`inline-block mt-4 px-4 py-1 rounded-full text-xs font-bold ${selectedTable.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{selectedTable.confirmedCount} / {selectedTable.capacity} Lugares Ocupados</span>
              </div>
              <div className="p-8 grid grid-cols-2 gap-3">
                  {getSeats(selectedTable.guests, selectedTable.capacity).map((guestName, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${guestName ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-dashed border-gray-200 op-60'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${guestName ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{idx + 1}</div>
                      <p className={`text-xs font-bold truncate ${guestName ? 'text-blue-900' : 'text-gray-400 italic'}`}>{guestName || 'Disponível'}</p>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatingChart;
