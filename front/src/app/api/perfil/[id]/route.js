import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("perfil_teste")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return Response.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ data, success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro na rota:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

