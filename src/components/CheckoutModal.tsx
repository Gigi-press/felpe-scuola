import { X, School, GraduationCap, BookOpen, Building2, CheckCircle, UserRound } from 'lucide-react';
import type React from 'react';
import { SCHOOL_EMAIL_DOMAIN } from '../constants';
import type { CheckoutFormData, Role } from '../types';

interface CheckoutModalProps {
  setIsCheckoutOpen: (open: boolean) => void;
  handlePlaceOrder: (e: React.FormEvent) => void;
  role: Role;
  setRole: (role: Role) => void;
  formData: CheckoutFormData;
  setFormData: (data: CheckoutFormData) => void;
  cartTotal: number;
  isSubmitting: boolean;
  checkoutError: string;
}

export default function CheckoutModal({ setIsCheckoutOpen, handlePlaceOrder, role, setRole, formData, setFormData, cartTotal, isSubmitting, checkoutError }: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 my-auto relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsCheckoutOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <School className="w-5 h-5 text-blue-950 shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">Checkout Ordine Divini</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Inserisci i tuoi dati per la prenotazione e il ritiro a scuola.
        </p>

        <form onSubmit={handlePlaceOrder} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Seleziona Ruolo:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

              <button
                type="button"
                onClick={() => setRole('studente')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'studente'
                    ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
                <span className="text-[11px] sm:text-xs font-extrabold">Studente</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('docente')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'docente'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="text-[11px] sm:text-xs font-extrabold">Docente</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ata')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'ata'
                    ? 'border-orange-600 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                <span className="text-[11px] sm:text-xs font-extrabold">Personale ATA</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('esterno')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'esterno'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <UserRound className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="text-[11px] sm:text-xs font-extrabold">Esterno</span>
              </button>

            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  placeholder="es. Mario"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cognome *</label>
                <input
                  type="text"
                  required
                  placeholder="es. Rossi"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {role === 'studente' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Classe e Sezione * (es. 5F)
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. 5F Informatica"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            )}

            {role === 'docente' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Materia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Matematica"
                  value={formData.teacherSubject}
                  onChange={(e) => setFormData({ ...formData, teacherSubject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {role === 'ata' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ufficio / Postazione *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Portineria Principale / Segreteria"
                  value={formData.ataOffice}
                  onChange={(e) => setFormData({ ...formData, ataOffice: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {role !== 'esterno' ? (
              <div>
                <label htmlFor="checkout-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email d'istituto * (per la consegna)
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={`es. nome.cognome@${SCHOOL_EMAIL_DOMAIN}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">Solo email che finiscono con @{SCHOOL_EMAIL_DOMAIN}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="es. mario.rossi@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-xs font-bold text-slate-700 mb-1">Telefono *</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="es. 333 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Note Opzionali</label>
              <input
                type="text"
                placeholder="es. Preferenza orario o altre indicazioni"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-900 text-xs space-y-1">
            <div className="font-extrabold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
              Pagamento: In contanti ai Rappresentanti
            </div>
            <p className="text-[11px] text-orange-800">
              Importo totale di <strong>€{cartTotal.toFixed(2)}</strong> da consegnare in contanti ai rappresentanti d'istituto per confermare la prenotazione.
            </p>
          </div>

          {checkoutError && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-xs font-semibold">
              {checkoutError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 disabled:cursor-wait text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Invio in corso…' : 'Conferma e Invia Ordine'}
          </button>

        </form>
      </div>
    </div>
  );
}
