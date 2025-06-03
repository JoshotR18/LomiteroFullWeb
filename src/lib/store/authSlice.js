
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/authUtils';

export const createAuthSlice = (set, get) => ({
  isAuthenticated: false,
  user: null,
  role: null,
  authLoading: false,
  authError: null,

  setAuthLoading: (isLoading) => set({ authLoading: isLoading }),
  setAuthError: (error) => set({ authError: error }),

  login: async (email, password, role) => {
    get().setAuthLoading(true);
    get().setAuthError(null);
    try {
      const { data: { user: authUser, session }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        get().setAuthLoading(false);
        get().setAuthError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (!authUser) {
        get().setAuthLoading(false);
        get().setAuthError('Usuario no encontrado o contraseña incorrecta.');
        return { success: false, error: 'Usuario no encontrado o contraseña incorrecta.' };
      }
      
      const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (publicUserError || !publicUser) {
        get().setAuthLoading(false);
        get().setAuthError(publicUserError?.message || 'Datos de usuario no encontrados.');
        await supabase.auth.signOut(); 
        return { success: false, error: publicUserError?.message || 'Datos de usuario no encontrados.' };
      }

      if (publicUser.role !== role) {
        get().setAuthLoading(false);
        get().setAuthError(`Acceso denegado. Rol de usuario (${publicUser.role}) no coincide con el rol de inicio de sesión (${role}).`);
        await supabase.auth.signOut();
        return { success: false, error: `Acceso denegado. Rol de usuario (${publicUser.role}) no coincide con el rol de inicio de sesión (${role}).` };
      }
      
      if (role !== 'client' && !publicUser.email_confirmed_at) {
        get().setAuthLoading(false);
        get().setAuthError('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
        await supabase.auth.signOut();
        return { success: false, error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' };
      }


      set({
        isAuthenticated: true,
        user: {
          id: publicUser.id,
          email: publicUser.email,
          name: publicUser.name,
          role: publicUser.role,
          branch_id: publicUser.branch_id,
          email_confirmed_at: publicUser.email_confirmed_at
        },
        role: publicUser.role,
        authLoading: false,
      });
      
      get().fetchBranches();
      get().fetchProducts();
      get().fetchCategories();
      get().fetchIngredients();
      get().fetchOrders(publicUser.role === 'admin' ? null : publicUser.branch_id);


      return { success: true, user: publicUser };
    } catch (error) {
      console.error("Login error:", error);
      get().setAuthLoading(false);
      get().setAuthError(error.message || "Un error inesperado ocurrió.");
      return { success: false, error: error.message || "Un error inesperado ocurrió." };
    }
  },

  register: async (userData) => {
    get().setAuthLoading(true);
    get().setAuthError(null);

    const { email, password, name, role, branch_id } = userData;

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            branch_id: role === 'staff' ? branch_id : null,
          },
        },
      });
      
      if (signUpError) {
        get().setAuthLoading(false);
        get().setAuthError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        get().setAuthLoading(false);
        get().setAuthError("El usuario ya existe pero no se pudo iniciar sesión.");
        return { success: false, error: "El usuario ya existe pero no se pudo iniciar sesión. Intenta iniciar sesión." };
      }
      
      if (!signUpData.user) {
        get().setAuthLoading(false);
        get().setAuthError("No se pudo crear el usuario.");
        return { success: false, error: "No se pudo crear el usuario." };
      }
      
      const hashedPassword = await hashPassword(password);

      const { error: publicUserInsertError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          email,
          name,
          role,
          branch_id: role === 'staff' ? branch_id : null,
          password_hash: hashedPassword, 
        });

      if (publicUserInsertError) {
        get().setAuthLoading(false);
        get().setAuthError(publicUserInsertError.message);
        
        await supabase.auth.admin.deleteUser(signUpData.user.id);
        return { success: false, error: publicUserInsertError.message };
      }
      
      get().setAuthLoading(false);
      return { success: true, user: signUpData.user };

    } catch (error) {
      console.error("Registration error:", error);
      get().setAuthLoading(false);
      get().setAuthError(error.message || "Un error inesperado ocurrió durante el registro.");
      return { success: false, error: error.message || "Un error inesperado ocurrió durante el registro." };
    }
  },

  logout: async () => {
    get().setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      get().setAuthError(error.message);
    }
    set({
      isAuthenticated: false,
      user: null,
      role: null,
      orders: [], 
      authLoading: false,
    });
  },

  checkSession: async () => {
    get().setAuthLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      set({ isAuthenticated: false, user: null, role: null, authLoading: false });
      return;
    }
    
    if (session && session.user) {
      const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (publicUserError || !publicUser) {
        set({ isAuthenticated: false, user: null, role: null, authLoading: false });
        await supabase.auth.signOut(); 
        return;
      }
      
      if (publicUser.role !== 'client' && !publicUser.email_confirmed_at && !session.user.email_confirmed_at) {
         set({ isAuthenticated: false, user: null, role: null, authLoading: false });
         await supabase.auth.signOut();
         return;
      }

      set({
        isAuthenticated: true,
        user: {
          id: publicUser.id,
          email: publicUser.email,
          name: publicUser.name,
          role: publicUser.role,
          branch_id: publicUser.branch_id,
          email_confirmed_at: publicUser.email_confirmed_at || session.user.email_confirmed_at,
        },
        role: publicUser.role,
        authLoading: false,
      });
      
      get().fetchBranches();
      get().fetchProducts();
      get().fetchCategories();
      get().fetchIngredients();
      get().fetchOrders(publicUser.role === 'admin' ? null : publicUser.branch_id);


    } else {
      set({ isAuthenticated: false, user: null, role: null, authLoading: false });
    }
  },
  
  updateUserBranch: async (userId, branchId) => {
    get().setAuthLoading(true);
    get().setAuthError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ branch_id: branchId })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      if (get().user?.id === userId) {
        set(state => ({ user: { ...state.user, branch_id: branchId } }));
      }
      get().setAuthLoading(false);
      return { success: true, data };
    } catch (error) {
      console.error("Error updating user branch:", error);
      get().setAuthLoading(false);
      get().setAuthError(error.message);
      return { success: false, error: error.message };
    }
  },
});
