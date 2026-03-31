import type { APIRoute } from 'astro';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { file, data } = body;

    // Only allow specific files
    const allowed = ['pages.json', 'products.json'];
    if (!allowed.includes(file)) {
      return new Response(JSON.stringify({ ok: false, error: 'File not allowed' }), { status: 400 });
    }

    const filePath = resolve(process.cwd(), 'src/content', file);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ url }) => {
  const file = url.searchParams.get('file') || 'pages.json';
  const allowed = ['pages.json', 'products.json'];
  if (!allowed.includes(file)) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  const filePath = resolve(process.cwd(), 'src/content', file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
