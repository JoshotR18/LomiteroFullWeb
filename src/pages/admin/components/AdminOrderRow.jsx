
import React, {useState} from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, CheckCircle2, XCircle, PackageCheck, Trash2, ChevronDown, ChevronUp, User, Loader2 } from 'lucide-react';

const AdminOrderRow = ({ order, onStatusChange, onDeleteOrder, isUpdating, isLoadingOverall }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'En preparación': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
      case 'Listo para servir': return 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30';
      case 'Entregado': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'Cancelado': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      default: return 'bg-slate-200 text-slate-600 border-slate-400 dark:bg-slate-600/20 dark:text-slate-400 dark:border-slate-500/30';
    }
  };

  const formatGuaranies = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        const GsPrefix = new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(0).replace(/[0-9.,\s]/g, '');
        return `${GsPrefix} 0`;
    }
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('PYG', 'Gs.');
  };

  const ActionButton = ({ onClick, children, className, icon: Icon, disabled }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all duration-150 ease-in-out ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-100'}`}
      disabled={disabled || isUpdating || isLoadingOverall}
    >
      {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {children}
    </Button>
  );

  const renderActionButtons = () => {
    const buttons = [];
    if (order.status === 'Pendiente') {
      buttons.push(
        <ActionButton key="preparar" onClick={() => onStatusChange(order.id, 'En preparación')} className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20" icon={Clock}>
          Preparar
        </ActionButton>
      );
    }
    if (order.status === 'En preparación') {
      buttons.push(
        <ActionButton key="listo" onClick={() => onStatusChange(order.id, 'Listo para servir')} className="text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20" icon={CheckCircle2}>
          Listo
        </ActionButton>
      );
    }
    if (order.status === 'Listo para servir') {
      buttons.push(
        <ActionButton key="entregar" onClick={() => onStatusChange(order.id, 'Entregado')} className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20" icon={PackageCheck}>
          Entregar
        </ActionButton>
      );
    }
    if (order.status !== 'Entregado' && order.status !== 'Cancelado') {
      buttons.push(
        <ActionButton key="cancelar" onClick={() => onStatusChange(order.id, 'Cancelado')} className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20" icon={XCircle}>
          Cancelar
        </ActionButton>
      );
    }
    return buttons;
  };

  const displayName = order.customer_name || order.users?.name || 'N/A';

  return (
    <>
      <TableRow className={`border-b-slate-200 dark:border-b-purple-800/30 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors duration-150 ${isUpdating ? 'opacity-60' : ''}`}>
        <TableCell className="font-medium text-slate-800 dark:text-gray-200 py-3 px-4">{order.id?.substring(0, 8)}...</TableCell>
        <TableCell className="text-slate-700 dark:text-gray-300 py-3 px-4">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-purple-500 dark:text-purple-400" />
            {displayName}
          </div>
        </TableCell>
        <TableCell className="text-slate-700 dark:text-gray-300 py-3 px-4">{order.branches?.name || 'N/A'}</TableCell>
        <TableCell className="text-slate-500 dark:text-gray-400 text-sm py-3 px-4">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}</TableCell>
        <TableCell className="py-3 px-4">
          <Button variant="link" size="sm" onClick={() => setExpanded(!expanded)} className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 p-0 h-auto">
            {order.order_items?.length || 0} items {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
        </TableCell>
        <TableCell className="text-slate-800 dark:text-gray-200 font-semibold py-3 px-4">{formatGuaranies(order.total_amount)}</TableCell>
        <TableCell className="py-3 px-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(order.status)}`}>
            {order.status}
          </span>
        </TableCell>
        <TableCell className="text-right space-x-1 py-3 px-4">
          {renderActionButtons()}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 h-7 w-7" disabled={isUpdating || isLoadingOverall}>
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-purple-700 text-slate-900 dark:text-gray-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 dark:text-red-400">¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer. Se eliminará el pedido <span className="font-semibold text-purple-700 dark:text-purple-300">#{order.id?.substring(0,8)}...</span> permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-slate-700 dark:text-gray-300 border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteOrder(order)} className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white">
                  Eliminar Pedido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-slate-100 dark:bg-slate-700/30 border-b-slate-200 dark:border-b-purple-800/30">
          <TableCell colSpan={8} className="p-0">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-md shadow-inner">
              <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-2">Detalles del Pedido:</h4>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-xs space-y-1">
                {order.order_items?.map((item, index) => (
                  <li key={item.id || index}>
                    {item.quantity}x {item.products?.name || 'Producto no encontrado'} - {formatGuaranies(item.unit_price)} c/u
                    {item.add_ons && Array.isArray(item.add_ons) && item.add_ons.length > 0 && (
                      <ul className="list-disc list-inside ml-4 text-slate-500 dark:text-slate-400">
                        {item.add_ons.map((addon, addonIndex) => (
                          <li key={addonIndex}>
                            + {addon.name} ({formatGuaranies(addon.price)})
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.notes && <span className="block text-slate-500 dark:text-slate-400 text-xs italic ml-4">Nota: {item.notes}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default AdminOrderRow;
