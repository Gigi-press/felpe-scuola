import { X, Printer } from 'lucide-react';
import type { Order } from '../types';

interface PrintOrdersModalProps {
  setPrintOrdersModal: (open: boolean) => void;
  filteredOrders: Order[];
}

export default function PrintOrdersModal({ setPrintOrdersModal, filteredOrders }: PrintOrdersModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-auto relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setPrintOrdersModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 pb-3 border-b gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Lista Consegne Divini</h3>
            <p className="text-xs text-slate-500">Stampa per la gestione incassi dei rappresentanti e consegne.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-blue-950 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow shrink-0"
          >
            <Printer className="w-4 h-4 text-orange-400" /> Stampa
          </button>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredOrders.map((o) => (
            <div key={o.orderCode} className="border p-2.5 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>#{o.orderCode} - {o.customer.firstName} {o.customer.lastName} ({o.customer.role.toUpperCase()})</span>
                <span className="text-emerald-600">€{o.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-slate-600">
                📍 Posizione: <strong>{o.customer.location || (o.customer.role === 'esterno' ? 'Esterno' : 'N/D')}</strong>
                {' '}| Contatto: {[o.customer.email, o.customer.phone].filter(Boolean).join(' • ')}
              </div>
              <div className="text-slate-500">
                📦 Capi: {o.items.map(i => `${i.quantity}x ${i.productName} (${i.size})`).join(', ')}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
