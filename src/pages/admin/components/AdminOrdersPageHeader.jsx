
import React from 'react';
import { ShoppingBag } from 'lucide-react';

const AdminOrdersPageHeader = () => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <ShoppingBag className="h-10 w-10 text-purple-400" />
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
        Gestión de Pedidos
      </h1>
    </div>
    <p className="text-slate-400">
      Visualiza y administra todos los pedidos. El stock se descuenta al marcar como "En preparación". Las ventas se registran al marcar como "Entregado".
    </p>
  </div>
);

export default AdminOrdersPageHeader;
