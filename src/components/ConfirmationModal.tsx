import { CheckCircle } from 'lucide-react';
import type { Order } from '../types';

interface ConfirmationModalProps {
  completedOrder: Order;
  setCompletedOrder: (order: Order | null) => void;
}

export default function ConfirmationModal({ completedOrder, setCompletedOrder }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto">

        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
          Ordine Registrato!
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          La tua prenotazione per la felpa Divini è stata salvata con successo.
        </p>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs border-b pb-1.5">
            <span className="text-slate-500 font-semibold">Codice Ordine:</span>
            <span className="font-extrabold text-blue-950 text-sm">{completedOrder.orderCode}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-b pb-1.5">
            <span className="text-slate-500 font-semibold">Cliente:</span>
            <span className="font-bold text-slate-800">{completedOrder.customer.firstName} ({completedOrder.customer.role})</span>
          </div>
          <div className="flex justify-between items-center text-xs border-b pb-1.5">
            <span className="text-slate-500 font-semibold">Consegna presso:</span>
            <span className="font-bold text-slate-800">{completedOrder.customer.location}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Importo pre-consegna:</span>
            <span className="font-black text-emerald-600 text-base">€{completedOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => setCompletedOrder(null)}
          className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 rounded-xl shadow transition-all text-xs"
        >
          Torna al Negozio
        </button>

      </div>
    </div>
  );
}
