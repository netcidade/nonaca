import type { APIRoute } from 'astro';

export const prerender = false;

// Senha padrão — altere via variável de ambiente ADMIN_PASSWORD no .env
const SENHA = import.meta.env.ADMIN_PASSWORD ?? 'nonaca2025';
const TOKEN = import.meta.env.ADMIN_TOKEN   ?? 'nonaca2025';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === SENHA) {
      cookies.set('nonaca_admin_session', TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        sameSite: 'lax',
      });
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Senha incorreta' }, 401);

  } catch (err) {
    console.error('[Admin Login Error]:', err);
    return json({ ok: false, error: 'Erro no servidor' }, 500);
  }
};

