/**
 * Serviço para buscar dados de perfil do investidor no Supabase
 */

import { supabaseAdmin } from '../../../../lib/supabase'

export const getPerfilInvestidor = async ({ id }) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('perfil')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      return { error: 'Erro ao buscar perfil', success: false }
    }

    if (!data) {
      return { error: 'Perfil não encontrado', success: false }
    }

    return { perfil: data.perfil, success: true }
  } catch (error) {
    console.error('Erro na rota:', error)
    return { error: 'Erro interno do servidor', success: false }
  }
}
