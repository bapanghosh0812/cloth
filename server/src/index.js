// Standalone server (local development, or any Node host). On Netlify the API runs as a
// function instead — see server/functions/api.js.
import { loadConfig } from './config.js';
import { connectDB, disconnectDB } from './db.js';
import { ensureCatalog } from './catalog.js';
import { createApp } from './app.js';

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(`\n[config] ${err.message}\n`);
  process.exit(1);
}

try {
  await connectDB(config.mongoUri, { dbName: config.dbName });
  console.log('MongoDB connected');
} catch (err) {
  console.error(`\nCould not connect to MongoDB: ${err.message}`);
  console.error('Check MONGODB_URI, your database user/password, and that Atlas "Network Access" allows this IP.\n');
  process.exit(1);
}

const seeded = await ensureCatalog();
if (seeded) console.log(`Empty database — added ${seeded.total} catalogue products`);

const server = createApp(config).listen(config.port, () => {
  console.log(`WEARSUPER API listening on http://localhost:${config.port}`);
});

const shutdown = () => {
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
