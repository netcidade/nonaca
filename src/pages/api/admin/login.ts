import type { APIRoute } from 'astro';

export const prerender = false;

// Senha padrão — altere via variável de ambiente ADMIN_PASSWORD no .env
const SENHA = import.meta.env.ADMIN_PASSWORD ?? 'nonaca2025';
const TOKEN  = import.meta.env.ADMIN_TOKEN   ?? 'nonaca2025';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const text = await request.text();
    let password = '';
    try {
      password = JSON.parse(text).password ?? '';
    } catch {
      // fallback para form-data
      const params = new URLSearchParams(text);
      password = params.get('password') ?? '';
    }

    if (password === SENHA) {
      cookies.set('nonaca_admin_session', TOKEN, {
        httpOnly: true,
        secure: false,   // true em produção HTTPS
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Senha incorreta' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/login] erro:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
