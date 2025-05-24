
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const StockPageHeader = ({ onRefresh, isLoading, selectedBranch }) => (
  <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
        Control de Stock
      </h1>
      <p className="text-muted-foreground mt-1">Monitorea y ajusta el inventario por sucursal.</p>
    </div>
    <Button onClick={onRefresh} disabled={isLoading || !selectedBranch} className="bg-indigo-500 hover:bg-indigo-600 text-white">
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      Actualizar Datos
    </Button>
  </header>
);

export default StockPageHeader;
