
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit2, Trash2, Search, PackagePlus, AlertTriangle, Info, UtensilsCrossed } from 'lucide-react';
import useStore, { formatGuaranies } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialAddOnFormData = {
  product_id: '',
  ingredient_id: '',
  name: '',
  add_on_price: '',
  add_on_quantity: '',
};

const AddOnsPage = () => {
  const { 
    productAddOns, fetchProductAddOns, isLoadingAddOns, addOnsError,
    addAddOn, updateAddOn, deleteAddOn,
    products, fetchProducts, 
    ingredients, fetchIngredients 
  } = useStore(state => ({
    productAddOns: state.productAddOns,
    fetchProductAddOns: state.fetchProductAddOns,
    isLoadingAddOns: state.isLoadingAddOns,
    addOnsError: state.addOnsError,
    addAddOn: state.addAddOn,
    updateAddOn: state.updateAddOn,
    deleteAddOn: state.deleteAddOn,
    products: state.products,
    fetchProducts: state.fetchProducts,
    ingredients: state.ingredients,
    fetchIngredients: state.fetchIngredients,
  }));

  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAddOn, setCurrentAddOn] = useState(null);
  const [formData, setFormData] = useState(initialAddOnFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [addOnToDelete, setAddOnToDelete] = useState(null);

  useEffect(() => {
    fetchProductAddOns();
    if (!products || products.length === 0) fetchProducts();
    if (!ingredients || ingredients.length === 0) fetchIngredients();
  }, [fetchProductAddOns, fetchProducts, fetchIngredients, products, ingredients]);

  useEffect(() => {
    if (currentAddOn) {
      setFormData({
        product_id: currentAddOn.product_id || '',
        ingredient_id: currentAddOn.ingredient_id || '',
        name: currentAddOn.name || '',
        add_on_price: currentAddOn.add_on_price?.toString() || '',
        add_on_quantity: currentAddOn.add_on_quantity?.toString() || '',
      });
    } else {
      setFormData(initialAddOnFormData);
    }
  }, [currentAddOn, isFormOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'ingredient_id' && !currentAddOn && !formData.name) {
      const selectedIngredient = ingredients.find(ing => ing.id === value);
      if (selectedIngredient) {
        setFormData(prev => ({ ...prev, name: `Extra ${selectedIngredient.name}` }));
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.ingredient_id || !formData.name || !formData.add_on_price || !formData.add_on_quantity) {
      toast({ title: "Campos incompletos", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    }
    const price = parseFloat(formData.add_on_price);
    const quantity = parseFloat(formData.add_on_quantity);

    if (isNaN(price) || price < 0 || isNaN(quantity) || quantity <= 0) {
      toast({ title: "Valores inválidos", description: "Precio y cantidad deben ser números válidos (cantidad > 0).", variant: "destructive" });
      return;
    }

    const dataToSubmit = {
      ...formData,
      add_on_price: price,
      add_on_quantity: quantity,
    };

    try {
      let result;
      if (currentAddOn) {
        result = await updateAddOn(currentAddOn.id, dataToSubmit);
      } else {
        result = await addAddOn(dataToSubmit);
      }

      if (result.success) {
        toast({ title: currentAddOn ? "Agregado Actualizado" : "Agregado Creado", description: `El agregado "${dataToSubmit.name}" ha sido ${currentAddOn ? 'actualizado' : 'creado'}.`, className: "bg-green-500 text-white" });
        setIsFormOpen(false);
        setCurrentAddOn(null);
      } else {
        throw new Error(result.error || "Error desconocido al guardar el agregado.");
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (addOn) => {
    setCurrentAddOn(addOn);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (addOn) => {
    setAddOnToDelete(addOn);
  };

  const handleDeleteConfirm = async () => {
    if (!addOnToDelete) return;
    try {
      const result = await deleteAddOn(addOnToDelete.id);
      if (result.success) {
        toast({ title: "Agregado Eliminado", description: `El agregado "${addOnToDelete.name}" ha sido eliminado.`, variant: "destructive" });
      } else {
        throw new Error(result.error || "No se pudo eliminar el agregado.");
      }
      setAddOnToDelete(null);
    } catch (err) {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
      setAddOnToDelete(null);
    }
  };

  const filteredAddOns = useMemo(() => {
    return productAddOns.filter(addOn =>
      (addOn.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (addOn.products?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (addOn.ingredients?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [productAddOns, searchTerm]);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600">
            Gestión de Agregados
          </h1>
          <p className="text-muted-foreground mt-1">Define ingredientes extra para tus productos.</p>
        </div>
        <Button
          size="lg"
          onClick={() => { setCurrentAddOn(null); setIsFormOpen(true); }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-150"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Agregado
        </Button>
      </header>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) setCurrentAddOn(null); setIsFormOpen(open); }}>
        <DialogContent className="bg-gradient-to-br from-gray-800 via-slate-900 to-black text-white border-slate-700 rounded-lg shadow-2xl sm:max-w-lg p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
                  {currentAddOn ? 'Editar Agregado' : 'Nuevo Agregado'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {currentAddOn ? 'Actualiza los detalles de este agregado.' : 'Define un nuevo agregado para un producto.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="product_id" className="text-amber-300 font-semibold">Producto</Label>
                  <Select name="product_id" value={formData.product_id} onValueChange={(value) => handleSelectChange('product_id', value)}>
                    <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 rounded-md">
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                      {safeProducts.map(product => (
                        <SelectItem key={product.id} value={product.id} className="hover:bg-slate-700 focus:bg-slate-700">{product.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ingredient_id" className="text-amber-300 font-semibold">Ingrediente Base</Label>
                  <Select name="ingredient_id" value={formData.ingredient_id} onValueChange={(value) => handleSelectChange('ingredient_id', value)}>
                    <SelectTrigger className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 rounded-md">
                      <SelectValue placeholder="Selecciona un ingrediente" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                      {safeIngredients.map(ingredient => (
                        <SelectItem key={ingredient.id} value={ingredient.id} className="hover:bg-slate-700 focus:bg-slate-700">{ingredient.name} ({ingredient.unit})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name" className="text-amber-300 font-semibold">Nombre del Agregado</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ej: Extra Queso Cheddar" className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 rounded-md" required />
                </div>
                <div>
                  <Label htmlFor="add_on_price" className="text-amber-300 font-semibold">Precio Adicional (Gs.)</Label>
                  <Input id="add_on_price" name="add_on_price" type="number" value={formData.add_on_price} onChange={handleInputChange} placeholder="Ej: 5000" className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 rounded-md" required />
                </div>
                <div>
                  <Label htmlFor="add_on_quantity" className="text-amber-300 font-semibold">Cantidad del Ingrediente a Usar</Label>
                  <Input id="add_on_quantity" name="add_on_quantity" type="number" step="0.01" value={formData.add_on_quantity} onChange={handleInputChange} placeholder="Ej: 0.05 (para 50gr si unidad es kg)" className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 rounded-md" required />
                  {formData.ingredient_id && <p className="text-xs text-slate-400 mt-1">Unidad base: {safeIngredients.find(i => i.id === formData.ingredient_id)?.unit}</p>}
                </div>
                <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="w-full sm:w-auto text-amber-300 border-amber-400 hover:bg-amber-400 hover:text-black transition-colors">Cancelar</Button>
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                    {currentAddOn ? 'Guardar Cambios' : 'Crear Agregado'}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar agregados por nombre, producto o ingrediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg pl-10 py-2 border-2 border-input focus:border-primary transition-colors rounded-lg shadow-sm"
        />
      </div>

      {isLoadingAddOns && (
        <div className="flex justify-center items-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      )}
      {addOnsError && !isLoadingAddOns && (
        <Card className="bg-red-900/30 border-red-700 text-red-300 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error al Cargar Agregados</h3>
          <p>{typeof addOnsError === 'string' ? addOnsError : addOnsError.message || "Error desconocido."}</p>
          <Button onClick={() => fetchProductAddOns()} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Reintentar</Button>
        </Card>
      )}
      {!isLoadingAddOns && !addOnsError && filteredAddOns.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700 text-slate-400 p-10 text-center">
          <Info className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No se Encontraron Agregados</h3>
          <p>{searchTerm ? "Intenta con otro término de búsqueda." : "Aún no has definido ningún agregado. ¡Crea uno para empezar!"}</p>
        </Card>
      )}

      {!isLoadingAddOns && !addOnsError && filteredAddOns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAddOns.map((addOn) => (
            <motion.div
              key={addOn.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-slate-800 to-gray-800 border-slate-700 overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-700/50 p-4">
                  <CardTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 flex items-center">
                    <PackagePlus className="mr-2 h-5 w-5 text-amber-400" />
                    {addOn.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(addOn)} className="h-8 w-8 text-slate-400 hover:text-amber-300 hover:bg-amber-500/20">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(addOn)} className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-sm">
                  <p className="text-slate-400">Producto: <span className="font-medium text-slate-300">{addOn.products?.name || 'N/A'}</span></p>
                  <p className="text-slate-400">Ingrediente Base: <span className="font-medium text-slate-300">{addOn.ingredients?.name || 'N/A'} ({addOn.ingredients?.unit || ''})</span></p>
                  <p className="text-slate-400">Precio Adicional: <span className="font-medium text-green-400">{formatGuaranies(addOn.add_on_price)}</span></p>
                  <p className="text-slate-400">Cantidad Usada: <span className="font-medium text-slate-300">{addOn.add_on_quantity} {addOn.ingredients?.unit || ''}</span></p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog open={!!addOnToDelete} onOpenChange={() => setAddOnToDelete(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-800 via-slate-900 to-black text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-yellow-400">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción eliminará permanentemente el agregado <span className="font-semibold text-yellow-500">{addOnToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AddOnsPage;
