/**
 * POST /api/chat - Envia uma pergunta para o assistente
 */

import { chatWithGemini, createSession } from "@/app/lib/services/geminiService";

export const POST = async (request) => {
  try {
    const { pergunta, session_id, user_id } = await request.json();

    if (!pergunta) {
      return Response.json(
        { erro: "Pergunta é obrigatória" },
        { status: 400 }
      );
    }

    // Usar session_id existente ou criar nova
    const finalSessionId = session_id || crypto.randomUUID();

    const result = await chatWithGemini(pergunta, finalSessionId, user_id);

    if (result.erro) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { erro: `Erro ao processar: ${error.message}` },
      { status: 500 }
    );
  }
};
