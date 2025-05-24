
import { supabase } from '@/lib/supabase';
import { hashPassword, createPublicUserEntry } from '@/lib/authUtils';
import bcrypt from 'bcryptjs';

export const authSlice = (set, get) => ({
  isAuthenticated: false,
  role: null,
  user: null,
  users: [], 
  isLoading: false,
  error: null,

  login: async (credentials, role) => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      set({ isLoading: false, error: "Error de conexión con el servidor." });
      return { error: "Error de conexión con el servidor." };
    }
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.username) 
        .eq('role', role);

      if (error) {
        console.error('Error fetching user:', error);
        set({ isLoading: false, error: 'Error al intentar iniciar sesión. Intente de nuevo.' });
        return { error: 'Error al intentar iniciar sesión. Intente de nuevo.' };
      }

      if (users && users.length > 0) {
        const userRecord = users[0];
        const passwordMatch = await bcrypt.compare(credentials.password, userRecord.password_hash);
        
        if (passwordMatch) {
          if (userRecord.role === 'client' && !userRecord.email_confirmed_at) {
            set({ isLoading: false, error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
            return { error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' };
          }

          set({ 
            isAuthenticated: true, 
            role: userRecord.role,
            user: {
              id: userRecord.id,
              email: userRecord.email,
              name: userRecord.name,
              role: userRecord.role,
              branch_id: userRecord.branch_id,
              email_confirmed_at: userRecord.email_confirmed_at 
            },
            isLoading: false 
          });
          return { success: true, user: userRecord };
        } else {
          set({ isLoading: false, error: 'Credenciales incorrectas.' });
          return { error: 'Credenciales incorrectas.' };
        }
      } else {
        set({ isLoading: false, error: 'Usuario no encontrado o rol incorrecto.' });
        return { error: 'Usuario no encontrado o rol incorrecto.' };
      }
    } catch (e) {
      console.error('Login exception:', e);
      set({ isLoading: false, error: 'Ocurrió un error inesperado.' });
      return { error: 'Ocurrió un error inesperado.' };
    }
  },

  registerClient: async (userData) => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      set({ isLoading: false, error: "Error de conexión con el servidor." });
      return { error: "Error de conexión con el servidor." };
    }
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { 
            name: userData.name, 
            role: 'client', 
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (signUpError) {
        console.error('Error registering client with Supabase Auth:', signUpError);
        let errorMessage = signUpError.message || 'Error al registrar el usuario. Intente de nuevo.';
        if (signUpError.message.includes("User already registered")) {
          errorMessage = 'El correo electrónico ya está registrado.';
        } else if (signUpError.message.includes("Password should be at least 6 characters")) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        }
        set({ isLoading: false, error: errorMessage });
        return { error: errorMessage };
      }
      
      if (signUpData.user) {
        const password_hash = await hashPassword(userData.password);
        const publicUser = await createPublicUserEntry(signUpData.user.id, { ...userData, role: 'client' }, password_hash);
        
        set({ isLoading: false });
        return { success: true, user: publicUser, needsVerification: !signUpData.user.email_confirmed_at };
      }
      set({ isLoading: false, error: 'No se pudo registrar el usuario.' });
      return { error: 'No se pudo registrar el usuario.' };

    } catch (e) {
      console.error('Registration exception:', e);
      set({ isLoading: false, error: e.message || 'Ocurrió un error inesperado durante el registro.' });
      return { error: e.message || 'Ocurrió un error inesperado durante el registro.' };
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    if (supabase && supabase.auth) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during Supabase sign out:', error);
        // We still proceed to clear local state
      }
    }
    set({ 
      isAuthenticated: false, 
      role: null,
      user: null,
      isLoading: false,
    });
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      set({ isLoading: false, error: "Supabase client not initialized" });
      return { error: "Supabase client not initialized" };
    }
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        branch_id,
        branches (id, name),
        created_at,
        email_confirmed_at
      `)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching users:', error);
      set({ error: error.message, isLoading: false, users: [] });
      return { error: error.message };
    }
    set({ users: data || [], isLoading: false, error: null });
    return { success: true, data: data || [] };
  },

  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      set({ error: "Supabase client not initialized", isLoading: false });
      return { error: "Supabase client not initialized" };
    }

    let password_hash;
    if (userData.password) {
      try {
        password_hash = await hashPassword(userData.password);
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        set({ error: "Error procesando la contraseña.", isLoading: false });
        return { error: "Error procesando la contraseña." };
      }
    } else {
      set({ error: "La contraseña es obligatoria para nuevos usuarios.", isLoading: false });
      return { error: "La contraseña es obligatoria para nuevos usuarios." };
    }
    
    const { password, ...restOfUserData } = userData;

    const { data, error } = await supabase
      .from('users')
      .insert([{ ...restOfUserData, password_hash, branch_id: userData.branch_id || null }])
      .select()
      .single();

    if (error) {
      console.error('Error adding user:', error);
      let errorMessage = error.message;
      if (error.code === '23505') {
          errorMessage = 'El correo electrónico ya está registrado.';
      }
      set({ error: errorMessage, isLoading: false });
      return { error: errorMessage };
    }
    await get().fetchUsers(); // Refresh user list
    set({ isLoading: false });
    return { success: true, data };
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      set({ error: "Supabase client not initialized", isLoading: false });
      return { error: "Supabase client not initialized" };
    }

    const updateData = { ...userData };
    if (userData.password) {
      try {
        updateData.password_hash = await hashPassword(userData.password);
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        set({ error: "Error procesando la contraseña.", isLoading: false });
        return { error: "Error procesando la contraseña." };
      }
      delete updateData.password; 
    } else {
      delete updateData.password; 
    }
    
    updateData.branch_id = userData.branch_id || null;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      let errorMessage = error.message;
      if (error.code === '23505') {
          errorMessage = 'El correo electrónico ya está registrado para otro usuario.';
      }
      set({ error: errorMessage, isLoading: false });
      return { error: errorMessage };
    }
    await get().fetchUsers(); // Refresh user list
    set({ isLoading: false });
    return { success: true, data };
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      set({ error: "Supabase client not initialized", isLoading: false });
      return { error: "Supabase client not initialized" };
    }

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
    await get().fetchUsers(); // Refresh user list
    set({ isLoading: false });
    return { success: true };
  },
  
  checkSession: async () => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      set({ isAuthenticated: false, user: null, role: null, isLoading: false, error: "Supabase client not initialized" });
      return;
    }
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error checking session:", sessionError);
      set({ isAuthenticated: false, user: null, role: null, isLoading: false, error: sessionError.message });
      return;
    }

    if (session && session.user) {
      const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (publicUserError) {
        console.error("Error fetching public user data:", publicUserError);
        // If public user not found, it might be an issue, log out or handle as unauthenticated
        await supabase.auth.signOut(); // Attempt to clear inconsistent state
        set({ isAuthenticated: false, user: null, role: null, isLoading: false, error: "Error al obtener datos del usuario." });
        return;
      }
      
      if (publicUser) {
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
          isLoading: false,
        });
      } else {
         // This case should ideally be caught by publicUserError if the user exists in auth but not public.users
         await supabase.auth.signOut();
         set({ isAuthenticated: false, user: null, role: null, isLoading: false, error: "Usuario no encontrado en registros públicos." });
      }
    } else {
      set({ isAuthenticated: false, user: null, role: null, isLoading: false });
    }
  },
  
  handleEmailVerification: async () => {
    set({ isLoading: true, error: null });
    if (!supabase) {
      set({ isLoading: false, error: "Supabase client not initialized" });
      return { status: 'error', message: "Supabase client not initialized" };
    }
    const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
    
    if (authUserError) {
      console.error("Error getting user after verification:", authUserError);
      set({ isLoading: false, error: 'Error al verificar el estado del usuario.' });
      return { status: 'error', message: 'Error al verificar el estado del usuario.' };
    }

    if (authUser && authUser.email_confirmed_at) {
      const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .select('email_confirmed_at')
        .eq('id', authUser.id)
        .single();

      if (publicUser && !publicUser.email_confirmed_at) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ email_confirmed_at: authUser.email_confirmed_at })
          .eq('id', authUser.id);

        if (updateError) {
          console.error("Error updating public user email_confirmed_at:", updateError);
        }
      } else if (publicUserError) {
         console.error("Error fetching public user for email_confirmed_at check:", publicUserError);
      }
      
      set(state => ({
        user: state.user ? { ...state.user, email_confirmed_at: authUser.email_confirmed_at } : null,
        isLoading: false,
      }));
      return { status: 'success', message: 'Email verificado exitosamente.' };
    } else if (authUser) { 
      set({ isLoading: false });
      return { status: 'pending', message: 'La verificación del email aún está pendiente o ya fue verificada. Intenta iniciar sesión.' };
    } else { 
      set({ isLoading: false, error: 'No se pudo obtener la información del usuario. Por favor, intenta iniciar sesión.' });
      return { status: 'error', message: 'No se pudo obtener la información del usuario. Por favor, intenta iniciar sesión.' };
    }
  }
});
