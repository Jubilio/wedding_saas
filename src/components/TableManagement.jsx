import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import guestListData from '../data/guestList.json';

const TableManagement = ({ rsvps }) => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [targetTable, setTargetTable] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get all tables (groups)
  const tables = guestListData.groups;

  // Helper to get guests for a specific table
  const getTableGuests = (tableName) => {
    return rsvps.filter(r => r.attending && r.guestGroup === tableName);
  };

  // Helper to get table capacity status
  const getTableStatus = (tableName, maxGuests) => {
    const currentGuests = getTableGuests(tableName).reduce((sum, r) => sum + r.guests, 0);
    return {
      current: currentGuests,
      max: maxGuests,
      isFull: currentGuests >= maxGuests,
      available: maxGuests - currentGuests
    };
  };

  const handleMoveGuest = async (tableId, tableName, maxGuests) => {
    if (!selectedGuest) return;

    setError('');
    setSuccessMsg('');

    // Check if trying to move to same table
    if (selectedGuest.guestGroup === tableName) {
      setError('O convidado já está nesta mesa.');
      return;
    }

    // Check capacity
    const status = getTableStatus(tableName, maxGuests);
    if (status.current + selectedGuest.guests > maxGuests) {
      setError(`Mesa cheia! Capacidade: ${maxGuests}, Disponível: ${status.available}, Necessário: ${selectedGuest.guests}`);
      return;
    }

    setIsMoving(true);

    try {
      const rsvpRef = doc(db, 'rsvps', selectedGuest.id);
      
      await updateDoc(rsvpRef, {
        guestGroup: tableName,
        groupId: tableId, // Update ID as well for consistency
        lastModified: new Date()
      });

      setSuccessMsg(`✅ ${selectedGuest.name} movido para ${tableName}`);
      setSelectedGuest(null);
      setTargetTable(null);
    } catch (err) {
      console.error("Error moving guest:", err);
      setError('Erro ao mover convidado. Tente novamente.');
    } finally {
      setIsMoving(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Status Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif text-neutral-gray">Gestão de Mesas</h2>
            <p className="text-gray-600 text-sm">Selecione um convidado para mover de mesa</p>
          </div>
          
          {selectedGuest && (
            <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 animate-pulse">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Selecionado:</p>
                <p className="font-bold text-blue-800">{selectedGuest.name}</p>
              </div>
              <button 
                onClick={() => setSelectedGuest(null)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
              {successMsg}
            </div>
          )}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const guests = getTableGuests(table.name);
          const status = getTableStatus(table.name, table.maxGuests);
          const isTarget = selectedGuest && selectedGuest.guestGroup !== table.name;
          const canAccept = isTarget && (status.current + selectedGuest.guests <= table.maxGuests);

          return (
            <motion.div
              key={table.id}
              layout
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
                selectedGuest?.guestGroup === table.name 
                  ? 'border-blue-400 ring-2 ring-blue-100' 
                  : canAccept 
                    ? 'border-green-400 hover:ring-4 hover:ring-green-100 cursor-pointer'
                    : isTarget
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-transparent hover:border-gold/30'
              }`}
              onClick={() => {
                if (canAccept) {
                  handleMoveGuest(table.id, table.name, table.maxGuests);
                }
              }}
            >
              {/* Table Header */}
              <div className={`p-3 ${
                status.isFull ? 'bg-green-100' : 'bg-gray-50'
              } border-b border-gray-100 flex justify-between items-center`}>
                <h3 className="font-bold text-gray-700 truncate pr-2" title={table.name}>
                  {table.name}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  status.isFull ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {status.current}/{table.maxGuests}
                </span>
              </div>

              {/* Guest List */}
              <div className="p-3 space-y-2 min-h-[100px]">
                {guests.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center italic py-4">Vazia</p>
                ) : (
                  guests.map((guest) => (
                    <div 
                      key={guest.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGuest(selectedGuest?.id === guest.id ? null : guest);
                      }}
                      className={`text-sm p-2 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                        selectedGuest?.id === guest.id
                          ? 'bg-blue-100 text-blue-800 font-semibold'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="truncate mr-2">{guest.name}</span>
                      <span className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500">
                        {guest.guests}
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              {/* Action Overlay (Only visible when dragging/selecting) */}
              {canAccept && (
                <div className="bg-green-500/10 absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    Mover para cá
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TableManagement;
