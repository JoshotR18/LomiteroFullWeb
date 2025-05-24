
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { formatGuaranies } from '@/lib/store';
import { Clock, CheckCircle2, ChefHat, PackageCheck, XCircle, User, Loader2, PlusSquare } from 'lucide-react';

const OrderCard = ({ order, onStatusUpdate, isUpdating }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'En preparación': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'Listo para servir': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'Entregado': return 'bg-teal-500/20 text-teal-400 border-teal-500';
      case 'Cancelado': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pendiente': return <Clock size={18} />;
      case 'En preparación': return <ChefHat size={18} />;
      case 'Listo para servir': return <PackageCheck size={18} />;
      case 'Entregado': return <CheckCircle2 size={18} />;
      case 'Cancelado': return <XCircle size={18} />;
      default: return null;
    }
  };

  return (
    <motion.div
      className={`glassmorphic-card p-5 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-shadow duration-300 ${isUpdating ? 'opacity-70' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
        <div className="mb-2 md:mb-0">
          <h3 className="text-xl font-semibold text-white">Pedido #{order.id.substring(0, 8)}</h3>
          {order.customer_name && (
            <p className="text-sm text-purple-300 flex items-center">
              <User size={14} className="mr-1.5 text-purple-400" />
              Para: {order.customer_name}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(order.created_at).toLocaleString('es-PY', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {order.status}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        {(order.order_items || []).map((item, i) => (
          <div key={item.id || i} className="text-purple-200 border-b border-purple-800/50 pb-2 last:border-b-0 last:pb-0">
            <div className="flex justify-between">
              <span className="font-medium">{item.quantity}x {item.products?.name || 'Producto desconocido'}</span>
              <span>{formatGuaranies(item.unit_price * item.quantity)}</span>
            </div>
            {item.add_ons && item.add_ons.length > 0 && (
              <div className="ml-4 mt-1 space-y-0.5">
                {item.add_ons.map((addon, addonIndex) => (
                  <div key={addon.product_add_on_id || addonIndex} className="flex justify-between items-center text-xs text-yellow-300/80">
                    <span className="flex items-center">
                      <PlusSquare size={12} className="mr-1.5 text-yellow-400/70" />
                      {addon.name}
                    </span>
                    <span>+{formatGuaranies(addon.price)}</span>
                  </div>
                ))}
              </div>
            )}
            {item.notes && (
              <p className="text-sm text-purple-400/80 ml-4 italic mt-1">
                Obs: {item.notes}
              </p>
            )}
          </div>
        ))}
        <div className="text-white font-semibold pt-2 border-t border-purple-500/30">
          Total: {formatGuaranies(order.total_amount)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isUpdating ? (
          <Button disabled className="bg-slate-500 text-white flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <Loader2 size={16} className="animate-spin" /> Actualizando...
          </Button>
        ) : (
          <>
            {order.status === 'Pendiente' && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                onClick={() => onStatusUpdate(order.id, 'En preparación')}
              >
                <ChefHat size={16} /> Comenzar Preparación
              </Button>
            )}
            {order.status === 'En preparación' && (
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                onClick={() => onStatusUpdate(order.id, 'Listo para servir')}
              >
                <PackageCheck size={16} /> Marcar como Listo
              </Button>
            )}
            {order.status === 'Listo para servir' && (
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                onClick={() => onStatusUpdate(order.id, 'Entregado')}
              >
                <CheckCircle2 size={16} /> Confirmar Entrega
              </Button>
            )}
            {order.status !== 'Entregado' && order.status !== 'Cancelado' && (
              <Button 
                variant="outline" 
                className="text-red-400 border-red-500 hover:bg-red-700 hover:text-white flex items-center gap-1.5"
                onClick={() => onStatusUpdate(order.id, 'Cancelado')}
              >
                <XCircle size={16} /> Cancelar
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default OrderCard;
