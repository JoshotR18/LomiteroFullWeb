
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Edit, Leaf, Box, PackagePlus as PackageIcon, Minus } from 'lucide-react';

const StockTableRow = ({ item, onUpdateStock, isCalculated }) => {
  const isNumericStock = typeof item.current_stock === 'number';
  
  const stockStatusColor = isNumericStock && item.current_stock <= item.min_stock 
    ? (item.current_stock === 0 ? 'text-red-400' : 'text-yellow-400') 
    : (isNumericStock ? 'text-green-400' : 'text-slate-400');
  
  const stockStatusIcon = isNumericStock && item.current_stock <= item.min_stock 
    ? <AlertTriangle className={`h-5 w-5 mr-1 ${stockStatusColor}`} />
    : (isNumericStock ? <CheckCircle2 className={`h-5 w-5 mr-1 ${stockStatusColor}`} /> : <Minus className={`h-5 w-5 mr-1 ${stockStatusColor}`} />);

  let ItemIcon = Leaf; 
  let itemIconColor = 'text-green-500';

  if (item.itemType === 'product_direct') {
    ItemIcon = Box;
    itemIconColor = 'text-blue-500';
  } else if (item.itemType === 'product_calculated') {
    ItemIcon = PackageIcon;
    itemIconColor = 'text-purple-500';
  }


  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
        <div className="flex items-center">
          <ItemIcon className={`h-5 w-5 mr-2 ${itemIconColor}`} />
          {item.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">{item.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">{item.unit}</td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${stockStatusColor}`}>
        {isNumericStock ? item.current_stock : item.current_stock}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {isNumericStock ? item.min_stock : item.min_stock}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`flex items-center ${stockStatusColor}`}>
          {stockStatusIcon}
          {isNumericStock 
            ? (item.current_stock <= item.min_stock ? (item.current_stock === 0 ? 'Agotado' : 'Bajo Stock') : 'En Stock')
            : (item.current_stock === 'N/A' ? 'No Calculable' : 'Calculado')
          }
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {!isCalculated ? (
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
          <span className="text-xs text-muted-foreground italic">Automático</span>
        )}
      </td>
    </tr>
  );
};

export default StockTableRow;
