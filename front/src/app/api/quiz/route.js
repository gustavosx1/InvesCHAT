import { supabaseAdmin } from '../../../../lib/supabase'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return Response.json(
        { error: 'Parâmetro user_id é obrigatório', success: false },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('quiz_resultados')
      .select('*')
      .eq('user_id', userId)
      .order('quiz_completed_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Erro ao buscar resultado do quiz:', error)
      return Response.json(
        { error: 'Erro ao buscar resultado do quiz', success: false },
        { status: 500 }
      )
    }

    return Response.json({ data, success: true }, { status: 200 })
  } catch (error) {
    console.error('Erro ao consultar quiz:', error)
    return Response.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      user_id,
      nota,
      respostas,
      quiz_completed_at,
      quiz_tipo = 'conhecimento_financeiro',
    } = body

    if (!user_id) {
      return Response.json(
        { error: 'user_id é obrigatório', success: false },
        { status: 400 }
      )
    }

    if (typeof nota !== 'number' || nota < 0 || nota > 30) {
      return Response.json(
        { error: 'nota deve ser um número entre 0 e 30', success: false },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('quiz_resultados')
      .insert({
        user_id,
        nota,
        respostas: respostas ?? {},
        quiz_completed_at: quiz_completed_at ?? new Date().toISOString(),
        quiz_tipo,
      })
      .select()

    if (error) {
      console.error('Erro ao salvar resultado do quiz:', error)
      return Response.json(
        { error: 'Erro ao salvar resultado do quiz', success: false },
        { status: 500 }
      )
    }

    return Response.json({ data: data[0], success: true }, { status: 201 })
  } catch (error) {
    console.error('Erro ao processar resultado do quiz:', error)
    return Response.json(
      { error: 'Erro interno do servidor', success: false },
      { status: 500 }
    )
  }
}
