
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authSlice } from '@/lib/store/auth';
import { branchesSlice } from '@/lib/store/branches';
import { ordersSlice } from '@/lib/store/orders';
import { financialStatsSlice, formatGuaranies as fg } from '@/lib/store/financialStats';
import { productsSlice } from '@/lib/store/products';
import { categoriesSlice } from '@/lib/store/categories';
import { ingredientsSlice } from '@/lib/store/ingredients';
import { stockSlice } from '@/lib/store/stock';

export const formatGuaranies = fg;

const useStore = create(
  persist(
    (set, get) => ({
      ...authSlice(set, get),
      ...branchesSlice(set, get),
      ...ordersSlice(set, get),
      ...financialStatsSlice(set, get),
      ...productsSlice(set, get),
      ...categoriesSlice(set, get),
      ...ingredientsSlice(set, get),
      ...stockSlice(set, get),
    }),
    {
      name: 'lomi-tero-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        user: state.user,
        lastOrderNumber: state.lastOrderNumber,
        branches: state.branches,
        orders: state.orders,
        products: state.products,
        categories: state.categories,
        ingredients: state.ingredients,
        stock: state.stock,
      }),
    }
  )
);

export default useStore;
