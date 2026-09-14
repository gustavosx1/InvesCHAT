import { supabaseAdmin } from '../../../../lib/supabase'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { error: 'Parâmetro id é obrigatório' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('perfil')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      return Response.json(
        { error: 'Erro ao buscar perfil' },
        { status: 500 }
      )
    }

    if (!data) {
      return Response.json(
        { error: 'Perfil não encontrado', success: false },
        { status: 404 }
      )
    }

    return Response.json({ data, success: true })
  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const { id, perfil, score, quiz_responses, quiz_completed_at } = await req.json()

    const { data, error } = await supabaseAdmin
      .from('perfil')
      .upsert(
        {
          id,
          perfil,
          score,
          quiz_responses: quiz_responses ?? {},
          quiz_completed_at,
        },
        { onConflict: 'id' }
      )
      .select()

    if (error) {
      console.error('Erro ao salvar perfil:', error)
      return Response.json(
        { error: 'Erro ao salvar perfil' },
        { status: 500 }
      )
    }

    return Response.json({ data: data?.[0] ?? data, success: true })
  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
    
