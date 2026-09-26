// `npm run seed` — copies shared/catalog.js into MongoDB (safe to run again after catalogue edits).
import { connectDB, disconnectDB } from './db.js';
import { syncCatalog } from './catalog.js';

const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  console.error('Missing MONGODB_URI. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

try {
  await connectDB(uri, { dbName: process.env.MONGODB_DB?.trim() || 'wearsuper' });
  const r = await syncCatalog();
  console.log(`Catalogue synced: ${r.total} products (${r.inserted} new, ${r.updated} updated, ${r.hidden} hidden).`);
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
