
import { supabase } from '@/lib/supabase';

export const categoriesSlice = (set, get) => ({
  categories: [],
  isLoadingCategories: false,
  categoriesError: null,

  fetchCategories: async () => {
    set({ isLoadingCategories: true, categoriesError: null });
    if (!supabase) {
      set({ categoriesError: "Supabase client not initialized", isLoadingCategories: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      set({ categories: data || [], isLoadingCategories: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ categoriesError: error.message, isLoadingCategories: false });
      return { success: false, error: error.message };
    }
  },

  addCategory: async (categoryData) => {
    set({ isLoadingCategories: true, categoriesError: null });
    if (!supabase) {
      set({ categoriesError: "Supabase client not initialized", isLoadingCategories: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('categories').insert(categoryData).select().single();
      if (error) throw error;
      set(state => ({ 
        categories: [...state.categories, data].sort((a,b) => a.name.localeCompare(b.name)), 
        isLoadingCategories: false 
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding category:', error);
      set({ categoriesError: error.message, isLoadingCategories: false });
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    set({ isLoadingCategories: true, categoriesError: null });
    if (!supabase) {
      set({ categoriesError: "Supabase client not initialized", isLoadingCategories: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('categories').update(categoryData).eq('id', categoryId).select().single();
      if (error) throw error;
      set(state => ({
        categories: state.categories.map(c => (c.id === categoryId ? data : c)).sort((a,b) => a.name.localeCompare(b.name)),
        isLoadingCategories: false,
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating category:', error);
      set({ categoriesError: error.message, isLoadingCategories: false });
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (categoryId) => {
    set({ isLoadingCategories: true, categoriesError: null });
     if (!supabase) {
      set({ categoriesError: "Supabase client not initialized", isLoadingCategories: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      set(state => ({
        categories: state.categories.filter(c => c.id !== categoryId),
        isLoadingCategories: false,
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ categoriesError: error.message, isLoadingCategories: false });
      return { success: false, error: error.message };
    }
  },
});
