
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice } from './auth';
import { createDataSlice } from './data';
import { createOrdersSlice } from './orders';
import { supabase } from '../supabase';

export const formatGuaranies = (amount) => {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const useStore = create(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createDataSlice(set, get),
      ...createOrdersSlice(set, get),

      initializeApp: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({ 
            isAuthenticated: true,
            user: { ...session.user, ...profile },
            role: profile.role
          });
        }

        await get().loadBranches();
        await get().loadCategories();
        await get().loadProducts();
        await get().loadIngredients();
        await get().loadOrders();
      },
    }),
    {
      name: 'lomi-tero-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        user: state.user
      }),
    }
  )
);

export default useStore;
