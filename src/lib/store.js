
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

import { authSlice } from '@/lib/store/authSlice';
import { branchesSlice } from '@/lib/store/branchesSlice';
import { categoriesSlice } from '@/lib/store/categoriesSlice';
import { ingredientsSlice } from '@/lib/store/ingredientsSlice';
import { ordersSlice } from '@/lib/store/orders.jsx'; // Corrected import
import { productsSlice } from '@/lib/store/products.jsx';
import { stockSlice } from '@/lib/store/stockSlice';
import { financialStatsSlice, formatGuaranies as fg } from '@/lib/store/financialStatsSlice';

export const formatGuaranies = fg;

const storeImplementation = (set, get) => ({
  ...authSlice(set, get),
  ...branchesSlice(set, get),
  ...categoriesSlice(set, get),
  ...ingredientsSlice(set, get),
  ...ordersSlice(set, get), // Uses the corrected import
  ...productsSlice(set, get), 
  ...stockSlice(set, get),
  ...financialStatsSlice(set, get),

  appInitializationCalled: false,
  initializeApp: async () => {
    if (get().appInitializationCalled) {
      console.log("App initialization already called.");
      return;
    }
    set({ appInitializationCalled: true });
    console.log("initializeApp called in store");

    await get().checkSession(); 
    
    if (get().isAuthenticated) {
      console.log("User is authenticated, fetching initial data...");
      try {
        await get().fetchUserProfile(); 
        
        const fetchPromises = [
          get().fetchBranches(),
          get().fetchCategories(),
          get().fetchIngredients(),
          get().fetchProducts(),
        ];
        
        const currentRole = get().role;
        const currentUserId = get().user?.id;

        if (currentRole === 'admin' || currentRole === 'staff' || currentRole === 'kitchen') {
          fetchPromises.push(get().fetchOrders());
        }
        if (currentRole === 'admin'){
          fetchPromises.push(get().fetchAllStockData());
          fetchPromises.push(get().fetchSalesForStats());
        }
        if (currentRole === 'client' && currentUserId){
           fetchPromises.push(get().fetchClientOrders(currentUserId));
        }

        const results = await Promise.allSettled(fetchPromises);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error fetching data for promise ${index}:`, result.reason);
          } else {
            console.log(`Successfully fetched data for promise ${index}`);
          }
        });
        console.log("All initial data fetched (or attempted). Branches:", get().branches);
      } catch (error) {
        console.error("Error during initial data fetching:", error);
      }
    } else {
      console.log("User not authenticated, skipping initial data fetch.");
    }
  },
});

const useStore = create(
  persist(
    storeImplementation,
    {
      name: 'lomi-tero-app-storage-v3', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        role: state.role,
        appInitializationCalled: state.appInitializationCalled,
      }),
      version: 3, 
      migrate: (persistedState, version) => {
        if (version < 2) {
        }
        if (version < 3) {
        }
        return persistedState;
      },
    }
  )
);

export default useStore;
