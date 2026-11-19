import { X, ShoppingCart } from 'lucide-react';
import { ALL_SIZES, formatPrice, getOriginalPrice } from '../constants';
import type { Product } from '../types';

interface SizeModalProps {
  selectedProductModal: Product;
  setSelectedProductModal: (product: Product | null) => void;
  modalSize: string;
  setModalSize: (size: string) => void;
  addToCart: (product: Product, size: string, quantity?: number) => void;
}

export default function SizeModal({ selectedProductModal, setSelectedProductModal, modalSize, setModalSize, addToCart }: SizeModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          <img
            src={selectedProductModal.image}
            alt={selectedProductModal.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shrink-0"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              {selectedProductModal.badge}
            </span>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-0.5">
              {selectedProductModal.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {getOriginalPrice(selectedProductModal) > selectedProductModal.price && (
                <span className="text-xs line-through text-slate-400 font-semibold">
                  {formatPrice(getOriginalPrice(selectedProductModal))}
                </span>
              )}
              <span className="text-base sm:text-lg font-black text-blue-950">
                {formatPrice(selectedProductModal.price)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          {selectedProductModal.description}
        </p>

        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Seleziona Taglia:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {ALL_SIZES.map((sz) => {
              const stk = (selectedProductModal.stock && selectedProductModal.stock[sz]) || 0;
              const isAvailable = stk > 0;
              const isSelected = modalSize === sz;

              return (
                <button
                  key={sz}
                  disabled={!isAvailable}
                  onClick={() => setModalSize(sz)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-blue-950 bg-blue-950 text-white shadow-md scale-105'
                      : isAvailable
                      ? 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300'
                      : 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                  }`}
                >
                  <span>{sz}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            addToCart(selectedProductModal, modalSize, 1);
            setSelectedProductModal(null);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Aggiungi al Carrello (Taglia {modalSize} - {formatPrice(selectedProductModal.price)})
        </button>
      </div>
    </div>
  );
}
