// Reads and validates environment variables, with messages that say exactly what to fix.

export class ConfigError extends Error {}

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ConfigError(`Missing ${name}. Set it in server/.env locally, or in Netlify → Site configuration → Environment variables.`);
  }
  return value;
};

export const loadConfig = () => {
  const mongoUri = required('MONGODB_URI');
  if (/<[^>]+>/.test(mongoUri)) {
    throw new ConfigError('MONGODB_URI still contains a placeholder like <db_password> — replace it with your real database password.');
  }

  const jwtSecret = required('JWT_SECRET');
  if (jwtSecret.length < 32) throw new ConfigError('JWT_SECRET must be at least 32 characters long.');

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri,
    // Database name, so the Atlas connection string can be pasted exactly as Atlas shows it.
    dbName: process.env.MONGODB_DB?.trim() || 'wearsuper',
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    // Comma-separated list of other sites allowed to call the API from a browser.
    // Not needed on Netlify, where the storefront and the API share one address.
    clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
  };
};
