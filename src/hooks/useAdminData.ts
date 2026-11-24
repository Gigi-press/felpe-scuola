import { useMemo, useState } from 'react';
import type React from 'react';
import { doc, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AdminStats, Order, Product } from '../types';

/** Filtri, statistiche e azioni del pannello admin (ordini e scorte). */
export function useAdminData(
  orders: Order[],
  allProducts: Product[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateOrderStatus = async (orderToUpdate: Order, newStatus: string) => {
    if (db && orderToUpdate.id) {
      const orderDoc = doc(db, 'orders', orderToUpdate.id);
      await updateDoc(orderDoc, { status: newStatus });
    } else {
      setOrders(prev => prev.map(o => o.orderCode === orderToUpdate.orderCode ? { ...o, status: newStatus } : o));
    }
  };

  /**
   * Elimina definitivamente un ordine. Con `restoreStock` rimette in magazzino
   * i pezzi dell'ordine (tutto in un'unica transazione: o tutto o niente).
   */
  const handleDeleteOrder = async (order: Order, restoreStock: boolean) => {
    if (db && order.id) {
      await runTransaction(db, async (tx) => {
        const orderRef = doc(db, 'orders', order.id!);
        if (restoreStock) {
          // Quantità da rimettere per prodotto e taglia
          const back: Record<string, Record<string, number>> = {};
          order.items.forEach(it => {
            back[it.productId] = back[it.productId] || {};
            back[it.productId][it.size] = (back[it.productId][it.size] || 0) + it.quantity;
          });
          const ids = Object.keys(back);
          const refs = ids.map(id => doc(db, 'products', id));
          const snaps = await Promise.all(refs.map(r => tx.get(r)));
          snaps.forEach((snap, i) => {
            if (!snap.exists()) return; // prodotto eliminato nel frattempo: niente da rimettere
            const stock = { ...((snap.data() as Product).stock || {}) };
            for (const [size, qty] of Object.entries(back[ids[i]])) {
              stock[size] = (stock[size] || 0) + qty;
            }
            tx.update(refs[i], { stock });
          });
        }
        tx.delete(orderRef);
      });
    }
    // Toglie subito l'ordine dalla lista (l'aggiornamento da Firebase può arrivare qualche secondo dopo)
    setOrders(prev => prev.filter(o => (order.id ? o.id !== order.id : o.orderCode !== order.orderCode)));
  };

  const handleUpdateStock = async (productId: string, size: string, newQty: number | string) => {
    const qty = Math.max(0, parseInt(String(newQty)) || 0);
    // Cerca in tutto il catalogo, così funziona anche per i prodotti nascosti
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const newStock = { ...product.stock, [size]: qty };

    if (db) {
      updateDoc(doc(db, 'products', productId), { stock: newStock }).catch(e => console.warn(e));
    }
    // Aggiornamento immediato a schermo (poi arriva la conferma da Firestore)
    const patch = (list: Product[]) => list.map(p => p.id === productId ? { ...p, stock: newStock } : p);
    setAllProducts(patch);
    setProducts(patch);
  };

  // Admin Analytics Computation
  const adminStats: AdminStats = useMemo(() => {
    const totalOrdersCount = orders.length;
    const collectedCash = orders
      .filter(o => o.status === 'Consegnato e Incassato')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    const pendingCash = orders
      .filter(o => o.status === 'In attesa' || o.status === 'Pronto per consegna')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    const totalHoodiesSold = orders
      .filter(o => o.status !== 'Annullato')
      .reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);

    return { totalOrdersCount, collectedCash, pendingCash, totalHoodiesSold };
  }, [orders]);

  // Filtered Orders for Admin View
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (roleFilter !== 'all' && order.customer.role !== roleFilter) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const fullName = `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();
        const location = (order.customer.location || '').toLowerCase();
        const code = (order.orderCode || '').toLowerCase();
        const contact = `${order.customer.email || ''} ${order.customer.phone || ''}`.toLowerCase();
        return fullName.includes(query) || location.includes(query) || code.includes(query) || contact.includes(query);
      }
      return true;
    });
  }, [orders, roleFilter, statusFilter, searchQuery]);

  return {
    roleFilter, setRoleFilter,
    statusFilter, setStatusFilter,
    searchQuery, setSearchQuery,
    adminStats,
    filteredOrders,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    handleUpdateStock,
  };
}
