import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Helper para verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key);
};

// Estas variáveis serão configuradas com as credenciais reais do Supabase
// Usamos valores de fallback para evitar CRASH no momento da importação
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase] Credenciais não configuradas. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
