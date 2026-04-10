import { supabase } from "../../../../lib/supabase"

export async function POST(req) {
  try {
    const body = await req.json()
    const { id, investimentos } = body

    if (!id || !investimentos) {
      return Response.json({ error: 'ID e investimento são obrigatórios' }, { status: 400 })
    }

    const { data: existing, error: selectError } = await supabase
      .from('invest_teste')
      .select('investimentos')
      .eq('id', id)
      .maybeSingle()

    if (selectError) {
      console.error('Erro ao buscar carteira existente:', selectError)
      return Response.json({ error: 'Erro ao buscar carteira' }, { status: 500 })
    }

    const carteiraExistente = Array.isArray(existing?.investimentos)
      ? existing.investimentos
      : []

    if (carteiraExistente.length > 0) {
      const carteiraAtualizada = [...carteiraExistente, investimentos]
      const { data, error } = await supabase
        .from('invest_teste')
        .update({ investimentos: carteiraAtualizada })
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar carteira:', error)
        return Response.json({ error: 'Erro ao atualizar carteira' }, { status: 500 })
      }
      return Response.json({ data, success: true })
    }

    const { data, error } = await supabase
      .from('invest_teste')
      .upsert({ id, investimentos: [investimentos] }, { onConflict: 'id' })

    if (error) {
      console.error('Erro ao salvar carteira:', error)
      return Response.json({ error: 'Erro ao salvar carteira' }, { status: 500 })
    }

    return Response.json({ data, success: true })

  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}