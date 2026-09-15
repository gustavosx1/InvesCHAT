/**
 * POST /api/chat - Envia uma pergunta para o assistente
 */

import { chatWithGemini } from "@/app/lib/services/geminiService";
import { supabaseAdmin } from '../../../../lib/supabase'

export const POST = async (request) => {
  try {
    const { pergunta, session_id, user_id } = await request.json();

    if (!pergunta) {
      return Response.json(
        { erro: "Pergunta é obrigatória" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return Response.json(
        { erro: "user_id é obrigatório para persistir a conversa" },
        { status: 400 }
      );
    }

    let finalSessionId = session_id;

    if (!finalSessionId) {
      const { data: createdSession, error: createSessionError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ user_id })
        .select('id')
        .single()

      if (createSessionError || !createdSession) {
        return Response.json(
          { erro: `Erro ao criar sessão: ${createSessionError?.message || 'sessão inválida'}` },
          { status: 500 }
        )
      }

      finalSessionId = createdSession.id
    } else {
      const { error: upsertError } = await supabaseAdmin
        .from('chat_sessions')
        .upsert(
          {
            id: finalSessionId,
            user_id,
            last_message_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (upsertError) {
        return Response.json(
          { erro: `Erro ao validar sessão: ${upsertError.message}` },
          { status: 500 }
        )
      }
    }

    const { data: previousMessagesData, error: previousMessagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', finalSessionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (previousMessagesError) {
      return Response.json(
        { erro: `Erro ao carregar histórico: ${previousMessagesError.message}` },
        { status: 500 }
      )
    }

    const previousMessages = (previousMessagesData ?? []).reverse()
    const messageForDb = pergunta.trim()

    const result = await chatWithGemini(messageForDb, finalSessionId, user_id, previousMessages);

    if (result.erro) {
      return Response.json(result, { status: 500 });
    }

    const assistantMessage = result.resposta ?? ''

    const { error: insertMessagesError } = await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          session_id: finalSessionId,
          user_id,
          role: 'user',
          content: messageForDb,
        },
        {
          session_id: finalSessionId,
          user_id,
          role: 'assistant',
          content: assistantMessage,
        },
      ])

    if (insertMessagesError) {
      return Response.json(
        { erro: `Erro ao salvar mensagens: ${insertMessagesError.message}` },
        { status: 500 }
      )
    }

    await supabaseAdmin
      .from('chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', finalSessionId)

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { erro: `Erro ao processar: ${error.message}` },
      { status: 500 }
    );
  }
};
