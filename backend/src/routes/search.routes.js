import { Router } from 'express';
import { body } from 'express-validator';
import { searchRateLimit } from '../config/rateLimit.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/',
  searchRateLimit,
  [
    body('origin_lat').isFloat({ min: -90, max: 90 }),
    body('origin_lng').isFloat({ min: -180, max: 180 }),
    body('dest_lat').isFloat({ min: -90, max: 90 }),
    body('dest_lng').isFloat({ min: -180, max: 180 }),
    body('city_id').isUUID(),
    body('currency').optional().isLength({ min: 3, max: 3 }),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { origin_lat, origin_lng, dest_lat, dest_lng, city_id, currency = 'COP' } = req.body;

      const { default: supabase }         = await import('../config/supabase.js');
      const { priceService }              = await import('../services/priceService.js');
      const { stopService }               = await import('../services/stopService.js');
      const { currencyService }           = await import('../services/currencyService.js');

      const { data: operators, error } = await supabase
        .from('v_operators_with_fare')
        .select('*')
        .eq('city_id', city_id);
      if (error) throw error;

      const distanceKm    = haversineKm(origin_lat, origin_lng, dest_lat, dest_lng);
      const nearestStops  = await stopService.findNearest(origin_lat, origin_lng, city_id);
      let results         = priceService.calculateAll(operators, distanceKm, nearestStops);

      if (currency !== 'COP') {
        results = await currencyService.convert(results, 'COP', currency);
      }

      res.json({ results, distance_km: Math.round(distanceKm * 10) / 10, currency });
    } catch (err) { next(err); }
  }
);

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default router;