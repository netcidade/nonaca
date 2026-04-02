import { Client, Databases, Storage, ID } from 'node-appwrite';

export { ID };

// Constantes exportadas que dependem do env do request
export const COL_CONTENT = 'site_content';
export const COL_PRODUCTS = 'products';
export const BUCKET_MEDIA = 'media';

/**
 * Mescla o env do Cloudflare runtime (producao/wrangler dev)
 * com o import.meta.env do Vite (npm run dev local).
 * O runtime tem prioridade quando disponivel.
 */
export function mergeEnv(runtimeEnv: any): any {
  const viteEnv: Record<string, string> = {
    APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT ?? import.meta.env.APPWRITE_ENDPOINT ?? '',
    APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID ?? import.meta.env.APPWRITE_PROJECT_ID ?? '',
    APPWRITE_API_KEY: import.meta.env.VITE_APPWRITE_API_KEY ?? import.meta.env.APPWRITE_API_KEY ?? '',
    APPWRITE_DB_ID: import.meta.env.APPWRITE_DB_ID ?? '',
    APPWRITE_COLLECTION_CONTENT: import.meta.env.APPWRITE_COLLECTION_CONTENT ?? 'site_content',
    APPWRITE_COLLECTION_PRODUCTS: import.meta.env.APPWRITE_COLLECTION_PRODUCTS ?? 'products',
    APPWRITE_BUCKET_MEDIA: import.meta.env.APPWRITE_BUCKET_MEDIA ?? 'media',
    ADMIN_TOKEN: import.meta.env.ADMIN_TOKEN ?? 'nonaca2025',
    SITE_URL: import.meta.env.SITE_URL ?? 'https://nonaca.com.br',
  };
  // runtimeEnv (Cloudflare) tem prioridade; fallback para viteEnv
  return { ...viteEnv, ...runtimeEnv };
}

// env vem do locals.runtime.env de cada request
export function getClient(env: any) {
  const merged = mergeEnv(env);
  const endpoint = merged.APPWRITE_ENDPOINT ?? '';
  const project = merged.APPWRITE_PROJECT_ID ?? '';
  const apiKey = merged.APPWRITE_API_KEY ?? '';
  return new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
}

export function getDatabases(env: any) {
  return new Databases(getClient(env));
}

export function getStorage(env: any) {
  return new Storage(getClient(env));
}

export function getEnvIds(env: any) {
  const merged = mergeEnv(env);
  return {
    DB_ID: merged.APPWRITE_DB_ID ?? '',
    COL_CONTENT: merged.APPWRITE_COLLECTION_CONTENT ?? 'site_content',
    COL_PRODUCTS: merged.APPWRITE_COLLECTION_PRODUCTS ?? 'products',
    BUCKET_MEDIA: merged.APPWRITE_BUCKET_MEDIA ?? 'media',
  };
}

export function getAdminToken(env: any): string {
  return mergeEnv(env).ADMIN_TOKEN ?? 'nonaca2025';
}
