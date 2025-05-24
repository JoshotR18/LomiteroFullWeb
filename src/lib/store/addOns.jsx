
import { supabase } from '@/lib/supabase';

export const addOnsSlice = (set, get) => ({
  productAddOns: [],
  isLoadingAddOns: false,
  addOnsError: null,

  fetchProductAddOns: async (productId = null) => {
    set({ isLoadingAddOns: true, addOnsError: null });
    if (!supabase) {
      set({ addOnsError: "Supabase client not initialized", isLoadingAddOns: false });
      return { error: "Supabase client not initialized" };
    }

    let query = supabase
      .from('product_add_ons')
      .select(`
        *,
        ingredients (id, name, unit),
        products (id, name)
      `)
      .order('name', { ascending: true });

    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching product add-ons:', error);
      set({ addOnsError: error.message, isLoadingAddOns: false, productAddOns: [] });
      return { error: error.message };
    }
    
    set({ productAddOns: data || [], isLoadingAddOns: false });
    return { success: true, data: data || [] };
  },

  addAddOn: async (addOnData) => {
    set({ isLoadingAddOns: true, addOnsError: null });
    if (!supabase) {
      set({ addOnsError: "Supabase client not initialized", isLoadingAddOns: false });
      return { error: "Supabase client not initialized" };
    }

    const { data, error } = await supabase
      .from('product_add_ons')
      .insert([addOnData])
      .select(`
        *,
        ingredients (id, name, unit),
        products (id, name)
      `)
      .single();

    if (error) {
      console.error('Error adding add-on:', error);
      set({ addOnsError: error.message, isLoadingAddOns: false });
      return { error: error.message };
    }

    set(state => ({
      productAddOns: [...state.productAddOns, data].sort((a, b) => a.name.localeCompare(b.name)),
      isLoadingAddOns: false
    }));
    return { success: true, data };
  },

  updateAddOn: async (id, addOnData) => {
    set({ isLoadingAddOns: true, addOnsError: null });
    if (!supabase) {
      set({ addOnsError: "Supabase client not initialized", isLoadingAddOns: false });
      return { error: "Supabase client not initialized" };
    }

    const { data, error } = await supabase
      .from('product_add_ons')
      .update(addOnData)
      .eq('id', id)
      .select(`
        *,
        ingredients (id, name, unit),
        products (id, name)
      `)
      .single();

    if (error) {
      console.error('Error updating add-on:', error);
      set({ addOnsError: error.message, isLoadingAddOns: false });
      return { error: error.message };
    }

    set(state => ({
      productAddOns: state.productAddOns.map(ao => (ao.id === id ? data : ao)).sort((a, b) => a.name.localeCompare(b.name)),
      isLoadingAddOns: false
    }));
    return { success: true, data };
  },

  deleteAddOn: async (id) => {
    set({ isLoadingAddOns: true, addOnsError: null });
    if (!supabase) {
      set({ addOnsError: "Supabase client not initialized", isLoadingAddOns: false });
      return { error: "Supabase client not initialized" };
    }

    const { error } = await supabase
      .from('product_add_ons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting add-on:', error);
      set({ addOnsError: error.message, isLoadingAddOns: false });
      return { error: error.message };
    }

    set(state => ({
      productAddOns: state.productAddOns.filter(ao => ao.id !== id),
      isLoadingAddOns: false
    }));
    return { success: true };
  },
});
