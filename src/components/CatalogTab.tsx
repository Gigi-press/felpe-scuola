import { useState } from 'react';
import type React from 'react';
import { Eye, EyeOff, Plus, Trash2, X } from 'lucide-react';
import {
  ALL_SIZES, AVAILABLE_IMAGES, TEST_PRODUCT_ID, UNIVERSAL_DESCRIPTION, UNIVERSAL_TAGLINE,
  formatPrice, getOriginalPrice, isProductActive,
} from '../constants';
import type { NewProductInput } from '../hooks/useCatalogAdmin';
import { useConfirm } from './ConfirmDialog';
import type { Product } from '../types';

interface CatalogTabProps {
  allProducts: Product[];
  addProduct: (input: NewProductInput) => Promise<Product>;
  setProductActive: (product: Product, active: boolean) => Promise<void>;
  deleteProduct: (product: Product) => Promise<void>;
}

const emptyForm = () => ({
  name: '',
  badge: '',
  tagline: UNIVERSAL_TAGLINE,
  description: UNIVERSAL_DESCRIPTION,
  price: '20',
  originalPrice: '25',
  image: AVAILABLE_IMAGES[0],
  stock: Object.fromEntries(ALL_SIZES.map(sz => [sz, '10'])) as Record<string, string>,
  active: true,
});

const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900';
const labelClass = 'block text-xs font-bold text-slate-700 mb-1';

