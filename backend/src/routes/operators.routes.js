import { Router } from 'express';
import supabase from '../config/supabase.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { city_id } = req.query;
    if (!city_id) return res.status(400).json({ error: 'city_id requerido' });

    const { data, error } = await supabase
      .from('v_operators_with_fare')
      .select('*')
      .eq('city_id', city_id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

export default router;