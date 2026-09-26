// `npm run dev:memory` — runs the API against a throwaway in-memory MongoDB (no Atlas needed).
// Everything is lost when you stop it; use MongoDB Atlas (`npm run dev`) for real data.
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Reuse the MongoDB binary cached under server/node_modules, whatever folder this is started from.
process.env.MONGOMS_DOWNLOAD_DIR ||= fileURLToPath(new URL('../node_modules/.cache/mongodb-memory-server', import.meta.url));

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('wearsuper');
process.env.JWT_SECRET ||= randomBytes(32).toString('hex');
console.log('In-memory MongoDB started (data resets on exit)');

const stop = () => mongo.stop().finally(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

await import('../src/index.js');
