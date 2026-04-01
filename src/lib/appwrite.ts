import { Client, Databases, Storage, ID } from 'node-appwrite';

const ENDPOINT = import.meta.env.APPWRITE_ENDPOINT ?? '';
const PROJECT  = import.meta.env.APPWRITE_PROJECT_ID ?? '';
const API_KEY  = import.meta.env.APPWRITE_API_KEY ?? '';

export const DB_ID        = import.meta.env.APPWRITE_DB_ID ?? '';
export const COL_CONTENT  = import.meta.env.APPWRITE_COLLECTION_CONTENT ?? 'site_content';
export const COL_PRODUCTS = import.meta.env.APPWRITE_COLLECTION_PRODUCTS ?? 'products';
export const BUCKET_MEDIA = import.meta.env.APPWRITE_BUCKET_MEDIA ?? 'media';

export function getClient() {
  return new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
}
export const getDatabases = () => new Databases(getClient());
export const getStorage   = () => new Storage(getClient());
export { ID };
