
import { supabase } from '@/lib/supabase';
import { mapSupabaseUserToPublicUser, handleSupabaseError } from '@/lib/store/authHelpers';

export const sessionManagementSlice = (set, get) => ({
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        set({ isAuthenticated: false, user: null, role: null, isLoading: false });
        console.error("Error checking session:", sessionError);
        return;
      }

      if (session?.user) {
        const { data: publicUser, error: publicUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (publicUserError && publicUserError.code !== 'PGRST116') { 
          set({ isAuthenticated: false, user: null, role: null, isLoading: false });
          console.error("Error fetching public user data on session check:", publicUserError);
          return;
        }
        
        const mappedUser = mapSupabaseUserToPublicUser(session.user, publicUser);
        if (mappedUser) {
          set({
            isAuthenticated: true,
            user: mappedUser,
            role: mappedUser.role,
            isLoading: false,
          });
        } else {
           set({ isAuthenticated: false, user: null, role: null, isLoading: false });
        }
      } else {
        set({ isAuthenticated: false, user: null, role: null, isLoading: false });
      }
    } catch (e) {
      console.error("Exception in checkSession:", e);
      set({ isAuthenticated: false, user: null, role: null, isLoading: false });
    }
  },

  handleEmailVerification: async () => {
    set({ isLoading: true });
    try {
      const { data: { user: supabaseAuthUser }, error: authUserError } = await supabase.auth.getUser();
      
      if (authUserError) {
        set({ isLoading: false });
        return { status: 'error', message: handleSupabaseError(authUserError, 'handleEmailVerification (getUser)') };
      }

      if (supabaseAuthUser && supabaseAuthUser.email_confirmed_at) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ email_confirmed_at: supabaseAuthUser.email_confirmed_at })
          .eq('id', supabaseAuthUser.id);

        if (updateError && updateError.code !== '23505') { 
          console.error("Error updating public user email_confirmed_at:", updateError);
        }
        
        const currentUser = get().user;
        set({
          user: currentUser ? { ...currentUser, email_confirmed_at: supabaseAuthUser.email_confirmed_at } : mapSupabaseUserToPublicUser(supabaseAuthUser, null),
          isLoading: false,
        });
        return { status: 'success', message: 'Email verificado exitosamente.' };
      } else if (supabaseAuthUser) {
        set({ isLoading: false });
        return { status: 'pending', message: 'La verificación del email aún está pendiente. Revisa tu bandeja de entrada.' };
      } else {
        set({ isLoading: false });
        return { status: 'error', message: 'No se pudo obtener la información del usuario para completar la verificación.' };
      }
    } catch (e) {
      console.error("Exception in handleEmailVerification:", e);
      set({ isLoading: false });
      return { status: 'error', message: 'Ocurrió un error inesperado durante la verificación.' };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during Supabase sign out:', error);
      }
    } catch(e) {
      console.error('Exception during logout:', e);
    } finally {
      set({ 
        isAuthenticated: false, 
        role: null,
        user: null,
        isLoading: false,
      });
    }
  },
});