export default function CatalogTab({ allProducts, addProduct, setProductActive, deleteProduct }: CatalogTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDialog, ask] = useConfirm();

  // Attivi prima, poi in ordine alfabetico; il prodotto test in fondo
  const sorted = [...allProducts].sort((a, b) => {
    const rank = (p: Product) => (p.id === TEST_PRODUCT_ID ? 2 : isProductActive(p) ? 0 : 1);
    return rank(a) - rank(b) || a.name.localeCompare(b.name);
  });
  const activeCount = allProducts.filter(p => p.id !== TEST_PRODUCT_ID && isProductActive(p)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const price = parseFloat(form.price.replace(',', '.'));
    const originalPrice = parseFloat(form.originalPrice.replace(',', '.'));
    if (!form.name.trim()) return setMessage({ type: 'error', text: 'Inserisci il nome del prodotto.' });
    if (!(price > 0)) return setMessage({ type: 'error', text: 'Il prezzo deve essere maggiore di zero.' });
    if (!form.image.trim()) return setMessage({ type: 'error', text: 'Scegli un\'immagine.' });

    setIsSaving(true);
    setMessage(null);
    try {
      const created = await addProduct({
        name: form.name,
        badge: form.badge || form.name,
        tagline: form.tagline,
        description: form.description,
        price,
        // Il prezzo pieno non può essere più basso di quello scontato
        originalPrice: originalPrice > price ? originalPrice : price,
        image: form.image,
        stock: Object.fromEntries(ALL_SIZES.map(sz => [sz, parseInt(form.stock[sz]) || 0])),
        active: form.active,
      });
      setMessage({
        type: 'ok',
        text: `"${created.name}" aggiunto${created.active ? ' e visibile nel negozio' : ' (nascosto)'}.`,
      });
      setForm(emptyForm());
      setIsFormOpen(false);
    } catch (err) {
      console.error('Add product error:', err);
      setMessage({ type: 'error', text: 'Non è stato possibile salvare il prodotto. Riprova.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (product: Product) => {
    const active = !isProductActive(product);
    setBusyId(product.id);
    setMessage(null);
    try {
      await setProductActive(product, active);
      setMessage({ type: 'ok', text: `"${product.name}" ${active ? 'ora è visibile nel negozio' : 'è stato nascosto dal negozio'}.` });
    } catch (err) {
      console.error('Toggle product error:', err);
      setMessage({ type: 'error', text: 'Operazione non riuscita. Riprova.' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    const choice = await ask({
      title: `Eliminare "${product.name}"?`,
      message: (
        <>
          <p>L'eliminazione è <strong>definitiva</strong>: le scorte di questo prodotto andranno perse. Gli ordini già fatti restano.</p>
          <p>Se vuoi solo toglierlo dal negozio, usa "Nascondi".</p>
        </>
      ),
      actions: [{ value: 'delete', label: 'Elimina prodotto', tone: 'danger' }],
    });
    if (!choice) return;
    setBusyId(product.id);
    setMessage(null);
    try {
      await deleteProduct(product);
      setMessage({ type: 'ok', text: `"${product.name}" eliminato.` });
    } catch (err) {
      console.error('Delete product error:', err);
      setMessage({ type: 'error', text: 'Eliminazione non riuscita. Riprova.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      {confirmDialog}
      <div className="mb-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Catalogo Prodotti</h2>
          <p className="text-xs text-slate-500">
            {activeCount} {activeCount === 1 ? 'prodotto visibile' : 'prodotti visibili'} nel negozio su {allProducts.filter(p => p.id !== TEST_PRODUCT_ID).length} totali.
            Nascondi un prodotto per toglierlo dal negozio senza perdere le scorte.
          </p>
        </div>
        <button
          onClick={() => { setIsFormOpen(o => !o); setMessage(null); }}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs px-3 py-2 rounded-xl shadow self-start sm:self-auto"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-orange-400" />}
          {isFormOpen ? 'Chiudi' : 'Aggiungi prodotto'}
        </button>
      </div>

      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`mb-4 rounded-xl p-3 text-xs font-semibold border ${
            message.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* FORM NUOVO PRODOTTO */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-extrabold text-blue-950">Nuovo prodotto</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="np-name">Nome *</label>
              <input id="np-name" required className={inputClass} placeholder="es. Felpa Stile A"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="np-badge">Etichetta sulla foto</label>
              <input id="np-badge" className={inputClass} placeholder="es. Stile A (se vuoto, usa il nome)"
                value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="np-price">Prezzo scontato (€) *</label>
              <input id="np-price" required inputMode="decimal" className={inputClass}
                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className={labelClass} htmlFor="np-orig">Prezzo pieno barrato (€)</label>
              <input id="np-orig" inputMode="decimal" className={inputClass}
                value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
            </div>
          </div>

          <div>
            <span className={labelClass}>Immagine *</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 mb-2">
              {AVAILABLE_IMAGES.map(img => (
                <button
                  type="button"
                  key={img}
                  onClick={() => setForm({ ...form, image: img })}
                  aria-label={`Usa immagine ${img}`}
                  aria-pressed={form.image === img}
                  className={`rounded-lg overflow-hidden border-2 aspect-square ${
                    form.image === img ? 'border-orange-500 ring-2 ring-orange-300' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input className={inputClass} placeholder="oppure percorso/URL di un'altra immagine (es. /stile-l.jpg)"
              value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
          </div>

          <div>
            <label className={labelClass} htmlFor="np-tagline">Sottotitolo</label>
            <input id="np-tagline" className={inputClass}
              value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="np-desc">Descrizione</label>
            <textarea id="np-desc" rows={3} className={inputClass}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <span className={labelClass}>Scorte iniziali per taglia</span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {ALL_SIZES.map(sz => (
                <label key={sz} className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-black text-slate-700">{sz}</span>
                  <input type="number" min={0} className="w-12 text-center text-xs font-extrabold border border-slate-200 rounded py-0.5"
                    value={form.stock[sz]}
                    onChange={e => setForm({ ...form, stock: { ...form.stock, [sz]: e.target.value } })} />
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            Mostra subito nel negozio
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-extrabold px-5 py-2.5 rounded-xl shadow text-sm"
          >
            {isSaving ? 'Salvataggio…' : 'Salva prodotto'}
          </button>
        </form>
      )}

      {/* ELENCO PRODOTTI */}
      <div className="space-y-2.5">
        {sorted.map(product => {
          const active = isProductActive(product);
          const isTest = product.id === TEST_PRODUCT_ID;
          const totalStock = Object.values(product.stock || {}).reduce((a, b) => a + b, 0);
          const original = getOriginalPrice(product);
          return (
            <div
              key={product.id}
              className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
                active && !isTest ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img src={product.image} alt="" className={`w-12 h-12 rounded-lg object-cover border shrink-0 ${active || isTest ? '' : 'opacity-50'}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">{product.name}</h3>
                    {isTest ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-900">SOLO TEST</span>
                    ) : active ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">VISIBILE</span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">NASCOSTO</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {original > product.price && <span className="line-through text-slate-400 mr-1">{formatPrice(original)}</span>}
                    <span className="font-bold text-orange-600">{formatPrice(product.price)}</span>
                    <span className="mx-1.5">•</span>
                    {totalStock} pezzi in magazzino
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isTest && (
                  <button
                    onClick={() => handleToggle(product)}
                    disabled={busyId === product.id}
                    className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-lg border disabled:opacity-50 ${
                      active
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {active ? 'Nascondi' : 'Mostra nel negozio'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(product)}
                  disabled={busyId === product.id}
                  aria-label={`Elimina ${product.name}`}
                  className="inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-red-50 text-red-700 border-red-200 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Elimina
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
