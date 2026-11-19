import { ShieldCheck, Package, SlidersHorizontal, LogOut, LayoutGrid } from 'lucide-react';
import { auth } from '../firebase';
import type { AdminStats, AdminTab, Order } from '../types';

interface AdminHeaderProps {
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  orders: Order[];
  handleAdminLogout: () => void;
  adminStats: AdminStats;
}

export default function AdminHeader({ activeAdminTab, setActiveAdminTab, orders, handleAdminLogout, adminStats }: AdminHeaderProps) {
  return (
    <div className="bg-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8 border border-blue-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-blue-900 gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Gestione Divini
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Pannello Gestione Ordini & Incassi</h1>
          {auth?.currentUser?.email && (
            <p className="text-xs text-blue-300 mt-1">
              Connesso come Admin: <span className="text-orange-400 font-semibold">{auth.currentUser.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-blue-900 p-1 rounded-xl border border-blue-800">
            <button
              onClick={() => setActiveAdminTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'orders'
                  ? 'bg-orange-500 text-blue-950 shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              Ordini ({orders.length})
            </button>
            <button
              onClick={() => setActiveAdminTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'inventory'
                  ? 'bg-orange-500 text-blue-950 shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Scorte
            </button>
            <button
              onClick={() => setActiveAdminTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'catalog'
                  ? 'bg-orange-500 text-blue-950 shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Catalogo
            </button>
          </div>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Esci
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6">

        <div className="bg-blue-900/80 p-3 sm:p-4 rounded-xl border border-blue-800">
          <div className="text-blue-300 text-[11px] sm:text-xs font-medium">Totale Ordini</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{adminStats.totalOrdersCount}</div>
          <div className="text-[9px] sm:text-[10px] text-orange-400 mt-0.5">studenti, prof, ATA ed esterni</div>
        </div>

        <div className="bg-blue-900/80 p-3 sm:p-4 rounded-xl border border-blue-800">
          <div className="text-blue-300 text-[11px] sm:text-xs font-medium">Contanti Incassati</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">€{adminStats.collectedCash.toFixed(2)}</div>
          <div className="text-[9px] sm:text-[10px] text-emerald-300 mt-0.5">ordini consegnati</div>
        </div>

        <div className="bg-blue-900/80 p-3 sm:p-4 rounded-xl border border-blue-800">
          <div className="text-blue-300 text-[11px] sm:text-xs font-medium">Da Incassare</div>
          <div className="text-xl sm:text-2xl font-black text-orange-400 mt-1">€{adminStats.pendingCash.toFixed(2)}</div>
          <div className="text-[9px] sm:text-[10px] text-orange-300 mt-0.5">in attesa di consegna</div>
        </div>

        <div className="bg-blue-900/80 p-3 sm:p-4 rounded-xl border border-blue-800">
          <div className="text-blue-300 text-[11px] sm:text-xs font-medium">Felpe Prenotate</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{adminStats.totalHoodiesSold}</div>
          <div className="text-[9px] sm:text-[10px] text-blue-300 mt-0.5">unità totali</div>
        </div>

      </div>
    </div>
  );
}
