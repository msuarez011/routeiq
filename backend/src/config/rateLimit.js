import rateLimit from 'express-rate-limit';

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados requests. Intenta en unos minutos.' },
});

export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Límite de búsquedas alcanzado. Espera un momento.' },
});