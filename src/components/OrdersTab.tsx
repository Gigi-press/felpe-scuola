import { Search, Printer, Package, GraduationCap, BookOpen, Building2, School, Mail, Phone, UserRound } from 'lucide-react';
import type { Order } from '../types';

interface OrdersTabProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  setPrintOrdersModal: (open: boolean) => void;
  filteredOrders: Order[];
  handleUpdateOrderStatus: (order: Order, newStatus: string) => void;
}

export default function OrdersTab({ searchQuery, setSearchQuery, roleFilter, setRoleFilter, statusFilter, setStatusFilter, setPrintOrdersModal, filteredOrders, handleUpdateOrderStatus }: OrdersTabProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca per Nome, Classe, Ufficio o Codice (#DIVINI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
            {['all', 'studente', 'docente', 'ata', 'esterno'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-1 rounded-lg capitalize text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                  roleFilter === r
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'all' ? 'Tutti' : r}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none"
          >
            <option value="all">Tutti gli Stati</option>
            <option value="In attesa">In attesa</option>
            <option value="Pronto per consegna">Pronto per consegna</option>
            <option value="Consegnato e Incassato">Consegnato e Incassato</option>
            <option value="Annullato">Annullato</option>
          </select>

          <button
            onClick={() => setPrintOrdersModal(true)}
            className="flex items-center gap-1 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            Stampa
          </button>

        </div>

      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">Nessun ordine trovato con questi filtri.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.map((order) => {
            let roleBadgeClass = "bg-blue-100 text-blue-900 border-blue-200";
            let RoleIcon = GraduationCap;
            if (order.customer.role === 'docente') {
              roleBadgeClass = "bg-purple-100 text-purple-900 border-purple-200";
              RoleIcon = BookOpen;
            } else if (order.customer.role === 'ata') {
              roleBadgeClass = "bg-orange-100 text-orange-900 border-orange-200";
              RoleIcon = Building2;
            } else if (order.customer.role === 'esterno') {
              roleBadgeClass = "bg-teal-100 text-teal-900 border-teal-200";
              RoleIcon = UserRound;
            }

            let statusBadge = "bg-yellow-100 text-yellow-800 border-yellow-300";
            if (order.status === 'Pronto per consegna') statusBadge = "bg-blue-100 text-blue-800 border-blue-300";
            else if (order.status === 'Consegnato e Incassato') statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
            else if (order.status === 'Annullato') statusBadge = "bg-red-100 text-red-800 border-red-300";

            return (
              <div
                key={order.orderCode}
                className="border border-slate-200 rounded-xl p-3.5 sm:p-5 hover:border-blue-300 transition-all bg-white shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">

                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl border ${roleBadgeClass} shrink-0`}>
                      <RoleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {order.customer.firstName} {order.customer.lastName}
                        </h3>
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${roleBadgeClass}`}>
                          {order.customer.role}
                        </span>
                        <span className="text-xs font-extrabold text-slate-500">
                          #{order.orderCode}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-blue-900" />
                          {order.customer.location || (order.customer.role === 'esterno' ? 'Esterno' : 'N/D')}
                        </span>
                        {order.customer.email && (
                          <a href={`mailto:${order.customer.email}`} className="text-slate-600 hover:text-blue-900 flex items-center gap-1 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-blue-900" />
                            {order.customer.email}
                          </a>
                        )}
                        {order.customer.phone && (
                          <span className="text-slate-600 flex items-center gap-1 font-semibold">
                            {/* Negli ordini vecchi "phone" può contenere anche una mail */}
                            {order.customer.email || !order.customer.phone.includes('@')
                              ? <Phone className="w-3.5 h-3.5 text-blue-900" />
                              : <Mail className="w-3.5 h-3.5 text-blue-900" />}
                            {order.customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Totale Contanti</span>
                      <span className="text-base sm:text-lg font-black text-emerald-600">€{order.totalAmount.toFixed(2)}</span>
                    </div>

                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border shadow-sm focus:outline-none ${statusBadge}`}
                    >
                      <option value="In attesa">⏳ In attesa</option>
                      <option value="Pronto per consegna">📦 Pronto per consegna</option>
                      <option value="Consegnato e Incassato">✅ Consegnato e Incassato</option>
                      <option value="Annullato">❌ Annullato</option>
                    </select>
                  </div>

                </div>

                <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] font-medium">
                        <strong>{item.quantity}x</strong> {item.productName} <span className="text-blue-900 font-bold">({item.size})</span>
                      </span>
                    ))}
                  </div>
                  {order.customer.notes && (
                    <div className="text-[11px] text-slate-500 italic">
                      Nota: "{order.customer.notes}"
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
