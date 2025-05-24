
import { supabase } from '@/lib/supabase';

export const categoriesSlice = (set, get) => ({
  categories: [],
  fetchCategories: async () => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
      console.error('Error fetching categories:', error);
      return { error: error.message };
    }
    set({ categories: data });
    return { success: true, data };
  },
  addCategory: async (categoryData) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase.from('categories').insert([categoryData]).select().single();
    if (error) {
      console.error('Error adding category:', error);
      return { error: error.message };
    }
    await get().fetchCategories();
    return { success: true, data };
  },
  updateCategory: async (id, categoryData) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select().single();
    if (error) {
      console.error('Error updating category:', error);
      return { error: error.message };
    }
    await get().fetchCategories();
    return { success: true, data };
  },
  deleteCategory: async (id) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category:', error);
      return { error: error.message };
    }
    await get().fetchCategories();
    return { success: true };
  },
});
