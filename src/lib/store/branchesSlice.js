
import { supabase } from '@/lib/supabase';

export const branchesSlice = (set, get) => ({
  branches: [],
  isLoadingBranches: false,
  branchesError: null,

  fetchBranches: async () => {
    set({ isLoadingBranches: true, branchesError: null });
    if (!supabase) {
      set({ branchesError: "Supabase client not initialized", isLoadingBranches: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
      if (error) throw error;
      set({ branches: data || [], isLoadingBranches: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching branches:', error);
      set({ branchesError: error.message, isLoadingBranches: false });
      return { success: false, error: error.message };
    }
  },

  addBranch: async (branchData) => {
    set({ isLoadingBranches: true, branchesError: null });
    if (!supabase) {
      set({ branchesError: "Supabase client not initialized", isLoadingBranches: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('branches').insert(branchData).select().single();
      if (error) throw error;
      set(state => ({ branches: [...state.branches, data].sort((a,b) => a.name.localeCompare(b.name)), isLoadingBranches: false }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding branch:', error);
      set({ branchesError: error.message, isLoadingBranches: false });
      return { success: false, error: error.message };
    }
  },

  updateBranch: async (branchId, branchData) => {
    set({ isLoadingBranches: true, branchesError: null });
    if (!supabase) {
      set({ branchesError: "Supabase client not initialized", isLoadingBranches: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { data, error } = await supabase.from('branches').update(branchData).eq('id', branchId).select().single();
      if (error) throw error;
      set(state => ({
        branches: state.branches.map(b => (b.id === branchId ? data : b)).sort((a,b) => a.name.localeCompare(b.name)),
        isLoadingBranches: false,
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating branch:', error);
      set({ branchesError: error.message, isLoadingBranches: false });
      return { success: false, error: error.message };
    }
  },

  deleteBranch: async (branchId) => {
    set({ isLoadingBranches: true, branchesError: null });
    if (!supabase) {
      set({ branchesError: "Supabase client not initialized", isLoadingBranches: false });
      return { success: false, error: "Supabase client not initialized" };
    }
    try {
      const { error } = await supabase.from('branches').delete().eq('id', branchId);
      if (error) throw error;
      set(state => ({
        branches: state.branches.filter(b => b.id !== branchId),
        isLoadingBranches: false,
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting branch:', error);
      set({ branchesError: error.message, isLoadingBranches: false });
      return { success: false, error: error.message };
    }
  },
});
