import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { User } from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { HttpError, isEmail, text } from '../utils/http.js';

const BCRYPT_COST = 12;
// Compared against when an email is unknown, so both paths take the same time.
// Created on first use rather than at startup, to keep serverless cold starts quick.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash('wearsuper-timing-guard', BCRYPT_COST));

// Netlify passes the visitor's IP in its own header; elsewhere Express's req.ip is correct.
const clientKey = (req) => ipKeyGenerator(req.get('x-nf-client-connection-ip') || req.ip || '0.0.0.0');

export const authRouter = (config) => {
  const router = Router();

  // Slows down password guessing and signup spam.
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.authRateLimit ?? 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: clientKey,
    message: { error: 'Too many attempts — please wait a few minutes and try again' },
  });

  router.post('/signup', limiter, async (req, res) => {
    const name = text(req.body?.name, 'Name', { max: 60 });
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = req.body?.password;

    if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email address');
    if (typeof password !== 'string' || password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }
    if (Buffer.byteLength(password) > 72) throw new HttpError(400, 'Password must be at most 72 characters');
    if (await User.exists({ email })) {
      throw new HttpError(409, 'An account with this email already exists — please sign in');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user, config), user });
  });

  router.post('/login', limiter, async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) throw new HttpError(400, 'Enter your email and password');

    const user = await User.findOne({ email }).select('+passwordHash');
    const ok = await bcrypt.compare(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !ok) throw new HttpError(401, 'Incorrect email or password');

    res.json({ token: signToken(user, config), user });
  });

  router.get('/me', requireAuth(config), (req, res) => {
    res.json({ user: req.user });
  });

  return router;
};
