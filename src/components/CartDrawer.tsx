import { ShoppingCart, X, ShoppingBag, Trash2, Euro, ChevronRight } from 'lucide-react';
import { formatPrice } from '../constants';
import type { CartItem } from '../types';

interface CartDrawerProps {
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  updateCartQty: (productId: string, size: string, delta: number) => void;
  cartTotal: number;
  setIsCheckoutOpen: (open: boolean) => void;
}

export default function CartDrawer({ setIsCartOpen, cart, updateCartQty, cartTotal, setIsCheckoutOpen }: CartDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-blue-950 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            <h2 className="font-extrabold text-base">Carrello Felpe Divini</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-slate-300 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">Il carrello è vuoto.</p>
              <p className="text-xs text-slate-400 mt-1">Scegli uno degli stili per prenotare.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.product.id}-${item.size}`} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{item.product.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 my-1">
                    <span>Taglia: <strong className="text-blue-900 uppercase font-black">{item.size}</strong></span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">{formatPrice(item.product.price)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.size, -1)}
                        className="text-slate-600 font-bold hover:text-red-600"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.size, 1)}
                        className="text-slate-600 font-bold hover:text-blue-900"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => updateCartQty(item.product.id, item.size, -item.quantity)}
                      className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-600">Totale Promozionale:</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">€{cartTotal.toFixed(2)}</span>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl text-orange-900 text-[11px] flex items-center gap-2">
              <Euro className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Pagamento in contanti ai rappresentanti d'istituto prima della consegna.</span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              Procedi all'Ordine
              <ChevronRight className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
