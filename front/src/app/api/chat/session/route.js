/**
 * POST /api/chat/session - Cria uma nova sessão de conversa
 */

import { createSession } from "@/app/lib/services/geminiService";

export const POST = async (request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { user_id } = body;

    const session = createSession(user_id || null);

    return Response.json(session, { status: 201 });
  } catch (error) {
    return Response.json(
      { erro: `Erro ao criar sessão: ${error.message}` },
      { status: 500 }
    );
  }
};
