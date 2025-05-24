
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PackagePlus, Package, Leaf, DollarSign, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

const AddOnForm = ({ isOpen, onOpenChange, onSubmit, initialData, products, ingredientsList, isLoading }) => {
  const [productId, setProductId] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [name, setName] = useState('');
  const [addOnPrice, setAddOnPrice] = useState('');
  const [addOnQuantity, setAddOnQuantity] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProductId(initialData.product_id || '');
        setIngredientId(initialData.ingredient_id || '');
        setName(initialData.name || '');
        setAddOnPrice(initialData.add_on_price?.toString() || '');
        setAddOnQuantity(initialData.add_on_quantity?.toString() || '');
      } else {
        setProductId('');
        setIngredientId('');
        setName('');
        setAddOnPrice('');
        setAddOnQuantity('');
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !ingredientId || !name || !addOnPrice || !addOnQuantity) {
      console.error("Faltan campos requeridos.");
      return;
    }
    onSubmit({
      product_id: productId,
      ingredient_id: ingredientId,
      name,
      add_on_price: parseFloat(addOnPrice),
      add_on_quantity: parseFloat(addOnQuantity),
    });
  };

  if (!isOpen) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputGroupClass = "grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4";
  const labelClass = "text-sm font-medium text-slate-300 sm:text-right";
  const inputContainerClass = "sm:col-span-3";
  const inputClass = "w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 rounded-md shadow-sm";
  const selectTriggerClass = `${inputClass} flex items-center justify-between`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-800 via-slate-900 to-black text-white border-slate-700 rounded-lg shadow-2xl sm:max-w-xl p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 flex items-center">
                <PackagePlus className="h-8 w-8 mr-3 text-orange-400" />
                {initialData ? 'Editar Agregado' : 'Nuevo Agregado'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {initialData ? 'Actualiza los detalles del agregado.' : 'Define un nuevo agregado para un producto.'}
              </DialogDescription>
            </DialogHeader>

            <motion.form onSubmit={handleSubmit} className="space-y-6" variants={cardVariants} initial="hidden" animate="visible">
              <div className={inputGroupClass}>
                <Label htmlFor="product_id" className={labelClass}><Package className="inline h-4 w-4 mr-1"/>Producto</Label>
                <div className={inputContainerClass}>
                  <Select value={productId} onValueChange={setProductId} required>
                    <SelectTrigger className={selectTriggerClass} id="product_id">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id} className="hover:bg-slate-700 focus:bg-slate-700">
                          {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="ingredient_id" className={labelClass}><Leaf className="inline h-4 w-4 mr-1"/>Ingrediente Base</Label>
                <div className={inputContainerClass}>
                  <Select value={ingredientId} onValueChange={setIngredientId} required>
                    <SelectTrigger className={selectTriggerClass} id="ingredient_id">
                      <SelectValue placeholder="Seleccionar ingrediente base" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {ingredientsList.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id} className="hover:bg-slate-700 focus:bg-slate-700">
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="name" className={labelClass}><PackagePlus className="inline h-4 w-4 mr-1"/>Nombre del Agregado</Label>
                <div className={inputContainerClass}>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Extra Queso Cheddar" required className={inputClass} />
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="add_on_price" className={labelClass}><DollarSign className="inline h-4 w-4 mr-1"/>Precio Extra</Label>
                <div className={inputContainerClass}>
                  <Input id="add_on_price" type="number" value={addOnPrice} onChange={(e) => setAddOnPrice(e.target.value)} placeholder="Ej: 5000" required className={inputClass} min="0" step="1"/>
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="add_on_quantity" className={labelClass}><Scale className="inline h-4 w-4 mr-1"/>Cantidad del Ingrediente</Label>
                <div className={inputContainerClass}>
                  <Input id="add_on_quantity" type="number" value={addOnQuantity} onChange={(e) => setAddOnQuantity(e.target.value)} placeholder="Ej: 30 (gramos, unidades, etc.)" required className={inputClass} min="0.01" step="0.01"/>
                  <p className="text-xs text-slate-400 mt-1">La cantidad del ingrediente base que este agregado representa (ej. 30 para 30gr de queso).</p>
                </div>
              </div>

              <DialogFooter className="pt-8 flex flex-col sm:flex-row gap-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-orange-300 border-orange-400 hover:bg-orange-400 hover:text-black transition-colors">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg" disabled={isLoading}>
                  {isLoading ? (initialData ? 'Guardando...' : 'Creando...') : (initialData ? 'Guardar Cambios' : 'Crear Agregado')}
                </Button>
              </DialogFooter>
            </motion.form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddOnForm;
