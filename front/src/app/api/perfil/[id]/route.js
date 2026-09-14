import { supabaseAdmin } from '../../../../../lib/supabase'

export async function GET(req, { params }) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('perfil')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar perfil por id:', error)
      return Response.json(
        { success: false, error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    if (!data) {
      return Response.json(
        { success: false, error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    return Response.json({ data, success: true }, { status: 200 })
  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

