
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MinusCircle, Beef } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductFormIngredients = ({ productIngredients, setProductIngredients, ingredientsList, inputClass, selectTriggerClass }) => {
  
  const handleAddIngredient = () => {
    if (ingredientsList && ingredientsList.length > 0) {
      setProductIngredients([...productIngredients, { id: ingredientsList[0].id, quantity: '1' }]);
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...productIngredients];
    newIngredients.splice(index, 1);
    setProductIngredients(newIngredients);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...productIngredients];
    newIngredients[index][field] = value;
    setProductIngredients(newIngredients);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-700">
      <h3 className="text-lg font-semibold text-indigo-300 flex items-center"><Beef className="inline h-5 w-5 mr-2"/>Ingredientes Base</h3>
      <ScrollArea className="h-[150px] w-full pr-3">
      {productIngredients.map((ing, index) => (
        <motion.div 
          key={ing.id || `ing-${index}`}
          className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-md mb-3 shadow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Select
            value={ing.id}
            onValueChange={(value) => handleIngredientChange(index, 'id', value)}
          >
            <SelectTrigger className={`${selectTriggerClass} flex-1`}>
              <SelectValue placeholder="Seleccionar ingrediente" />
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
            value={ing.quantity}
            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            placeholder="Cant."
            min="0.01"
            step="0.01"
            required
            className={`${inputClass} w-24 text-center`}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredient(index)} className="text-red-400 hover:bg-red-500/20">
            <MinusCircle size={20} />
          </Button>
        </motion.div>
      ))}
      </ScrollArea>
      <Button type="button" variant="outline" onClick={handleAddIngredient} className="text-indigo-300 border-indigo-400 hover:bg-indigo-400 hover:text-black transition-colors w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ingrediente Base
      </Button>
    </div>
  );
};

export default ProductFormIngredients;
