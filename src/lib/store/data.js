
import { supabase } from '../supabase';

export const createDataSlice = (set, get) => ({
  branches: [],
  categories: [],
  products: [],
  ingredients: [],
  orders: [],

  loadBranches: async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ branches: data });
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  },

  loadCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ categories: data });
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  },

  loadProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name');
      
      if (error) throw error;
      set({ products: data });
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  },

  loadIngredients: async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ ingredients: data });
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
    }
  },

  loadOrders: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          branch:branches(*),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ orders: data });
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  },
});
