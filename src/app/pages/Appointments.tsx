import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RefreshCw, Calendar, MapPin, Package, MoreVertical, X } from 'lucide-react';

export const Appointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(true);

  const handleRefresh = () => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); };
  const handleCancel = () => { setShowUpcoming(false); setActiveTab('cancelled'); };

  return (
    <div className="min-h-full w-full bg-eco-black pb-24">
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-display font-bold">Meus Agendamentos</h1>
          <button onClick={handleRefresh} className={`w-10 h-10 flex items-center justify-center text-eco-neon ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="flex space-x-2 mb-6">
          {['upcoming', 'completed', 'cancelled'].map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
              {['Próximos', 'Concluídos', 'Cancelados'][i]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 'upcoming' && showUpcoming && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-eco-green/20 text-eco-neon border border-eco-neon/30 px-3 py-1 rounded-full text-xs font-bold uppercase">Agendado</div>
                <button className="text-gray-500"><MoreVertical size={20} /></button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-sm"><Calendar size={18} className="text-gray-400" /><span className="font-medium">14 de Maio, 10:00</span></div>
                <div className="flex items-start space-x-3 text-sm"><MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" /><span className="text-gray-300">EcoPonto Consolação<br /><span className="text-xs text-gray-500">R. da Consolação, 1000, São Paulo</span></span></div>
                <div className="flex items-center space-x-3 text-sm"><Package size={18} className="text-gray-400" /><span className="text-gray-300">1x Celular, 2x Baterias</span></div>
              </div>
              <div className="flex space-x-3 mt-4 pt-4 border-t border-white/5">
                <button onClick={() => navigate('/schedule')} className="flex-1 py-2 rounded-xl text-sm font-medium text-white border border-white/10 hover:bg-white/5">Reagendar</button>
                <button onClick={handleCancel} className="flex-1 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20">Cancelar</button>
              </div>
            </div>
          )}
          {activeTab === 'upcoming' && !showUpcoming && (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4"><Calendar size={40} className="text-gray-500" /></div>
              <p className="text-gray-400">Nenhum agendamento futuro</p>
            </div>
          )}
          {activeTab === 'completed' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 opacity-80">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Concluído</div>
                <span className="font-mono text-eco-neon font-bold">+120 pts</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm"><Calendar size={18} className="text-gray-400" /><span className="text-gray-300">02 de Abril, 14:00</span></div>
                <div className="flex items-center space-x-3 text-sm"><Package size={18} className="text-gray-400" /><span className="text-gray-300">Monitor, Teclado</span></div>
              </div>
            </div>
          )}
          {activeTab === 'cancelled' && (
            showUpcoming ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4"><X size={40} className="text-gray-500" /></div>
                <p className="text-gray-400">Nenhum agendamento cancelado</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 opacity-80">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">Cancelado</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm"><Calendar size={18} className="text-gray-400" /><span className="text-gray-300 line-through">14 de Maio, 10:00</span></div>
                  <div className="flex items-center space-x-3 text-sm"><Package size={18} className="text-gray-400" /><span className="text-gray-300">1x Celular, 2x Baterias</span></div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
