
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Search, Minus, Plus, User } from 'lucide-react';
import useStore, { formatGuaranies } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const MobileOrderForm = ({ isOpen, onClose, onSubmit, selectedBranch }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const { products, fetchProducts } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && (!products || products.length === 0)) {
      fetchProducts();
    }
  }, [isOpen, products, fetchProducts]);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.active
  );

  const handleAddProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1, notes: '' }]);
    }
  };

  const handleQuantityChange = (productId, change) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const newQuantity = p.quantity + change;
        return newQuantity < 1 ? null : { ...p, quantity: newQuantity };
      }
      return p;
    }).filter(Boolean));
  };

  const handleObservationChange = (productId, observation) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, notes: observation } : p
    ));
  };

  const handleSubmit = () => {
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Debe seleccionar una sucursal antes de crear un pedido",
        variant: "destructive"
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Debe ingresar el nombre del cliente",
        variant: "destructive"
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un producto",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const orderItems = selectedProducts.map(p => ({
      productId: p.id,
      quantity: p.quantity,
      price: p.price,
      notes: p.notes,
    }));

    onSubmit({
      orderItems,
      total_amount: totalAmount,
      status: 'Pendiente',
      branch_id: selectedBranch.id,
      customer_name: customerName.trim(),
      user_id: null, // Staff creates orders for non-registered users or as a general order
    });
    setSelectedProducts([]);
    setSearchTerm('');
    setCustomerName('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-slate-900 text-gray-100 border-purple-700">
        <SheetHeader>
          <SheetTitle className="text-purple-300">Tomar Pedido - {selectedBranch?.name || 'Seleccione una sucursal'}</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full pt-4">
          <div className="mb-4">
            <Label htmlFor="customerName" className="text-purple-300 mb-1 block">Nombre del Cliente</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="customerName"
                placeholder="Ej: Juan Pérez"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-9 bg-slate-800 border-purple-600 text-gray-100 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800 border-purple-600 text-gray-100 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800 pr-2">
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <Card key={product.id} className="cursor-pointer hover:bg-purple-800/30 bg-slate-800 border-purple-700" onClick={() => handleAddProduct(product)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-purple-300">{product.name}</h3>
                        <p className="text-sm text-gray-400">{formatGuaranies(product.price)}</p>
                      </div>
                      <PlusCircle className="h-5 w-5 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-purple-300">Pedido Actual</h3>
                <div className="space-y-3">
                  {selectedProducts.map(product => (
                    <Card key={product.id} className="bg-slate-800 border-purple-700">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-purple-300">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="bg-slate-700 border-purple-600 hover:bg-purple-700 text-gray-100 h-7 w-7"
                              onClick={() => handleQuantityChange(product.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center text-gray-100">{product.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="bg-slate-700 border-purple-600 hover:bg-purple-700 text-gray-100 h-7 w-7"
                              onClick={() => handleQuantityChange(product.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Observaciones (sin tomate, extra queso, etc.)"
                          value={product.notes}
                          onChange={(e) => handleObservationChange(product.id, e.target.value)}
                          className="mt-2 bg-slate-700 border-purple-600 text-gray-100 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          rows={2}
                        />
                        <p className="text-right mt-2 text-sm text-gray-400">
                          {formatGuaranies(product.price * product.quantity)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-3 border-t border-purple-700">
                  <div className="flex justify-between font-semibold text-purple-300">
                    <span>Total:</span>
                    <span>
                      {formatGuaranies(
                        selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-auto pt-4 border-t border-purple-700">
            <Button variant="outline" onClick={onClose} className="text-purple-300 border-purple-500 hover:bg-purple-700 hover:text-white">Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">Crear Pedido</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileOrderForm;
