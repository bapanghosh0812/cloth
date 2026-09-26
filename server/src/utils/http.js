export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const isEmail = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Trimmed string within bounds, or throws a 400 naming the field.
export const text = (value, field, { min = 1, max = 200 } = {}) => {
  const v = typeof value === 'string' ? value.trim() : '';
  if (v.length < min || v.length > max) {
    throw new HttpError(400, min > 0 && !v ? `${field} is required` : `${field} must be ${min}–${max} characters`);
  }
  return v;
};
