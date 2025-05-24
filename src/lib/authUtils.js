
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export const hashPassword = async (password) => {
  if (!password) throw new Error("Password cannot be empty");
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const createPublicUserEntry = async (userId, userData, passwordHash) => {
  if (!supabase) {
    console.error("Supabase client is not initialized in createPublicUserEntry.");
    throw new Error("Error de conexión con el servidor.");
  }
  if (!userId || !userData || !userData.email || !userData.name) {
    console.error("Invalid data provided to createPublicUserEntry:", { userId, userData });
    throw new Error("Datos incompletos para crear el usuario.");
  }

  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .insert([
      { 
        id: userId, 
        email: userData.email, 
        name: userData.name,
        password_hash: passwordHash, // This might be null if Supabase Auth handles password directly
        role: userData.role || 'client',
        branch_id: userData.branch_id || null,
        email_confirmed_at: null, 
      }
    ])
    .select()
    .single();

  if (publicUserError) {
    console.error('Error inserting user into public.users table:', publicUserError);
    throw new Error(publicUserError.message || 'Error al completar el registro.');
  }
  return publicUser;
};
