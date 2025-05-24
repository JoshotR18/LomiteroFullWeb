
import React, { useEffect, useState, useMemo } from 'react';
import useStore from '@/lib/store';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, LineChart, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Activity, BarChartBig } from 'lucide-react';
import FinancialStatCard from '@/pages/admin/components/financial_report/FinancialStatCard';
import TopProductsTable from '@/pages/admin/components/financial_report/TopProductsTable';
import RevenueByBranchTable from '@/pages/admin/components/financial_report/RevenueByBranchTable';
import DailyRevenueTable from '@/pages/admin/components/financial_report/DailyRevenueTable';
import BranchSelector from '@/pages/admin/components/financial_report/BranchSelector';

const FinancialReportPage = () => {
  const { 
    sales, 
    isLoadingSales,
    fetchSales, 
    getFinancialStats,
    branches,
    fetchBranches,
    orders,
    fetchOrders,
    products,
    fetchProducts,
   } = useStore(state => ({
    sales: state.sales,
    isLoadingSales: state.isLoadingSales || state.isLoadingFinancialStats, 
    fetchSales: state.fetchSales,
    getFinancialStats: state.getFinancialStats,
    branches: state.branches,
    fetchBranches: state.fetchBranches,
    orders: state.orders,
    fetchOrders: state.fetchOrders,
    products: state.products,
    fetchProducts: state.fetchProducts,
  }));

  const [selectedBranch, setSelectedBranch] = useState('all');
  const [financialStats, setFinancialStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingInitialData(true);
      setError(null);
      try {
        await Promise.all([
          fetchBranches(),
          fetchOrders(),
          fetchProducts(),
          fetchSales(selectedBranch) 
        ]);
      } catch (e) {
        console.error("Error loading initial financial report data:", e);
        setError("Hubo un error al cargar los datos iniciales del reporte.");
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    loadInitialData();
  }, [fetchBranches, fetchOrders, fetchProducts, fetchSales]);
  
  useEffect(() => {
    if (!isLoadingInitialData) {
      fetchSales(selectedBranch);
    }
  }, [selectedBranch, fetchSales, isLoadingInitialData]);

  useEffect(() => {
    if (!isLoadingSales && sales !== null && orders !== null) {
      try {
        const stats = getFinancialStats(selectedBranch);
        setFinancialStats(stats);
      } catch (e) {
        console.error("Error calculating financial stats:", e);
        setError("Hubo un error al calcular las estadísticas financieras.");
        setFinancialStats(null);
      }
    }
  }, [sales, orders, isLoadingSales, selectedBranch, getFinancialStats]);


  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
  };

  const memoizedSalesData = useMemo(() => sales, [sales]);
  const memoizedBranches = useMemo(() => branches, [branches]);
  const memoizedProducts = useMemo(() => products, [products]);


  if (isLoadingInitialData || (isLoadingSales && !financialStats)) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-900 to-purple-900 text-gray-100 p-6">
        <Loader2 className="h-16 w-16 animate-spin text-purple-400 mb-4" />
        <p className="text-xl font-semibold">Cargando Reporte Financiero...</p>
        <p className="text-slate-400">Por favor, espera un momento.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-900 to-red-900 text-gray-100 p-6">
        <AlertTriangle className="h-16 w-16 text-red-400 mb-4" />
        <p className="text-xl font-semibold">Error</p>
        <p className="text-slate-300">{error}</p>
      </div>
    );
  }

  if (!financialStats) {
     return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-900 to-purple-900 text-gray-100 p-6">
        <LineChart className="h-16 w-16 text-purple-400 mb-4" />
        <p className="text-xl font-semibold">No hay datos disponibles</p>
        <p className="text-slate-400">Intenta seleccionar otra sucursal o verifica que haya ventas registradas.</p>
      </div>
    );
  }
  
  const statCards = [
    { title: "Ingresos del Mes", value: financialStats.monthlyRevenue, isCurrency: true, icon: <DollarSign className="h-5 w-5 text-green-400" />, tooltip: "Ingresos totales generados este mes." },
    { title: "Ingresos de Hoy", value: financialStats.dailyRevenue, isCurrency: true, icon: <DollarSign className="h-5 w-5 text-green-400" />, tooltip: "Ingresos totales generados hoy." },
    { title: "Ticket Promedio (Mes)", value: financialStats.averageOrderValue, isCurrency: true, icon: <BarChartBig className="h-5 w-5 text-blue-400" />, tooltip: "Valor promedio de cada venta este mes." },
    { title: "Ventas del Mes", value: financialStats.completedOrders, isCurrency: false, icon: <ShoppingCart className="h-5 w-5 text-purple-400" />, tooltip: "Número de ventas completadas este mes." },
    { title: "Total Pedidos (Mes)", value: financialStats.totalOrders, isCurrency: false, icon: <ShoppingCart className="h-5 w-5 text-purple-400" />, tooltip: "Número total de pedidos creados este mes." },
    { title: "Pedidos Activos", value: financialStats.pendingOrders, isCurrency: false, icon: <Activity className="h-5 w-5 text-orange-400" />, tooltip: "Pedidos que no han sido completados o cancelados." },
    { title: "Clientes Únicos (Mes)", value: financialStats.uniqueCustomersThisMonth, isCurrency: false, icon: <Users className="h-5 w-5 text-teal-400" />, tooltip: "Número de clientes distintos que compraron este mes." },
    { title: "Tasa Conversión (Sim.)", value: financialStats.totalOrders > 0 ? ((financialStats.completedOrders / financialStats.totalOrders) * 100).toFixed(1) + "%" : "0%", isCurrency: false, icon: <TrendingUp className="h-5 w-5 text-indigo-400" />, tooltip: "Ventas completadas / Total pedidos (Simulado)." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 p-4 sm:p-6 text-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight">
          Reporte Financiero Detallado
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Analiza el rendimiento de tu negocio con métricas clave.
        </p>
      </motion.div>

      <BranchSelector 
        selectedBranch={selectedBranch}
        onBranchChange={handleBranchChange}
        branches={memoizedBranches || []}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 mb-8">
        {statCards.map((stat, index) => (
          <FinancialStatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            isCurrency={stat.isCurrency}
            icon={stat.icon}
            tooltipText={stat.tooltip}
            isLoading={isLoadingSales && !financialStats}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable salesData={memoizedSalesData || []} productsList={memoizedProducts || []} />
        
        {selectedBranch === 'all' && memoizedBranches && memoizedBranches.length > 1 && (
          <RevenueByBranchTable salesData={memoizedSalesData || []} branches={memoizedBranches || []} />
        )}
        
        <DailyRevenueTable salesData={memoizedSalesData || []} />
      </div>
    </div>
  );
};

export default FinancialReportPage;
