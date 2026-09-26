// Reads and validates environment variables once, failing fast with a clear message.

const fail = (message) => {
  console.error(`\n[config] ${message}\n`);
  process.exit(1);
};

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) fail(`Missing ${name}. Copy server/.env.example to server/.env and fill it in.`);
  return value;
};

export const loadConfig = () => {
  const jwtSecret = required('JWT_SECRET');
  if (jwtSecret.length < 32) fail('JWT_SECRET must be at least 32 characters long.');

  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: required('MONGODB_URI'),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    // Comma-separated list of sites allowed to call the API from a browser.
    clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
  };
};
