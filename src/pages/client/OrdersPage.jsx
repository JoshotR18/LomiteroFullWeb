
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatGuaranies } from '@/lib/store';
import useStore from '@/lib/store';
import { Clock, CheckCircle2, ChefHat, Package, XCircle, ShoppingBag, Loader2 } from 'lucide-react';

// Note: subscribeToOrderChanges and unsubscribeFromOrderChanges will be pulled from useStore
const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'Pendiente':
      return <Clock className="h-5 w-5 text-yellow-400" />;
    case 'En preparación':
      return <ChefHat className="h-5 w-5 text-blue-400" />;
    case 'Listo para servir':
      return <Package className="h-5 w-5 text-purple-400" />;
    case 'Entregado':
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    case 'Cancelado':
      return <XCircle className="h-5 w-5 text-red-400" />;
    default:
      return null;
  }
};

const OrderCard = ({ order }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'En preparación': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Listo para servir': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Entregado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="w-full bg-slate-800/70 border border-purple-700/50 shadow-lg hover:shadow-purple-500/30 transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-lg text-purple-300">
              Pedido #{order.id.substring(0, 8)}... 
              {order.customer_name && <span className="text-sm text-slate-400"> para {order.customer_name}</span>}
            </span>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(order.status)}`}>
              <OrderStatusIcon status={order.status} />
              <span>{order.status}</span>
            </div>
          </CardTitle>
          <p className="text-xs text-slate-500 pt-1">
            {new Date(order.created_at).toLocaleDateString('es-PY', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
            {order.branches && ` - Sucursal: ${order.branches.name}`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              {order.order_items?.map((item, i) => (
                <div key={item.id || i} className="flex justify-between items-center text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.quantity}x</span>
                    <span>{item.products?.name || 'Producto desconocido'}</span>
                  </div>
                  <span className="font-medium">{formatGuaranies(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-purple-700/30">
              <div className="flex justify-between items-center font-semibold text-gray-100">
                <span>Total</span>
                <span className="text-green-400">{formatGuaranies(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const OrdersPage = () => {
  const {
    orders,
    user,
    fetchOrders,
    isLoading,
    setIsLoading,
    subscribeToOrderChanges, // Added
    unsubscribeFromOrderChanges // Added
  } = useStore(state => ({
    orders: state.orders,
    user: state.user,
    fetchOrders: state.fetchOrders,
    isLoading: state.isLoadingOrders, // Assuming isLoadingOrders is the correct state property
    setIsLoading: state.setIsLoadingOrders, // Assuming setIsLoadingOrders is the correct setter
    subscribeToOrderChanges: state.subscribeToOrderChanges,
    unsubscribeFromOrderChanges: state.unsubscribeFromOrderChanges,
  }));
  const [activeTab, setActiveTab] = useState("pending");

  const loadUserOrders = useCallback(async () => {
    if (user?.id) {
      // fetchOrders itself sets isLoading to true and false.
      // No need to call setIsLoading here if fetchOrders handles it.
      await fetchOrders(); 
    }
  }, [user, fetchOrders]);

  useEffect(() => {
    loadUserOrders();
  }, [loadUserOrders]);

  // Effect for real-time order subscriptions for the logged-in user
  useEffect(() => {
    if (user?.id) {
      console.log(`Client/OrdersPage: Subscribing to order changes for user ${user.id}`);
      // Passing null for branchId, assuming RLS handles user-specific orders
      // or the subscription in the slice is designed to fetch all orders for the user.
      subscribeToOrderChanges(null);

      return () => {
        console.log(`Client/OrdersPage: Unsubscribing from order changes for user ${user.id}`);
        unsubscribeFromOrderChanges();
      };
    }
  }, [user, subscribeToOrderChanges, unsubscribeFromOrderChanges]);
  
  const userOrders = Array.isArray(orders) ? orders.filter(order => order.user_id === user?.id) : [];
  
  const pendingOrders = userOrders.filter(order => 
    ['Pendiente', 'En preparación', 'Listo para servir'].includes(order.status)
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const completedOrders = userOrders.filter(order => 
    ['Entregado', 'Cancelado'].includes(order.status)
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="space-y-8 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <ShoppingBag className="h-10 w-10 text-purple-400" />
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">Mis Pedidos</h1>
          <p className="text-slate-400 mt-1">Seguimiento de tus pedidos actuales e historial.</p>
        </div>
      </motion.div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/70 p-1 rounded-lg">
          <TabsTrigger value="pending" className="relative data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:bg-purple-500/50 transition-all rounded-md py-2">
            Pedidos Activos
            {pendingOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs animate-pulse">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:bg-purple-500/50 transition-all rounded-md py-2">
            Historial
          </TabsTrigger>
        </TabsList>
        
        {isLoading && (pendingOrders.length === 0 && completedOrders.length === 0) && (
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mx-auto" />
            <p className="mt-3 text-slate-400">Cargando tus pedidos...</p>
          </div>
        )}

        <TabsContent value="pending" className="space-y-4 mt-6">
          {!isLoading && pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-slate-800/50 rounded-lg"
            >
              <ShoppingBag className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No tienes pedidos activos en este momento.</p>
              <Button
                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => window.location.href = '/client/menu'}
              >
                Realizar un Pedido
              </Button>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {!isLoading && completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-slate-800/50 rounded-lg"
            >
              <ShoppingBag className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Aún no tienes pedidos en tu historial.</p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
