import type { APIRoute } from 'astro';
import { getStorage, BUCKET_MEDIA, ID } from '../../../lib/appwrite';

export const prerender = false;

const ADMIN_TOKEN = import.meta.env.ADMIN_TOKEN ?? 'nonaca2025';
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
function isAuthorized(cookies: any) {
  return cookies.get('nonaca_admin_session')?.value === ADMIN_TOKEN;
}

const APPWRITE_ENDPOINT = import.meta.env.APPWRITE_ENDPOINT ?? '';
const APPWRITE_PROJECT  = import.meta.env.APPWRITE_PROJECT_ID ?? '';

function getPublicUrl(fileId: string) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_MEDIA}/files/${fileId}/view?project=${APPWRITE_PROJECT}`;
}

// ── GET ── lista arquivos do bucket
export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const s = getStorage();
    const res = await s.listFiles(BUCKET_MEDIA);
    const media = res.files.map((f: any) => ({
      name: f.name,
      id:   f.$id,
      url:  getPublicUrl(f.$id),
    }));
    return json({ ok: true, media });
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

// ── POST ── faz upload de imagem
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return json({ ok: false, error: 'Nenhum arquivo enviado' }, 400);

    const s = getStorage();
    const result = await s.createFile(BUCKET_MEDIA, ID.unique(), file);
    return json({ ok: true, file: { id: result.$id, name: result.name, url: getPublicUrl(result.$id) } });
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

// ── DELETE ── remove arquivo do bucket
export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { id } = await request.json();
    if (!id) return json({ ok: false, error: 'ID inválido' }, 400);
    const s = getStorage();
    await s.deleteFile(BUCKET_MEDIA, id);
    return json({ ok: true });
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};
