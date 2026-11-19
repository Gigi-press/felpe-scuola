import { useEffect, useState } from 'react';
import type React from 'react';
import {
  ALL_SIZES, TEST_PRODUCT_ID, formatPrice, getOriginalPrice, isProductActive,
} from '../constants';
import type { Product } from '../types';

type Filter = 'all' | 'active' | 'hidden';

interface InventoryTabProps {
  allProducts: Product[];
  handleUpdateStock: (productId: string, size: string, newQty: number | string) => void;
  updateProductPrice: (product: Product, price: number, originalPrice: number) => Promise<void>;
}

/** "18,50" o "18.50" → 18.5 */
const parsePrice = (s: string) => parseFloat(s.replace(',', '.'));
const toInput = (n: number) => String(n).replace('.', ',');

/** Campi prezzo con pulsante Salva (scrive su Firestore solo al clic, non a ogni tasto). */
function PriceEditor({ product, updateProductPrice }: {
  product: Product;
  updateProductPrice: InventoryTabProps['updateProductPrice'];
}) {
  const [price, setPrice] = useState(toInput(product.price));
  const [original, setOriginal] = useState(toInput(getOriginalPrice(product)));
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  // Se il prezzo cambia su Firestore (salvataggio o un altro admin), aggiorna i campi
  const savedOriginal = getOriginalPrice(product);
  useEffect(() => {
    setPrice(toInput(product.price));
    setOriginal(toInput(savedOriginal));
  }, [product.price, savedOriginal]);

  const p = parsePrice(price);
  const o = parsePrice(original);
  const changed = p !== product.price || o !== getOriginalPrice(product);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(p > 0)) { setState('error'); setError('Prezzo non valido'); return; }
    setState('saving');
    try {
      await updateProductPrice(product, p, o > 0 ? o : p);
      setState('saved');
    } catch (err) {
      console.error('Price update error:', err);
      setState('error');
      setError('Salvataggio non riuscito');
    }
  };

  const field = 'w-16 text-center text-xs font-extrabold border border-slate-200 rounded-lg py-1 bg-white';

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col text-[10px] font-bold text-slate-500 uppercase">
        Prezzo €
        <input inputMode="decimal" className={field} value={price} aria-label={`Prezzo di ${product.name}`}
          onChange={e => { setPrice(e.target.value); setState('idle'); }} />
      </label>
      <label className="flex flex-col text-[10px] font-bold text-slate-500 uppercase">
        Barrato €
        <input inputMode="decimal" className={field} value={original} aria-label={`Prezzo pieno di ${product.name}`}
          onChange={e => { setOriginal(e.target.value); setState('idle'); }} />
      </label>
      <button
        type="submit"
        disabled={!changed || state === 'saving'}
        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
      >
        {state === 'saving' ? 'Salvo…' : 'Salva prezzo'}
      </button>
      {state === 'saved' && !changed && <span className="text-[11px] font-bold text-emerald-600">✓ Salvato</span>}
      {state === 'error' && <span role="alert" className="text-[11px] font-bold text-red-600">{error}</span>}
    </form>
  );
}

export default function InventoryTab({ allProducts, handleUpdateStock, updateProductPrice }: InventoryTabProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const visibleInShop = (p: Product) => p.id !== TEST_PRODUCT_ID && isProductActive(p);
  const shown = allProducts
    .filter(p => filter === 'all' || (filter === 'active' ? visibleInShop(p) : !visibleInShop(p)))
    // Visibili prima, poi nascosti, prodotto test in fondo; dentro ogni gruppo in ordine di nome
    .sort((a, b) => {
      const rank = (p: Product) => (p.id === TEST_PRODUCT_ID ? 2 : visibleInShop(p) ? 0 : 1);
      return rank(a) - rank(b) || a.name.localeCompare(b.name);
    });

  const counts = {
    all: allProducts.length,
    active: allProducts.filter(visibleInShop).length,
    hidden: allProducts.filter(p => !visibleInShop(p)).length,
  };
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tutti' },
    { key: 'active', label: 'Visibili' },
    { key: 'hidden', label: 'Nascosti' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="mb-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Magazzino e Prezzi</h2>
          <p className="text-xs text-slate-500">
            Scorte e prezzi di tutti i prodotti, anche quelli nascosti. Le scorte si salvano subito; il prezzo con "Salva prezzo".
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto" role="group" aria-label="Filtra prodotti">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                filter === f.key ? 'bg-white text-blue-950 shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && (
        <p className="text-center text-sm text-slate-500 py-10">Nessun prodotto in questa vista.</p>
      )}

      <div className="space-y-4 sm:space-y-5">
        {shown.map((product) => {
          const isTest = product.id === TEST_PRODUCT_ID;
          const active = visibleInShop(product);
          return (
            <div key={product.id} className={`border border-slate-200 rounded-xl p-3.5 sm:p-5 ${active ? 'bg-slate-50/50' : 'bg-slate-100/60'}`}>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt="" className={`w-12 h-12 rounded-lg object-cover border ${active || isTest ? '' : 'opacity-60'}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{product.name}</h3>
                      {isTest ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-900">SOLO TEST</span>
                      ) : active ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">VISIBILE</span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">NASCOSTO</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-orange-600">
                      {getOriginalPrice(product) > product.price && (
                        <span className="line-through text-slate-400 mr-1">{formatPrice(getOriginalPrice(product))}</span>
                      )}
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <PriceEditor
                    key={product.id}
                    product={product}
                    updateProductPrice={updateProductPrice}
                  />
                  <button
                    onClick={() => {
                      ALL_SIZES.forEach(sz => {
                        handleUpdateStock(product.id, sz, ((product.stock && product.stock[sz]) || 0) + 5);
                      });
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-blue-200"
                  >
                    +5 su tutte
                  </button>
                </div>
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
                          aria-label={`Togli un pezzo ${size}`}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={qty}
                          aria-label={`Scorte ${product.name} taglia ${size}`}
                          onChange={(e) => handleUpdateStock(product.id, size, e.target.value)}
                          className="w-10 text-center text-xs font-extrabold border border-slate-200 rounded py-0.5"
                        />
                        <button
                          onClick={() => handleUpdateStock(product.id, size, qty + 1)}
                          aria-label={`Aggiungi un pezzo ${size}`}
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
          );
        })}
      </div>

    </div>
  );
}
