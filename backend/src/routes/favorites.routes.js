import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('favorites')
      .select('id, label, lat, lng, icon, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/',
  [
    body('label').trim().isLength({ min: 1, max: 60 }),
    body('lat').isFloat({ min: -90, max: 90 }),
    body('lng').isFloat({ min: -180, max: 180 }),
    body('icon').optional().isIn(['star','home','work','gym','school','hospital','other']),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
      const { label, lat, lng, icon = 'star' } = req.body;
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: req.user.id, label, lat, lng, icon })
        .select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

router.delete('/:id',
  [param('id').isUUID()],
  validateRequest,
  async (req, res, next) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id);
      if (error) throw error;
      res.status(204).send();
    } catch (err) { next(err); }
  }
);

export default router;