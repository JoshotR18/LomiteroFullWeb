
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Sparkles, PlayCircle, CheckCircle2 } from 'lucide-react';
import { formatGuaranies } from '@/lib/store';

const KitchenOrderCard = ({ order, branches, onStatusUpdate, isUpdating }) => {
  const hasNotes = order.order_items?.some(item => item.notes);
  const branch = branches.find(b => b.id === order.branch_id);
  const isLoading = isUpdating[order.id];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      className="mb-4"
    >
      <Card className={`border-2 hover:border-purple-500 transition-colors duration-300 ease-in-out ${hasNotes ? 'border-yellow-500 hover:border-yellow-400' : 'border-slate-700'} ${isLoading ? 'opacity-60 animate-pulse' : ''} bg-slate-800/70 shadow-xl backdrop-blur-md`}>
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-purple-300">Pedido #{order.id.substring(0, 8)}</CardTitle>
              <p className="text-sm text-slate-400">
                Cliente: {order.customer_name || order.users?.name || 'No especificado'}
              </p>
              <p className="text-xs text-slate-500">
                Recibido: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full shadow-sm">
                {branch?.name || 'Sucursal'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-700">
            {order.order_items?.map((item, index) => (
              <div key={item.id || index} className="flex flex-col p-2 bg-slate-700/50 rounded-md shadow-inner">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-semibold text-purple-200 mr-2">{item.quantity}x</span>
                    <span className="text-slate-100">{item.products?.name || item.name || 'Producto Desconocido'}</span>
                    {item.notes && (
                      <MessageSquare className="h-4 w-4 ml-2 text-yellow-400" />
                    )}
                  </div>
                </div>
                {item.add_ons && Array.isArray(item.add_ons) && item.add_ons.length > 0 && (
                  <div className="ml-6 mt-1.5 pl-2 border-l-2 border-yellow-500/70 space-y-1">
                    {item.add_ons.map((addon, addonIndex) => (
                      <div key={addon.product_add_on_id || addonIndex} className="text-xs text-yellow-300 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-400" />
                        {addon.name} (+{formatGuaranies(addon.price * (addon.quantity_selected || 1))})
                      </div>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <div className="ml-6 mt-1.5 p-1.5 bg-yellow-500/10 rounded-md">
                    <p className="text-sm text-yellow-300">
                      <span className="font-medium">Nota:</span> {item.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            {isLoading ? (
              <Button disabled className="bg-slate-600 text-slate-400 w-full sm:w-auto">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </Button>
            ) : (
              <>
                {order.status === 'Pendiente' && (
                  <Button 
                    onClick={() => onStatusUpdate(order.id, 'En preparación')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md w-full sm:w-auto"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Empezar
                  </Button>
                )}
                {order.status === 'En preparación' && (
                  <Button 
                    onClick={() => onStatusUpdate(order.id, 'Listo para servir')}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md w-full sm:w-auto"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Listo
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KitchenOrderCard;
