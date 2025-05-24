
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminOrderRow from '@/pages/admin/components/AdminOrderRow';
import { Loader2 } from 'lucide-react';

const AdminOrderTable = ({ orders, onStatusChange, onDeleteOrder, isUpdatingStatus, isLoadingTable }) => {
  if (isLoadingTable && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-300" />
      </div>
    );
  }

  if (!isLoadingTable && orders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-slate-500 dark:text-slate-400">No se encontraron pedidos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b-slate-300 dark:border-b-purple-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/30">
            <TableHead className="text-purple-700 dark:text-purple-300">ID Pedido</TableHead>
            <TableHead className="text-purple-700 dark:text-purple-300">Cliente</TableHead>
            <TableHead className="text-purple-700 dark:text-purple-300">Sucursal</TableHead>
            <TableHead className="text-purple-700 dark:text-purple-300">Fecha</TableHead>
            <TableHead className="text-purple-700 dark:text-purple-300">Items</TableHead>
            <TableHead className="text-purple-700 dark:text-purple-300">Total</TableHead>
            <TableHead className="text-purple-700 dark:text-purple-300">Estado</TableHead>
            <TableHead className="text-right text-purple-700 dark:text-purple-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <AdminOrderRow 
              key={order.id} 
              order={order} 
              onStatusChange={onStatusChange} 
              onDeleteOrder={onDeleteOrder}
              isUpdating={isUpdatingStatus[order.id]}
              isLoadingOverall={isLoadingTable}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminOrderTable;
