
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/lib/store';
import AdminOrderTable from '@/pages/admin/components/AdminOrderTable';
import AdminOrdersPageHeader from '@/pages/admin/components/AdminOrdersPageHeader';
import OrderSearchFilter from '@/pages/admin/components/OrderSearchFilter';

const AdminOrdersPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState({});

  const { 
    orders, 
    fetchOrders: storeFetchOrders, 
    updateOrderStatus: storeUpdateOrderStatus, 
    deleteOrder: storeDeleteOrder, 
    isLoadingOrders,
    subscribeToOrderChanges, // Added
    unsubscribeFromOrderChanges // Added
  } = useStore(state => ({
    orders: state.orders,
    fetchOrders: state.fetchOrders,
    subscribeToOrderChanges: state.subscribeToOrderChanges, // Added
    unsubscribeFromOrderChanges: state.unsubscribeFromOrderChanges, // Added
    updateOrderStatus: state.updateOrderStatus,
    deleteOrder: state.deleteOrder,
    isLoadingOrders: state.isLoadingOrders,
  }));
  
  const loadOrders = useCallback(async () => {
    await storeFetchOrders();
  }, [storeFetchOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Effect for real-time order subscriptions for Admin (all orders)
  useEffect(() => {
    console.log('AdminOrdersPage: Subscribing to all order changes.');
    // Passing null for branchId to subscribe to all orders
    subscribeToOrderChanges(null);

    return () => {
      console.log('AdminOrdersPage: Unsubscribing from order changes.');
      unsubscribeFromOrderChanges();
    };
  }, [subscribeToOrderChanges, unsubscribeFromOrderChanges]); // subscribe/unsubscribe are stable references from Zustand

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const result = await storeUpdateOrderStatus(orderId, newStatus);
      
      if (result.error && result.isOptimisticRevert) {
        toast({
          title: "Error de Sincronización",
          description: `No se pudo actualizar el estado del pedido a "${newStatus}". Se revirtió al estado anterior. (${result.error})`,
          variant: "destructive"
        });
      } else if (result.error && !result.info_sale && !result.warning_stock && !result.info_stock) {
        throw new Error(result.error || "Error desconocido al actualizar el pedido");
      }

      let messages = [`Pedido #${orderId.substring(0,8)} marcado como "${newStatus}".`];
      if(result.info_stock) messages.push(result.info_stock);
      if(result.warning_stock) messages.push(result.warning_stock);
      if(result.info_sale) messages.push(result.info_sale);
      if(result.error_sale) messages.push(`Error en venta: ${result.error_sale}`);
      
      toast({
        title: "Estado Actualizado",
        description: messages.join(' '),
        variant: result.error_sale ? "destructive" : "default",
        className: result.error_sale ? "" : (newStatus === "En preparación" ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500 dark:text-white" : (newStatus === "Listo para servir" || newStatus === "Entregado") ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-500 dark:text-white" : "")
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error al actualizar estado",
        description: error.message || "No se pudo actualizar el estado del pedido.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      setIsUpdatingStatus(prev => ({ ...prev, [orderToDelete.id]: true }));
      try {
        await storeDeleteOrder(orderToDelete.id); 
        toast({ 
          title: "Pedido eliminado", 
          description: "El pedido ha sido eliminado exitosamente.",
          className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-600 dark:text-white"
        });
        setOrderToDelete(null);
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Error al eliminar",
          description: error.message || "No se pudo eliminar el pedido.",
          variant: "destructive"
        });
      } finally {
        setIsUpdatingStatus(prev => ({ ...prev, [orderToDelete.id]: false }));
      }
    }
  };
  
  const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
    (order.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.users?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.users?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.id?.toString() || '').includes(searchTerm)
  ) : [];


  if (isLoadingOrders && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-purple-400" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 min-h-screen text-slate-800 dark:text-gray-100 rounded-lg shadow-sm"
    >
      <AdminOrdersPageHeader />
      <OrderSearchFilter searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-purple-700/30 shadow-2xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-300 text-2xl">Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminOrderTable 
            orders={filteredOrders}
            onStatusChange={handleStatusChange}
            onDeleteOrder={setOrderToDelete} 
            isUpdatingStatus={isUpdatingStatus}
            isLoadingTable={isLoadingOrders && orders.length > 0}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!orderToDelete} onOpenChange={(isOpen) => { if(!isOpen) setOrderToDelete(null); }}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer. Se eliminará el pedido <span className="font-semibold text-purple-700 dark:text-purple-300">#{orderToDelete?.id?.substring(0,8)}...</span> permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setOrderToDelete(null)}
              className="text-slate-700 dark:text-gray-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              disabled={isUpdatingStatus[orderToDelete?.id]}
            >
              {isUpdatingStatus[orderToDelete?.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AdminOrdersPage;
