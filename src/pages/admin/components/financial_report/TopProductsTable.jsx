
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatGuaranies } from '@/lib/store/financialStats';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const TopProductsTable = ({ salesData, productsList }) => {
  const getTopSellingProducts = () => {
    if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
      return [];
    }

    const productSales = {};
    salesData.forEach(sale => {
      if (sale.sale_items && Array.isArray(sale.sale_items)) {
        sale.sale_items.forEach(item => {
          let productName = item.products?.name || 'Producto Desconocido';
          let productDetails = null;

          if (productsList && Array.isArray(productsList)) {
            productDetails = productsList.find(p => p.id === item.product_id);
            if (productDetails && productDetails.name) {
              productName = productDetails.name;
            }
          }
          
          if (!productSales[productName]) {
            productSales[productName] = { quantity: 0, revenue: 0, itemsSold: 0 };
          }
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += item.total_price;
          productSales[productName].itemsSold += item.quantity;
        });
      }
    });

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const topProducts = getTopSellingProducts();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className="bg-slate-800/60 border-purple-700/40 text-gray-100 backdrop-blur-md shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-purple-300 text-xl">Top 5 Productos (por Ingresos)</CardTitle>
          </div>
          <CardDescription className="text-slate-400">Basado en ventas registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700/50 hover:bg-slate-700/30">
                  <TableHead className="text-purple-300">Producto</TableHead>
                  <TableHead className="text-purple-300 text-right">Unidades</TableHead>
                  <TableHead className="text-purple-300 text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={index} className="border-b-purple-800/30 hover:bg-slate-700/40">
                    <TableCell className="font-medium text-gray-200">{product.name}</TableCell>
                    <TableCell className="text-gray-300 text-right">{product.itemsSold}</TableCell>
                    <TableCell className="text-gray-300 text-right">{formatGuaranies(product.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-slate-400 text-center py-4">No hay suficientes datos de ventas o productos para mostrar los productos más vendidos.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopProductsTable;
