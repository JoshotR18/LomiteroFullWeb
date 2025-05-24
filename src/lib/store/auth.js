
import { supabase } from '../supabase';

export const createAuthSlice = (set, get) => ({
  isAuthenticated: false,
  role: null,
  user: null,

  login: async (credentials, role) => {
    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email || credentials.username,
        password: credentials.password
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== role) {
        throw new Error('Rol no autorizado');
      }

      set({ 
        isAuthenticated: true,
        user: { ...data.user, ...profile },
        role: profile.role
      });

      return { success: true };
    } catch (error) {
      console.error('Error de login:', error);
      return { error: error.message };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        isAuthenticated: false, 
        role: null,
        user: null
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },
});
