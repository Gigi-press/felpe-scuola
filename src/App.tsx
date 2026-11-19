import { useState } from 'react';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useFirestoreData } from './hooks/useFirestoreData';
import { useCart } from './hooks/useCart';
import { useCheckout } from './hooks/useCheckout';
import { useAdminData } from './hooks/useAdminData';
import Header from './components/Header';
import ShopView from './components/ShopView';
import AdminHeader from './components/AdminHeader';
import OrdersTab from './components/OrdersTab';
import InventoryTab from './components/InventoryTab';
import CatalogTab from './components/CatalogTab';
import { useCatalogAdmin } from './hooks/useCatalogAdmin';
import AdminLocked from './components/AdminLocked';
import AdminLoginModal from './components/AdminLoginModal';
import SizeModal from './components/SizeModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ConfirmationModal from './components/ConfirmationModal';
import PrintOrdersModal from './components/PrintOrdersModal';
import Footer from './components/Footer';
import { IS_TEST_MODE, TEST_PRODUCT_ID } from './constants';
import type { AdminTab, Product, View } from './types';

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<View>('shop');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('orders');

  // Product selection modal & print modal
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [modalSize, setModalSize] = useState('M');
  const [printOrdersModal, setPrintOrdersModal] = useState(false);

  // Autenticazione admin
  const {
    isAdminAuthenticated,
    isAdminPasswordModalOpen,
    setIsAdminPasswordModalOpen,
    adminEmailInput,
    setAdminEmailInput,
    adminPasswordInput,
    setAdminPasswordInput,
    adminPasswordError,
    setAdminPasswordError,
    showPassword,
    setShowPassword,
    isLoggingIn,
    handleOpenAdmin,
    handleAdminPasswordSubmit,
    handleAdminLogout,
  } = useAdminAuth(setCurrentView);

  // Dati (prodotti e ordini sincronizzati con Firestore)
  const { products, setProducts, allProducts, setAllProducts, orders, setOrders } = useFirestoreData(isAdminAuthenticated);

  // Catalogo (aggiungi / nascondi / elimina prodotti)
  const { addProduct, setProductActive, updateProductPrice, deleteProduct } = useCatalogAdmin(allProducts, setAllProducts, setProducts);

  // Carrello
  const {
    cart, setCart, isCartOpen, setIsCartOpen,
    addToCart, updateCartQty, cartTotal, cartCount,
  } = useCart(products);

  // Checkout
  const {
    isCheckoutOpen, setIsCheckoutOpen,
    completedOrder, setCompletedOrder,
    role, setRole,
    formData, setFormData,
    isSubmitting, checkoutError, setCheckoutError,
    handlePlaceOrder,
  } = useCheckout({ cart, cartTotal, products, setProducts, setOrders, setCart, setIsCartOpen });

  // Pannello admin: filtri, statistiche, azioni
  const {
    roleFilter, setRoleFilter,
    statusFilter, setStatusFilter,
    searchQuery, setSearchQuery,
    adminStats,
    filteredOrders,
    handleUpdateOrderStatus,
    handleUpdateStock,
  } = useAdminData(orders, allProducts, setOrders, setAllProducts, setProducts);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased overflow-x-hidden">

      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        handleOpenAdmin={handleOpenAdmin}
        isAdminAuthenticated={isAdminAuthenticated}
        orders={orders}
        setIsCartOpen={setIsCartOpen}
        cartCount={cartCount}
      />

      {IS_TEST_MODE && (
        <div role="status" className="bg-yellow-300 text-yellow-950 text-xs sm:text-sm font-bold text-center px-4 py-2 border-b border-yellow-500">
          🧪 MODALITÀ TEST —{' '}
          {products.some(p => p.id === TEST_PRODUCT_ID)
            ? 'il prodotto test è in cima alla lista. Gli ordini di prova vanno annullati dal pannello admin.'
            : 'prodotto test non ancora creato: entra come admin con questo link per crearlo.'}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {currentView === 'shop' ? (
          <div>
            <ShopView
              products={products}
              setSelectedProductModal={setSelectedProductModal}
              setModalSize={setModalSize}
            />
          </div>
        ) : isAdminAuthenticated ? (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <AdminHeader
              activeAdminTab={activeAdminTab}
              setActiveAdminTab={setActiveAdminTab}
              orders={orders}
              handleAdminLogout={handleAdminLogout}
              adminStats={adminStats}
            />

            {activeAdminTab === 'orders' && (
              <OrdersTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                setPrintOrdersModal={setPrintOrdersModal}
                filteredOrders={filteredOrders}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeAdminTab === 'inventory' && (
              <InventoryTab
                allProducts={allProducts}
                handleUpdateStock={handleUpdateStock}
                updateProductPrice={updateProductPrice}
              />
            )}

            {activeAdminTab === 'catalog' && (
              <CatalogTab
                allProducts={allProducts}
                addProduct={addProduct}
                setProductActive={setProductActive}
                deleteProduct={deleteProduct}
              />
            )}
          </div>
        ) : (
          <AdminLocked handleOpenAdmin={handleOpenAdmin} />
        )}
      </main>

      {isAdminPasswordModalOpen && (
        <AdminLoginModal
          setIsAdminPasswordModalOpen={setIsAdminPasswordModalOpen}
          handleAdminPasswordSubmit={handleAdminPasswordSubmit}
          adminEmailInput={adminEmailInput}
          setAdminEmailInput={setAdminEmailInput}
          setAdminPasswordError={setAdminPasswordError}
          adminPasswordInput={adminPasswordInput}
          setAdminPasswordInput={setAdminPasswordInput}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          adminPasswordError={adminPasswordError}
          isLoggingIn={isLoggingIn}
        />
      )}

      {selectedProductModal && (
        <SizeModal
          selectedProductModal={selectedProductModal}
          setSelectedProductModal={setSelectedProductModal}
          modalSize={modalSize}
          setModalSize={setModalSize}
          addToCart={addToCart}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          setIsCartOpen={setIsCartOpen}
          cart={cart}
          updateCartQty={updateCartQty}
          cartTotal={cartTotal}
          setIsCheckoutOpen={setIsCheckoutOpen}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          setIsCheckoutOpen={(open) => { setIsCheckoutOpen(open); setCheckoutError(''); }}
          handlePlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
          checkoutError={checkoutError}
          role={role}
          setRole={setRole}
          formData={formData}
          setFormData={setFormData}
          cartTotal={cartTotal}
        />
      )}

      {completedOrder && (
        <ConfirmationModal
          completedOrder={completedOrder}
          setCompletedOrder={setCompletedOrder}
        />
      )}

      {printOrdersModal && (
        <PrintOrdersModal
          setPrintOrdersModal={setPrintOrdersModal}
          filteredOrders={filteredOrders}
        />
      )}

      <Footer />

    </div>
  );
}
