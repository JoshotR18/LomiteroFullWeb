
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit2, Trash2, CheckCircle, XCircle, ImageOff, Package, BarChartBig } from 'lucide-react';
import { formatGuaranies } from '@/lib/store/financialStats';

const ProductRow = ({ product, categories, ingredientsList, onEdit, onDelete }) => {
  const category = categories.find(c => c.id === product.category_id);
  
  let stockInfoDisplay = 'N/A';
  if (product.stock_control_type === 'direct') {
    stockInfoDisplay = (
      <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-300 py-1 px-2 rounded-full text-xs">
        <BarChartBig className="mr-1 h-3 w-3" />
        Stock Directo
      </Badge>
    );
  } else if (product.ingredients && product.ingredients.length > 0) {
    stockInfoDisplay = product.ingredients.map(ing => {
      const fullIngredient = ingredientsList.find(i => i.id === ing.id);
      return `${ing.quantity}${fullIngredient?.unit || ''} ${fullIngredient?.name || ing.name || 'Desconocido'}`;
    }).join(', ');
  }


  return (
    <TableRow className="border-slate-800 hover:bg-slate-800/50 transition-colors group">
      <TableCell className="font-medium text-slate-200">
        <div className="flex items-center">
          {product.image_url ? (
            <img  class="h-12 w-12 rounded-lg object-cover mr-4 shadow-md border-2 border-slate-700 group-hover:border-emerald-500 transition-all" alt={product.name} src={product.image_url} />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-slate-700 mr-4 flex items-center justify-center text-slate-500 shadow-md border-2 border-slate-700 group-hover:border-emerald-500 transition-all">
              <Package size={28} />
            </div>
          )}
          <span className="group-hover:text-emerald-400 transition-colors">{product.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-slate-400">
        {category ? (
          <div className="flex items-center">
            {category.icon && <span className="mr-2 text-lg text-slate-500">{category.icon}</span>}
            {category.name}
          </div>
        ) : <span className="text-slate-500 italic">Sin categoría</span>}
      </TableCell>
      <TableCell className="text-slate-300 font-semibold">{formatGuaranies(product.price)}</TableCell>
      <TableCell className="text-slate-400 text-xs max-w-xs truncate" title={typeof stockInfoDisplay === 'string' ? stockInfoDisplay : 'Stock Directo por Sucursal'}>
        {stockInfoDisplay}
      </TableCell>
      <TableCell>
        {product.active ? (
          <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-400 py-1 px-3 rounded-full text-xs">
            <CheckCircle className="mr-1 h-3 w-3" />
            Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-500/20 border-red-500 text-red-400 py-1 px-3 rounded-full text-xs">
            <XCircle className="mr-1 h-3 w-3" />
            Inactivo
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400 hover:bg-slate-700">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
            <DropdownMenuItem onClick={() => onEdit(product)} className="hover:bg-slate-700 focus:bg-slate-700 hover:text-emerald-400 focus:text-emerald-400">
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(product)} className="hover:bg-slate-700 focus:bg-slate-700 hover:text-red-400 focus:text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
