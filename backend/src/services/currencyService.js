import { assertSafeUrl } from '../middleware/safeUrl.js';

const cache = new Map();
const TTL = 60 * 60 * 1000;

export const currencyService = {
  async convert(results, from, to) {
    const rate = await this.getRate(from, to);
    return results.map(r => ({
      ...r,
      estimated_price: Math.round(r.estimated_price * rate * 100) / 100,
      currency: to,
    }));
  },

  async getRate(from, to) {
    const key = `${from}_${to}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < TTL) return cached.rate;

    const url = `https://api.frankfurter.dev/v2/rates?base=${from}&quotes=${to}`;
    assertSafeUrl(url);

    const res  = await fetch(url);
    const data = await res.json();
    const rate = data.rates?.[to];
    if (!rate) throw new Error(`No se pudo obtener ${from}→${to}`);

    cache.set(key, { rate, ts: Date.now() });
    return rate;
  },
};