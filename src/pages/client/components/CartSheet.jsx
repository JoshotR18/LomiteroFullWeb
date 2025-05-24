
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { formatGuaranies } from '@/lib/store/financialStats';
import { ShoppingCart, X, Minus, Plus, Sparkles } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemoveItem, onNotesChange }) => (
  <div className="flex items-start py-4 border-b border-slate-700">
    <div className="flex-grow">
      <h4 className="font-semibold text-purple-300">{item.name}</h4>
      <p className="text-sm text-green-400 mb-1">{formatGuaranies(item.price)}</p>
      {item.add_ons && item.add_ons.length > 0 && (
        <div className="mb-2 pl-2 border-l-2 border-yellow-500">
          {item.add_ons.map((addon, index) => (
            <div key={index} className="text-xs text-yellow-400 flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
              {addon.name} (+{formatGuaranies(addon.price * addon.quantity_selected)})
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-2 mb-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
          onClick={() => onQuantityChange(item.id, -1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-gray-100">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
          onClick={() => onQuantityChange(item.id, 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        placeholder="Notas para este producto (ej: sin cebolla)"
        value={item.notes || ''}
        onChange={(e) => onNotesChange(item.id, e.target.value)}
        className="text-xs bg-slate-700 border-purple-600 text-gray-200 placeholder-slate-400 focus:border-purple-400 mt-1"
        rows={2}
      />
    </div>
    <div className="ml-4 flex flex-col items-end">
      <p className="font-semibold text-gray-100 mb-2">{formatGuaranies(item.price * item.quantity)}</p>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-7 w-7"
        onClick={() => onRemoveItem(item.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
);


const CartSheet = ({ 
  isOpen, 
  onOpenChange, 
  cart, 
  selectedBranch, 
  onQuantityChange, 
  onRemoveItem, 
  onNotesChange, 
  totalCartAmount, 
  onCheckout, 
  isLoading,
  customerName,
  onCustomerNameChange,
  isStaffOrder = false
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-900 text-gray-100 border-l-2 border-purple-700 flex flex-col">
        <SheetHeader className="pb-4 border-b border-slate-700">
          <SheetTitle className="text-2xl text-purple-300">Tu Carrito</SheetTitle>
          <SheetDescription className="text-slate-400">
            {selectedBranch ? `Pedido para: ${selectedBranch.name}` : "Selecciona una sucursal"}
          </SheetDescription>
        </SheetHeader>
        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-20 w-20 text-slate-600 mb-6" />
            <p className="text-xl text-slate-400 mb-2">Tu carrito está vacío</p>
            <p className="text-sm text-slate-500 mb-6">Agrega algunos productos deliciosos del menú.</p>
            <SheetClose asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Ver Menú
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {isStaffOrder && (
              <div className="py-4 border-b border-slate-700">
                <label htmlFor="customerNameCart" className="block text-sm font-medium text-slate-300 mb-1">Nombre del Cliente:</label>
                <Input
                  id="customerNameCart"
                  type="text"
                  placeholder="Ingresa el nombre del cliente"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                  className="w-full bg-slate-700 border-purple-600 text-gray-200 placeholder-slate-400 focus:border-purple-400"
                />
              </div>
            )}
            <div className="flex-grow overflow-y-auto py-4 pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={onQuantityChange}
                  onRemoveItem={onRemoveItem}
                  onNotesChange={onNotesChange}
                />
              ))}
            </div>
            <SheetFooter className="pt-6 border-t border-slate-700">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-xl font-semibold text-gray-100">
                  <span>Total:</span>
                  <span className="text-green-400">{formatGuaranies(totalCartAmount)}</span>
                </div>
                <Button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-lg py-3"
                  disabled={isLoading || !selectedBranch || (isStaffOrder && !customerName)}
                >
                  {isLoading ? "Procesando..." : "Finalizar Pedido"}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
