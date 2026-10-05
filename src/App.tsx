import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  addDoc 
} from 'firebase/firestore';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  GraduationCap, 
  Briefcase, 
  Wrench, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Phone, 
  School, 
  Package, 
  Euro, 
  Check, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  RefreshCw,
  SlidersHorizontal,
  Info,
  Building2,
  BookOpen,
  Lock,
  Key,
  LogOut,
  Eye,
  EyeOff,
  Mail
} from 'lucide-react';

// Configuration Config di Firebase dal tuo progetto felpescarti-as26-27
const firebaseConfig = {
  apiKey: "AIzaSyBWM8Ik7WWlYjn7XRW5hQnKptm4OrBVszo",
  authDomain: "felpescarti-as26-27.firebaseapp.com",
  projectId: "felpescarti-as26-27",
  storageBucket: "felpescarti-as26-27.firebasestorage.app",
  messagingSenderId: "730372682315",
  appId: "1:730372682315:web:256c227f461b1cc5b713ce",
  measurementId: "G-7QZSSME7VB"
};

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn("Firebase config error, using memory fallback mode:", err);
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// Catalogo Ufficiale 6 Stili Felpe ITTS "E. Divini" (Tutte a 20€)
const INITIAL_PRODUCTS = [
  {
    id: 'hoodie-a',
    name: 'Felpa Stile A',
    tagline: 'Lo stile iconico d\'istituto con logo ufficiale',
    description: 'Felpa unisex in cotone pettinato pesante. Interno garzato caldo e morbido con stemma ufficiale ITTS E. Divini sul petto.',
    price: 20.00,
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Stile A',
    image: '/stile-a.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-b',
    name: 'Felpa Stile B',
    tagline: 'Ispirazione campus con dettagli bicolore',
    description: 'Design dinamico stile universitario con rifiniture a contrasto. Perfetta per rappresentare la scuola con stile.',
    price: 20.00,
    rating: 4.9,
    reviewsCount: 29,
    badge: 'Stile B',
    image: '/stile-b.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-c',
    name: 'Felpa Stile C',
    tagline: 'Linea pulita ed essenziale con micro-logo',
    description: 'Design sobrio ed elegante, amato sia dagli studenti che dai docenti. Tessuto traspirante con cappuccio strutturato.',
    price: 20.00,
    rating: 4.8,
    reviewsCount: 35,
    badge: 'Stile C',
    image: '/stile-c.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-d',
    name: 'Felpa Stile D',
    tagline: 'Taglio oversize moderno a spalle scivolate',
    description: 'Vestibilità comoda e di tendenza per il tempo libero e per le giornate a scuola. Tessuto calandrato anti-pilling.',
    price: 20.00,
    rating: 4.9,
    reviewsCount: 18,
    badge: 'Stile D',
    image: '/stile-d.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-e',
    name: 'Felpa Stile E',
    tagline: 'Effetto retrò con tasca a marsupio anatomica',
    description: 'Particolare lavorazione del tessuto per un affascinante effetto vintage. Bordo e polsini a coste rinforzate.',
    price: 20.00,
    rating: 4.7,
    reviewsCount: 24,
    badge: 'Stile E',
    image: '/stile-e.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  },
  {
    id: 'hoodie-f',
    name: 'Felpa Stile F',
    tagline: 'Massima praticità con zip metallica ad alta resistenza',
    description: 'Versione con cerniera integrale, ideale per le mezze stagioni. Tasche frontali capienti e cuciture a triplo ago.',
    price: 20.00,
    rating: 5.0,
    reviewsCount: 51,
    badge: 'Stile F',
    image: '/stile-f.jpg',
    stock: { XS: 10, S: 20, M: 30, L: 20, XL: 10, '2XL': 10, '3XL': 10 }
  }
];

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState('shop'); // 'shop' | 'admin'
  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // 'orders' | 'inventory'

  // Admin Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  // Cart & UI Modals
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [modalSize, setModalSize] = useState('M');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [printOrdersModal, setPrintOrdersModal] = useState(false);

  // Checkout Form State
  const [role, setRole] = useState('studente'); // 'studente' | 'docente' | 'ata'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentClass: '',     // per Studente (es: 5F)
    teacherSubject: '',   // per Docente (es: Matematica)
    ataOffice: '',        // per ATA (es: Segreteria Didattica)
    phone: '',            // ora usata come Cellulare/Mail
    notes: ''
  });

  // Admin Filter States
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Access Handlers
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setAdminPasswordError('');
      setIsAdminPasswordModalOpen(true);
    }
  };

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!auth) {
      setAdminPasswordError('Servizio Firebase non pronto. Riprova tra poco.');
      return;
    }

    setIsLoggingIn(true);
    setAdminPasswordError('');

    try {
      await signInWithEmailAndPassword(auth, adminEmailInput, adminPasswordInput);
      setIsAdminAuthenticated(true);
      setIsAdminPasswordModalOpen(false);
      setCurrentView('admin');
      setAdminPasswordInput('');
    } catch (err: any) {
      console.error("Login error:", err);
      setAdminPasswordError('Credenziali non valide! Verifica Email e Password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    if (auth) {
      await signOut(auth);
      try {
        await signInAnonymously(auth);
      } catch (err) {}
    }
    setIsAdminAuthenticated(false);
    setCurrentView('shop');
  };

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        setIsAdminAuthenticated(true);
      } else {
        setIsAdminAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Products & Orders with Firestore
  useEffect(() => {
    if (!db) return;

    const productsRef = collection(db, 'products');
    const ordersRef = collection(db, 'orders');

    // Subscribe to products
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(loadedProducts);
      } else {
        INITIAL_PRODUCTS.forEach(async (p) => {
          await setDoc(doc(productsRef, p.id), p);
        });
      }
    }, (err) => console.warn("Products sync error:", err));

    // Subscribe to orders
    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loadedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(loadedOrders);
    }, (err) => console.warn("Orders sync error:", err));

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user]);

  const addToCart = (product, size, quantity = 1) => {
    const currentStock = product.stock[size] || 0;
    if (currentStock <= 0) return;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.size === size);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > currentStock) {
          updated[existingIndex].quantity = currentStock;
        } else {
          updated[existingIndex].quantity = newQty;
        }
        return updated;
      } else {
        return [...prev, { product, size, quantity: Math.min(quantity, currentStock) }];
      }
    });

    setIsCartOpen(true);
  };

  const updateCartQty = (productId, size, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.size === size) {
          const product = products.find(p => p.id === productId);
          const maxStock = product ? product.stock[size] : 99;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: Math.min(newQty, maxStock) };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let locationDetail = '';
    if (role === 'studente') locationDetail = formData.studentClass;
    else if (role === 'docente') locationDetail = formData.teacherSubject;
    else if (role === 'ata') locationDetail = formData.ataOffice;

    const orderId = 'DIVINI-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      orderCode: orderId,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: role,
        location: locationDetail,
        notes: formData.notes
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

    // Update stock locally and in Firestore
    const updatedProducts = products.map(p => {
      const cartItemsForProduct = cart.filter(ci => ci.product.id === p.id);
      if (cartItemsForProduct.length === 0) return p;

      const newStock = { ...p.stock };
      cartItemsForProduct.forEach(ci => {
        newStock[ci.size] = Math.max(0, (newStock[ci.size] || 0) - ci.quantity);
      });

      if (db) {
        const prodDoc = doc(db, 'products', p.id);
        updateDoc(prodDoc, { stock: newStock }).catch(err => console.warn("Stock update err:", err));
      }

      return { ...p, stock: newStock };
    });

    setProducts(updatedProducts);

    if (db) {
      try {
        const ordersRef = collection(db, 'orders');
        await addDoc(ordersRef, newOrder);
      } catch (err) {
        console.error("Order save err:", err);
      }
    } else {
      setOrders(prev => [newOrder, ...prev]);
    }

    setCompletedOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      studentClass: '',
      teacherSubject: '',
      ataOffice: '',
      phone: '',
      notes: ''
    });
  };

  const handleUpdateOrderStatus = async (orderToUpdate, newStatus) => {
    if (db && orderToUpdate.id) {
      const orderDoc = doc(db, 'orders', orderToUpdate.id);
      await updateDoc(orderDoc, { status: newStatus });
    } else {
      setOrders(prev => prev.map(o => o.orderCode === orderToUpdate.orderCode ? { ...o, status: newStatus } : o));
    }
  };

  const handleUpdateStock = async (productId, size, newQty) => {
    const qty = Math.max(0, parseInt(newQty) || 0);
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = { ...p.stock, [size]: qty };
        if (db) {
          const prodDoc = doc(db, 'products', p.id);
          updateDoc(prodDoc, { stock: newStock }).catch(e => console.warn(e));
        }
        return { ...p, stock: newStock };
      }
      return p;
    });
    setProducts(updated);
  };

  // Admin Analytics Computation
  const adminStats = useMemo(() => {
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
        return fullName.includes(query) || location.includes(query) || code.includes(query);
      }
      return true;
    });
  }, [orders, roleFilter, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* HEADER NAV - PALETTE ITTS E. DIVINI */}
      <header className="sticky top-0 z-40 bg-blue-950 text-white shadow-xl border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Divini Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('shop')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center shadow-md">
              <School className="w-6 h-6 text-blue-950" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                ITTS "E. DIVINI"
              </span>
              <span className="block text-[10px] font-bold tracking-wider text-orange-400 uppercase">
                Felpe Ufficiali d'Istituto • 20€
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-900/80 p-1 rounded-xl border border-blue-800 flex items-center">
              <button
                onClick={() => setCurrentView('shop')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'shop'
                    ? 'bg-orange-500 text-blue-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Negozio
              </button>
              <button
                onClick={handleOpenAdmin}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'admin'
                    ? 'bg-orange-500 text-blue-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Pannello Admin
                {isAdminAuthenticated ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Autenticato" />
                ) : (
                  orders.filter(o => o.status === 'In attesa').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                  )
                )}
              </button>
            </div>

            {/* Cart Button */}
            {currentView === 'shop' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Carrello</span>
                {cartCount > 0 && (
                  <span className="bg-white text-emerald-950 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {currentView === 'shop' ? (
          <div>
            
            {/* HERO BANNER - ITTS E. DIVINI */}
            <section className="relative bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)]" />
              <div className="max-w-7xl mx-auto relative z-10 text-center">
                
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-full text-orange-300 text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Prenotazione Felpe Ufficiali ITTS "E. Divini"
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                  Indossa l'Orgoglio del Divini.
                </h1>
                <p className="max-w-2xl mx-auto text-slate-200 text-sm sm:text-base mb-6">
                  Ordina online, effettua il <strong className="text-orange-400 font-bold">pagamento ai rappresentanti d'istituto prima della consegna (20€)</strong> e ritira la tua felpa a scuola.
                </p>

                {/* Info Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
                  <div className="bg-blue-900/60 backdrop-blur border border-blue-700/80 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Studenti</div>
                      <div className="text-[11px] text-blue-200">Pagamento ai rappresentanti in classe</div>
                    </div>
                  </div>

                  <div className="bg-blue-900/60 backdrop-blur border border-blue-700/80 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Docenti</div>
                      <div className="text-[11px] text-blue-200">Consegna in Sala Professori</div>
                    </div>
                  </div>

                  <div className="bg-blue-900/60 backdrop-blur border border-blue-700/80 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
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
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Collezione Felpe Divini (6 Stili)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Scegli tra lo Stile A e lo Stile F • Taglie disponibili: XS, S, M, L, XL, 2XL, 3XL
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-bold bg-orange-50 text-orange-900 px-3 py-1.5 rounded-lg border border-orange-200">
                  <Euro className="w-4 h-4 text-orange-600" />
                  Prezzo Unico: 20,00€ (Pagamento ai Rappresentanti)
                </div>
              </div>

              {/* 6 Hoodies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <div className="absolute top-3 right-3">
                          <span className="bg-orange-500 text-white font-black text-xs px-3 py-1 rounded-full shadow">
                            €20,00
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-900 transition-colors">
                              {product.name}
                            </h3>
                          </div>
                          
                          <p className="text-xs font-semibold text-blue-900 mb-2">
                            {product.tagline}
                          </p>

                          <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                            {product.description}
                          </p>
                        </div>

                        {/* Size availability indicators */}
                        <div className="border-t border-slate-100 pt-3">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                            <span>Disponibilità Taglie:</span>
                            <span className={totalStock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                              {totalStock > 0 ? `Disponibile` : 'Esaurito'}
                            </span>
                          </div>

                          {/* Sizes Selector Pills */}
                          <div className="flex items-center justify-between gap-1 mb-4 overflow-x-auto">
                            {ALL_SIZES.map((sz) => {
                              const stk = (product.stock && product.stock[sz]) || 0;
                              return (
                                <div
                                  key={sz}
                                  className={`flex-1 text-center py-1 min-w-[28px] rounded border text-[10px] font-bold transition-all ${
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
                            {totalStock > 0 ? 'Scegli Taglia e Ordina (20€)' : 'Esaurito'}
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </section>

          </div>
        ) : isAdminAuthenticated ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* ADMIN HEADER & STATS BAR */}
            <div className="bg-blue-950 text-white rounded-2xl p-6 shadow-xl mb-8 border border-blue-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-blue-900 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" /> Gestione ITTS "E. Divini"
                  </div>
                  <h1 className="text-2xl font-black">Pannello Gestione Ordini & Incassi</h1>
                  {auth?.currentUser?.email && (
                    <p className="text-xs text-blue-300 mt-1">
                      Connesso come Admin: <span className="text-orange-400 font-semibold">{auth.currentUser.email}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-blue-900 p-1 rounded-xl border border-blue-800">
                    <button
                      onClick={() => setActiveAdminTab('orders')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeAdminTab === 'orders'
                          ? 'bg-orange-500 text-blue-950 shadow-md'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Gestione Ordini ({orders.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab('inventory')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeAdminTab === 'inventory'
                          ? 'bg-orange-500 text-blue-950 shadow-md'
                          : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Gestione Scorte
                    </button>
                  </div>

                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Esci
                  </button>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                
                <div className="bg-blue-900/80 p-4 rounded-xl border border-blue-800">
                  <div className="text-blue-300 text-xs font-medium">Totale Ordini</div>
                  <div className="text-2xl font-black text-white mt-1">{adminStats.totalOrdersCount}</div>
                  <div className="text-[10px] text-orange-400 mt-1">studenti, prof e ATA</div>
                </div>

                <div className="bg-blue-900/80 p-4 rounded-xl border border-blue-800">
                  <div className="text-blue-300 text-xs font-medium">Contanti Incassati</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">€{adminStats.collectedCash.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-300 mt-1">ordini consegnati</div>
                </div>

                <div className="bg-blue-900/80 p-4 rounded-xl border border-blue-800">
                  <div className="text-blue-300 text-xs font-medium">Contanti da Incassare</div>
                  <div className="text-2xl font-black text-orange-400 mt-1">€{adminStats.pendingCash.toFixed(2)}</div>
                  <div className="text-[10px] text-orange-300 mt-1">in attesa di consegna</div>
                </div>

                <div className="bg-blue-900/80 p-4 rounded-xl border border-blue-800">
                  <div className="text-blue-300 text-xs font-medium">Felpe Prenotate</div>
                  <div className="text-2xl font-black text-white mt-1">{adminStats.totalHoodiesSold}</div>
                  <div className="text-[10px] text-blue-300 mt-1">unità totali</div>
                </div>

              </div>
            </div>

            {/* TAB 1: ORDERS MANAGEMENT */}
            {activeAdminTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cerca per Nome, Classe, Ufficio o Codice (#DIVINI)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                      <span className="text-slate-400 text-[10px] uppercase font-bold px-2">Ruolo:</span>
                      {['all', 'studente', 'docente', 'ata'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRoleFilter(r)}
                          className={`px-2.5 py-1 rounded-lg capitalize text-xs font-bold transition-all ${
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
                      className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                    >
                      <option value="all">Tutti gli Stati</option>
                      <option value="In attesa">In attesa</option>
                      <option value="Pronto per consegna">Pronto per consegna</option>
                      <option value="Consegnato e Incassato">Consegnato e Incassato</option>
                      <option value="Annullato">Annullato</option>
                    </select>

                    <button
                      onClick={() => setPrintOrdersModal(true)}
                      className="flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-orange-400" />
                      Stampa Lista
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
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      let roleBadgeClass = "bg-blue-100 text-blue-900 border-blue-200";
                      let RoleIcon = GraduationCap;
                      if (order.customer.role === 'docente') {
                        roleBadgeClass = "bg-purple-100 text-purple-900 border-purple-200";
                        RoleIcon = BookOpen;
                      } else if (order.customer.role === 'ata') {
                        roleBadgeClass = "bg-orange-100 text-orange-900 border-orange-200";
                        RoleIcon = Building2;
                      }

                      let statusBadge = "bg-yellow-100 text-yellow-800 border-yellow-300";
                      if (order.status === 'Pronto per consegna') statusBadge = "bg-blue-100 text-blue-800 border-blue-300";
                      else if (order.status === 'Consegnato e Incassato') statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
                      else if (order.status === 'Annullato') statusBadge = "bg-red-100 text-red-800 border-red-300";

                      return (
                        <div
                          key={order.orderCode}
                          className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all bg-white shadow-sm"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            
                            <div className="flex items-start gap-3">
                              <div className={`p-2.5 rounded-xl border ${roleBadgeClass}`}>
                                <RoleIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-extrabold text-slate-900 text-base">
                                    {order.customer.firstName} {order.customer.lastName}
                                  </h3>
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleBadgeClass}`}>
                                    {order.customer.role}
                                  </span>
                                  <span className="text-xs font-extrabold text-slate-500">
                                    #{order.orderCode}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                                  <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <School className="w-3.5 h-3.5 text-blue-900" />
                                    {order.customer.location || 'N/D'}
                                  </span>
                                  {order.customer.phone && (
                                    <span className="text-slate-600 flex items-center gap-1 font-semibold">
                                      <Mail className="w-3.5 h-3.5 text-blue-900" />
                                      {order.customer.phone}
                                    </span>
                                  )}
                                  <span className="text-slate-400">
                                    {new Date(order.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Totale Contanti</span>
                                <span className="text-lg font-black text-emerald-600">€{order.totalAmount.toFixed(2)}</span>
                              </div>

                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                                className={`text-xs font-bold rounded-xl px-3 py-2 border shadow-sm focus:outline-none ${statusBadge}`}
                              >
                                <option value="In attesa">⏳ In attesa</option>
                                <option value="Pronto per consegna">📦 Pronto per consegna</option>
                                <option value="Consegnato e Incassato">✅ Consegnato e Incassato</option>
                                <option value="Annullato">❌ Annullato</option>
                              </select>
                            </div>

                          </div>

                          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
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
            )}

            {/* TAB 2: INVENTORY */}
            {activeAdminTab === 'inventory' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Gestione Giacenze Magazzino ITTS Divini
                  </h2>
                  <p className="text-xs text-slate-500">
                    Modifica le disponibilità delle taglie per i 6 stili (da XS a 3XL).
                  </p>
                </div>

                <div className="space-y-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border" />
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base">{product.name}</h3>
                            <span className="text-xs font-bold text-orange-600">€20,00</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              ALL_SIZES.forEach(sz => {
                                handleUpdateStock(product.id, sz, ((product.stock && product.stock[sz]) || 0) + 5);
                              });
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-200"
                          >
                            +5 su tutte
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                        {ALL_SIZES.map((size) => {
                          const qty = (product.stock && product.stock[size]) || 0;
                          return (
                            <div key={size} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                              <span className="text-xs font-black text-slate-700 uppercase mb-1">{size}</span>
                              <div className="flex items-center gap-1.5 my-1">
                                <button
                                  onClick={() => handleUpdateStock(product.id, size, qty - 1)}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={qty}
                                  onChange={(e) => handleUpdateStock(product.id, size, e.target.value)}
                                  className="w-10 text-center text-xs font-extrabold border border-slate-200 rounded-lg py-0.5"
                                />
                                <button
                                  onClick={() => handleUpdateStock(product.id, size, qty + 1)}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs"
                                >
                                  +
                                </button>
                              </div>
                              <span className={`text-[10px] font-bold ${qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {qty > 0 ? 'In Stock' : 'Esaurito'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="w-16 h-16 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Accesso Riservato ITTS Divini</h2>
            <p className="text-xs text-slate-500 mb-6">
              Devi inserire le credenziali da amministratore per accedere a questa sezione.
            </p>
            <button
              onClick={handleOpenAdmin}
              className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all"
            >
              Accedi al Pannello Admin
            </button>
          </div>
        )}
      </main>

      {/* MODAL: ADMIN FIREBASE AUTHENTICATION */}
      {isAdminPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAdminPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Login Admin ITTS Divini
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Inserisci Email e Password configurate nella tua console Firebase.
            </p>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Admin
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="admin@scuola.it"
                    value={adminEmailInput}
                    onChange={(e) => {
                      setAdminEmailInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password Admin
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 ${
                      adminPasswordError
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-200 focus:ring-blue-900'
                    }`}
                  />
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {adminPasswordError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{adminPasswordError}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminPasswordModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4 text-orange-400" />
                  {isLoggingIn ? 'Verifica...' : 'Accedi'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: SIZE SELECTION */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedProductModal.image}
                alt={selectedProductModal.name}
                className="w-20 h-20 rounded-xl object-cover border"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {selectedProductModal.badge}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                  {selectedProductModal.name}
                </h3>
                <span className="text-lg font-black text-blue-950">
                  €20,00
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              {selectedProductModal.description}
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Seleziona Taglia:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {ALL_SIZES.map((sz) => {
                  const stk = (selectedProductModal.stock && selectedProductModal.stock[sz]) || 0;
                  const isAvailable = stk > 0;
                  const isSelected = modalSize === sz;

                  return (
                    <button
                      key={sz}
                      disabled={!isAvailable}
                      onClick={() => setModalSize(sz)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-blue-950 bg-blue-950 text-white shadow-md scale-105'
                          : isAvailable
                          ? 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300'
                          : 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                      }`}
                    >
                      <span>{sz}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                addToCart(selectedProductModal, modalSize, 1);
                setSelectedProductModal(null);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Aggiungi al Carrello (Taglia {modalSize} - 20€)
            </button>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-950 text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-400" />
                <h2 className="font-extrabold text-base">Carrello ITTS Divini</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">Il carrello è vuoto.</p>
                  <p className="text-xs text-slate-400 mt-1">Scegli uno dei 6 stili per prenotare.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{item.product.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 my-1">
                        <span>Taglia: <strong className="text-blue-900 uppercase font-black">{item.size}</strong></span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">€20,00</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.size, -1)}
                            className="text-slate-600 font-bold hover:text-red-600"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.size, 1)}
                            className="text-slate-600 font-bold hover:text-blue-900"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => updateCartQty(item.product.id, item.size, -item.quantity)}
                          className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600">Totale Contanti:</span>
                  <span className="text-2xl font-black text-slate-900">€{cartTotal.toFixed(2)}</span>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl text-orange-900 text-[11px] flex items-center gap-2">
                  <Euro className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Pagamento in contanti ai rappresentanti d'istituto prima della consegna.</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Procedi all'Ordine
                  <ChevronRight className="w-4 h-4 text-orange-400" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <School className="w-5 h-5 text-blue-950" />
              <h2 className="text-xl font-black text-slate-900">Checkout Ordine ITTS "E. Divini"</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Inserisci i tuoi dati per il ritiro e la consegna a scuola.
            </p>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Seleziona Ruolo:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  
                  <button
                    type="button"
                    onClick={() => setRole('studente')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === 'studente'
                        ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-900/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-blue-900" />
                    <span className="text-xs font-extrabold">Studente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('docente')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === 'docente'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-extrabold">Docente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ata')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === 'ata'
                        ? 'border-orange-600 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-extrabold">Personale ATA</span>
                  </button>

                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cellulare / Mail * (per la consegna)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="es. 333 1234567 oppure email@divini.org"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

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
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                  Pagamento: In contanti ai Rappresentanti
                </div>
                <p className="text-[11px] text-orange-800">
                  Importo totale di <strong>€{cartTotal.toFixed(2)}</strong> da consegnare in contanti ai rappresentanti d'istituto per confermare la prenotazione.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                Conferma e Invia Ordine
              </button>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              Ordine Registrato!
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              La tua prenotazione per l'ITTS "E. Divini" è stata salvata con successo.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left space-y-2 mb-6">
              <div className="flex justify-between items-center text-xs border-b pb-2">
                <span className="text-slate-500 font-semibold">Codice Ordine:</span>
                <span className="font-extrabold text-blue-950 text-sm">{completedOrder.orderCode}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b pb-2">
                <span className="text-slate-500 font-semibold">Cliente:</span>
                <span className="font-bold text-slate-800">{completedOrder.customer.firstName} ({completedOrder.customer.role})</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b pb-2">
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
      )}

      {/* PRINTABLE ORDERS LIST */}
      {printOrdersModal && (
        <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 relative">
            <button
              onClick={() => setPrintOrdersModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-black text-slate-900">Lista Consegne ITTS "E. Divini"</h3>
                <p className="text-xs text-slate-500">Stampa per la gestione incassi dei rappresentanti e consegne.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-blue-950 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4 text-orange-400" /> Stampa Foglio
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {filteredOrders.map((o) => (
                <div key={o.orderCode} className="border p-3 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>#{o.orderCode} - {o.customer.firstName} {o.customer.lastName} ({o.customer.role.toUpperCase()})</span>
                    <span className="text-emerald-600">€{o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-slate-600">
                    📍 Posizione: <strong>{o.customer.location}</strong> | Contatto: {o.customer.phone}
                  </div>
                  <div className="text-slate-500">
                    📦 Capi: {o.items.map(i => `${i.quantity}x ${i.productName} (${i.size})`).join(', ')}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-blue-950 text-blue-200 border-t border-blue-900 py-8 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-white">ITTS "E. Divini" • Merchandising Ufficiale</span>
          </div>
          <div>
            A.S. 2025/2026 • Ordini gestiti dai Rappresentanti d'Istituto.
          </div>
        </div>
      </footer>

    </div>
  );
}
