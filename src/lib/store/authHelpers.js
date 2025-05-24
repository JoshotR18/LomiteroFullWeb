
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const mapSupabaseUserToPublicUser = (supabaseUser, publicUserData) => {
  if (!publicUserData && !supabaseUser) return null;
  if (!publicUserData && supabaseUser) { 
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || 'Usuario',
      role: supabaseUser.user_metadata?.role || 'client',
      branch_id: supabaseUser.user_metadata?.branch_id || null,
      email_confirmed_at: supabaseUser.email_confirmed_at || null,
    };
  }
  return {
    id: publicUserData.id,
    email: publicUserData.email,
    name: publicUserData.name,
    role: publicUserData.role,
    branch_id: publicUserData.branch_id,
    email_confirmed_at: publicUserData.email_confirmed_at || supabaseUser?.email_confirmed_at,
  };
};

export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error);
  if (error && error.message) {
    if (error.message.includes("User already registered")) {
      return 'El correo electrónico ya está registrado.';
    }
    if (error.message.includes("Invalid login credentials")) {
      return 'Credenciales incorrectas.';
    }
    if (error.code === '23505') { 
        if (error.message.includes('users_email_key')) {
            return 'El correo electrónico ya está registrado.';
        }
        return 'Error de unicidad. Ya existe un registro con alguno de los datos proporcionados.';
    }
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
};
