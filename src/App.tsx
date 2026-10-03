import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
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
  DollarSign, 
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
  EyeOff
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

// Password di default per il Pannello Admin
const ADMIN_PASSWORD = "admin";

let app, auth, db;
const appId = 'felpescarti-as26-27';

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn("Firebase config error, using memory fallback mode:", err);
}

// 6 Exclusive School Hoodies Initial Catalog Data
const INITIAL_PRODUCTS = [
  {
    id: 'hoodie-1',
    name: 'Classic Heritage Hoodie',
    tagline: 'Lo stile iconico scolastico con stemma ricamato',
    description: 'Felpa unisex in cotone pettinato pesante 320g. Interno garzato ultra-morbido con stemma del liceo ad alta definizione sul petto.',
    price: 35.00,
    rating: 4.9,
    reviewsCount: 42,
    badge: 'Più Venduto',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    stock: { XS: 4, S: 10, M: 15, L: 8, XL: 3 }
  },
  {
    id: 'hoodie-2',
    name: 'Vintage Washed Hoodie',
    tagline: 'Effetto lavato retrò dal fascino atemporale',
    description: 'Trattamento acid wash artigianale. Vestibilità leggermente boxy con bordi a coste rinforzati e tasca a marsupio anatomica.',
    price: 38.00,
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Edizione Limitata',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
    stock: { XS: 2, S: 5, M: 8, L: 6, XL: 2 }
  },
  {
    id: 'hoodie-3',
    name: 'Minimalist Logo Hoodie',
    tagline: 'Design pulito ed essenziale con micro-logo',
    description: 'Perfetta sia per gli studenti che per i docenti. Tessuto traspirante con cappuccio foderato e coulisse metalliche.',
    price: 34.00,
    rating: 4.7,
    reviewsCount: 35,
    badge: 'Consigliato Prof',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    stock: { XS: 5, S: 12, M: 18, L: 12, XL: 6 }
  },
  {
    id: 'hoodie-4',
    name: 'Zip-Up Heavyweight Hoodie',
    tagline: 'Massimo comfort con cerniera full-zip metallica',
    description: 'Zip ad alta resistenza YKK, cappuccio strutturato a 3 pannelli e cuciture a triplo ago per una durata garantita su più anni scolastici.',
    price: 42.00,
    rating: 4.9,
    reviewsCount: 18,
    badge: 'Premium',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    stock: { XS: 3, S: 6, M: 10, L: 7, XL: 1 }
  },
  {
    id: 'hoodie-5',
    name: 'College Varsity Edition',
    tagline: 'Ispirazione campus americano con dettagli bicolore',
    description: 'Dettagli a contrasto su cappuccio e maniche, ricamo in spugna morbida stile varsity. La preferita dagli studenti dell’ultimo anno.',
    price: 39.00,
    rating: 5.0,
    reviewsCount: 51,
    badge: 'Trend 2026',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    stock: { XS: 1, S: 4, M: 9, L: 5, XL: 0 }
  },
  {
    id: 'hoodie-6',
    name: 'Streetwear Oversized Hoodie',
    tagline: 'Spalle scivolate e taglio oversize ultra-moderno',
    description: 'Vestibilità rilassata streetwear, tessuto pesante calandrato anti-pilling. Un capolavoro di stile per il tempo libero e la scuola.',
    price: 36.00,
    rating: 4.8,
    reviewsCount: 24,
    badge: 'Oversize',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    stock: { XS: 6, S: 8, M: 14, L: 9, XL: 4 }
  }
];

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState('shop'); // 'shop' | 'admin'
  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // 'orders' | 'inventory'

  // Admin Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    studentClass: '',     // per Studente (es: 5^A Liceo)
    teacherSubject: '',   // per Docente (es: Prof. Rossi - Matematica)
    ataOffice: '',        // per ATA (es: Segreteria Didattica)
    phone: '',
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
      setAdminPasswordInput('');
      setAdminPasswordError('');
      setIsAdminPasswordModalOpen(true);
    }
  };

  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setIsAdminPasswordModalOpen(false);
      setCurrentView('admin');
      setAdminPasswordError('');
    } else {
      setAdminPasswordError('Password errata. Riprova.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentView('shop');
  };

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
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
        // Seed default products to Firestore
        INITIAL_PRODUCTS.forEach(async (p) => {
          await setDoc(doc(productsRef, p.id), p);
        });
      }
    }, (err) => console.warn("Products sync error:", err));

    // Subscribe to orders
    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort newest first
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
          updated[existingIndex].quantity = currentStock; // cap at stock
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

    // Build location string based on role
    let locationDetail = '';
    if (role === 'studente') locationDetail = formData.studentClass;
    else if (role === 'docente') locationDetail = formData.teacherSubject;
    else if (role === 'ata') locationDetail = formData.ataOffice;

    const orderId = 'SCH-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      orderCode: orderId,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: role, // 'studente', 'docente', 'ata'
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
      paymentMethod: 'Contanti alla consegna',
      status: 'In attesa', // 'In attesa' | 'Pronto per consegna' | 'Consegnato e Incassato' | 'Annullato'
      createdAt: Date.now()
    };

    // 1. Update stock locally and in Firestore
    const updatedProducts = products.map(p => {
      const cartItemsForProduct = cart.filter(ci => ci.product.id === p.id);
      if (cartItemsForProduct.length === 0) return p;

      const newStock = { ...p.stock };
      cartItemsForProduct.forEach(ci => {
        newStock[ci.size] = Math.max(0, (newStock[ci.size] || 0) - ci.quantity);
      });

      // Update Firestore product if connected
      if (db) {
        const prodDoc = doc(db, 'products', p.id);
        updateDoc(prodDoc, { stock: newStock }).catch(err => console.warn("Stock update err:", err));
      }

      return { ...p, stock: newStock };
    });

    setProducts(updatedProducts);

    // 2. Add Order to Firestore or state
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

    // 3. Clear Cart & Reset Form
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
      // Role Filter
      if (roleFilter !== 'all' && order.customer.role !== roleFilter) return false;
      // Status Filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      // Search Query
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
      
      {/* HEADER NAV */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & School Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('shop')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                CAMPUS HOODIES
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">
                Edizione Limitata Scuola
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            
            {/* View Switcher: Shop vs Admin */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
              <button
                onClick={() => setCurrentView('shop')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'shop'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Negozio
              </button>
              <button
                onClick={handleOpenAdmin}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Pannello Admin
                {isAdminAuthenticated ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Autenticato" />
                ) : (
                  orders.filter(o => o.status === 'In attesa').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
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
                  <span className="bg-white text-emerald-900 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
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
            
            {/* HERO BANNER */}
            <section className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
              <div className="max-w-7xl mx-auto relative z-10 text-center">
                
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-full text-indigo-300 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Drop Esclusivo A.S. 2025/2026
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                  Le Felpe Ufficiali della Tua Scuola.
                </h1>
                <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base mb-6">
                  Ordina online, paga in <strong className="text-emerald-400 font-bold">contanti alla consegna</strong> e ritira la tua felpa direttamente in aula durante l'intervallo.
                </p>

                {/* Info Badges for School Roles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
                  <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Per Studenti</div>
                      <div className="text-[11px] text-slate-400">Consegna diretta in classe</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Per Docenti</div>
                      <div className="text-[11px] text-slate-400">Consegna in Sala Professori</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Personale ATA</div>
                      <div className="text-[11px] text-slate-400">Consegna in Ufficio/Portineria</div>
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
                    Collezione Felpe (6 Stili)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Giacenze limitate in tempo reale per le taglie XS, S, M, L, XL
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Nessuna carta richiesta – Paghi solo in contanti
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
                      {/* Image & Badge Container */}
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                            {product.badge}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/95 backdrop-blur text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-full shadow">
                            €{product.price ? product.price.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                              ★ {product.rating} <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                            </div>
                          </div>
                          
                          <p className="text-xs font-semibold text-indigo-600 mb-2">
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
                              {totalStock > 0 ? `${totalStock} pezzi rimasti` : 'Esaurito'}
                            </span>
                          </div>

                          {/* Sizes Selector Pills */}
                          <div className="flex items-center justify-between gap-1 mb-4">
                            {['XS', 'S', 'M', 'L', 'XL'].map((sz) => {
                              const stk = (product.stock && product.stock[sz]) || 0;
                              return (
                                <div
                                  key={sz}
                                  className={`flex-1 text-center py-1 rounded border text-[11px] font-bold transition-all ${
                                    stk > 0
                                      ? 'border-slate-200 bg-slate-50 text-slate-800'
                                      : 'border-slate-100 bg-slate-100 text-slate-300 line-through'
                                  }`}
                                  title={stk > 0 ? `${stk} disponibili` : 'Taglia esaurita'}
                                >
                                  {sz}
                                  <span className="block text-[9px] font-normal opacity-75">
                                    {stk > 0 ? stk : '0'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Add Button */}
                          <button
                            onClick={() => {
                              setSelectedProductModal(product);
                              const firstAvailable = ['S', 'M', 'L', 'XS', 'XL'].find(s => (product.stock && product.stock[s] || 0) > 0) || 'M';
                              setModalSize(firstAvailable);
                            }}
                            disabled={totalStock <= 0}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                              totalStock > 0
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {totalStock > 0 ? 'Scegli Taglia e Ordina' : 'Esaurito'}
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
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl mb-8 border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" /> Gestione Scuola & Consegne
                  </div>
                  <h1 className="text-2xl font-black">Pannello Amministratore</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Admin Tab Switcher */}
                  <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setActiveAdminTab('orders')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeAdminTab === 'orders'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Gestione Ordini ({orders.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab('inventory')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeAdminTab === 'inventory'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Gestione Scorte
                    </button>
                  </div>

                  {/* Admin Logout Button */}
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    title="Esci dalla sessione Amministratore"
                  >
                    <LogOut className="w-4 h-4" />
                    Esci
                  </button>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-medium">Totale Ordini</div>
                  <div className="text-2xl font-black text-white mt-1">{adminStats.totalOrdersCount}</div>
                  <div className="text-[10px] text-indigo-400 mt-1">studenti, prof e ATA</div>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-medium">Contanti Incassati</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">€{adminStats.collectedCash.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-500/80 mt-1">ordini consegnati</div>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-medium">Contanti da Incassare</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">€{adminStats.pendingCash.toFixed(2)}</div>
                  <div className="text-[10px] text-amber-500/80 mt-1">in attesa di ritiro</div>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-xs font-medium">Felpe Prenotate</div>
                  <div className="text-2xl font-black text-indigo-300 mt-1">{adminStats.totalHoodiesSold}</div>
                  <div className="text-[10px] text-slate-400 mt-1">unità totali</div>
                </div>

              </div>
            </div>

            {/* TAB 1: ORDERS MANAGEMENT */}
            {activeAdminTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                
                {/* Filters and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cerca per Nome, Classe, Ufficio o Codice (#SCH)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Role Filter */}
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

                    {/* Status Filter */}
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

                    {/* Print Button */}
                    <button
                      onClick={() => setPrintOrdersModal(true)}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Stampa Lista
                    </button>

                  </div>

                </div>

                {/* Orders List Table */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">Nessun ordine trovato con questi filtri.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      
                      // Role styling badge
                      let roleBadgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                      let RoleIcon = GraduationCap;
                      if (order.customer.role === 'docente') {
                        roleBadgeClass = "bg-purple-100 text-purple-800 border-purple-200";
                        RoleIcon = BookOpen;
                      } else if (order.customer.role === 'ata') {
                        roleBadgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                        RoleIcon = Building2;
                      }

                      // Status Badge Styling
                      let statusBadge = "bg-yellow-100 text-yellow-800 border-yellow-300";
                      if (order.status === 'Pronto per consegna') statusBadge = "bg-blue-100 text-blue-800 border-blue-300";
                      else if (order.status === 'Consegnato e Incassato') statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
                      else if (order.status === 'Annullato') statusBadge = "bg-red-100 text-red-800 border-red-300";

                      return (
                        <div
                          key={order.orderCode}
                          className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-all bg-white shadow-sm"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            
                            {/* Customer & Role Information */}
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
                                    <School className="w-3.5 h-3.5 text-indigo-600" />
                                    {order.customer.location || 'N/D'}
                                  </span>
                                  {order.customer.phone && (
                                    <a
                                      href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      {order.customer.phone}
                                    </a>
                                  )}
                                  <span className="text-slate-400">
                                    {new Date(order.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status & Actions Dropdown */}
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

                          {/* Ordered Items Summary */}
                          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                                  <strong>{item.quantity}x</strong> {item.productName} <span className="text-indigo-600 font-bold">({item.size})</span>
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

            {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
            {activeAdminTab === 'inventory' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Gestione Giacenze Magazzino (6 Stili)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Modifica direttamente la disponibilità di ciascuna taglia per bloccare/sbloccare gli ordini in tempo reale su Firebase.
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
                            <span className="text-xs font-bold text-indigo-600">€{product.price ? product.price.toFixed(2) : '0.00'}</span>
                          </div>
                        </div>

                        {/* Quick stock refill buttons */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">Riassortimento Rapido:</span>
                          <button
                            onClick={() => {
                              ['XS', 'S', 'M', 'L', 'XL'].forEach(sz => {
                                handleUpdateStock(product.id, sz, ((product.stock && product.stock[sz]) || 0) + 5);
                              });
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-indigo-200"
                          >
                            +5 su tutte
                          </button>
                        </div>
                      </div>

                      {/* Size Controls Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                          const qty = (product.stock && product.stock[size]) || 0;
                          return (
                            <div key={size} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                              <span className="text-xs font-black text-slate-700 uppercase mb-1">Taglia {size}</span>
                              <div className="flex items-center gap-1.5 my-1">
                                <button
                                  onClick={() => handleUpdateStock(product.id, size, qty - 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={qty}
                                  onChange={(e) => handleUpdateStock(product.id, size, e.target.value)}
                                  className="w-12 text-center text-sm font-extrabold border border-slate-200 rounded-lg py-1"
                                />
                                <button
                                  onClick={() => handleUpdateStock(product.id, size, qty + 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
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
            <h2 className="text-xl font-black text-slate-900 mb-2">Accesso Non Autorizzato</h2>
            <p className="text-xs text-slate-500 mb-6">
              Devi inserire la password da amministratore per accedere a questa sezione.
            </p>
            <button
              onClick={handleOpenAdmin}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all"
            >
              Inserisci Password Admin
            </button>
          </div>
        )}
      </main>

      {/* MODAL: ADMIN PASSWORD VERIFICATION */}
      {isAdminPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAdminPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Accesso Riservato Admin
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Inserisci la password di amministrazione per accedere alla gestione degli ordini e delle giacenze.
            </p>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password Amministratore
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Inserisci password..."
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    className={`w-full pl-4 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 ${
                      adminPasswordError
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-200 focus:ring-indigo-500'
                    }`}
                  />
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

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Password predefinita: <strong className="font-extrabold">{ADMIN_PASSWORD}</strong></span>
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Accedi
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: SIZE SELECTION & QUICK ADD */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedProductModal.badge}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                  {selectedProductModal.name}
                </h3>
                <span className="text-base font-black text-slate-900">
                  €{selectedProductModal.price ? selectedProductModal.price.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              {selectedProductModal.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Seleziona Taglia:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((sz) => {
                  const stk = (selectedProductModal.stock && selectedProductModal.stock[sz]) || 0;
                  const isAvailable = stk > 0;
                  const isSelected = modalSize === sz;

                  return (
                    <button
                      key={sz}
                      disabled={!isAvailable}
                      onClick={() => setModalSize(sz)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md scale-105'
                          : isAvailable
                          ? 'border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300'
                          : 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                      }`}
                    >
                      <span>{sz}</span>
                      <span className={`text-[9px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {isAvailable ? `${stk} rimanenti` : '0'}
                      </span>
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
              disabled={((selectedProductModal.stock && selectedProductModal.stock[modalSize]) || 0) <= 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Aggiungi al Carrello (Taglia {modalSize})
            </button>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h2 className="font-extrabold text-base">Il tuo Carrello Scuola</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">Il carrello è vuoto.</p>
                  <p className="text-xs text-slate-400 mt-1">Scegli una delle 6 felpe per iniziare.</p>
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
                        <span>Taglia: <strong className="text-indigo-600 uppercase font-black">{item.size}</strong></span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">€{item.product.price ? item.product.price.toFixed(2) : '0.00'}</span>
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
                            className="text-slate-600 font-bold hover:text-indigo-600"
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

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600">Totale Contanti:</span>
                  <span className="text-2xl font-black text-slate-900">€{cartTotal.toFixed(2)}</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pagamento esclusivamente in contanti alla consegna durante la ricreazione.</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Procedi all'Ordine
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WITH SCHOOL ROLE SELECTOR */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <School className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900">Checkout Ordine Scolastico</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Inserisci i tuoi dati per la consegna direttamente a scuola.
            </p>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              
              {/* ROLE SELECTOR CARDS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Chi sei? (Seleziona Ruolo):
                </label>

                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Studente */}
                  <button
                    type="button"
                    onClick={() => setRole('studente')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === 'studente'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-extrabold">Studente</span>
                  </button>

                  {/* Docente */}
                  <button
                    type="button"
                    onClick={() => setRole('docente')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === 'docente'
                        ? 'border-purple-600 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-extrabold">Docente</span>
                  </button>

                  {/* ATA */}
                  <button
                    type="button"
                    onClick={() => setRole('ata')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                      role === 'ata'
                        ? 'border-amber-600 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-extrabold">Personale ATA</span>
                  </button>

                </div>
              </div>

              {/* DYNAMIC FORM FIELDS BASED ON ROLE */}
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Specific field for Studente */}
                {role === 'studente' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Classe e Sezione * (es. 5^A Liceo, 3^B Tech)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. 5^A Scientifico"
                      value={formData.studentClass}
                      onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Specific field for Docente */}
                {role === 'docente' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Materia / Sala Professori * (es. Prof. Rossi - Matematica)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. Matematica (Sala Professori)"
                      value={formData.teacherSubject}
                      onChange={(e) => setFormData({ ...formData, teacherSubject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Specific field for ATA */}
                {role === 'ata' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ufficio / Postazione * (es. Segreteria, Portineria)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. Portineria Principale / Segreteria"
                      value={formData.ataOffice}
                      onChange={(e) => setFormData({ ...formData, ataOffice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* Phone/WhatsApp for coordination */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cellulare / WhatsApp * (per avvisarti della consegna)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="es. 333 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Extra Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Note Opzionali</label>
                  <input
                    type="text"
                    placeholder="es. Consegna preferita durante il 2° intervallo"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              {/* PAYMENT RECAP BANNER */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Pagamento: Contanti alla Consegna
                </div>
                <p className="text-[11px] text-emerald-700">
                  Importo totale di <strong>€{cartTotal.toFixed(2)}</strong> da consegnare in contanti al momento del ritiro della felpa.
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
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              Ordine Ricevuto!
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              La tua richiesta è stata registrata con successo nel database Firebase della scuola.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left space-y-2 mb-6">
              <div className="flex justify-between items-center text-xs border-b pb-2">
                <span className="text-slate-500 font-semibold">Codice Ordine:</span>
                <span className="font-extrabold text-indigo-600 text-sm">{completedOrder.orderCode}</span>
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
                <span className="text-slate-500 font-semibold">Da pagare in contanti:</span>
                <span className="font-black text-emerald-600 text-base">€{completedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow transition-all text-xs"
            >
              Torna al Negozio
            </button>

          </div>
        </div>
      )}

      {/* PRINTABLE ORDERS LIST MODAL FOR DELIVERIES */}
      {printOrdersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 relative">
            <button
              onClick={() => setPrintOrdersModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-black text-slate-900">Lista Consegne Scuola</h3>
                <p className="text-xs text-slate-500">Stampa da portare durante l'intervallo per la consegna e l'incasso.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Stampa Foglio
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
                    📍 Posizione: <strong>{o.customer.location}</strong> | Tel: {o.customer.phone}
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
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">Merchandising Scolastico Ufficiale</span>
          </div>
          <div>
            A.S. 2025/2026 • Tutti gli ordini sono gestiti ed incassati direttamente a scuola.
          </div>
        </div>
      </footer>

    </div>
  );
}
