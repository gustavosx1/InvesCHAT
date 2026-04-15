import {supabase} from "../../../../../lib/supabase"

export async function GET(req, {params}) {
    try{    
    const {id} = await params
    const { data, error } = await supabase.from('invest_teste').select('*').eq('id', id).single()
    if (error) {
      console.error(error)
      return Response.json({ error: 'Erro ao buscar investimento' }, { status: 500 })
    }
    return Response.json({ data, success: true })
    }catch (error) {
      console.error('Erro na rota:', error)
      return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}