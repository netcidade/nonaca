import type { APIRoute } from 'astro';
import { getStorage, getEnvIds, ID } from '../../../lib/appwrite';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

function isAuthorized(cookies: any, env: any) {
  const ADMIN_TOKEN = env.ADMIN_TOKEN ?? 'nonaca2025';
  return cookies.get('nonaca_admin_session')?.value === ADMIN_TOKEN;
}

function getPublicUrl(fileId: string, env: any) {
  const endpoint = env.APPWRITE_ENDPOINT ?? '';
  const project = env.APPWRITE_PROJECT_ID ?? '';
  const bucket = env.APPWRITE_BUCKET_MEDIA ?? 'media';
  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
}

export const GET: APIRoute = async ({ cookies, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { BUCKET_MEDIA } = getEnvIds(env);
    const s = getStorage(env);
    const res = await s.listFiles(BUCKET_MEDIA);
    const media = res.files.map((f: any) => ({
      name: f.name,
      id: f.$id,
      url: getPublicUrl(f.$id, env),
    }));
    return json({ ok: true, media });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return json({ ok: false, error: 'Nenhum arquivo enviado' }, 400);
    const { BUCKET_MEDIA } = getEnvIds(env);
    const s = getStorage(env);
    const result = await s.createFile(BUCKET_MEDIA, ID.unique(), file);
    return json({ ok: true, file: { id: result.$id, name: result.name, url: getPublicUrl(result.$id, env) } });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const env = (locals as any).runtime?.env ?? {};
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { id } = await request.json();
    if (!id) return json({ ok: false, error: 'ID inválido' }, 400);
    const { BUCKET_MEDIA } = getEnvIds(env);
    const s = getStorage(env);
    await s.deleteFile(BUCKET_MEDIA, id);
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};