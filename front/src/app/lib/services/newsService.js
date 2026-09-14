import { supabaseAdmin } from "../../../../lib/supabase";

export const getNewsletters = async () => {
  if (!supabaseAdmin) {
    return { erro: "Cliente admin do Supabase indisponivel neste contexto." };
  }

  const { data, error } = await supabaseAdmin
    .from("newsletters")
    .select("assunto, corpo, data_recebimento")// filtra por assunto contendo "Mercado em 5 minutos"
    .order("data_recebimento", { ascending: false })
    .limit(1)  // só o mais recente
    .maybeSingle(); // retorna objeto direto ao invés de array

  if (error) return { erro: error.message };
  if (!data) return { erro: "Nenhuma newsletter encontrada" };
  return { titulo: data.assunto, corpo: data.corpo, data: data.data_recebimento };
};