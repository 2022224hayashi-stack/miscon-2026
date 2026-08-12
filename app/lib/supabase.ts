import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Supabase Config Error] SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が設定されていません。');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);