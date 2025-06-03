
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
      appInitializationCalled: false, // Added
      ...createAuthSlice(set, get),
      ...createDataSlice(set, get),
      ...createOrdersSlice(set, get),

      initializeApp: async () => {
        if (get().appInitializationCalled) return; // Added guard

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('users') // Changed to 'users'
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Store initializeApp: error fetching profile", profileError);
            await supabase.auth.signOut();
            set({
              isAuthenticated: false,
              user: null,
              role: null,
            });
          } else if (profile) {
            set({
              isAuthenticated: true,
              user: { ...session.user, ...profile }, // Spread session.user first
              role: profile.role
            });
          } else { // No profile and no error, means profile not found
             console.warn("Store initializeApp: profile not found for user", session.user.id);
             await supabase.auth.signOut();
             set({ isAuthenticated: false, user: null, role: null });
          }
        } else if (error) {
          console.error("Store initializeApp: error getting session", error);
          set({ isAuthenticated: false, user: null, role: null });
        }

        // Preserve existing load functions
        await get().loadBranches();
        await get().loadCategories();
        await get().loadProducts();
        await get().loadIngredients();
        await get().loadOrders(); // Consider context for loadOrders if needed

        set({ appInitializationCalled: true }); // Added as last action
      },
    }),
    {
      name: 'lomi-tero-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        user: state.user,
        appInitializationCalled: state.appInitializationCalled // Added for persistence
      }),
    }
  )
);

export default useStore;
