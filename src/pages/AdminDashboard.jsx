import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { getGuestStats } from '../utils/guestUtils';
import guestListData from '../data/guestList.json';
import AdminLogin from '../components/AdminLogin';
import TableManagement from '../components/TableManagement';
import SeatingChart from '../components/SeatingChart';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvps, setRSVPs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'seating', 'statistics', 'management'




  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load data after authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Load static stats
      const guestStats = getGuestStats();
      setStats(guestStats);

      // Real-time RSVPs listener
      const q = query(collection(db, 'rsvps'), orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rsvpList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to Date object if it exists
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        // Merge with local storage data (for DEV_MODE)
        const localData = JSON.parse(localStorage.getItem('mock_rsvps') || '[]').map(item => ({
          ...item,
          timestamp: new Date(item.timestamp) // Convert string back to Date
        }));
        
        // Combine and sort
        const combinedList = [...rsvpList, ...localData].sort((a, b) => b.timestamp - a.timestamp);
        
        setRSVPs(combinedList);
      }, (error) => {
        console.error("Error fetching RSVPs:", error);
        // Fallback to local storage if Firestore fails
        const localData = JSON.parse(localStorage.getItem('mock_rsvps') || '[]').map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setRSVPs(localData);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteRSVP = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta confirmação?')) {
      try {
        await deleteDoc(doc(db, 'rsvps', id));
      } catch (error) {
        console.error("Error deleting RSVP:", error);
        alert("Erro ao deletar. Verifique suas permissões.");
      }
    }
  };

  const handleClearAllRSVPs = async () => {
    if (window.confirm('⚠️ ATENÇÃO: Isto irá apagar TODAS as confirmações do banco de dados. Esta ação não pode ser desfeita. Tem certeza absoluta?')) {
      try {
        const batch = writeBatch(db);
        const snapshot = await getDocs(collection(db, 'rsvps'));
        
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        
        // Also clear local storage
        localStorage.removeItem('mock_rsvps');
        
        alert("Todas as confirmações foram apagadas.");
      } catch (error) {
        console.error("Error clearing RSVPs:", error);
        alert("Erro ao limpar dados. Verifique suas permissões.");
      }
    }
  };

  const filteredRSVPs = rsvps.filter((rsvp) => {
    const matchesGroup = selectedGroup === 'all' || (rsvp.guestGroup && rsvp.guestGroup.includes(selectedGroup));
    const matchesSearch = rsvp.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const confirmedCount = rsvps.filter((r) => r.attending).length;
  const declinedCount = rsvps.filter((r) => !r.attending).length;
  const totalGuestsCount = rsvps.reduce((sum, r) => sum + (r.attending ? r.guests : 0), 0);

  const exportToCSV = () => {
    const headers = ['Nome', 'Grupo', 'Confirmado', 'Acompanhantes', 'Telefone', 'Mensagem', 'Data'];
    const rows = rsvps.map((rsvp) => [
      `"${rsvp.name}"`,
      `"${rsvp.guestGroup || ''}"`,
      rsvp.attending ? 'Sim' : 'Não',
      rsvp.guests,
      `"${rsvp.phone}"`,
      `"${rsvp.message || ''}"`,
      new Date(rsvp.timestamp).toLocaleDateString('pt-BR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rsvps_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!stats) {
    return <div className="text-center py-20">Carregando estatísticas...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-serif text-neutral-gray mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600">Gestão de convidados e confirmações</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearAllRSVPs}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              🗑️ Limpar Tudo
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
            >
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <p className="text-gray-600 text-sm mb-2">Total de Grupos</p>
            <p className="text-4xl font-bold text-gold">{stats.totalGroups}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <p className="text-gray-600 text-sm mb-2">Total de Convidados</p>
            <p className="text-4xl font-bold text-gold">{stats.totalGuests}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <p className="text-gray-600 text-sm mb-2">Confirmados</p>
            <p className="text-4xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-sm text-gray-500 mt-1">{totalGuestsCount} pessoas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <p className="text-gray-600 text-sm mb-2">Pendentes</p>
            <p className="text-4xl font-bold text-orange-600">
              {stats.totalGuests - confirmedCount - declinedCount}
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === 'overview' ? 'text-gold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Visão Geral
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gold rounded-t-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('seating')}
            className={`pb-4 px-4 font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === 'seating' ? 'text-gold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mapa de Assentos
            {activeTab === 'seating' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gold rounded-t-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`pb-4 px-4 font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === 'statistics' ? 'text-gold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Estatísticas Avançadas
            {activeTab === 'statistics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gold rounded-t-full"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <>
            {/* Filters and Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="w-full md:w-auto">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="all">Todos os Grupos</option>
                    {guestListData.groups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={exportToCSV}
                  className="w-full md:w-auto bg-gold text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
                >
                  📥 Exportar CSV
                </button>
              </div>
            </div>

            {/* RSVPs Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Nome
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Grupo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Acompanhantes
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Telefone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Data
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRSVPs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          Nenhuma confirmação encontrada
                        </td>
                      </tr>
                    ) : (
                      filteredRSVPs.map((rsvp) => {
                        // Check for companion in name
                        const hasCompanion = rsvp.name.toLowerCase().includes(' e ') || rsvp.name.toLowerCase().includes(' +');
                        const nameParts = hasCompanion ? rsvp.name.split(/ e | \+/) : [rsvp.name];
                        
                        return (
                          <motion.tr
                            key={rsvp.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-gray-800">
                              <div className="font-medium">{nameParts[0]}</div>
                              {hasCompanion && (
                                <div className="text-xs text-gold font-semibold mt-0.5">
                                  + {rsvp.name.substring(nameParts[0].length + 3)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{rsvp.guestGroup || '-'}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  rsvp.attending
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {rsvp.attending ? '✓ Confirmado' : '✗ Não virá'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">{rsvp.guests}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{rsvp.phone}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {rsvp.timestamp instanceof Date ? rsvp.timestamp.toLocaleDateString('pt-BR') : ''}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteRSVP(rsvp.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remover confirmação"
                              >
                                🗑️
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Groups Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-serif text-neutral-gray mb-6">
                Visão Geral dos Grupos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guestListData.groups.map((group) => {
                  const groupRSVPs = rsvps.filter((r) => r.guestGroup === group.name);
                  const confirmed = groupRSVPs.filter((r) => r.attending).length;

                  return (
                    <div
                      key={group.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-gold transition-colors"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">{group.name}</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Confirmados:</span>
                        <span className="font-semibold text-gold">
                          {confirmed} / {group.maxGuests}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : activeTab === 'seating' ? (
          <SeatingChart rsvps={rsvps} />
        ) : (
          /* Statistics Tab */
          <div className="space-y-8">
            {/* Family Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-serif text-neutral-gray mb-6">
                Distribuição por Família
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  const familyStats = {
                    binth: { count: 0, total: 0 },
                    jubilio: { count: 0, total: 0 },
                    others: { count: 0, total: 0 }
                  };

                  rsvps.filter(r => r.attending).forEach(rsvp => {
                    const groupName = (rsvp.guestGroup || '').toLowerCase();
                    if (groupName.includes('binth') && groupName.includes('jubílio')) {
                      familyStats.binth.count += rsvp.guests / 2;
                      familyStats.jubilio.count += rsvp.guests / 2;
                    } else if (groupName.includes('binth')) {
                      familyStats.binth.count += rsvp.guests;
                    } else if (groupName.includes('jubílio')) {
                      familyStats.jubilio.count += rsvp.guests;
                    } else {
                      familyStats.others.count += rsvp.guests;
                    }
                  });

                  return (
                    <>
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Família Binth</h3>
                        <p className="text-4xl font-bold text-blue-600">{Math.round(familyStats.binth.count)}</p>
                        <p className="text-sm text-blue-400 mt-1">convidados confirmados</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Família Jubílio</h3>
                        <p className="text-4xl font-bold text-green-600">{Math.round(familyStats.jubilio.count)}</p>
                        <p className="text-sm text-green-400 mt-1">convidados confirmados</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">Outros / Amigos</h3>
                        <p className="text-4xl font-bold text-purple-600">{Math.round(familyStats.others.count)}</p>
                        <p className="text-sm text-purple-400 mt-1">convidados confirmados</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Guest Messages */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-serif text-neutral-gray mb-6">
                Mensagens dos Convidados
              </h2>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Convidado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rsvps
                      .filter(r => r.message)
                      .map((rsvp) => (
                        <tr key={rsvp.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rsvp.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rsvp.guestGroup}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 italic">"{rsvp.message}"</td>
                        </tr>
                      ))}
                    {rsvps.filter(r => r.message).length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                          Nenhuma mensagem recebida até o momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
