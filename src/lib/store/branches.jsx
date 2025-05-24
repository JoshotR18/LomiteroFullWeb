
import { supabase } from '@/lib/supabase';

export const branchesSlice = (set, get) => ({
  branches: [],
  fetchBranches: async () => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
    if (error) {
      console.error('Error fetching branches:', error);
      return { error: error.message };
    }
    set({ branches: data });
    return { success: true, data };
  },
  addBranch: async (branchData) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    
    const { id, ...newBranchData } = branchData;

    const { data, error } = await supabase
      .from('branches')
      .insert([newBranchData])
      .select();
      
    if (error) {
      console.error('Error adding branch:', error);
      return { error: error.message };
    }
    await get().fetchBranches(); 
    return { success: true, data: data[0] };
  },
  updateBranch: async (id, branchData) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { data, error } = await supabase.from('branches').update(branchData).eq('id', id).select();
    if (error) {
      console.error('Error updating branch:', error);
      return { error: error.message };
    }
    await get().fetchBranches();
    return { success: true, data: data[0] };
  },
  deleteBranch: async (id) => {
    if (!supabase) return { error: "Supabase client not initialized" };
    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) {
      console.error('Error deleting branch:', error);
      return { error: error.message };
    }
    await get().fetchBranches();
    return { success: true };
  },
});
