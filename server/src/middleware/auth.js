import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from '../utils/http.js';

export const signToken = (user, { jwtSecret, jwtExpiresIn }) =>
  jwt.sign({ sub: String(user._id) }, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS256' });

// Requires `Authorization: Bearer <token>`; attaches the signed-in user as req.user.
export const requireAuth = (config) => async (req, _res, next) => {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Please sign in to continue');

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Your session has expired — please sign in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Account not found — please sign in again');
  req.user = user;
  next();
};
