
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bumeegpasworrlxaekhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bWVlZ3Bhc3dvcnJseGFla2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMjI5MTYsImV4cCI6MjA2MjU5ODkxNn0.wwn2seHpV75okUTtR5dUGr0mSLR-Ti5BhpYNPbpNbhU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
