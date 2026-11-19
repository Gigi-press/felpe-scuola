import { useState } from 'react';
import { School, Image as ImageIcon, ShoppingBag, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import type { Order, View } from '../types';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  handleOpenAdmin: () => void;
  isAdminAuthenticated: boolean;
  orders: Order[];
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
}

export default function Header({ currentView, setCurrentView, handleOpenAdmin, isAdminAuthenticated, orders, setIsCartOpen, cartCount }: HeaderProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-blue-950 text-white shadow-xl border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo & Divini Title */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => setCurrentView('shop')}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center shadow-md shrink-0">
            <School className="w-5 h-5 sm:w-6 sm:h-6 text-blue-950" />
          </div>
          <div>
            <span className="text-base sm:text-2xl font-black tracking-tight text-white block leading-tight">
              FELPE DIVINI
            </span>
            <span className="text-[9px] sm:text-xs font-bold tracking-wider text-orange-400 uppercase flex items-center gap-1">
              <span className="line-through text-blue-300">25€</span>
              <span className="bg-orange-500 text-white px-1 rounded text-[9px] font-black">PROMO 20€</span>
            </span>
          </div>
        </div>

        {/* Center/Right Navigation & School Logo Placeholder */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* LOGO SCUOLA / LISTA RAPPRESENTANTI */}
          <div className="hidden lg:flex items-center gap-2.5 border border-blue-800/80 bg-blue-900/40 backdrop-blur px-3 py-1.5 rounded-xl text-blue-200 text-xs">
            <div className="w-9 h-9 rounded-lg bg-white p-0.5 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {!logoError ? (
                <img 
                  src="/logo-lista.png" 
                  alt="Logo Lista Divini" 
                  className="w-full h-full object-contain rounded-md"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-orange-400" />
              )}
            </div>
            <div className="text-left leading-tight">
              <div className="font-extrabold text-white text-[11px]">Rappresentanti Divini</div>
              <div className="text-[9px] text-orange-300 uppercase font-semibold">Merchandising Ufficiale</div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="bg-blue-900/80 p-0.5 sm:p-1 rounded-xl border border-blue-800 flex items-center shrink-0">
            <button
              onClick={() => setCurrentView('shop')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'shop'
                  ? 'bg-orange-500 text-blue-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Negozio</span>
            </button>
            <button
              onClick={handleOpenAdmin}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'admin'
                  ? 'bg-orange-500 text-blue-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Admin</span>
              {isAdminAuthenticated ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Autenticato" />
              ) : (
                orders.filter(o => o.status === 'In attesa').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                )
              )}
            </button>
          </div>

          {/* Cart Button */}
          {currentView === 'shop' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 sm:py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrello</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-950 text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
