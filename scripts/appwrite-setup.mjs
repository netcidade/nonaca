// Script de setup do Appwrite para o projeto Nonaca
// Executa: node scripts/appwrite-setup.mjs
import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

const ENDPOINT  = 'https://appwrite-chjf8p91ixyxxjdpbv4cppl7.138.201.188.208.sslip.io/v1';
const PROJECT   = '69cd498c002c9098b10d';
const API_KEY   = 'standard_223a0c76ab473b1eaa1062b82d4d93acee13c69a521ac64f6f38a13c285ee3eac65fc669c953826d21a4ee6f0ce5f75c28a9ef9b4284f20b90b585ff655eb65b86368d954b0838512df75738a1b081037b9a8bb1c5c5a9c24773a9a07aa57af6bb46f5e56ad200ecdd69434ddfd479cdb5601314105ba10018b677f6cf5abe3e';
const DB_ID     = '69cd4f8200023db2ed87';

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage   = new Storage(client);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Deleta collection se existir (cleanup)
async function deleteCollectionIfExists(colId) {
  try {
    await databases.deleteCollection(DB_ID, colId);
    console.log(`   🗑️  Collection ${colId} anterior removida`);
    await sleep(1000);
  } catch(e) { /* não existe, ok */ }
}

async function main() {
  console.log('🚀 Iniciando setup do Appwrite para Nonaca...\n');

  // ── 1. Collection: site_content ──────────────────────
  // Schema simples: key (64) + data (65535) = 2 atributos, total ~65KB
  await deleteCollectionIfExists('site_content');
  console.log('📁 Criando collection site_content...');
  await databases.createCollection(
    DB_ID, 'site_content', 'site_content',
    [Permission.read(Role.any())]
  );
  await sleep(500);
  await databases.createStringAttribute(DB_ID, 'site_content', 'key',  64,    true);
  await sleep(500);
  await databases.createStringAttribute(DB_ID, 'site_content', 'data', 65535, true);
  console.log('   ✅ site_content pronto\n');

  // ── 2. Collection: products ──────────────────────────
  // Schema simples: slug (128) + data (65535) = produto inteiro como JSON blob
  await deleteCollectionIfExists('products');
  console.log('📦 Criando collection products...');
  await databases.createCollection(
    DB_ID, 'products', 'products',
    [Permission.read(Role.any())]
  );
  await sleep(500);
  await databases.createStringAttribute(DB_ID, 'products', 'slug', 128,   true);
  await sleep(500);
  await databases.createStringAttribute(DB_ID, 'products', 'data', 65535, true);
  console.log('   ✅ products pronto\n');

  // ── 3. Bucket: media ─────────────────────────────────
  console.log('🖼️  Criando bucket media...');
  try {
    await storage.deleteBucket('media');
    console.log('   🗑️  Bucket anterior removido');
    await sleep(1000);
  } catch(e) { /* não existe */ }

  await storage.createBucket(
    'media', 'media',
    [Permission.read(Role.any())],
    false, false, 10485760,
    ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
  );
  console.log('   ✅ Bucket media pronto\n');

  // ── 4. Aguarda índices ficarem prontos ────────────────
  console.log('⏳ Aguardando índices ficarem prontos (8s)...');
  await sleep(8000);

  // ── 5. Seed: pages.json → site_content ───────────────
  console.log('\n📄 Migrando pages.json...');
  const pagesData = fs.readFileSync(path.join(process.cwd(), 'src/content/pages.json'), 'utf8');
  await databases.createDocument(DB_ID, 'site_content', ID.unique(), {
    key: 'pages',
    data: pagesData,
  });
  console.log('   ✅ pages.json migrado!');

  // ── 6. Seed: products.json → products ────────────────
  console.log('\n📦 Migrando products...');
  const products = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/products.json'), 'utf8'));
  for (const p of products) {
    await databases.createDocument(DB_ID, 'products', ID.unique(), {
      slug: p.slug,
      data: JSON.stringify(p),
    });
    console.log('   ✅', p.name);
  }

  console.log('\n🎉 Setup concluído com sucesso!');
  console.log('\n📋 Adicione ao .env do projeto:');
  console.log('─'.repeat(60));
  console.log(`APPWRITE_ENDPOINT=${ENDPOINT}`);
  console.log(`APPWRITE_PROJECT_ID=${PROJECT}`);
  console.log(`APPWRITE_API_KEY=<sua-api-key>`);
  console.log(`APPWRITE_DB_ID=${DB_ID}`);
  console.log(`APPWRITE_COLLECTION_CONTENT=site_content`);
  console.log(`APPWRITE_COLLECTION_PRODUCTS=products`);
  console.log(`APPWRITE_BUCKET_MEDIA=media`);
  console.log('─'.repeat(60));
}

main().catch(e => { console.error('\n❌ Erro fatal:', e.message || e); process.exit(1); });
