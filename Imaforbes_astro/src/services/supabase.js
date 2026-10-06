import { createClient } from '@supabase/supabase-js';

// Vercel a veces tiene problemas inyectando variables en el build de Astro.
// Al ser llaves "Públicas" (anon), es completamente seguro ponerlas como respaldo aquí.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || "https://vojoyocbdragjpvmytus.supabase.co";
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvam95b2NiZHJhZ2pwdm15dHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDM5NzYsImV4cCI6MjEwNjg3OTk3Nn0.bhJn0h_SZEgJLhIEJ54zWAPOQ7yf5dSjJcPLDt0qLAo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
