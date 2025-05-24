
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit2, Trash2, Leaf, PackageOpen, ServerCrash, FileQuestion, Warehouse, MinusCircle, PlusCircle } from 'lucide-react';
import useStore from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialFormData = {
  name: '',
  unit: '',
  stockByBranch: {}, 
};

const IngredientsPage = () => {
  const { 
    ingredients, 
    fetchIngredients, 
    branches, 
    fetchBranches,
    isLoading,
    error
  } = useStore(state => ({
    ingredients: state.ingredients,
    fetchIngredients: state.fetchIngredients,
    branches: state.branches,
    fetchBranches: state.fetchBranches,
    isLoading: state.isLoading,
    error: state.error,
  }));

  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [stockToManage, setStockToManage] = useState(null);
  const [branchStockLevels, setBranchStockLevels] = useState({});

  const storeActions = useStore(state => ({
    addIngredient: state.addIngredient,
    updateIngredient: state.updateIngredient,
    deleteIngredient: state.deleteIngredient,
    updateStockForIngredient: state.updateStockForIngredient,
  }));

  useEffect(() => {
    fetchIngredients();
    fetchBranches();
  }, [fetchIngredients, fetchBranches]);

  useEffect(() => {
    if (currentIngredient) {
      const initialStock = {};
      branches.forEach(branch => {
        const stockInfo = currentIngredient.stock_by_branch?.find(s => s.branch_id === branch.id);
        initialStock[branch.id] = {
          current_stock: stockInfo?.current_stock || 0,
          min_stock: stockInfo?.min_stock || 0,
        };
      });
      setFormData({
        name: currentIngredient.name || '',
        unit: currentIngredient.unit || '',
        stockByBranch: initialStock,
      });
    } else {
      const initialStock = {};
      branches.forEach(branch => {
        initialStock[branch.id] = { current_stock: 0, min_stock: 0 };
      });
      setFormData({...initialFormData, stockByBranch: initialStock });
    }
  }, [currentIngredient, isFormOpen, branches]);

  useEffect(() => {
    if (stockToManage && ingredients.length > 0 && branches.length > 0) {
      const ingredientDetails = ingredients.find(ing => ing.id === stockToManage.id);
      const initialLevels = {};
      branches.forEach(branch => {
        const stockInfo = ingredientDetails?.stock_by_branch?.find(s => s.branch_id === branch.id);
        initialLevels[branch.id] = {
          current_stock: stockInfo?.current_stock || 0,
          min_stock: stockInfo?.min_stock || 0,
        };
      });
      setBranchStockLevels(initialLevels);
    }
  }, [stockToManage, ingredients, branches]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockInputChange = (branchId, field, value) => {
    setFormData(prev => ({
      ...prev,
      stockByBranch: {
        ...prev.stockByBranch,
        [branchId]: {
          ...prev.stockByBranch[branchId],
          [field]: parseFloat(value) || 0,
        },
      },
    }));
  };
  
  const handleBranchStockLevelChange = (branchId, field, value) => {
    setBranchStockLevels(prev => ({
      ...prev,
      [branchId]: {
        ...prev[branchId],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      toast({ title: "Campos incompletos", description: "Nombre y unidad son obligatorios.", variant: "destructive" });
      return;
    }
    
    try {
      let result;
      const dataToSubmit = {
        name: formData.name,
        unit: formData.unit,
        stockByBranch: formData.stockByBranch, 
      };

      if (currentIngredient) {
        result = await storeActions.updateIngredient(currentIngredient.id, dataToSubmit);
        if (result.success) {
          toast({ title: "Ingrediente Actualizado", description: `El ingrediente "${formData.name}" ha sido actualizado.`, className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
        }
      } else {
        result = await storeActions.addIngredient(dataToSubmit);
        if (result.success) {
          toast({ title: "Ingrediente Creado", description: `El ingrediente "${formData.name}" ha sido creado.`, className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
        }
      }

      if (result.error) {
        throw new Error(result.error);
      }
      setIsFormOpen(false);
      setCurrentIngredient(null);
    } catch (err) {
      toast({ title: "Error", description: err.message || "No se pudo guardar el ingrediente.", variant: "destructive" });
    }
  };

  const handleEdit = (ingredient) => {
    setCurrentIngredient(ingredient);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (ingredient) => {
    setIngredientToDelete(ingredient);
  };

  const handleDeleteConfirm = async () => {
    if (!ingredientToDelete) return;
    try {
      const result = await storeActions.deleteIngredient(ingredientToDelete.id);
      if (result.success) {
        toast({ title: "Ingrediente Eliminado", description: `El ingrediente "${ingredientToDelete.name}" ha sido eliminado.`, variant: "destructive" });
      } else {
        throw new Error(result.error);
      }
      setIngredientToDelete(null);
    } catch (err) {
      toast({ title: "Error al eliminar", description: err.message || "No se pudo eliminar el ingrediente.", variant: "destructive" });
      setIngredientToDelete(null);
    }
  };

  const openStockModal = (ingredient) => {
    setStockToManage(ingredient);
    setIsStockModalOpen(true);
  };

  const handleStockUpdate = async (branchId) => {
    if (!stockToManage || !branchStockLevels[branchId]) return;
    const { current_stock, min_stock } = branchStockLevels[branchId];
    
    const result = await storeActions.updateStockForIngredient(stockToManage.id, branchId, current_stock, min_stock);
    if (result.success) {
      toast({ title: "Stock Actualizado", description: `Stock para ${stockToManage.name} en sucursal actualizado.`, className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" });
    } else {
      toast({ title: "Error", description: result.error || "No se pudo actualizar el stock.", variant: "destructive" });
    }
  };
  
  const adjustStock = (branchId, field, amount) => {
    setBranchStockLevels(prev => {
      const currentVal = prev[branchId]?.[field] || 0;
      const newVal = Math.max(0, currentVal + amount); 
      return {
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [field]: newVal,
        },
      };
    });
  };


  const filteredIngredients = ingredients.filter(ingredient =>
    (ingredient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm"
    >
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 dark:from-lime-400 dark:via-green-500 dark:to-emerald-600">
            Gestión de Ingredientes
          </h1>
          <p className="text-slate-600 dark:text-muted-foreground mt-1">Controla los ingredientes y su stock en las sucursales.</p>
        </div>
        <Button
          size="lg"
          onClick={() => {
            setCurrentIngredient(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-150"
        >
          <Plus className="mr-2 h-5 w-5" />
          Añadir Ingrediente
        </Button>
      </header>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) setCurrentIngredient(null);
        setIsFormOpen(open);
      }}>
        <DialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-lg shadow-2xl sm:max-w-2xl p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-400">
                  {currentIngredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  {currentIngredient ? 'Actualiza los detalles de este ingrediente.' : 'Añade un nuevo ingrediente al inventario.'}
                </DialogDescription>
              </DialogHeader>
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="name" className="text-lime-600 dark:text-lime-300 font-semibold">Nombre del Ingrediente</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Tomate Fresco"
                    className="mt-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-lime-500 focus:border-lime-500 rounded-md"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-lime-600 dark:text-lime-300 font-semibold">Unidad de Medida</Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="Ej: kg, L, unidad"
                    className="mt-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-lime-500 focus:border-lime-500 rounded-md"
                    required
                  />
                </div>
                
                {branches.length > 0 && (
                  <div>
                    <Label className="text-lime-600 dark:text-lime-300 font-semibold mb-2 block">Stock Inicial por Sucursal (Opcional)</Label>
                    <ScrollArea className="h-40 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/30 p-3 space-y-3">
                      {branches.map(branch => (
                        <div key={branch.id} className="grid grid-cols-3 gap-2 items-center p-2 rounded bg-slate-200 dark:bg-slate-700">
                          <Label htmlFor={`stock-${branch.id}`} className="text-slate-700 dark:text-slate-300 col-span-1 truncate" title={branch.name}>{branch.name}</Label>
                          <Input
                            id={`stock-${branch.id}`}
                            type="number"
                            placeholder="Actual"
                            value={formData.stockByBranch[branch.id]?.current_stock || ''}
                            onChange={(e) => handleStockInputChange(branch.id, 'current_stock', e.target.value)}
                            className="bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-sm"
                          />
                          <Input
                            id={`min-stock-${branch.id}`}
                            type="number"
                            placeholder="Mínimo"
                            value={formData.stockByBranch[branch.id]?.min_stock || ''}
                            onChange={(e) => handleStockInputChange(branch.id, 'min_stock', e.target.value)}
                            className="bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-sm"
                          />
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                <DialogFooter className="pt-8 flex flex-col sm:flex-row gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto text-lime-600 dark:text-lime-300 border-lime-500 dark:border-lime-400 hover:bg-lime-500 dark:hover:bg-lime-400 hover:text-white dark:hover:text-black transition-colors">Cancelar</Button>
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white shadow-lg">
                    {currentIngredient ? 'Guardar Cambios' : 'Crear Ingrediente'}
                  </Button>
                </DialogFooter>
              </motion.form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-lg shadow-2xl sm:max-w-lg p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400">
                  Gestionar Stock: <span className="text-slate-800 dark:text-white">{stockToManage?.name}</span>
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  Actualiza el stock actual y mínimo para este ingrediente en cada sucursal.
                </DialogDescription>
              </DialogHeader>
              {stockToManage && branches.length > 0 ? (
                <div className="space-y-4">
                  {branches.map(branch => (
                    <Card key={branch.id} className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="text-lg font-semibold text-sky-600 dark:text-sky-300 mb-3">{branch.name}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`current_stock_${branch.id}`} className="text-slate-500 dark:text-slate-400">Stock Actual ({stockToManage.unit})</Label>
                          <div className="flex items-center mt-1">
                            <Button size="icon" variant="ghost" onClick={() => adjustStock(branch.id, 'current_stock', -1)} className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 h-8 w-8"><MinusCircle size={18}/></Button>
                            <Input
                              id={`current_stock_${branch.id}`}
                              type="number"
                              value={branchStockLevels[branch.id]?.current_stock || 0}
                              onChange={(e) => handleBranchStockLevelChange(branch.id, 'current_stock', e.target.value)}
                              className="mx-2 w-20 text-center bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                            />
                            <Button size="icon" variant="ghost" onClick={() => adjustStock(branch.id, 'current_stock', 1)} className="text-green-500 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 h-8 w-8"><PlusCircle size={18}/></Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`min_stock_${branch.id}`} className="text-slate-500 dark:text-slate-400">Stock Mínimo ({stockToManage.unit})</Label>
                           <div className="flex items-center mt-1">
                            <Button size="icon" variant="ghost" onClick={() => adjustStock(branch.id, 'min_stock', -1)} className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 h-8 w-8"><MinusCircle size={18}/></Button>
                            <Input
                              id={`min_stock_${branch.id}`}
                              type="number"
                              value={branchStockLevels[branch.id]?.min_stock || 0}
                              onChange={(e) => handleBranchStockLevelChange(branch.id, 'min_stock', e.target.value)}
                              className="mx-2 w-20 text-center bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                            />
                            <Button size="icon" variant="ghost" onClick={() => adjustStock(branch.id, 'min_stock', 1)} className="text-green-500 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 h-8 w-8"><PlusCircle size={18}/></Button>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleStockUpdate(branch.id)} size="sm" className="mt-3 w-full bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white">Actualizar Stock en {branch.name}</Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-500">No hay sucursales o ingrediente no seleccionado.</p>
              )}
              <DialogFooter className="pt-8">
                <Button variant="outline" onClick={() => setIsStockModalOpen(false)} className="w-full text-sky-600 dark:text-sky-300 border-sky-500 dark:border-sky-400 hover:bg-sky-500 dark:hover:bg-sky-400 hover:text-white dark:hover:text-black">Cerrar</Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-muted-foreground" />
        <Input
          placeholder="Buscar ingredientes por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 py-2 border-2 border-slate-300 dark:border-input focus:border-lime-500 dark:focus:border-primary transition-colors rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-lime-500 dark:border-lime-500 border-t-transparent rounded-full" />
        </div>
      )}
      {error && !isLoading && (
        <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-md">
          <ServerCrash className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error al cargar ingredientes</h3>
          <p className="text-red-600 dark:text-red-400">{typeof error === 'string' ? error : error?.message || "Error desconocido"}</p>
          <Button onClick={() => { fetchIngredients(); fetchBranches(); }} className="mt-4 bg-red-500 hover:bg-red-600 text-white">Reintentar</Button>
        </div>
      )}
      {!isLoading && !error && filteredIngredients.length === 0 && (
        <div className="text-center py-10 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 rounded-lg shadow-md">
          <FileQuestion className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300 mb-2">No se encontraron ingredientes</h3>
          <p className="text-yellow-600 dark:text-yellow-400">{searchTerm ? "Intenta con otro término de búsqueda." : "Añade un nuevo ingrediente para empezar."}</p>
        </div>
      )}

      {!isLoading && !error && filteredIngredients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIngredients.map((ingredient) => (
            <motion.div
              key={ingredient.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-gray-800 border-slate-200 dark:border-slate-700 overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100 dark:bg-slate-700/50 p-4">
                  <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-500 dark:from-lime-300 dark:to-green-400 flex items-center">
                    <Leaf className="mr-2 h-6 w-6 text-lime-500 dark:text-lime-400" />
                    {ingredient.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(ingredient)} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-lime-600 dark:hover:text-lime-300 hover:bg-lime-100 dark:hover:bg-lime-500/20">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(ingredient)} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Unidad: <span className="font-medium text-slate-700 dark:text-slate-300">{ingredient.unit}</span></p>
                  <div className="space-y-2 pt-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center"><Warehouse className="mr-2 h-4 w-4 text-sky-500 dark:text-sky-400"/>Stock por Sucursal:</h4>
                    {branches.length > 0 ? (
                      <ScrollArea className="h-28 pr-2">
                        <ul className="space-y-1 text-xs">
                          {branches.map(branch => {
                            const stockInfo = ingredient.stock_by_branch?.find(s => s.branch_id === branch.id);
                            const currentStock = stockInfo?.current_stock || 0;
                            const minStock = stockInfo?.min_stock || 0;
                            const stockStatusColor = currentStock <= minStock ? (currentStock === 0 ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400') : 'text-green-500 dark:text-green-400';
                            return (
                              <li key={branch.id} className="flex justify-between items-center p-1.5 rounded bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-slate-500 dark:text-slate-400 truncate" title={branch.name}>{branch.name}:</span>
                                <span className={`font-semibold ${stockStatusColor}`}>
                                  {currentStock} / {minStock} {ingredient.unit}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">No hay sucursales configuradas.</p>
                    )}
                  </div>
                  <Button onClick={() => openStockModal(ingredient)} className="w-full mt-2 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs py-1.5">
                    <PackageOpen className="mr-2 h-4 w-4" /> Gestionar Stock
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog open={!!ingredientToDelete} onOpenChange={() => setIngredientToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white border-slate-300 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-yellow-600 dark:text-yellow-400">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción eliminará permanentemente el ingrediente <span className="font-semibold text-yellow-700 dark:text-yellow-500">{ingredientToDelete?.name}</span>. Esto también afectará el stock asociado y los productos que lo utilicen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white">Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default IngredientsPage;
