
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Package, Leaf, Box, Loader2, RefreshCw } from 'lucide-react';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

import StockPageHeader from '@/pages/admin/components/stock/StockPageHeader';
import StockFilters from '@/pages/admin/components/stock/StockFilters';
import StockTable from '@/pages/admin/components/stock/StockTable';
import UpdateStockDialog from '@/pages/admin/components/stock/UpdateStockDialog';

const StockPage = () => {
  const { toast } = useToast();
  const { 
    ingredients, fetchIngredients, products, fetchProducts, branches, fetchBranches, 
    ingredientStock, productDirectStock, fetchStockByBranch, isLoadingStock, stockError,
    updateIngredientStockEntry, updateProductDirectStockEntry,
  } = useStore(state => ({
    ingredients: state.ingredients, fetchIngredients: state.fetchIngredients,
    products: state.products, fetchProducts: state.fetchProducts,
    branches: state.branches, fetchBranches: state.fetchBranches,
    ingredientStock: state.ingredientStock, productDirectStock: state.productDirectStock,
    fetchStockByBranch: state.fetchStockByBranch, isLoadingStock: state.isLoadingStock,
    stockError: state.stockError,
    updateIngredientStockEntry: state.updateIngredientStockEntry,
    updateProductDirectStockEntry: state.updateProductDirectStockEntry,
  }));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isBaseDataLoading, setIsBaseDataLoading] = useState(true);
  const [hasAttemptedStockFetch, setHasAttemptedStockFetch] = useState(false);

  const loadBaseData = useCallback(async (selectDefaultBranch = true) => {
    setIsBaseDataLoading(true);
    setHasAttemptedStockFetch(false); 
    useStore.setState({ ingredientStock: [], productDirectStock: [], stockError: null });
    try {
      const branchesRes = await fetchBranches();
      await Promise.all([
        fetchIngredients(),
        fetchProducts(),
      ]);
      
      if (selectDefaultBranch) {
        if (branchesRes.success && branchesRes.data && branchesRes.data.length > 0) {
          if (!selectedBranch || !branchesRes.data.find(b => b.id === selectedBranch.id)) {
            setSelectedBranch(branchesRes.data[0]);
          }
        } else if (branchesRes.success && branchesRes.data && branchesRes.data.length === 0) {
          setSelectedBranch(null);
        }
      }
    } catch (error) {
      console.error("Error loading base data for stock page:", error);
      toast({ title: "Error", description: "No se pudieron cargar los datos base para el stock.", variant: "destructive" });
    } finally {
      setIsBaseDataLoading(false);
    }
  }, [fetchIngredients, fetchProducts, fetchBranches, toast, selectedBranch]);

  useEffect(() => {
    loadBaseData();
  }, []); 

  useEffect(() => {
    if (selectedBranch && !isBaseDataLoading) {
      setHasAttemptedStockFetch(true);
      fetchStockByBranch(selectedBranch.id);
    } else if (!selectedBranch && !isBaseDataLoading) {
      useStore.setState({ ingredientStock: [], productDirectStock: [], isLoadingStock: false, stockError: null });
      setHasAttemptedStockFetch(false);
    }
  }, [selectedBranch, isBaseDataLoading, fetchStockByBranch]);


  const handleOpenUpdateDialog = (item, itemType) => {
    setSelectedStockItem({...item, itemType });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateStockSubmit = async ({ current_stock, min_stock }) => {
    if (!selectedStockItem || !selectedBranch) {
      toast({ title: "Error", description: "Item o sucursal no seleccionada.", variant: "destructive" });
      return;
    }
    
    let result;
    if (selectedStockItem.itemType === 'ingredient') {
      result = await updateIngredientStockEntry(
        selectedStockItem.stock_entry_id, selectedStockItem.id, selectedBranch.id, 
        current_stock, min_stock
      );
    } else if (selectedStockItem.itemType === 'product_direct') {
       result = await updateProductDirectStockEntry(
        selectedStockItem.stock_entry_id, selectedStockItem.id, selectedBranch.id,
        current_stock, min_stock
      );
    } else {
      toast({ title: "Error", description: "Tipo de item desconocido para actualización de stock.", variant: "destructive" });
      return;
    }

    if (result && result.success) {
      toast({ title: "Stock Actualizado", description: `El stock para ${selectedStockItem.name} en ${selectedBranch.name} ha sido actualizado.`, className: "bg-green-500 text-white" });
      setIsUpdateDialogOpen(false);
      setSelectedStockItem(null);
    } else {
      toast({ title: "Error", description: (result && result.error) || "No se pudo actualizar el stock.", variant: "destructive" });
    }
  };

  const combinedStockView = useMemo(() => {
    if (!selectedBranch || isBaseDataLoading || (!isLoadingStock && !hasAttemptedStockFetch && (ingredientStock.length === 0 && productDirectStock.length === 0))) {
      return [];
    }
    
    const branchIngredients = ingredientStock && ingredientStock.length > 0 ? ingredientStock
      .filter(s => s.branch_id === selectedBranch.id && s.ingredients)
      .map(s => ({
        id: s.ingredients.id, name: s.ingredients.name, unit: s.ingredients.unit,
        current_stock: s.current_stock, min_stock: s.min_stock,
        type: 'Ingrediente', itemType: 'ingredient', icon: Leaf, stock_entry_id: s.id
      })) : [];

    const branchProductsDirect = productDirectStock && productDirectStock.length > 0 ? productDirectStock
      .filter(ps => ps.branch_id === selectedBranch.id && ps.products && ps.products.stock_control_type === 'direct')
      .map(ps => ({
        id: ps.products.id, name: ps.products.name, unit: 'unidad', 
        current_stock: ps.current_stock, min_stock: ps.min_stock,
        type: 'Producto (Directo)', itemType: 'product_direct', icon: Box, stock_entry_id: ps.id
      })) : [];
    
    const productsWithCalculatedStock = products
      .filter(p => p.stock_control_type === 'ingredients')
      .map(p => {
        let calculable = true;
        let canMake = Infinity;

        if (p.product_ingredients && p.product_ingredients.length > 0) {
          p.product_ingredients.forEach(pi => {
            const ingStockEntry = ingredientStock.find(is => is.ingredient_id === pi.ingredient_id && is.branch_id === selectedBranch.id);
            if (!ingStockEntry || typeof ingStockEntry.current_stock !== 'number') {
              calculable = false; canMake = 0; return;
            }
            if (pi.quantity === 0) { 
              canMake = Infinity; 
            } else {
              canMake = Math.min(canMake, Math.floor(ingStockEntry.current_stock / pi.quantity));
            }
          });
        } else { 
          calculable = false; canMake = 0;
        }
        
        return {
          id: p.id, name: p.name, unit: 'unidad',
          current_stock: calculable ? (isFinite(canMake) ? canMake : 0) : 'N/A', 
          min_stock: 'N/A',
          type: 'Producto (Calculado)', itemType: 'product_calculated', icon: Package,
          isCalculated: true, stock_entry_id: `calc-${p.id}`,
        };
      });

    return [...branchIngredients, ...branchProductsDirect, ...productsWithCalculatedStock].sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredientStock, productDirectStock, products, selectedBranch, isBaseDataLoading, isLoadingStock, hasAttemptedStockFetch]);


  const filteredItems = useMemo(() => {
    if (!combinedStockView) return [];
    return combinedStockView.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinedStockView, searchTerm]);

  const isLoadingPage = isBaseDataLoading; 
  const isLoadingBranchStock = isLoadingStock && hasAttemptedStockFetch;

  const handleSelectBranch = (branch) => {
    if (branch?.id !== selectedBranch?.id) {
      setSelectedBranch(branch);
      setHasAttemptedStockFetch(false); 
    }
  };
  
  const refreshData = useCallback(() => {
    loadBaseData(false).then(() => {
      if(selectedBranch?.id) {
        setHasAttemptedStockFetch(true);
        fetchStockByBranch(selectedBranch.id);
      }
    });
  }, [selectedBranch, loadBaseData, fetchStockByBranch]);

  if (isLoadingPage && !branches.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Cargando datos base...</h2>
      </div>
    );
  }

  if (!branches.length && !isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <Store className="w-24 h-24 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">No hay Sucursales Creadas</h2>
        <p className="text-muted-foreground mb-6">
          Para gestionar el stock, primero necesitas agregar al menos una sucursal.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <StockPageHeader onRefresh={refreshData} isLoading={isLoadingPage || isLoadingBranchStock} selectedBranch={selectedBranch} />
      <StockFilters 
        searchTerm={searchTerm} 
        onSearchTermChange={setSearchTerm}
        selectedBranch={selectedBranch}
        branches={branches}
        onSelectBranch={handleSelectBranch}
        disabled={isLoadingPage || !branches.length}
      />

      <Card className="shadow-xl border-border bg-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center text-xl text-foreground">
            <Package className="mr-3 h-6 w-6 text-primary" />
            Inventario {selectedBranch ? `- ${selectedBranch.name}`: ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <StockTable 
             items={filteredItems}
             onUpdateStock={handleOpenUpdateDialog}
             isLoading={isLoadingBranchStock}
             stockError={stockError}
             selectedBranch={selectedBranch}
             searchTerm={searchTerm}
             onRefresh={refreshData}
             hasAttemptedStockFetch={hasAttemptedStockFetch}
           />
        </CardContent>
      </Card>

      {selectedStockItem && selectedBranch && (
        <UpdateStockDialog
          isOpen={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          item={selectedStockItem}
          branchName={selectedBranch.name}
          onSubmit={handleUpdateStockSubmit}
          isLoading={isLoadingStock} 
          itemType={selectedStockItem.itemType}
        />
      )}
    </motion.div>
  );
};

export default StockPage;
