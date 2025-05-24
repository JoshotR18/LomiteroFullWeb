
import { supabase } from '@/lib/supabase';

export const formatGuaranies = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Gs. 0';
  }
  const formatted = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted.replace('PYG', 'Gs.');
};

export const financialStatsSlice = (set, get) => ({
  sales: [],
  isLoadingSales: false,
  isLoadingFinancialStats: false, 
  financialStatsError: null,

  fetchSales: async (branchId = 'all') => {
    if (!supabase) {
      console.error("Supabase client not initialized in fetchSales");
      set({ isLoadingSales: false, sales: [], financialStatsError: "Supabase client not initialized" });
      return { error: "Supabase client not initialized" };
    }
    set({ isLoadingSales: true, financialStatsError: null });
    let query = supabase
      .from('sales')
      .select(`
        *,
        branches (id, name),
        users (id, name, email),
        sale_items (
          *,
          products (id, name)
        )
      `)
      .order('sale_date', { ascending: false });

    if (branchId !== 'all' && branchId !== null && branchId !== undefined) {
      query = query.eq('branch_id', branchId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching sales:', error);
      set({ sales: [], isLoadingSales: false, financialStatsError: error.message });
      return { error: error.message };
    }
    
    set({ sales: data || [], isLoadingSales: false });
    get().getFinancialStats(branchId); 
    return { success: true, data: data || [] };
  },

  getFinancialStats: (branchId = 'all') => {
    const allOrdersFromStore = get().orders || []; 
    const salesForStats = get().sales || []; 
    
    const relevantSales = branchId === 'all' || branchId === null || branchId === undefined
      ? salesForStats
      : salesForStats.filter(sale => sale.branch_id === branchId);

    const relevantOrders = branchId === 'all' || branchId === null || branchId === undefined
      ? allOrdersFromStore
      : allOrdersFromStore.filter(order => order.branch_id === branchId);

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
    const firstDayNextMonth = new Date(currentYear, currentMonth + 1, 1);


    const dailyRevenue = relevantSales
      .filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= today && saleDate < tomorrow;
      })
      .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

    const monthlyRevenue = relevantSales
      .filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= firstDayCurrentMonth && saleDate < firstDayNextMonth;
      })
      .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    
    const totalSalesThisMonth = relevantSales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= firstDayCurrentMonth && saleDate < firstDayNextMonth;
    }).length;

    const averageOrderValue = totalSalesThisMonth > 0 
      ? monthlyRevenue / totalSalesThisMonth
      : 0;

    const pendingOrders = relevantOrders.filter(order => 
        order.status && !['Entregado', 'Cancelado', 'Pagado'].includes(order.status)
    ).length;
    
    const totalOrdersThisMonth = relevantOrders.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    const uniqueCustomersThisMonth = new Set(
      relevantSales
        .filter(sale => {
          if (!sale.sale_date || !sale.user_id) return false;
          const saleDate = new Date(sale.sale_date);
          return saleDate >= firstDayCurrentMonth && saleDate < firstDayNextMonth;
        })
        .map(sale => sale.user_id)
    ).size;

    return {
      dailyRevenue,
      monthlyRevenue,
      pendingOrders,
      completedOrders: totalSalesThisMonth, 
      totalOrders: totalOrdersThisMonth,
      averageOrderValue,
      uniqueCustomersThisMonth,
    };
  },
});
