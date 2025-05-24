
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, MinusCircle, Leaf, Box } from 'lucide-react';

const UpdateStockDialog = ({ isOpen, onOpenChange, item, branchName, onSubmit, isLoading, itemType }) => {
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');

  useEffect(() => {
    if (item) {
      setCurrentStock(item.current_stock?.toString() || '0');
      setMinStock(item.min_stock?.toString() || '0');
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const current = parseFloat(currentStock);
    const minimum = parseFloat(minStock);

    if (isNaN(current) || isNaN(minimum)) {
      return;
    }
    onSubmit({ current_stock: current, min_stock: minimum });
  };

  const adjustStock = (field, amount) => {
    if (field === 'current') {
      setCurrentStock(prev => String(Math.max(0, (parseFloat(prev) || 0) + amount)));
    } else if (field === 'min') {
      setMinStock(prev => String(Math.max(0, (parseFloat(prev) || 0) + amount)));
    }
  };

  if (!item) return null;

  const ItemIcon = itemType === 'ingredient' ? Leaf : Box;
  const itemColor = itemType === 'ingredient' ? 'text-green-400' : 'text-blue-400';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-800 via-slate-900 to-black text-white border-slate-700 rounded-lg shadow-2xl sm:max-w-md p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex items-center">
            <ItemIcon className={`h-7 w-7 mr-3 ${itemColor}`} />
            Ajustar Stock: {item.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {itemType === 'ingredient' ? `Sucursal: ` : `Tipo: `} 
            <span className="font-semibold text-indigo-300">{itemType === 'ingredient' ? branchName : 'Producto (Stock Directo)'}</span>
            {item.unit && <span className="ml-2 text-xs text-slate-500">(Unidad: {item.unit})</span>}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="currentStock" className="text-indigo-300 font-semibold">Stock Actual ({item.unit || 'unidades'})</Label>
            <div className="flex items-center mt-2">
              <Button type="button" size="icon" variant="ghost" onClick={() => adjustStock('current', -1)} className="text-red-400 hover:bg-red-500/20 h-10 w-10"><MinusCircle size={20}/></Button>
              <Input
                id="currentStock"
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="mx-2 flex-1 text-center bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                min="0"
                step="any"
                required
              />
              <Button type="button" size="icon" variant="ghost" onClick={() => adjustStock('current', 1)} className="text-green-400 hover:bg-green-500/20 h-10 w-10"><PlusCircle size={20}/></Button>
            </div>
          </div>
          <div>
            <Label htmlFor="minStock" className="text-indigo-300 font-semibold">Stock Mínimo ({item.unit || 'unidades'})</Label>
             <div className="flex items-center mt-2">
              <Button type="button" size="icon" variant="ghost" onClick={() => adjustStock('min', -1)} className="text-red-400 hover:bg-red-500/20 h-10 w-10"><MinusCircle size={20}/></Button>
              <Input
                id="minStock"
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="mx-2 flex-1 text-center bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                min="0"
                step="any"
                required
              />
              <Button type="button" size="icon" variant="ghost" onClick={() => adjustStock('min', 1)} className="text-green-400 hover:bg-green-500/20 h-10 w-10"><PlusCircle size={20}/></Button>
            </div>
          </div>
          <DialogFooter className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-indigo-300 border-indigo-400 hover:bg-indigo-400 hover:text-black transition-colors">Cancelar</Button>
            <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Actualizar Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockDialog;
