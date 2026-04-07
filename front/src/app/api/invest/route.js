import {supabase} from "../../../../lib/supabase"
import { GET } from "../perfil/route"

export async function POST(req) {
  try {
    const body = await req.json()
    const { id, investimentos } = body

    // Busca carteira atual
    const res = await fetch(`/api/invest/${id}`)
    const resultado = await res.json()

    if (!res.ok) {
      return Response.json({ error: 'Erro ao buscar investimento' }, { status: 500 })
    }

    const carteiraExistente = resultado?.data?.investimentos

    if (carteiraExistente) {
      // Adiciona o novo investimento na carteira existente
      const carteiraAtualizada = [...carteiraExistente, investimentos]

      const { data, error } = await supabase
        .from('invest_teste')
        .update({ investimentos: carteiraAtualizada })
        .eq('id', id)

      if (error) return Response.json({ error: 'Erro ao atualizar' }, { status: 500 })
      return Response.json({ data, success: true })

    } else {
      // Cria novo registro
      const { data, error } = await supabase
        .from('invest_teste')
        .upsert(body)

      if (error) return Response.json({ error: 'Erro ao salvar' }, { status: 500 })
      return Response.json({ data, success: true })
    }

  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}