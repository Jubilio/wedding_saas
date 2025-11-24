import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import guestListData from '../data/guestList.json';

const SeatingChart = ({ rsvps }) => {
  const [selectedTable, setSelectedTable] = useState(null);

  // Calculate occupancy for each table
  const tables = guestListData.groups.map(group => {
    const groupRSVPs = rsvps.filter(r => r.guestGroup === group.name && r.attending);
    const confirmedCount = groupRSVPs.reduce((sum, r) => sum + r.guests, 0);
    
    let status = 'empty';
    if (confirmedCount >= group.maxGuests) status = 'full';
    else if (confirmedCount > 0) status = 'partial';

    return {
      ...group,
      confirmedCount,
      status,
      guests: groupRSVPs
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'full': return 'bg-green-500 border-green-600 text-white';
      case 'partial': return 'bg-yellow-400 border-yellow-500 text-white';
      default: return 'bg-white border-gray-300 text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-serif text-neutral-gray mb-6 flex items-center gap-2">
        🗺️ Mapa de Assentos
        <span className="text-sm font-sans font-normal text-gray-500 ml-auto">
          {tables.length} Mesas
        </span>
      </h2>

      {/* Legend */}
      <div className="flex gap-4 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Cheia (10/10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          <span>Parcial (1-9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
          <span>Vazia (0)</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map((table) => (
          <motion.div
            key={table.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTable(table)}
            className={`
              relative aspect-square rounded-full border-4 shadow-md cursor-pointer
              flex flex-col items-center justify-center text-center p-4 transition-colors
              ${getStatusColor(table.status)}
            `}
          >
            <h3 className="font-bold text-sm md:text-base leading-tight mb-1">
              {table.name.split(' - ')[1] || table.name}
            </h3>
            <p className="text-xs font-medium opacity-90">
              {table.confirmedCount} / {table.maxGuests}
            </p>
            
            {/* Table Number Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white">
              {table.id.replace('mesa-', '')}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTable(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gold p-4 text-white flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold">
                  {selectedTable.name}
                </h3>
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">Ocupação</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    selectedTable.status === 'full' ? 'bg-green-100 text-green-700' :
                    selectedTable.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedTable.confirmedCount} / {selectedTable.maxGuests}
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedTable.guests.length > 0 ? (
                    selectedTable.guests.map((guest, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{guest.name}</p>
                          {guest.guests > 1 && (
                            <p className="text-xs text-gray-500">
                              + {guest.guests - 1} acompanhante(s)
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                          {guest.guests} assento(s)
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum convidado confirmado nesta mesa.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatingChart;
