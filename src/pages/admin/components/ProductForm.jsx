
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Package, DollarSign, Info, ListChecks, Image as ImageIcon, BarChartBig, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductFormIngredients from './ProductFormIngredients';
import ProductFormAddOns from './ProductFormAddOns';

const ProductForm = ({ isOpen, onOpenChange, onSubmit, initialData, categories, ingredientsList, isLoading }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [productIngredients, setProductIngredients] = useState([]);
  const [productAddOns, setProductAddOns] = useState([]);
  const [stockControlType, setStockControlType] = useState('ingredients');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setPrice(initialData.price?.toString() || '');
        setDescription(initialData.description || '');
        setCategoryId(initialData.category_id || '');
        setActive(initialData.active !== undefined ? initialData.active : true);
        setImageUrl(initialData.image_url || '');
        setProductIngredients(initialData.ingredients?.map(ing => ({ 
          id: ing.id || ing.ingredient_id, 
          quantity: ing.quantity?.toString() || '1' 
        })) || []);
        setProductAddOns(initialData.add_ons?.map(addon => ({
          id: addon.id || `temp_${Date.now()}_${Math.random()}`,
          name: addon.name || '',
          ingredient_id: addon.ingredient_id || '',
          add_on_price: addon.add_on_price?.toString() || '0',
          add_on_quantity: addon.add_on_quantity?.toString() || '1',
        })) || []);
        setStockControlType(initialData.stock_control_type || 'ingredients');
      } else {
        setName('');
        setPrice('');
        setDescription('');
        setCategoryId('');
        setActive(true);
        setImageUrl('');
        setProductIngredients([]);
        setProductAddOns([]);
        setStockControlType('ingredients');
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !categoryId ) {
      console.error("ProductForm Error: Faltan campos requeridos (nombre, precio, categoría).");
      return;
    }
    if (stockControlType === 'ingredients' && productIngredients.some(ing => !ing.id || !ing.quantity || parseFloat(ing.quantity) <= 0)) {
       console.error("ProductForm Error: Datos de ingredientes base inválidos (ID o cantidad faltante/inválida).");
       return;
    }
    if (productAddOns.some(addon => !addon.name || !addon.ingredient_id || !addon.add_on_price || parseFloat(addon.add_on_price) < 0 || !addon.add_on_quantity || parseFloat(addon.add_on_quantity) <= 0)) {
      console.error("ProductForm Error: Datos de agregados inválidos (nombre, ID ingrediente, precio o cantidad faltante/inválida).");
      return;
    }

    const payload = {
      name,
      price: parseFloat(price),
      description,
      category_id: categoryId,
      active,
      image_url: imageUrl,
      stock_control_type: stockControlType,
      ingredients: stockControlType === 'ingredients' ? productIngredients.map(ing => ({
        id: ing.id,
        quantity: parseFloat(ing.quantity)
      })) : [],
      add_ons: productAddOns.map(addon => ({
        ingredient_id: addon.ingredient_id,
        name: addon.name,
        add_on_price: parseFloat(addon.add_on_price),
        add_on_quantity: parseFloat(addon.add_on_quantity),
      })).filter(addon => addon.name && addon.ingredient_id && addon.add_on_price >= 0 && addon.add_on_quantity > 0),
    };
    console.log("ProductForm handleSubmit payload:", JSON.stringify(payload, null, 2));
    onSubmit(payload);
  };

  if (!isOpen) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputGroupClass = "grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4";
  const labelClass = "text-sm font-medium text-slate-300 sm:text-right";
  const inputContainerClass = "sm:col-span-3";
  const inputClass = "w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm";
  const selectTriggerClass = `${inputClass} flex items-center justify-between`;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-800 via-slate-900 to-black text-white border-slate-700 rounded-lg shadow-2xl sm:max-w-3xl p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex items-center">
                <Package className="h-8 w-8 mr-3 text-indigo-400" />
                {initialData ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {initialData ? 'Actualiza los detalles del producto.' : 'Completa la información para crear un nuevo producto.'}
              </DialogDescription>
            </DialogHeader>

            <motion.form onSubmit={handleSubmit} className="space-y-6" variants={cardVariants} initial="hidden" animate="visible">
              <div className={inputGroupClass}>
                <Label htmlFor="name" className={labelClass}><Info className="inline h-4 w-4 mr-1"/>Nombre</Label>
                <div className={inputContainerClass}>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Hamburguesa Clásica" required className={inputClass} />
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="price" className={labelClass}><DollarSign className="inline h-4 w-4 mr-1"/>Precio</Label>
                <div className={inputContainerClass}>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: 15.99" required className={inputClass} min="0" step="0.01"/>
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="description" className={labelClass}><Info className="inline h-4 w-4 mr-1"/>Descripción</Label>
                <div className={inputContainerClass}>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del producto..." className={`${inputClass} min-h-[80px]`} />
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="categoryId" className={labelClass}><ListChecks className="inline h-4 w-4 mr-1"/>Categoría</Label>
                <div className={inputContainerClass}>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger className={selectTriggerClass} id="categoryId">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="hover:bg-slate-700 focus:bg-slate-700">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className={inputGroupClass}>
                <Label htmlFor="imageUrl" className={labelClass}><ImageIcon className="inline h-4 w-4 mr-1"/>URL de Imagen</Label>
                <div className={inputContainerClass}>
                  <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" className={inputClass} />
                </div>
              </div>

              <div className={inputGroupClass}>
                <Label htmlFor="stockControlType" className={labelClass}><BarChartBig className="inline h-4 w-4 mr-1"/>Control de Stock</Label>
                <div className={inputContainerClass}>
                  <Select value={stockControlType} onValueChange={setStockControlType}>
                    <SelectTrigger className={selectTriggerClass} id="stockControlType">
                      <SelectValue placeholder="Tipo de control de stock" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="ingredients" className="hover:bg-slate-700 focus:bg-slate-700">Basado en Ingredientes</SelectItem>
                      <SelectItem value="direct" className="hover:bg-slate-700 focus:bg-slate-700">Stock Directo por Sucursal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {stockControlType === 'ingredients' && (
                <ProductFormIngredients 
                  productIngredients={productIngredients}
                  setProductIngredients={setProductIngredients}
                  ingredientsList={ingredientsList}
                  inputClass={inputClass}
                  selectTriggerClass={selectTriggerClass}
                />
              )}

              <ProductFormAddOns
                productAddOns={productAddOns}
                setProductAddOns={setProductAddOns}
                ingredientsList={ingredientsList}
                inputClass={inputClass}
                selectTriggerClass={selectTriggerClass}
              />
              
              <div className="flex items-center space-x-2 pt-4 border-t border-slate-700">
                <Checkbox id="active" checked={active} onCheckedChange={setActive} className="border-slate-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500" />
                <Label htmlFor="active" className="text-slate-300">Producto Activo (visible en menú)</Label>
              </div>

              <DialogFooter className="pt-8 flex flex-col sm:flex-row gap-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-indigo-300 border-indigo-400 hover:bg-indigo-400 hover:text-black transition-colors">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg" disabled={isLoading}>
                  {isLoading ? (initialData ? 'Guardando Cambios...' : 'Creando Producto...') : (initialData ? 'Guardar Cambios' : 'Crear Producto')}
                </Button>
              </DialogFooter>
            </motion.form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
