import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ACTIVE_PRODUCT_IDS, INITIAL_PRODUCTS, IS_TEST_MODE, TEST_PRODUCT, TEST_PRODUCT_ID } from '../constants';
import type { Order, Product } from '../types';

/**
 * Sincronizza prodotti e ordini con Firestore.
 * I prodotti sono pubblici; gli ordini (dati personali) vengono letti solo dagli admin.
 */
export function useFirestoreData(isAdmin: boolean) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Prodotti (mostriamo solo gli stili attivi)
  useEffect(() => {
    if (!db) return;
    const productsRef = collection(db, 'products');

    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
        const activeNewStyles = loadedProducts.filter(p => ACTIVE_PRODUCT_IDS.includes(p.id));
        const shown = activeNewStyles.length > 0 ? activeNewStyles : INITIAL_PRODUCTS;

        // Modalità test: aggiunge il prodotto di prova in cima (se esiste su Firestore)
        const testProduct = loadedProducts.find(p => p.id === TEST_PRODUCT_ID);
        setProducts(IS_TEST_MODE && testProduct ? [testProduct, ...shown] : shown);

        // Un admin in modalità test crea il prodotto di prova se manca
        if (IS_TEST_MODE && isAdmin && !testProduct) {
          setDoc(doc(productsRef, TEST_PRODUCT_ID), TEST_PRODUCT)
            .catch(err => console.warn("Test product create error:", err));
        }
      } else if (isAdmin) {
        // Catalogo vuoto: solo un admin può crearlo (le regole lo impediscono agli altri)
        INITIAL_PRODUCTS.forEach(p => {
          setDoc(doc(productsRef, p.id), p).catch(err => console.warn("Seed error:", err));
        });
      }
    }, (err) => console.warn("Products sync error:", err));

    return () => unsubProducts();
  }, [isAdmin]);

  // Ordini: solo per admin
  useEffect(() => {
    if (!db || !isAdmin) {
      if (db) setOrders([]);
      return;
    }
    const ordersRef = collection(db, 'orders');

    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      loadedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(loadedOrders);
    }, (err) => console.warn("Orders sync error:", err));

    return () => unsubOrders();
  }, [isAdmin]);

  return { products, setProducts, orders, setOrders };
}
