/**
 * POST /api/chat/session - Cria uma nova sessão de conversa
 */

import { supabaseAdmin } from '../../../../../lib/supabase'

const MAX_RESTORED_MESSAGES = 30

export const dynamic = 'force-dynamic'
export const revalidate = 0

const getLatestSessionByUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('chat_sessions')
    .select('id, created_at, updated_at, last_message_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { data, error }
}

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return Response.json(
        { erro: 'Parâmetro user_id é obrigatório', success: false },
        { status: 400 }
      )
    }

    const { data: lastSession, error: sessionError } = await getLatestSessionByUser(userId)

    if (sessionError) {
      return Response.json(
        { erro: `Erro ao buscar sessão: ${sessionError.message}`, success: false },
        { status: 500 }
      )
    }

    if (!lastSession) {
      return Response.json(
        { success: true, sessionId: null, messages: [] },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      )
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', lastSession.id)
      .order('created_at', { ascending: true })
      .limit(MAX_RESTORED_MESSAGES)

    if (messagesError) {
      return Response.json(
        { erro: `Erro ao buscar mensagens: ${messagesError.message}`, success: false },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        sessionId: lastSession.id,
        session: lastSession,
        messages: messages ?? [],
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  } catch (error) {
    return Response.json(
      { erro: `Erro ao consultar sessão: ${error.message}`, success: false },
      { status: 500 }
    )
  }
}

export const POST = async (request) => {
  try {
    const body = await request.json().catch(() => ({}))
    const { user_id } = body

    if (!user_id) {
      return Response.json(
        { erro: 'user_id é obrigatório', success: false },
        { status: 400 }
      )
    }

    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, created_at, updated_at, last_message_at')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return Response.json(
        { erro: `Erro ao buscar sessão: ${error.message}`, success: false },
        { status: 500 }
      )
    }

    let finalSession = session

    if (!finalSession) {
      const { data: createdSession, error: createError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ user_id })
        .select('id, created_at, updated_at, last_message_at')
        .single()

      if (createError) {
        return Response.json(
          { erro: `Erro ao criar sessão: ${createError.message}`, success: false },
          { status: 500 }
        )
      }

      finalSession = createdSession
    }

    return Response.json(
      {
        success: true,
        sessionId: finalSession.id,
        session: finalSession,
      },
      { status: 201 }
    )
  } catch (error) {
    return Response.json(
      { erro: `Erro ao criar sessão: ${error.message}`, success: false },
      { status: 500 }
    )
  }
}
