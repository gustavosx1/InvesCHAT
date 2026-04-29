import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req) {
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
}

export async function POST(req) {
  try {
    const { id, perfil } = await req.json();

    const { data, error } = await supabase
      .from("perfil_teste")
      .upsert({ id: id, perfil: perfil }, { onConflict: "id" });

    if (error) {
      console.error(error);
      return Response.json(
        { error: "Erro ao salvar perfil" },
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
}
    const { id, perfil } = await req.json()
    
    const { data, error } = await supabase
      .from('perfil_teste')
      .update({ perfil: perfil })
      .eq('id', id)
    
    if (error) {
      console.error(error)
      return Response.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
    }
    
    return Response.json({ data, success: true })
  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
