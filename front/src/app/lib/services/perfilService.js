/**
 * Serviço para buscar dados de perfil do investidor no Supabase
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

//Tive que quebrar o principio do DRY para evitar um erro de importação circular entre os arquivos de rota e serviço
//não fui um programador pragmatico ;(
export const getPerfilInvestidor = async ({ id }) => {
 try {
    const { id } = await req.json();

    const { data, error } = await supabase
      .from("perfil_teste")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return Response.json(
        { error: "Erro ao buscar perfil" },
        { status: 500 }
      );
    }

    return Response.json({ data, success: true });
  } catch (error) {
    console.error("Erro na rota:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
};
