import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { errorHandler, notFound } from './middleware/errors.js';

export const createApp = (config) => {
  const app = express();

  // Render / Railway / Fly run behind one proxy; needed for real client IPs in rate limiting.
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      // Only the storefront(s) listed in CLIENT_ORIGIN may call the API from a browser.
      origin: (origin, cb) => cb(null, !origin || config.clientOrigins.includes(origin)),
      methods: ['GET', 'POST', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/', (_req, res) => res.json({ name: 'WEARSUPER API', status: 'ok' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter(config));
  app.use('/api/products', productsRouter());
  app.use('/api/orders', ordersRouter(config));

  app.use(notFound);
  app.use(errorHandler);
  return app;
};
