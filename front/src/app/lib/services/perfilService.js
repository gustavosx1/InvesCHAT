/**
 * Serviço para buscar dados de perfil do investidor no Supabase
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const getPerfilInvestidor = async ({ id }) => {
  const response = await fetch(`${BASE_URL}/api/perfil/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return await response.json();
};
