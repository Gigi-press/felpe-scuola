export type Role = 'studente' | 'docente' | 'ata' | 'esterno';

export type OrderStatus =
  | 'In attesa'
  | 'Pronto per consegna'
  | 'Consegnato e Incassato'
  | 'Annullato';

export type View = 'shop' | 'admin';
export type AdminTab = 'orders' | 'inventory' | 'catalog';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Prezzo pieno barrato. I prodotti vecchi su Firestore non lo hanno (si usa 25€). */
  originalPrice?: number;
  price: number;
  badge: string;
  image: string;
  stock: Record<string, number>;
  /** Visibile nel negozio. Se manca, vale la lista ACTIVE_PRODUCT_IDS (prodotti vecchi). */
  active?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  size: string;
  quantity: number;
}

export interface Order {
  id?: string;
  orderCode: string;
  customer: {
    firstName: string;
    lastName: string;
    /** Email (d'istituto per studenti/docenti/ATA). Manca negli ordini vecchi. */
    email?: string;
    /** Telefono: solo per gli esterni. Negli ordini vecchi contiene "cellulare o mail". */
    phone: string;
    role: Role;
    location: string;
    notes: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus | string;
  createdAt: number;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  studentClass: string;
  teacherSubject: string;
  ataOffice: string;
  email: string;
  phone: string;
  notes: string;
}

export interface AdminStats {
  totalOrdersCount: number;
  collectedCash: number;
  pendingCash: number;
  totalHoodiesSold: number;
}
