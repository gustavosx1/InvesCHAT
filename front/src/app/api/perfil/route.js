import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(req) {
  try{
    const {id} = req.json()
    const { data, error } = await supabase.from('perfil_teste').select('*').eq('id', id).single()
    if (error) {
      console.error(error)
      return Response.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
    }
    return Response.json({ data, success: true })
  }

  catch (error) {
    console.error('Erro na rota:', error)
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
  
}

export async function POST(req) {
  try {
    const { id, perfil } = await req.json()
    
    const { data, error } = await supabase
      .from('perfil_teste')
      .upsert({ id: id, perfil: perfil }, { onConflict: 'id' })

    
    if (error) {  
      console.error(error)
      return Response.json({ error: 'Erro ao salvar perfil' }, { status: 500 })
    }
    
    return Response.json({ data, success: true })
  } catch (error) {
    console.error('Erro na rota:', error)
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    console.log('Recebendo PATCH para atualizar perfil')
    confirm.log('Corpo da requisição:', await req.json())
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
