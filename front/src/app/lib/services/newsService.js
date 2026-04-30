import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const getNewsletters = async () => {
  const { data, error } = await supabase
    .from("newsletters")
    .select("assunto, corpo, data_recebimento")// filtra por assunto contendo "Mercado em 5 minutos"
    .order("data_recebimento", { ascending: false })
    .limit(1)  // só o mais recente
    .maybeSingle(); // retorna objeto direto ao invés de array

    console.log("Dados da newsletter:", data);
    console.log("Erro ao buscar newsletter:", error);
  if (error) return { erro: error.message };
  if (!data) return { erro: "Nenhuma newsletter encontrada" };
  return { titulo: data.assunto, corpo: data.corpo, data: data.data_recebimento };
};