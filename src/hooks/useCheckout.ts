import { useState } from 'react';
import type React from 'react';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import type { CartItem, CheckoutFormData, Order, Product, Role } from '../types';

const EMPTY_FORM: CheckoutFormData = {
  firstName: '',
  lastName: '',
  studentClass: '',
  teacherSubject: '',
  ataOffice: '',
  phone: '',
  notes: ''
};

// Senza 0/O/1/I/L per evitare confusione quando il codice viene letto o dettato
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Codice ordine casuale di 6 caratteri (~750 milioni di combinazioni). */
function generateOrderCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  return 'DIVINI-' + code;
}

/** Errore con messaggio da mostrare all'utente. */
class CheckoutError extends Error {}

interface CheckoutDeps {
  cart: CartItem[];
  cartTotal: number;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setIsCartOpen: (open: boolean) => void;
}

/** Stato del form di checkout e invio dell'ordine. */
export function useCheckout({
  cart, cartTotal, products, setProducts, setOrders, setCart, setIsCartOpen,
}: CheckoutDeps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [role, setRole] = useState<Role>('studente');
  const [formData, setFormData] = useState<CheckoutFormData>({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const buildOrder = (): Order => {
    let locationDetail = '';
    if (role === 'studente') locationDetail = formData.studentClass;
    else if (role === 'docente') locationDetail = formData.teacherSubject;
    else if (role === 'ata') locationDetail = formData.ataOffice;

    return {
      orderCode: generateOrderCode(),
      customer: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        role: role,
        location: locationDetail.trim(),
        notes: formData.notes.trim()
      },
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        size: item.size,
        quantity: item.quantity
      })),
      totalAmount: cartTotal,
      paymentMethod: 'Contanti ai rappresentanti d\'istituto (Pre-consegna)',
      status: 'In attesa',
      createdAt: Date.now()
    };
  };

  /** Quantità richiesta per prodotto e taglia: { productId: { size: qty } } */
  const requestedQuantities = () => {
    const req: Record<string, Record<string, number>> = {};
    cart.forEach(ci => {
      req[ci.product.id] = req[ci.product.id] || {};
      req[ci.product.id][ci.size] = (req[ci.product.id][ci.size] || 0) + ci.quantity;
    });
    return req;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setCheckoutError('');

    const newOrder = buildOrder();
    const requested = requestedQuantities();

    try {
      if (db) {
        // Ordine e scorte salvati insieme: o tutto o niente.
        // Se due persone ordinano insieme, Firestore ripete la transazione con i dati aggiornati.
        await runTransaction(db, async (tx) => {
          const productIds = Object.keys(requested);
          const refs = productIds.map(id => doc(db, 'products', id));
          const snaps = await Promise.all(refs.map(r => tx.get(r)));

          const newStocks: Record<string, Record<string, number>> = {};
          snaps.forEach((snap, i) => {
            if (!snap.exists()) {
              throw new CheckoutError('Un prodotto nel carrello non è più disponibile.');
            }
            const data = snap.data() as Product;
            // Il prezzo potrebbe essere stato cambiato dall'admin mentre il cliente ordinava
            const cartPrice = cart.find(ci => ci.product.id === productIds[i])?.product.price;
            if (cartPrice !== undefined && data.price !== cartPrice) {
              throw new CheckoutError(
                `Il prezzo di ${data.name} è cambiato (ora ${data.price.toFixed(2).replace('.', ',')}€). Controlla il totale e riprova.`
              );
            }
            const stock = { ...(data.stock || {}) };
            for (const [size, qty] of Object.entries(requested[productIds[i]])) {
              const available = stock[size] || 0;
              if (available < qty) {
                throw new CheckoutError(
                  `${data.name} taglia ${size}: ne restano solo ${available}. Aggiorna il carrello e riprova.`
                );
              }
              stock[size] = available - qty;
            }
            newStocks[productIds[i]] = stock;
          });

          refs.forEach((ref, i) => tx.update(ref, { stock: newStocks[productIds[i]] }));
          tx.set(doc(collection(db, 'orders')), newOrder);
        });
        // Le scorte aggiornate arrivano da sole tramite onSnapshot
      } else {
        // Modalità offline (Firebase non disponibile): solo in memoria
        setProducts(prev => prev.map(p => {
          const req = requested[p.id];
          if (!req) return p;
          const stock = { ...p.stock };
          for (const [size, qty] of Object.entries(req)) {
            stock[size] = Math.max(0, (stock[size] || 0) - qty);
          }
          return { ...p, stock };
        }));
        setOrders(prev => [newOrder, ...prev]);
      }

      setCompletedOrder(newOrder);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setFormData({ ...EMPTY_FORM });
    } catch (err) {
      console.error("Order save err:", err);
      setCheckoutError(
        err instanceof CheckoutError
          ? err.message
          : 'Non è stato possibile inviare l\'ordine. Controlla la connessione e riprova.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isCheckoutOpen, setIsCheckoutOpen,
    completedOrder, setCompletedOrder,
    role, setRole,
    formData, setFormData,
    isSubmitting, checkoutError, setCheckoutError,
    handlePlaceOrder,
  };
}
