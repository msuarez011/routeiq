import { Router } from 'express';
import supabase from '../config/supabase.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name, country, lat, lng, currency_code')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

export default router;