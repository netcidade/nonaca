import type { APIRoute } from 'astro';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete('nonaca_admin_session', { path: '/' });
  return json({ ok: true });
};

