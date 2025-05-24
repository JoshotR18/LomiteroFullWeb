
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatGuaranies } from '@/lib/store/financialStats';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';

const RevenueByBranchTable = ({ salesData, branches }) => {
  const getRevenueByBranch = () => {
    if (!salesData || !Array.isArray(salesData) || salesData.length === 0 || 
        !branches || !Array.isArray(branches) || branches.length === 0) {
      return [];
    }

    const revenueMap = new Map();
    branches.forEach(branch => revenueMap.set(branch.id, { name: branch.name, revenue: 0, salesCount: 0 }));

    salesData.forEach(sale => {
      if (revenueMap.has(sale.branch_id)) {
        const current = revenueMap.get(sale.branch_id);
        current.revenue += sale.total_amount;
        current.salesCount += 1;
        revenueMap.set(sale.branch_id, current);
      }
    });
    return Array.from(revenueMap.values()).sort((a,b) => b.revenue - a.revenue);
  };

  const revenueByBranch = getRevenueByBranch();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card className="bg-slate-800/60 border-purple-700/40 text-gray-100 backdrop-blur-md shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-purple-300 text-xl">Ingresos por Sucursal (Mes)</CardTitle>
          </div>
          <CardDescription className="text-slate-400">Basado en ventas registradas este mes.</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueByBranch.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700/50 hover:bg-slate-700/30">
                  <TableHead className="text-purple-300">Sucursal</TableHead>
                  <TableHead className="text-purple-300 text-right">Nº Ventas</TableHead>
                  <TableHead className="text-purple-300 text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueByBranch.map((branchData) => (
                  <TableRow key={branchData.name} className="border-b-purple-800/30 hover:bg-slate-700/40">
                    <TableCell className="font-medium text-gray-200">{branchData.name}</TableCell>
                    <TableCell className="text-gray-300 text-right">{branchData.salesCount}</TableCell>
                    <TableCell className="text-gray-300 text-right">{formatGuaranies(branchData.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-slate-400 text-center py-4">No hay datos de ventas por sucursal para mostrar o no hay sucursales definidas.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RevenueByBranchTable;
