// Thin fetch wrapper for the WEARSUPER API.
// Dev: Vite proxies /api to the local server. Production: set VITE_API_URL (e.g. https://your-api.onrender.com/api).
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'ws_token';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — the session just won't survive a reload */
  }
};

export const api = async (path, { method = 'GET', body, timeout = 60000 } = {}) => {
  const token = getToken();
  const controller = new AbortController();
  // Generous timeout: free hosting tiers can take ~30–50s to wake up on the first request.
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('Cannot reach the WEARSUPER server right now. Please try again in a moment.', 0);
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Our API always answers with JSON. No JSON body means we reached something else: a gateway
    // while the server sleeps/restarts, or a host with no API behind it (VITE_API_URL not set).
    const unavailable = !data?.error && (data === null || res.status >= 500);
    const message = unavailable
      ? 'The WEARSUPER server is waking up or unavailable. Please try again in a moment.'
      : data?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data;
};
