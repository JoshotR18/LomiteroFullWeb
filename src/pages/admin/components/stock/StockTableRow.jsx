
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Edit, Leaf, Box, PackagePlus as PackageIcon, Minus, HelpCircle } from 'lucide-react';

const StockTableRow = ({ item, onUpdateStock, isCalculated }) => {
  const isNumericStock = typeof item.current_stock === 'number' && !isNaN(item.current_stock);
  const isNumericMinStock = typeof item.min_stock === 'number' && !isNaN(item.min_stock);
  
  const currentStockDisplay = isNumericStock ? item.current_stock : (item.current_stock === 'N/A' ? 'N/A' : 'Error');
  const minStockDisplay = isNumericMinStock ? item.min_stock : (item.min_stock === 'N/A' ? 'N/A' : 'Error');

  let stockStatus = 'En Stock';
  let stockStatusColor = 'text-green-400';
  let StockIcon = CheckCircle2;

  if (isCalculated) {
    stockStatus = item.current_stock === 'N/A' ? 'No Calculable' : 'Calculado';
    stockStatusColor = 'text-slate-400';
    StockIcon = item.current_stock === 'N/A' ? HelpCircle : CheckCircle2;
  } else if (!isNumericStock || !isNumericMinStock) {
      stockStatus = 'Datos Inválidos';
      stockStatusColor = 'text-orange-400';
      StockIcon = HelpCircle;
  } else if (item.current_stock <= item.min_stock) {
    stockStatus = item.current_stock === 0 ? 'Agotado' : 'Bajo Stock';
    stockStatusColor = item.current_stock === 0 ? 'text-red-400' : 'text-yellow-400';
    StockIcon = AlertTriangle;
  }


  let ItemIconComponent = Leaf; 
  let itemIconColor = 'text-green-500';

  if (item.itemType === 'product_direct') {
    ItemIconComponent = Box;
    itemIconColor = 'text-blue-500';
  } else if (item.itemType === 'product_calculated') {
    ItemIconComponent = PackageIcon;
    itemIconColor = 'text-purple-500';
  }


  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
        <div className="flex items-center">
          <ItemIconComponent className={`h-5 w-5 mr-2 ${itemIconColor}`} />
          {item.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">{item.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">{item.unit || 'unidad'}</td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${stockStatusColor}`}>
        {currentStockDisplay}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {minStockDisplay}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`flex items-center ${stockStatusColor}`}>
          <StockIcon className={`h-5 w-5 mr-1 ${stockStatusColor}`} />
          {stockStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {!isCalculated && (item.itemType === 'ingredient' || item.itemType === 'product_direct') ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdateStock}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            Ajustar
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">{isCalculated ? 'Automático' : 'No editable aquí'}</span>
        )}
      </td>
    </tr>
  );
};

export default StockTableRow;
