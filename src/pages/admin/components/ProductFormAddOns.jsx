
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MinusCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductFormAddOns = ({ productAddOns, setProductAddOns, ingredientsList, inputClass, selectTriggerClass }) => {

  const handleAddAddOn = () => {
    if (ingredientsList && ingredientsList.length > 0) {
      setProductAddOns([...productAddOns, { 
        id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        name: '', 
        ingredient_id: ingredientsList[0].id, 
        add_on_price: '0', 
        add_on_quantity: '1' 
      }]);
    }
  };

  const handleRemoveAddOn = (index) => {
    const newAddOns = [...productAddOns];
    newAddOns.splice(index, 1);
    setProductAddOns(newAddOns);
  };

  const handleAddOnChange = (index, field, value) => {
    const newAddOns = [...productAddOns];
    newAddOns[index][field] = value;
    setProductAddOns(newAddOns);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-700">
      <h3 className="text-lg font-semibold text-yellow-300 flex items-center"><Sparkles className="inline h-5 w-5 mr-2"/>Agregados (Extras)</h3>
      <ScrollArea className="h-[200px] w-full pr-3">
      {productAddOns.map((addon, index) => (
        <motion.div 
          key={addon.id} 
          className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 p-3 bg-slate-800/50 rounded-md mb-3 shadow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Input
            value={addon.name}
            onChange={(e) => handleAddOnChange(index, 'name', e.target.value)}
            placeholder="Nombre del Agregado (Ej: Queso Extra)"
            required
            className={`${inputClass} md:col-span-4`}
          />
          <Select
            value={addon.ingredient_id}
            onValueChange={(value) => handleAddOnChange(index, 'ingredient_id', value)}
          >
            <SelectTrigger className={`${selectTriggerClass} md:col-span-3`}>
              <SelectValue placeholder="Ingrediente del Agregado" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {ingredientsList.map((ingredient) => (
                <SelectItem key={ingredient.id} value={ingredient.id} className="hover:bg-slate-700 focus:bg-slate-700">
                  {ingredient.name} ({ingredient.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Input
            type="number"
            value={addon.add_on_quantity}
            onChange={(e) => handleAddOnChange(index, 'add_on_quantity', e.target.value)}
            placeholder="Cant. Ingrediente"
            min="0.01" step="0.01" required
            className={`${inputClass} md:col-span-2 text-center`}
          />
          <Input
            type="number"
            value={addon.add_on_price}
            onChange={(e) => handleAddOnChange(index, 'add_on_price', e.target.value)}
            placeholder="Precio Extra"
            min="0" step="0.01" required
            className={`${inputClass} md:col-span-2 text-center`}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAddOn(index)} className="text-red-400 hover:bg-red-500/20 md:col-span-1">
            <MinusCircle size={20} />
          </Button>
        </motion.div>
      ))}
      </ScrollArea>
      <Button type="button" variant="outline" onClick={handleAddAddOn} className="text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Agregado
      </Button>
    </div>
  );
};

export default ProductFormAddOns;
