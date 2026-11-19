import { Sparkles, GraduationCap, BookOpen, Building2, Tag, ShoppingCart } from 'lucide-react';
import { ALL_SIZES, formatPrice, getOriginalPrice } from '../constants';
import type { Product } from '../types';

interface ShopViewProps {
  products: Product[];
  setSelectedProductModal: (product: Product | null) => void;
  setModalSize: (size: string) => void;
}

export default function ShopView({ products, setSelectedProductModal, setModalSize }: ShopViewProps) {
  return (
    <>
      {/* HERO BANNER - DIVINI */}
      <section className="relative bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">

          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full text-orange-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Prenotazione Felpe Ufficiali "Divini"
          </div>

          <h1 className="text-2xl sm:text-5xl font-black tracking-tight mb-2 sm:mb-3">
            Indossa l'Orgoglio del Divini.
          </h1>
          <p className="max-w-2xl mx-auto text-slate-200 text-xs sm:text-base mb-6 px-2">
            Ordina online al prezzo promozionale di <strong className="text-orange-400 font-bold">20€ (invece di 25€)</strong>. Pagamento ai rappresentanti prima della consegna e ritiro comodo a scuola.
          </p>

          {/* Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-blue-900/60 backdrop-blur border border-blue-700/80 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Studenti</div>
                <div className="text-[11px] text-blue-200">Consegna in portineria</div>
              </div>
            </div>

            <div className="bg-blue-900/60 backdrop-blur border border-blue-700/80 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Docenti</div>
                <div className="text-[11px] text-blue-200">Consegna in sala professori</div>
              </div>
            </div>

            <div className="bg-blue-900/60 backdrop-blur border border-blue-700/80 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Personale ATA</div>
                <div className="text-[11px] text-blue-200">Consegna in Portineria/Ufficio</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRODUCT CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nuova Collezione Felpe Divini - Pezzi limitati!
            </h2>
            <p className="text-xs text-slate-500">
              Scegli tra {products.length === 1 ? '1 stile ufficiale' : `${products.length} stili ufficiali`} • Taglie: XS - 3XL
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold bg-orange-50 text-orange-950 px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm self-start sm:self-auto">
            <Tag className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Prezzo Scontato: <strong className="line-through text-slate-400 font-semibold mr-1">25€</strong> <strong className="text-orange-600 font-black text-sm">20,00€</strong></span>
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm font-bold">Al momento non ci sono felpe disponibili.</p>
            <p className="text-xs mt-1">Torna a trovarci presto!</p>
          </div>
        )}

        {/* Griglia felpe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {products.map((product) => {
            const totalStock = Object.values(product.stock || {}).reduce((a, b) => a + b, 0);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="bg-blue-950/90 backdrop-blur text-orange-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow border border-orange-500/30">
                      {product.badge}
                    </span>
                  </div>

                  {/* Discount Ribbon */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
                    {getOriginalPrice(product) > product.price && (
                      <span className="line-through text-orange-200 text-[10px] font-semibold">{formatPrice(getOriginalPrice(product))}</span>
                    )}
                    <span>{formatPrice(product.price)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-blue-900 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      {product.tagline}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Size availability indicators */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Disponibilità Taglie:</span>
                      <span className={totalStock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                        {totalStock > 0 ? `Disponibile` : 'Esaurito'}
                      </span>
                    </div>

                    {/* Sizes Selector Pills - Grid per Mobile */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {ALL_SIZES.map((sz) => {
                        const stk = (product.stock && product.stock[sz]) || 0;
                        return (
                          <div
                            key={sz}
                            className={`text-center py-1 rounded border text-[9px] sm:text-[10px] font-bold transition-all ${
                              stk > 0
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-slate-100 bg-slate-100 text-slate-300 line-through'
                            }`}
                          >
                            {sz}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={() => {
                        setSelectedProductModal(product);
                        const firstAvailable = ALL_SIZES.find(s => (product.stock && product.stock[s] || 0) > 0) || 'M';
                        setModalSize(firstAvailable);
                      }}
                      disabled={totalStock <= 0}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        totalStock > 0
                          ? 'bg-blue-950 hover:bg-blue-900 text-white shadow-md active:scale-95'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-orange-400" />
                      {totalStock > 0 ? `Scegli Taglia e Ordina (${formatPrice(product.price)})` : 'Esaurito'}
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </section>
    </>
  );
}
