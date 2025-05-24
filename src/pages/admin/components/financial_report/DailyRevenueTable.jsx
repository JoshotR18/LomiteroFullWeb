
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatGuaranies } from '@/lib/store/financialStats';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

const DailyRevenueTable = ({ salesData }) => {
  const getDailyRevenue = () => {
    const dailyData = {};
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);


    salesData.forEach(sale => {
      const saleDate = new Date(sale.sale_date);
      if (saleDate >= sevenDaysAgo) {
        const dateString = saleDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit'});
        dailyData[dateString] = (dailyData[dateString] || 0) + sale.total_amount;
      }
    });

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => {
        const datePartsA = a.date.split('/');
        const datePartsB = b.date.split('/');
        const dateA = new Date(+datePartsA[2], datePartsA[1] - 1, +datePartsA[0]);
        const dateB = new Date(+datePartsB[2], datePartsB[1] - 1, +datePartsB[0]);
        return dateB - dateA; // Sort descending
      });
  };

  const dailyRevenue = getDailyRevenue();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <Card className="bg-slate-800/60 border-purple-700/40 text-gray-100 backdrop-blur-md shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-purple-300 text-xl">Ingresos Diarios (Últimos 7 días)</CardTitle>
          </div>
          <CardDescription className="text-slate-400">Basado en ventas registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRevenue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b-purple-700/50 hover:bg-slate-700/30">
                  <TableHead className="text-purple-300">Fecha</TableHead>
                  <TableHead className="text-purple-300 text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyRevenue.map((day, index) => (
                  <TableRow key={index} className="border-b-purple-800/30 hover:bg-slate-700/40">
                    <TableCell className="font-medium text-gray-200">{day.date}</TableCell>
                    <TableCell className="text-gray-300 text-right">{formatGuaranies(day.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-slate-400 text-center py-4">No hay datos de ingresos diarios para mostrar en los últimos 7 días.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyRevenueTable;
