
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, MapPin, X, Loader2, AlertTriangle, Info, PlusCircle, MinusCircle, Filter, Utensils } from 'lucide-react';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import OrderCard from '@/pages/staff/components/OrderCard';
import MobileOrderForm from '@/pages/staff/components/MobileOrderForm';
import BranchSelectorDialog from '@/pages/staff/components/BranchSelectorDialog';
import StaffHeader from '@/pages/staff/components/StaffHeader';
import OrderSummaryCards from '@/pages/staff/components/OrderSummaryCards';
import CategoryTabs from '@/pages/client/components/CategoryTabs';
import ProductCard from '@/pages/client/components/ProductCard';
import CartSheet from '@/pages/client/components/CartSheet';
import { formatGuaranies } from '@/lib/store/financialStatsSlice';

const ActiveOrdersView = ({ 
  orders, 
  selectedBranch, 
  onStatusUpdate, 
  isUpdatingStatus, 
  isLoadingOrders, 
  storeOrdersError 
}) => {
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  const filteredActiveOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : [])
      .filter(order => order.branch_id === selectedBranch?.id && order.status !== 'Entregado' && order.status !== 'Cancelado')
      .filter(order => {
        const searchTermLower = orderSearchTerm.toLowerCase();
        const matchesSearch = orderSearchTerm 
          ? order.id.toLowerCase().includes(searchTermLower) || 
            (order.customer_name && order.customer_name.toLowerCase().includes(searchTermLower)) ||
            (order.users?.email && order.users.email.toLowerCase().includes(searchTermLower))
          : true;
        const matchesStatus = orderStatusFilter ? order.status === orderStatusFilter : true;
        return matchesSearch && matchesStatus;
      });
  }, [orders, selectedBranch, orderSearchTerm, orderStatusFilter]);

  const orderStatuses = ['Pendiente', 'En preparación', 'Listo para servir'];

  return (
    <section>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar pedido por ID, cliente..."
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-500"
          />
        </div>
        <Select value={orderStatusFilter} onValueChange={(value) => setOrderStatusFilter(value === "ALL_STATUSES" ? "" : value)}>
          <SelectTrigger className="w-full sm:w-[200px] bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-purple-500 focus:border-purple-500">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="ALL_STATUSES" className="hover:!bg-purple-600/70 focus:bg-purple-600/70">Todos los estados</SelectItem>
            {orderStatuses.map(status => (
              <SelectItem key={status} value={status} className="hover:!bg-purple-600/70 focus:bg-purple-600/70">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <OrderSummaryCards orders={filteredActiveOrders} />

      <h2 className="text-2xl font-semibold mb-4 text-purple-300">Pedidos Activos en {selectedBranch.name}</h2>
      {isLoadingOrders && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>}
      {!isLoadingOrders && storeOrdersError && <p className="text-red-400">Error al cargar pedidos: {storeOrdersError}</p>}
      {!isLoadingOrders && !storeOrdersError && filteredActiveOrders.length === 0 && (
        <div className="text-center py-10 bg-slate-800/50 border border-slate-700 rounded-lg shadow-md">
          <Filter className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No se encontraron pedidos</h3>
          <p className="text-slate-400">
            {orderSearchTerm || orderStatusFilter ? "Intenta con otros filtros o términos de búsqueda." : "No hay pedidos activos que coincidan."}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActiveOrders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onStatusUpdate={onStatusUpdate} 
            isUpdating={isUpdatingStatus[order.id]}
          />
        ))}
      </div>
    </section>
  );
};


const TakeOrderView = ({
  products, categories, selectedCategory, setSelectedCategory,
  searchTerm, setSearchTerm, openProductDetail,
  isLoadingProducts, productsError, customerName, setCustomerName
}) => {

  const filteredProducts = useMemo(() => {
    return (Array.isArray(products) ? products : []).filter(product => {
      const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return product.active && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <>
      <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold text-purple-300 mb-3 flex items-center">
          <Utensils className="mr-2 h-6 w-6" /> Tomar Pedido
        </h2>
        <Input
          type="text"
          placeholder="Nombre del Cliente (Requerido)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full max-w-md pl-4 pr-4 py-2 bg-slate-700 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-500"
        />
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-500"
        />
      </div>
      <CategoryTabs categories={categories || []} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      
      {isLoadingProducts && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
        </div>
      )}

      {!isLoadingProducts && productsError && (
        <div className="text-center py-10 bg-red-900/20 border border-red-700 rounded-lg shadow-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-300 mb-2">Error al cargar productos</h3>
          <p className="text-red-400">{productsError}</p>
        </div>
      )}

      {!isLoadingProducts && !productsError && filteredProducts.length === 0 && (
        <div className="text-center py-10 bg-slate-800/50 border border-slate-700 rounded-lg shadow-md">
          <Search className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No se encontraron productos</h3>
          <p className="text-slate-400">
            {searchTerm ? "Intenta con otro término de búsqueda o cambia la categoría." : "No hay productos disponibles en esta categoría."}
          </p>
        </div>
      )}
      
      <AnimatePresence>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8"
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={openProductDetail} />
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
};


const StaffPage = () => {
  const { 
    products, fetchProducts, categories, fetchCategories, 
    branches, fetchBranches, user, createOrder, updateOrderStatus, logout,
    orders, fetchOrders: storeFetchOrders,
    subscribeToOrderChanges, unsubscribeFromOrderChanges,
    isLoadingProducts, productsError, isLoadingCategories, categoriesError,
    isLoadingBranches, branchesError, isLoadingOrders, ordersError: storeOrdersError
  } = useStore(state => ({
    products: state.products || [],
    fetchProducts: state.fetchProducts,
    subscribeToOrderChanges: state.subscribeToOrderChanges,
    unsubscribeFromOrderChanges: state.unsubscribeFromOrderChanges,
    categories: state.categories || [], 
    fetchCategories: state.fetchCategories,
    branches: state.branches || [], 
    fetchBranches: state.fetchBranches,
    user: state.user, 
    createOrder: state.createOrder, 
    updateOrderStatus: state.updateOrderStatus, 
    logout: state.logout,
    orders: state.orders || [], 
    fetchOrders: state.fetchOrders,
    isLoadingProducts: state.isLoadingProducts, 
    productsError: state.productsError,
    isLoadingCategories: state.isLoadingCategories, 
    categoriesError: state.categoriesError,
    isLoadingBranches: state.isLoadingBranches, 
    branchesError: state.branchesError,
    isLoadingOrders: state.isLoadingOrders, 
    ordersError: state.ordersError,
  }));

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState({});
  const [activeOrdersView, setActiveOrdersView] = useState(false); 
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentProductQuantity, setCurrentProductQuantity] = useState(1);
  const [currentProductNotes, setCurrentProductNotes] = useState('');
  const [currentProductSelectedAddOns, setCurrentProductSelectedAddOns] = useState({});


  const loadInitialData = useCallback(async () => {
    if (initialDataLoaded) return;

    console.log("StaffPage: loadInitialData called");
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBranches()
    ]);
    setInitialDataLoaded(true);
  }, [fetchProducts, fetchCategories, fetchBranches, initialDataLoaded]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    const currentBranches = branches || [];
    if (initialDataLoaded) {
      if (user?.branch_id) {
        const staffBranch = currentBranches.find(b => b.id === user.branch_id);
        if (staffBranch) {
          if (!selectedBranch || selectedBranch.id !== staffBranch.id) {
            setSelectedBranch(staffBranch);
          }
        } else if (currentBranches.length > 0) {
          setIsBranchSelectorOpen(true);
        }
      } else if (currentBranches.length > 0 && !selectedBranch) {
        setIsBranchSelectorOpen(true);
      }
    }
  }, [initialDataLoaded, user, branches, selectedBranch]);

  useEffect(() => {
    if (selectedBranch?.id) {
      console.log("StaffPage: Fetching orders for branch", selectedBranch.id);
      storeFetchOrders(selectedBranch.id);
    }
  }, [selectedBranch, storeFetchOrders]);

  // Effect for real-time order subscriptions
  useEffect(() => {
    if (selectedBranch?.id) {
      console.log(`StaffPage: Subscribing to order changes for branch ${selectedBranch.id}`);
      subscribeToOrderChanges(selectedBranch.id);

      return () => {
        console.log(`StaffPage: Unsubscribing from order changes for branch ${selectedBranch.id}`);
        unsubscribeFromOrderChanges();
      };
    }
  }, [selectedBranch, subscribeToOrderChanges, unsubscribeFromOrderChanges]);

  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setIsBranchSelectorOpen(false);
    setCart([]);
    toast({
      title: "Sucursal Seleccionada",
      description: `Operando en ${branch.name}.`,
      className: "bg-purple-600 text-white"
    });
  };

  const openProductDetail = (product) => {
    setCurrentProduct(product);
    setCurrentProductQuantity(1);
    setCurrentProductNotes('');
    setCurrentProductSelectedAddOns({});
    setIsProductDetailOpen(true);
  };

  const handleAddOnSelection = (addOnId, isSelected) => {
    setCurrentProductSelectedAddOns(prev => ({
      ...prev,
      [addOnId]: isSelected
    }));
  };
  
  const calculateAddOnsTotal = (product, selectedAddOnsMap) => {
    if (!product || !product.add_ons) return 0;
    return product.add_ons.reduce((total, addon) => {
      if (selectedAddOnsMap[addon.id]) {
        return total + (parseFloat(addon.add_on_price) || 0);
      }
      return total;
    }, 0);
  };

  const handleAddToCartFromDetail = () => {
    if (!currentProduct) return;

    const existingCartItemIndex = cart.findIndex(item => 
      item.productId === currentProduct.id && 
      JSON.stringify(item.add_ons?.map(ao => ao.product_add_on_id).sort() || []) === JSON.stringify(Object.keys(currentProductSelectedAddOns).filter(key => currentProductSelectedAddOns[key]).sort()) &&
      item.notes === currentProductNotes
    );
    
    let finalPrice = parseFloat(currentProduct.price);
    const selectedAddOnsDetails = [];

    if (currentProduct.add_ons && currentProduct.add_ons.length > 0) {
        currentProduct.add_ons.forEach(addon => {
            if (currentProductSelectedAddOns[addon.id]) {
                finalPrice += parseFloat(addon.add_on_price);
                selectedAddOnsDetails.push({
                    product_add_on_id: addon.id,
                    name: addon.name,
                    price: parseFloat(addon.add_on_price),
                    quantity_selected: 1, 
                    ingredient_id: addon.ingredient_id,
                    ingredient_quantity_per_add_on: parseFloat(addon.add_on_quantity)
                });
            }
        });
    }

    if (existingCartItemIndex > -1) {
      const updatedCart = cart.map((item, index) => 
        index === existingCartItemIndex 
          ? { ...item, quantity: item.quantity + currentProductQuantity } 
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { 
        id: `${currentProduct.id}-${Date.now()}`, 
        productId: currentProduct.id,
        name: currentProduct.name, 
        price: finalPrice, 
        originalPrice: parseFloat(currentProduct.price),
        quantity: currentProductQuantity, 
        notes: currentProductNotes,
        add_ons: selectedAddOnsDetails 
      }]);
    }
    toast({
      title: `${currentProduct.name} añadido al carrito`,
      description: `${currentProductQuantity} unidad(es) con ${selectedAddOnsDetails.length} agregado(s).`,
      className: "bg-green-500 text-white"
    });
    setIsProductDetailOpen(false);
  };

  const handleQuantityChange = (cartItemId, amount) => {
    setCart(cart.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: Math.max(1, item.quantity + amount) } 
        : item
    ).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (cartItemId) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };
  
  const handleNotesChange = (cartItemId, notes) => {
    setCart(cart.map(item => item.id === cartItemId ? { ...item, notes } : item));
  };

  const totalCartAmount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (!selectedBranch) {
      toast({ title: "Error", description: "Por favor, selecciona una sucursal.", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Carrito Vacío", description: "Añade productos al carrito.", variant: "destructive" });
      return;
    }
    if (!customerName.trim()) {
      toast({ title: "Nombre del Cliente", description: "Por favor, ingresa el nombre del cliente.", variant: "destructive" });
      return;
    }

    const orderData = {
      user_id: null, 
      customer_name: customerName,
      branch_id: selectedBranch.id,
      status: 'Pendiente',
      total_amount: totalCartAmount,
      orderItems: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.originalPrice, 
        notes: item.notes,
        add_ons: item.add_ons,
      })),
    };

    const result = await createOrder(orderData);
    if (result.success) {
      toast({
        title: "Pedido Creado",
        description: `Pedido para ${customerName} enviado exitosamente.`,
        className: "bg-green-600 text-white"
      });
      setCart([]);
      setCustomerName('');
      setIsCartOpen(false);
    } else {
      toast({
        title: "Error al crear pedido",
        description: result.error || "No se pudo completar el pedido.",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error && result.isOptimisticRevert) {
        toast({
          title: "Error de Sincronización",
          description: `No se pudo actualizar el estado del pedido a "${newStatus}". Se revirtió al estado anterior. (${result.error})`,
          variant: "destructive"
        });
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        let messages = [`Pedido #${orderId.substring(0,8)} marcado como "${newStatus}".`];
        if(result.info_stock) messages.push(result.info_stock);
        if(result.warning_stock) messages.push(result.warning_stock);
        if(result.info_sale) messages.push(result.info_sale);
        if(result.error_sale) messages.push(`Error en venta: ${result.error_sale}`);
        
        toast({
          title: "Estado Actualizado",
          description: messages.join(' '),
          variant: result.error_sale ? "destructive" : "default",
          className: result.error_sale ? "" : (newStatus === "Entregado" ? "bg-green-500 text-white" : "bg-blue-500 text-white")
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al actualizar pedido #${orderId.substring(0,8)}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const activeBranchOrdersForSummary = useMemo(() => {
    return (Array.isArray(orders) ? orders : []).filter(order => order.branch_id === selectedBranch?.id && order.status !== 'Entregado' && order.status !== 'Cancelado');
  }, [orders, selectedBranch]);


  const isLoadingInitial = isLoadingProducts || isLoadingCategories || isLoadingBranches;
  const hasInitialError = productsError || categoriesError || branchesError;

  if (!initialDataLoaded && isLoadingInitial) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
        <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
      </div>
    );
  }

  if (hasInitialError && !selectedBranch) { 
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white p-4">
        <AlertTriangle className="h-16 w-16 text-yellow-300 mb-4" />
        <h2 className="text-3xl font-semibold mb-2">Error al Cargar Datos Iniciales</h2>
        <p className="text-center text-red-200 mb-6">
          {productsError || categoriesError || branchesError || "No se pudieron cargar los datos necesarios. Por favor, intenta de nuevo más tarde."}
        </p>
        <Button onClick={() => { setInitialDataLoaded(false); loadInitialData(); }} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          Reintentar Carga Inicial
        </Button>
      </div>
    );
  }
  
  const currentProductAddOnsTotal = currentProduct ? calculateAddOnsTotal(currentProduct, currentProductSelectedAddOns) : 0;
  const currentProductFinalPrice = currentProduct ? (parseFloat(currentProduct.price) + currentProductAddOnsTotal) * currentProductQuantity : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-gray-100 flex flex-col">
      <StaffHeader 
        user={user} 
        selectedBranch={selectedBranch} 
        branches={branches || []}
        onSelectBranch={handleSelectBranch}
        onTakeOrder={() => setActiveOrdersView(false)}
        onLogout={logout}
        userName={user?.name || user?.email}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onToggleOrdersView={() => setActiveOrdersView(!activeOrdersView)}
        activeOrdersView={activeOrdersView}
        activeOrderCount={activeBranchOrdersForSummary.length}
      />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {!selectedBranch && initialDataLoaded && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-600/50 text-yellow-300 p-6 rounded-lg text-center mb-8 shadow-lg"
          >
            <Info className="h-10 w-10 mx-auto mb-3 text-yellow-400" />
            <p className="text-xl font-semibold mb-2">¡Bienvenido, {user?.name || 'Personal'}!</p>
            <p className="mb-4">Por favor, selecciona tu sucursal para comenzar a tomar pedidos.</p>
            <Button onClick={() => setIsBranchSelectorOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              Seleccionar Sucursal
            </Button>
          </motion.div>
        )}

        {selectedBranch && (
          activeOrdersView ? (
            <ActiveOrdersView 
              orders={orders}
              selectedBranch={selectedBranch}
              onStatusUpdate={handleStatusUpdate}
              isUpdatingStatus={isUpdatingStatus}
              isLoadingOrders={isLoadingOrders}
              storeOrdersError={storeOrdersError}
            />
          ) : (
            <TakeOrderView
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              openProductDetail={openProductDetail}
              isLoadingProducts={isLoadingProducts}
              productsError={productsError}
              customerName={customerName}
              setCustomerName={setCustomerName}
            />
          )
        )}
      </main>

      <MobileOrderForm 
        cart={cart}
        totalCartAmount={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartSheet 
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        selectedBranch={selectedBranch}
        onQuantityChange={handleQuantityChange}
        onRemoveItem={handleRemoveItem}
        onNotesChange={handleNotesChange}
        totalCartAmount={totalCartAmount}
        onCheckout={handleCheckout}
        isLoading={isLoadingOrders}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        isStaffOrder={true}
      />

      <BranchSelectorDialog
        isOpen={isBranchSelectorOpen}
        onOpenChange={setIsBranchSelectorOpen}
        branches={branches || []}
        onSelectBranch={handleSelectBranch}
        isLoading={isLoadingBranches}
        error={branchesError}
        currentStaffBranchId={user?.branch_id}
      />

      {currentProduct && (
        <Dialog open={isProductDetailOpen} onOpenChange={setIsProductDetailOpen}>
          <DialogContent className="bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 text-white border-purple-700/50 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl text-purple-300">{currentProduct.name}</DialogTitle>
              <DialogDescription className="text-slate-400">{currentProduct.description}</DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-700">
              {currentProduct.add_ons && currentProduct.add_ons.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-yellow-300 mb-2">Agregados Disponibles:</h4>
                  <div className="space-y-2">
                    {currentProduct.add_ons.map(addon => (
                      <div key={addon.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md">
                        <div className="flex items-center">
                           <Checkbox
                            id={`staff-addon-${addon.id}`}
                            checked={!!currentProductSelectedAddOns[addon.id]}
                            onCheckedChange={(checked) => handleAddOnSelection(addon.id, checked)}
                            className="border-purple-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 mr-3"
                          />
                          <Label htmlFor={`staff-addon-${addon.id}`} className="text-slate-200 cursor-pointer">
                            {addon.name}
                          </Label>
                        </div>
                        <span className="text-green-400 font-medium">+{formatGuaranies(addon.add_on_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="staff-quantity" className="text-slate-300 mb-1 block">Cantidad:</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white" onClick={() => setCurrentProductQuantity(q => Math.max(1, q - 1))}>
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                  <Input id="staff-quantity" type="number" value={currentProductQuantity} readOnly className="w-16 text-center bg-slate-700 border-slate-600 text-white focus:ring-0 focus:border-slate-600" />
                  <Button variant="outline" size="icon" className="h-9 w-9 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white" onClick={() => setCurrentProductQuantity(q => q + 1)}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="staff-notes" className="text-slate-300 mb-1 block">Notas Adicionales:</Label>
                <Textarea
                  id="staff-notes"
                  placeholder="Ej: Sin cebolla, extra picante..."
                  value={currentProductNotes}
                  onChange={(e) => setCurrentProductNotes(e.target.value)}
                  className="bg-slate-700 border-purple-600 text-gray-200 placeholder-slate-400 focus:border-purple-400"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-between items-center pt-4 border-t border-slate-700">
              <div className="text-2xl font-bold text-green-400">
                Total: {formatGuaranies(currentProductFinalPrice)}
              </div>
              <Button onClick={handleAddToCartFromDetail} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                Añadir al Carrito
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffPage;
