import type { APIRoute } from 'astro';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export const prerender = false;

const ALLOWED = ['pages.json', 'products.json'];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { file, section, data } = body;

    if (!ALLOWED.includes(file)) {
      return json({ ok: false, error: 'Arquivo não permitido' }, 400);
    }

    const filePath = resolve(process.cwd(), 'src/content', file);
    const current  = JSON.parse(readFileSync(filePath, 'utf-8'));

    let toSave;

    if (section) {
      // Salva apenas uma seção dentro do objeto (ex: pages.json > hero)
      toSave = { ...current, [section]: data };
    } else {
      // Salva o dado inteiro (ex: products.json — array completo)
      toSave = data;
    }

    writeFileSync(filePath, JSON.stringify(toSave, null, 2), 'utf-8');
    return json({ ok: true });

  } catch (e) {
    console.error('[admin/content POST]', e);
    return json({ ok: false, error: String(e) }, 500);
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const file = url.searchParams.get('file') ?? 'pages.json';
    if (!ALLOWED.includes(file)) return json({ ok: false }, 400);
    const data = JSON.parse(readFileSync(resolve(process.cwd(), 'src/content', file), 'utf-8'));
    return json(data);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

