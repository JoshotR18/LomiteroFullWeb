
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Clock, ListOrdered, Check, Loader2, Utensils, Search, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/lib/store';
import KitchenOrderCard from '@/pages/kitchen/components/KitchenOrderCard';

const KitchenPage = () => {
  const { toast } = useToast();
  const { 
    orders, 
    updateOrderStatus, 
    branches, 
    user, 
    fetchOrders, 
    fetchBranches,
    isLoadingOrders,
    ordersError,
    isLoadingBranches,
    branchesError
  } = useStore(state => ({
    orders: state.orders || [],
    updateOrderStatus: state.updateOrderStatus,
    branches: state.branches || [],
    user: state.user,
    fetchOrders: state.fetchOrders,
    fetchBranches: state.fetchBranches,
    isLoadingOrders: state.isLoadingOrders,
    ordersError: state.ordersError,
    isLoadingBranches: state.isLoadingBranches,
    branchesError: state.branchesError,
  }));

  const [selectedBranch, setSelectedBranch] = useState(user?.branch_id || '');
  const [isUpdating, setIsUpdating] = useState({});
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); 

  const loadInitialData = useCallback(async () => {
    if (initialDataLoaded) return;
    console.log("KitchenPage: loadInitialData called");
    await Promise.allSettled([
      fetchOrders(),
      fetchBranches()
    ]);
    setInitialDataLoaded(true);
  }, [fetchOrders, fetchBranches, initialDataLoaded]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (initialDataLoaded && user?.branch_id && !selectedBranch) {
      setSelectedBranch(user.branch_id);
    }
  }, [user, selectedBranch, initialDataLoaded]);

  const filteredOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : [])
      .filter(order => {
        const matchesBranch = !selectedBranch || order.branch_id === selectedBranch;
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm 
          ? order.id.toLowerCase().includes(searchTermLower) || 
            (order.customer_name && order.customer_name.toLowerCase().includes(searchTermLower)) ||
            (order.users?.email && order.users.email.toLowerCase().includes(searchTermLower)) ||
            order.order_items.some(item => item.products?.name.toLowerCase().includes(searchTermLower))
          : true;
        return matchesBranch && matchesSearch;
      });
  }, [orders, selectedBranch, searchTerm]);

  const pendingOrders = filteredOrders.filter(order => order.status === 'Pendiente');
  const inProgressOrders = filteredOrders.filter(order => order.status === 'En preparación');
  const readyOrders = filteredOrders.filter(order => order.status === 'Listo para servir');

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error && result.isOptimisticRevert) {
        toast({
          title: "Error de Sincronización",
          description: `No se pudo actualizar el estado del pedido a "${newStatus}". Se revirtió al estado anterior. (${result.error})`,
          variant: "destructive"
        });
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        let messages = [`Pedido #${orderId.substring(0,8)} marcado como "${newStatus}".`];
        if(result.info_stock) messages.push(result.info_stock);
        if(result.warning_stock) messages.push(result.warning_stock);
        if(result.info_sale) messages.push(result.info_sale);
        if(result.error_sale) messages.push(`Error en venta: ${result.error_sale}`);
        
        toast({
          title: "Estado Actualizado",
          description: messages.join(' '),
          variant: result.error_sale ? "destructive" : "default",
          className: result.error_sale ? "" : (newStatus === "En preparación" ? "bg-blue-500 text-white" : "bg-green-500 text-white")
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al actualizar pedido #${orderId.substring(0,8)}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  if (!initialDataLoaded && (isLoadingOrders || isLoadingBranches)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-slate-800">
        <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
      </div>
    );
  }

  const renderOrderList = (orderList, emptyMessage) => {
    if (isLoadingOrders && !ordersError) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>;
    }
    if (!isLoadingOrders && !ordersError && orderList.length === 0) {
      return <p className="text-center text-gray-400 py-8 text-lg">{emptyMessage}</p>;
    }
    if (!isLoadingOrders && !ordersError) {
      return orderList.map(order => (
        <KitchenOrderCard key={order.id} order={order} branches={branches} onStatusUpdate={handleStatusChange} isUpdating={isUpdating} />
      ));
    }
    return null;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 py-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2 flex items-center justify-center">
            <Utensils className="mr-3 h-10 w-10" /> Panel de Cocina
          </h1>
          <p className="text-gray-400 text-lg">Gestiona los pedidos entrantes y su preparación.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por ID, cliente, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-500"
            />
          </div>
          <Select value={selectedBranch} onValueChange={(value) => setSelectedBranch(value === "ALL_BRANCHES" ? "" : value)} disabled={isLoadingBranches}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-purple-500 focus:border-purple-500">
              <SelectValue placeholder="Filtrar por Sucursal" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="ALL_BRANCHES" className="hover:!bg-purple-600/70 focus:bg-purple-600/70">Todas las sucursales</SelectItem>
              {branchesError && <p className="p-2 text-red-400 text-sm">Error al cargar sucursales.</p>}
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id} className="hover:!bg-purple-600/70 focus:bg-purple-600/70">
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="pending" className="space-y-6" onValueChange={setStatusFilter}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-700/80 p-1.5 rounded-lg shadow-lg">
            {[
              { value: "pending", label: "Pendientes", icon: Clock, count: pendingOrders.length, color: "pink" },
              { value: "inProgress", label: "En Proceso", icon: ListOrdered, count: inProgressOrders.length, color: "blue" },
              { value: "ready", label: "Listos", icon: Check, count: readyOrders.length, color: "green" },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className={`py-2.5 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-${tab.color}-500 data-[state=active]:to-${tab.color}-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-${tab.color}-500/20 transition-all rounded-md flex items-center justify-center`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label} ({tab.count})
              </TabsTrigger>
            ))}
          </TabsList>

          {ordersError && (
            <div className="text-center py-8 text-red-400 bg-red-900/20 rounded-lg">
              <p>Error al cargar pedidos: {ordersError}</p>
            </div>
          )}

          <TabsContent value="pending">
            <AnimatePresence>
              {renderOrderList(pendingOrders, "No hay pedidos pendientes.")}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="inProgress">
            <AnimatePresence>
              {renderOrderList(inProgressOrders, "No hay pedidos en preparación.")}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="ready">
            <AnimatePresence>
              {renderOrderList(readyOrders, "No hay pedidos listos para servir.")}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KitchenPage;
