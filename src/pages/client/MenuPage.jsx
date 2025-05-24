
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Search, MapPin, X, Loader2, AlertTriangle, Info, PlusCircle, MinusCircle } from 'lucide-react';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import ProductCard from '@/pages/client/components/ProductCard';
import CategoryTabs from '@/pages/client/components/CategoryTabs';
import CartSheet from '@/pages/client/components/CartSheet';
import BranchSelectorDialog from '@/pages/client/components/BranchSelectorDialog';
import { formatGuaranies } from '@/lib/store/financialStats';

const MenuPage = () => {
  const { 
    products, fetchProducts, categories, fetchCategories, 
    branches, fetchBranches, user, createOrder,
    isLoadingProducts, productsError, isLoadingCategories, categoriesError,
    isLoadingBranches, branchesError, isLoadingOrders, ordersError
  } = useStore(state => ({
    products: state.products, fetchProducts: state.fetchProducts,
    categories: state.categories, fetchCategories: state.fetchCategories,
    branches: state.branches, fetchBranches: state.fetchBranches,
    user: state.user, createOrder: state.createOrder,
    isLoadingProducts: state.isLoadingProducts, productsError: state.productsError,
    isLoadingCategories: state.isLoadingCategories, categoriesError: state.categoriesError,
    isLoadingBranches: state.isLoadingBranches, branchesError: state.branchesError,
    isLoadingOrders: state.isLoadingOrders, ordersError: state.ordersError,
  }));

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentProductQuantity, setCurrentProductQuantity] = useState(1);
  const [currentProductNotes, setCurrentProductNotes] = useState('');
  const [currentProductSelectedAddOns, setCurrentProductSelectedAddOns] = useState({});

  const loadInitialData = useCallback(async () => {
    await fetchProducts();
    await fetchCategories();
    await fetchBranches();
  }, [fetchProducts, fetchCategories, fetchBranches]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setIsBranchSelectorOpen(true);
    }
  }, [branches, selectedBranch]);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setIsBranchSelectorOpen(false);
    setCart([]); 
    toast({
      title: "Sucursal Seleccionada",
      description: `Ahora estás viendo el menú de ${branch.name}.`,
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

    const existingCartItemIndex = cart.findIndex(item => item.id === currentProduct.id && JSON.stringify(item.selectedAddOns) === JSON.stringify(currentProductSelectedAddOns));
    
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
                    quantity_selected: 1, // Assuming 1 for each selected add-on type
                    ingredient_id: addon.ingredient_id,
                    ingredient_quantity_per_add_on: parseFloat(addon.add_on_quantity)
                });
            }
        });
    }

    if (existingCartItemIndex > -1) {
      const updatedCart = cart.map((item, index) => 
        index === existingCartItemIndex 
          ? { ...item, quantity: item.quantity + currentProductQuantity, notes: currentProductNotes || item.notes } 
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { 
        id: currentProduct.id, 
        productId: currentProduct.id,
        name: currentProduct.name, 
        price: finalPrice, // Use final price including add-ons
        originalPrice: parseFloat(currentProduct.price), // Store original product price
        quantity: currentProductQuantity, 
        notes: currentProductNotes,
        add_ons: selectedAddOnsDetails // Store structured add-on data
      }]);
    }
    toast({
      title: `${currentProduct.name} añadido al carrito`,
      description: `${currentProductQuantity} unidad(es) con ${selectedAddOnsDetails.length} agregado(s).`,
      className: "bg-green-500 text-white"
    });
    setIsProductDetailOpen(false);
  };


  const handleQuantityChange = (productId, amount) => {
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: Math.max(1, item.quantity + amount) } 
        : item
    ).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };
  
  const handleNotesChange = (productId, notes) => {
    setCart(cart.map(item => item.id === productId ? { ...item, notes } : item));
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
      toast({ title: "Carrito Vacío", description: "Añade productos a tu carrito antes de finalizar.", variant: "destructive" });
      return;
    }

    const orderData = {
      user_id: user?.id || null,
      customer_name: user?.name || "Cliente Web",
      branch_id: selectedBranch.id,
      status: 'Pendiente',
      total_amount: totalCartAmount,
      orderItems: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.originalPrice, // Use original product price for order_item unit_price
        notes: item.notes,
        add_ons: item.add_ons, // Pass structured add-on data
      })),
    };

    const result = await createOrder(orderData);
    if (result.success) {
      toast({
        title: "Pedido Realizado",
        description: "Tu pedido ha sido enviado exitosamente.",
        className: "bg-green-600 text-white"
      });
      setCart([]);
      setIsCartOpen(false);
    } else {
      toast({
        title: "Error al realizar pedido",
        description: result.error || "No se pudo completar el pedido.",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return product.active && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingBranches;
  const hasError = productsError || categoriesError || branchesError;

  if (isLoading && !products.length && !categories.length && !branches.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
        <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white p-4">
        <AlertTriangle className="h-16 w-16 text-yellow-300 mb-4" />
        <h2 className="text-3xl font-semibold mb-2">Error al Cargar Datos</h2>
        <p className="text-center text-red-200 mb-6">
          {productsError || categoriesError || branchesError || "No se pudieron cargar los datos necesarios. Por favor, intenta de nuevo más tarde."}
        </p>
        <Button onClick={loadInitialData} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          Reintentar
        </Button>
      </div>
    );
  }
  
  const currentProductAddOnsTotal = currentProduct ? calculateAddOnsTotal(currentProduct, currentProductSelectedAddOns) : 0;
  const currentProductFinalPrice = currentProduct ? (parseFloat(currentProduct.price) + currentProductAddOnsTotal) * currentProductQuantity : 0;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-gray-100">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md shadow-lg p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              Lomi-tero Menú
            </h1>
            <Button 
              variant="link" 
              onClick={() => setIsBranchSelectorOpen(true)} 
              className="text-sm text-purple-300 hover:text-purple-200 p-0 h-auto"
            >
              <MapPin className="mr-1 h-4 w-4" />
              {selectedBranch ? selectedBranch.name : "Seleccionar Sucursal"}
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-500"
              />
            </div>
            <Button 
              onClick={() => setIsCartOpen(true)} 
              className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md transition-transform transform hover:scale-105"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!selectedBranch && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-600/50 text-yellow-300 p-6 rounded-lg text-center mb-8 shadow-lg"
          >
            <Info className="h-10 w-10 mx-auto mb-3 text-yellow-400" />
            <p className="text-xl font-semibold mb-2">¡Bienvenido a Lomi-tero!</p>
            <p className="mb-4">Por favor, selecciona una sucursal para ver el menú y realizar tu pedido.</p>
            <Button onClick={() => setIsBranchSelectorOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              Seleccionar Sucursal
            </Button>
          </motion.div>
        )}

        {selectedBranch && (
          <>
            <CategoryTabs categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            
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
        )}
      </main>

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
      />

      <BranchSelectorDialog
        isOpen={isBranchSelectorOpen}
        onOpenChange={setIsBranchSelectorOpen}
        branches={branches}
        onSelectBranch={handleSelectBranch}
        isLoading={isLoadingBranches}
        error={branchesError}
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
                            id={`addon-${addon.id}`}
                            checked={!!currentProductSelectedAddOns[addon.id]}
                            onCheckedChange={(checked) => handleAddOnSelection(addon.id, checked)}
                            className="border-purple-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 mr-3"
                          />
                          <Label htmlFor={`addon-${addon.id}`} className="text-slate-200 cursor-pointer">
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
                <Label htmlFor="quantity" className="text-slate-300 mb-1 block">Cantidad:</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white" onClick={() => setCurrentProductQuantity(q => Math.max(1, q - 1))}>
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                  <Input id="quantity" type="number" value={currentProductQuantity} readOnly className="w-16 text-center bg-slate-700 border-slate-600 text-white focus:ring-0 focus:border-slate-600" />
                  <Button variant="outline" size="icon" className="h-9 w-9 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white" onClick={() => setCurrentProductQuantity(q => q + 1)}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-slate-300 mb-1 block">Notas Adicionales:</Label>
                <Textarea
                  id="notes"
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

export default MenuPage;
