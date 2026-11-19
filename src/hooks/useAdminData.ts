import { useMemo, useState } from 'react';
import type React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
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
    handleUpdateStock,
  };
}
