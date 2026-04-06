import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import { stopService } from '../services/stopService.js';

const router = Router();

router.get('/nearby',
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('lat inválida'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('lng inválida'),
    query('city_id').isUUID().withMessage('city_id inválido'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { lat, lng, city_id } = req.query;
      const stops = await stopService.findNearest(
        parseFloat(lat),
        parseFloat(lng),
        city_id
      );
      res.json(stops);
    } catch (err) { next(err); }
  }
);

export default router;