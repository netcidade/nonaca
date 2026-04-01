import type { APIRoute } from 'astro';
import { getDatabases, DB_ID, COL_CONTENT, COL_PRODUCTS, ID } from '../../../lib/appwrite';
import { Query } from 'node-appwrite';

export const prerender = false;

const ADMIN_TOKEN = import.meta.env.ADMIN_TOKEN ?? 'nonaca2025';
const ALLOWED     = ['pages.json', 'products.json'];

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
function isAuthorized(cookies: any) {
  return cookies.get('nonaca_admin_session')?.value === ADMIN_TOKEN;
}

// ── GET ── lê conteúdo do Appwrite
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  const file = url.searchParams.get('file') ?? 'pages.json';
  if (!ALLOWED.includes(file)) return json({ ok: false, error: 'Arquivo inválido' }, 400);
  try {
    const db = getDatabases();
    if (file === 'pages.json') {
      const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
      const doc = res.documents[0];
      return json(doc ? JSON.parse(doc.data) : {});
    } else {
      const res = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
      const products = res.documents.map((d: any) => JSON.parse(d.data));
      return json(products);
    }
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

// ── POST ── salva conteúdo no Appwrite
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const body = await request.json();
    const db = getDatabases();

    if (body.file === 'pages.json') {
      // Salva seção de páginas
      const section  = body.section;    // ex: 'home', 'contato'
      const newData  = body.data;

      // Busca documento atual
      const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
      const doc = res.documents[0];

      let current: any = doc ? JSON.parse(doc.data) : {};
      if (section) current[section] = newData;
      else current = newData;

      if (doc) {
        await db.updateDocument(DB_ID, COL_CONTENT, doc.$id, { data: JSON.stringify(current) });
      } else {
        await db.createDocument(DB_ID, COL_CONTENT, ID.unique(), { key: 'pages', data: JSON.stringify(current) });
      }
      return json({ ok: true });
    }

    if (body.file === 'products.json') {
      const newProducts: any[] = body.data;

      // Apaga todos e recria (mais simples que diff)
      const existing = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
      await Promise.all(existing.documents.map((d: any) => db.deleteDocument(DB_ID, COL_PRODUCTS, d.$id)));
      await Promise.all(newProducts.map((p: any) =>
        db.createDocument(DB_ID, COL_PRODUCTS, ID.unique(), { slug: p.slug, data: JSON.stringify(p) })
      ));
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Arquivo não suportado' }, 400);
  } catch(e: any) {
    console.error('[content POST]', e);
    return json({ ok: false, error: e.message }, 500);
  }
};
