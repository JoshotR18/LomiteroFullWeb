
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import OrderCard from '@/pages/staff/components/OrderCard';
import OrderSummaryCards from '@/pages/staff/components/OrderSummaryCards';

const StaffActiveOrdersView = ({ 
  orders, 
  selectedBranch, 
  onStatusUpdate, 
  isUpdatingStatus, 
  isLoadingOrders, 
  ordersError 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const activeBranchOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : [])
      .filter(order => 
        order.branch_id === selectedBranch?.id && 
        order.status !== 'Entregado' && 
        order.status !== 'Cancelado'
      );
  }, [orders, selectedBranch]);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = activeBranchOrders;

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(lowerSearchTerm) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(lowerSearchTerm)) ||
        (order.users?.name && order.users.name.toLowerCase().includes(lowerSearchTerm)) ||
        (order.users?.email && order.users.email.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeBranchOrders, statusFilter, searchTerm]);

  const orderStatuses = ['Pendiente', 'En preparación', 'Listo para servir'];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-purple-300 tracking-tight">
        Pedidos Activos en {selectedBranch?.name || 'Sucursal'}
      </h2>
      
      <OrderSummaryCards orders={activeBranchOrders} />

      <div className="my-6 p-6 bg-slate-800/60 rounded-xl shadow-xl border border-purple-700/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="orderSearch" className="block text-sm font-medium text-purple-200 mb-1">
              Buscar Pedido
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="orderSearch"
                type="text"
                placeholder="ID, Cliente, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-slate-700 border-slate-600 focus:border-purple-500 focus:ring-purple-500 text-white placeholder-slate-400"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-purple-200 mb-1">
              Filtrar por Estado
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-slate-700 border-slate-600 focus:border-purple-500 focus:ring-purple-500 text-white">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="" className="hover:!bg-purple-600/70 focus:bg-purple-600/70">Todos los estados</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status} className="hover:!bg-purple-600/70 focus:bg-purple-600/70">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoadingOrders && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
        </div>
      )}
      {!isLoadingOrders && ordersError && (
        <div className="text-center py-10 bg-red-900/20 border border-red-700 rounded-lg shadow-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-red-300 mb-2">Error al Cargar Pedidos</h3>
          <p className="text-red-400">{ordersError}</p>
        </div>
      )}
      {!isLoadingOrders && !ordersError && filteredAndSortedOrders.length === 0 && (
        <div className="text-center py-10 bg-slate-800/50 border border-slate-700 rounded-lg shadow-md">
          <Search className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No se encontraron pedidos</h3>
          <p className="text-slate-400">
            {searchTerm || statusFilter ? "Intenta con otros filtros o términos de búsqueda." : "No hay pedidos activos que coincidan."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedOrders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onStatusUpdate={onStatusUpdate} 
            isUpdating={isUpdatingStatus[order.id]}
          />
        ))}
      </div>
    </section>
  );
};

export default StaffActiveOrdersView;
