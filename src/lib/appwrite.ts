import { Client, Databases, Storage, ID } from 'node-appwrite';

export { ID };

// Constantes exportadas que dependem do env do request
export const COL_CONTENT = 'site_content';
export const COL_PRODUCTS = 'products';
export const BUCKET_MEDIA = 'media';

// env vem do locals.runtime.env de cada request
export function getClient(env: any) {
  const endpoint = env.APPWRITE_ENDPOINT ?? '';
  const project = env.APPWRITE_PROJECT_ID ?? '';
  const apiKey = env.APPWRITE_API_KEY ?? '';
  return new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
}

export function getDatabases(env: any) {
  return new Databases(getClient(env));
}

export function getStorage(env: any) {
  return new Storage(getClient(env));
}

export function getEnvIds(env: any) {
  return {
    DB_ID: env.APPWRITE_DB_ID ?? '',
    COL_CONTENT: env.APPWRITE_COLLECTION_CONTENT ?? 'site_content',
    COL_PRODUCTS: env.APPWRITE_COLLECTION_PRODUCTS ?? 'products',
    BUCKET_MEDIA: env.APPWRITE_BUCKET_MEDIA ?? 'media',
  };
}