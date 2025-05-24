
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Store, ServerCrash, FileQuestion, Loader2, PackageSearch } from 'lucide-react';
import StockTableRow from '@/pages/admin/components/stock/StockTableRow';


const StockTable = ({ items, onUpdateStock, isLoading, stockError, selectedBranch, searchTerm, onRefresh, hasAttemptedStockFetch }) => {
  
  if (!selectedBranch) {
    return (
      <div className="text-center py-16 px-4 text-muted-foreground">
        <Store className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Selecciona una Sucursal</h3>
        <p>Debes seleccionar una sucursal para ver y gestionar el stock.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  if (stockError) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-md mx-4 my-4">
        <ServerCrash className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error al cargar el stock</h3>
        <p className="text-red-600 dark:text-red-400">{typeof stockError === 'string' ? stockError : stockError.message || "Error desconocido"}</p>
        <Button onClick={onRefresh} className="mt-4">Reintentar</Button>
      </div>
    );
  }
  
  if (!hasAttemptedStockFetch && items.length === 0 && selectedBranch) {
     return (
      <div className="text-center py-16 px-4 text-muted-foreground">
        <PackageSearch className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Stock no cargado</h3>
        <p>El stock para {selectedBranch.name} aún no se ha cargado. Puede que necesites refrescar.</p>
         <Button onClick={onRefresh} className="mt-4">Cargar Stock</Button>
      </div>
    );
  }


  if (items.length === 0 && hasAttemptedStockFetch) {
    return (
      <div className="text-center py-16 px-4 text-muted-foreground">
        <FileQuestion className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No se encontraron items</h3>
        <p>{searchTerm ? "Intenta con otro término de búsqueda." : `No hay items de stock para ${selectedBranch.name} o los productos/ingredientes base no están cargados.`}</p>
      </div>
    );
  }
  

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Unidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Mínimo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {items.map((item) => (
            <StockTableRow
              key={`${item.itemType}-${item.id}-${item.stock_entry_id || item.name}`}
              item={item}
              onUpdateStock={() => !item.isCalculated && onUpdateStock(item, item.itemType)}
              isCalculated={item.isCalculated}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
