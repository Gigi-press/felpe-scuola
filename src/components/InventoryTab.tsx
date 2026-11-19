import { ALL_SIZES } from '../constants';
import type { Product } from '../types';

interface InventoryTabProps {
  products: Product[];
  handleUpdateStock: (productId: string, size: string, newQty: number | string) => void;
}

export default function InventoryTab({ products, handleUpdateStock }: InventoryTabProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-extrabold text-slate-900">
          Gestione Giacenze Magazzino Divini
        </h2>
        <p className="text-xs text-slate-500">
          Modifica le disponibilità delle taglie per i 5 stili attivi (da Stile G a Stile K).
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {products.map((product) => (
          <div key={product.id} className="border border-slate-200 rounded-xl p-3.5 sm:p-5 bg-slate-50/50">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{product.name}</h3>
                  <span className="text-xs font-bold text-orange-600">
                    <span className="line-through text-slate-400 mr-1">€25,00</span>
                    €20,00
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  ALL_SIZES.forEach(sz => {
                    handleUpdateStock(product.id, sz, ((product.stock && product.stock[sz]) || 0) + 5);
                  });
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto"
              >
                +5 su tutte
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {ALL_SIZES.map((size) => {
                const qty = (product.stock && product.stock[size]) || 0;
                return (
                  <div key={size} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <span className="text-[11px] font-black text-slate-700 uppercase">{size}</span>
                    <div className="flex items-center gap-1 my-1">
                      <button
                        onClick={() => handleUpdateStock(product.id, size, qty - 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => handleUpdateStock(product.id, size, e.target.value)}
                        className="w-8 text-center text-xs font-extrabold border border-slate-200 rounded py-0.5"
                      />
                      <button
                        onClick={() => handleUpdateStock(product.id, size, qty + 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs"
                      >
                        +
                      </button>
                    </div>
                    <span className={`text-[9px] font-bold ${qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {qty > 0 ? 'In Stock' : 'Esaurito'}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
