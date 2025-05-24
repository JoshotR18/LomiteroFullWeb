
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, TrendingUp, Building2, UtensilsCrossed as UtensilsCross, Package, AlertTriangle } from 'lucide-react';
import useStore, { formatGuaranies } from '@/lib/store';

const StatCard = ({ title, value, icon, description, linkTo, linkText, colorClass }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${colorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {linkTo && (
          <Button variant="link" asChild className="px-0 pt-2 text-primary">
            <Link to={linkTo}>{linkText} &rarr;</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboardPage = () => {
  const { 
    getFinancialStats, 
    ingredients, 
    orders, 
    fetchOrders, 
    fetchIngredients,
    fetchSales,
    isLoadingSales,
    isLoadingOrders,
    isLoadingIngredients
  } = useStore(state => ({
    getFinancialStats: state.getFinancialStats,
    ingredients: state.ingredients,
    orders: state.orders,
    fetchOrders: state.fetchOrders,
    fetchIngredients: state.fetchIngredients,
    fetchSales: state.fetchSales,
    isLoadingSales: state.isLoadingSales,
    isLoadingOrders: state.isLoadingOrders,
    isLoadingIngredients: state.isLoadingIngredients,
  }));
  
  React.useEffect(() => {
    fetchOrders();
    fetchIngredients();
    fetchSales('all'); 
  }, [fetchOrders, fetchIngredients, fetchSales]);

  const stats = getFinancialStats('all'); 
  
  const lowStockIngredients = ingredients.filter(ing => ing.current_stock <= ing.min_stock);
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const quickActions = [
    { name: "Nueva Sucursal", icon: <Building2 className="h-5 w-5 mr-2" />, path: "/admin/branches", color: "bg-purple-500 hover:bg-purple-600" },
    { name: "Nuevo Producto", icon: <ShoppingBag className="h-5 w-5 mr-2" />, path: "/admin/products", color: "bg-pink-500 hover:bg-pink-600" },
    { name: "Nuevo Ingrediente", icon: <UtensilsCross className="h-5 w-5 mr-2" />, path: "/admin/ingredients", color: "bg-orange-500 hover:bg-orange-600" },
    { name: "Ver Pedidos", icon: <Package className="h-5 w-5 mr-2" />, path: "/admin/orders", color: "bg-teal-500 hover:bg-teal-600" },
  ];

  if (isLoadingSales || isLoadingOrders || isLoadingIngredients) {
    return (
      <div className="flex items-center justify-center h-full text-slate-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full"
        />
        <p className="ml-4 text-xl">Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Panel de Administración</h1>
        <p className="text-muted-foreground text-lg">Resumen general de tu negocio.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos del Día"
          value={formatGuaranies(stats.dailyRevenue)}
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          description="Ventas totales de hoy"
          colorClass="border-green-500"
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatGuaranies(stats.monthlyRevenue)}
          icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
          description="Ventas totales del mes actual"
          colorClass="border-blue-500"
        />
        <StatCard
          title="Pedidos Pendientes"
          value={stats.pendingOrders.toString()}
          icon={<Package className="h-5 w-5 text-yellow-500" />}
          description="Pedidos por procesar"
          colorClass="border-yellow-500"
        />
        <StatCard
          title="Ventas del Mes"
          value={stats.completedOrders.toString()}
          icon={<ShoppingBag className="h-5 w-5 text-purple-500" />}
          description="Total de ventas registradas este mes"
          colorClass="border-purple-500"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Realiza acciones comunes rápidamente.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {quickActions.map(action => (
                <Button key={action.name} asChild className={`w-full text-white ${action.color}`}>
                  <Link to={action.path}>
                    {action.icon}
                    {action.name}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Notificaciones importantes que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {lowStockIngredients.map(ingredient => (
                  <li key={ingredient.id} className="flex items-center">
                    <span className="bg-yellow-500 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">STOCK BAJO</span>
                    {ingredient.name} - Quedan {ingredient.current_stock} {ingredient.unit}
                  </li>
                ))}
                {stats.pendingOrders > 0 && orders.filter(o => o.status === 'Pendiente').slice(0,3).map(order => (
                  <li key={order.id} className="flex items-center">
                    <span className="bg-blue-500 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">PEDIDO</span>
                    {order.id.substring(0,8)}... - {formatGuaranies(order.total_amount)}
                  </li>
                ))}
                {lowStockIngredients.length === 0 && stats.pendingOrders === 0 && (
                  <li className="text-center text-muted-foreground">
                    No hay alertas pendientes
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="shadow-lg animated-gradient-bg text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Resumen Financiero</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Análisis rápido del rendimiento financiero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Ingresos del Día</p>
                <p className="text-2xl font-bold">{formatGuaranies(stats.dailyRevenue)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Ingresos del Mes</p>
                <p className="text-2xl font-bold">{formatGuaranies(stats.monthlyRevenue)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-primary-foreground/20">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full bg-white/90 text-primary hover:bg-white"
                asChild
              >
                <Link to="/admin/financial-report">
                  Ver Reporte Completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;
