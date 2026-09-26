// Netlify Function: serves the Express API at /api/* on the same address as the storefront
// (wired up in netlify.toml). Needs MONGODB_URI and JWT_SECRET in Netlify's environment variables.
import serverless from 'serverless-http';
import { ConfigError, loadConfig } from '../src/config.js';
import { connectDB } from '../src/db.js';
import { ensureCatalog } from '../src/catalog.js';
import { createApp } from '../src/app.js';

// Built once per warm function instance and reused by later requests.
let ready;

const init = async () => {
  const config = loadConfig();
  await connectDB(config.mongoUri, { dbName: config.dbName });
  await ensureCatalog();
  return serverless(createApp(config));
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Requests arrive as /api/... through the redirect, or as /.netlify/functions/api/... directly.
  event.path = (event.path || '/').replace(/^\/\.netlify\/functions\/api(?=\/|$)/, '/api');

  let app;
  try {
    app = await (ready ??= init());
  } catch (err) {
    ready = undefined; // try again on the next request
    if (err instanceof ConfigError) {
      console.error(err.message);
      return json(500, { error: `Server setup incomplete: ${err.message}` });
    }
    console.error('API startup failed:', err);
    return json(503, {
      error: 'Could not connect to the database. Check MONGODB_URI (username and password) and that MongoDB Atlas Network Access allows 0.0.0.0/0.',
    });
  }
  return app(event, context);
};
