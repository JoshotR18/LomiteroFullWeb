
import { supabase } from '@/lib/supabase';
import { hashPassword, handleSupabaseError, mapSupabaseUserToPublicUser, comparePassword } from '@/lib/store/authHelpers';

export const userManagementSlice = (set, get) => ({
  users: [],

  login: async (credentials, role) => {
    set({ isLoading: true });
    try {
      const { data: usersInDb, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.username)
        .eq('role', role)
        .single();

      if (dbError && dbError.code !== 'PGRST116') { 
        set({ isLoading: false });
        return { error: handleSupabaseError(dbError, 'login (fetchUser)') };
      }

      if (!usersInDb) {
        set({ isLoading: false });
        return { error: 'Usuario no encontrado o rol incorrecto.' };
      }

      const passwordMatch = await comparePassword(credentials.password, usersInDb.password_hash);
      
      if (passwordMatch) {
        const { data: { user: supabaseAuthUser, session }, error: signInError } = await supabase.auth.signInWithPassword({
          email: credentials.username,
          password: credentials.password,
        });

        if (signInError) {
          set({ isLoading: false });
          return { error: handleSupabaseError(signInError, 'login (signInWithPassword)') };
        }
        
        const mappedUser = mapSupabaseUserToPublicUser(supabaseAuthUser, usersInDb);
        set({ 
          isAuthenticated: true, 
          role: mappedUser.role,
          user: mappedUser,
          isLoading: false 
        });
        return { success: true, user: mappedUser };
      } else {
        set({ isLoading: false });
        return { error: 'Credenciales incorrectas.' };
      }
    } catch (e) {
      console.error('Login exception:', e);
      set({ isLoading: false });
      return { error: 'Ocurrió un error inesperado durante el inicio de sesión.' };
    }
  },

  registerClient: async (userData) => {
    set({ isLoading: true });
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { 
            name: userData.name,
            role: 'client', // Explicitly set role in Supabase Auth metadata
            branch_id: userData.branchId || null,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (signUpError) {
        set({ isLoading: false });
        return { error: handleSupabaseError(signUpError, 'registerClient (signUp)') };
      }
      
      if (signUpData.user) {
        const hashedPassword = await hashPassword(userData.password);
        const { data: publicUser, error: publicUserError } = await supabase
          .from('users')
          .insert([
            { 
              id: signUpData.user.id, 
              email: userData.email, 
              name: userData.name,
              password_hash: hashedPassword,
              role: 'client',
              branch_id: userData.branchId || null,
            }
          ])
          .select()
          .single();
        
        if (publicUserError) {
           await supabase.auth.admin.deleteUser(signUpData.user.id).catch(delErr => console.error("Failed to delete Supabase auth user after public table insert error:", delErr));
          set({ isLoading: false });
          return { error: handleSupabaseError(publicUserError, 'registerClient (insertPublicUser)') };
        }
        set({ isLoading: false });
        return { success: true, user: mapSupabaseUserToPublicUser(signUpData.user, publicUser), needsVerification: !signUpData.user.email_confirmed_at };
      }
      set({ isLoading: false });
      return { error: 'No se pudo registrar el usuario.' };

    } catch (e) {
      console.error('Registration exception:', e);
      set({ isLoading: false });
      return { error: 'Ocurrió un error inesperado durante el registro.' };
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, name, email, role, branch_id,
          branches (id, name),
          created_at, email_confirmed_at
        `)
        .order('name', { ascending: true });
      
      if (error) {
        set({ error: handleSupabaseError(error, 'fetchUsers'), isLoading: false });
        return { error: handleSupabaseError(error, 'fetchUsers') };
      }
      set({ users: data, isLoading: false, error: null });
      return { success: true, data };
    } catch(e) {
      console.error("Exception in fetchUsers:", e);
      set({ error: 'Ocurrió un error inesperado al obtener usuarios.', isLoading: false });
      return { error: 'Ocurrió un error inesperado al obtener usuarios.' };
    }
  },

  addUser: async (userData) => {
    set({ isLoading: true });
    try {
      if (!userData.password) {
        set({ error: "La contraseña es obligatoria para nuevos usuarios.", isLoading: false });
        return { error: "La contraseña es obligatoria para nuevos usuarios." };
      }
      const hashedPassword = await hashPassword(userData.password);
      
      const { password, ...restOfUserData } = userData;

      const { data, error } = await supabase
        .from('users')
        .insert([{ ...restOfUserData, password_hash: hashedPassword, branch_id: userData.branch_id || null }])
        .select()
        .single();

      if (error) {
        set({ error: handleSupabaseError(error, 'addUser'), isLoading: false });
        return { error: handleSupabaseError(error, 'addUser') };
      }
      await get().fetchUsers();
      set({ isLoading: false });
      return { success: true, data };
    } catch(e) {
      console.error("Exception in addUser:", e);
      set({ error: 'Ocurrió un error inesperado al agregar usuario.', isLoading: false });
      return { error: 'Ocurrió un error inesperado al agregar usuario.' };
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true });
    try {
      const updatePayload = { ...userData };
      if (userData.password) {
        updatePayload.password_hash = await hashPassword(userData.password);
      }
      delete updatePayload.password; 
      updatePayload.branch_id = userData.branch_id === "__NONE__" ? null : (userData.branch_id || null);


      const { data, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        set({ error: handleSupabaseError(error, 'updateUser'), isLoading: false });
        return { error: handleSupabaseError(error, 'updateUser') };
      }
      await get().fetchUsers();
      set({ isLoading: false });
      return { success: true, data };
    } catch(e) {
      console.error("Exception in updateUser:", e);
      set({ error: 'Ocurrió un error inesperado al actualizar usuario.', isLoading: false });
      return { error: 'Ocurrió un error inesperado al actualizar usuario.' };
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);

      if (error) {
        set({ error: handleSupabaseError(error, 'deleteUser'), isLoading: false });
        return { error: handleSupabaseError(error, 'deleteUser') };
      }
      await get().fetchUsers();
      set({ isLoading: false });
      return { success: true };
    } catch (e) {
      console.error("Exception in deleteUser:", e);
      set({ error: 'Ocurrió un error inesperado al eliminar usuario.', isLoading: false });
      return { error: 'Ocurrió un error inesperado al eliminar usuario.' };
    }
  },
});
