
import { supabase } from '@/lib/supabase';

export const ingredientsSlice = (set, get) => ({
  ingredients: [],
  isLoadingIngredients: false,
  ingredientsError: null,

  fetchIngredients: async () => {
    set({ isLoadingIngredients: true, ingredientsError: null });
    if (!supabase) {
      set({ ingredientsError: "Supabase client not initialized", isLoadingIngredients: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('ingredients').select('*').order('name', { ascending: true });
      if (error) throw error;
      set({ ingredients: data || [], isLoadingIngredients: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      set({ ingredientsError: error.message, isLoadingIngredients: false });
      return { success: false, error: error.message };
    }
  },

  addIngredient: async (ingredientData) => {
    set({ isLoadingIngredients: true, ingredientsError: null });
    if (!supabase) {
      set({ ingredientsError: "Supabase client not initialized", isLoadingIngredients: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('ingredients').insert(ingredientData).select().single();
      if (error) throw error;
      set(state => ({ 
        ingredients: [...state.ingredients, data].sort((a,b) => a.name.localeCompare(b.name)), 
        isLoadingIngredients: false 
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding ingredient:', error);
      set({ ingredientsError: error.message, isLoadingIngredients: false });
      return { success: false, error: error.message };
    }
  },

  updateIngredient: async (ingredientId, ingredientData) => {
    set({ isLoadingIngredients: true, ingredientsError: null });
    if (!supabase) {
      set({ ingredientsError: "Supabase client not initialized", isLoadingIngredients: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('ingredients').update(ingredientData).eq('id', ingredientId).select().single();
      if (error) throw error;
      set(state => ({
        ingredients: state.ingredients.map(i => (i.id === ingredientId ? data : i)).sort((a,b) => a.name.localeCompare(b.name)),
        isLoadingIngredients: false,
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating ingredient:', error);
      set({ ingredientsError: error.message, isLoadingIngredients: false });
      return { success: false, error: error.message };
    }
  },

  deleteIngredient: async (ingredientId) => {
    set({ isLoadingIngredients: true, ingredientsError: null });
    if (!supabase) {
      set({ ingredientsError: "Supabase client not initialized", isLoadingIngredients: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      await supabase.from('product_ingredients').delete().eq('ingredient_id', ingredientId);
      await supabase.from('stock_by_branch').delete().eq('ingredient_id', ingredientId);
      await supabase.from('product_add_ons').delete().eq('ingredient_id', ingredientId);
      
      const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId);
      if (error) throw error;
      
      set(state => ({
        ingredients: state.ingredients.filter(i => i.id !== ingredientId),
        isLoadingIngredients: false,
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      set({ ingredientsError: error.message, isLoadingIngredients: false });
      return { success: false, error: error.message };
    }
  },
});
