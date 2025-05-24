
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Save, XSquare } from 'lucide-react';

const BranchForm = ({ isOpen, onOpenChange, onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast({
        title: "Campos incompletos",
        description: "El nombre y la dirección de la sucursal son obligatorios.",
        variant: "destructive",
        className: "bg-red-700 text-white border-red-700"
      });
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-800 via-slate-900 to-black text-white border-slate-700 rounded-lg shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
            {isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </DialogTitle>
        </DialogHeader>
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onSubmit={handleSubmit} 
          className="space-y-6 mt-6"
        >
          <div>
            <Label htmlFor="name" className="text-pink-300 font-semibold">Nombre de la Sucursal</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej: Sucursal Centro"
              className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-pink-500 focus:border-pink-500 rounded-md"
              required
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-pink-300 font-semibold">Dirección</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ej: Av. Principal 123, Ciudad"
              className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-pink-500 focus:border-pink-500 rounded-md"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-pink-300 font-semibold">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ej: (021) 123-4567"
              className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-pink-500 focus:border-pink-500 rounded-md"
            />
          </div>
          <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-4">
             <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-pink-300 border-pink-400 hover:bg-pink-400 hover:text-black transition-colors"
            >
              <XSquare className="mr-2 h-5 w-5" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-150"
            >
              <Save className="mr-2 h-5 w-5" />
              {isEditing ? 'Guardar Cambios' : 'Crear Sucursal'}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default BranchForm;
