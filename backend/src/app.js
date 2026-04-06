import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsMiddleware } from './config/cors.js';
import { globalRateLimit } from './config/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

import citiesRouter    from './routes/cities.routes.js';
import operatorsRouter from './routes/operators.routes.js';
import stopsRouter     from './routes/stops.routes.js';
import favoritesRouter from './routes/favorites.routes.js';
import searchRouter    from './routes/search.routes.js';

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(globalRateLimit);
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

app.use('/api/cities',    citiesRouter);
app.use('/api/operators', operatorsRouter);
app.use('/api/stops',     stopsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/search',    searchRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'RouteIQ' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

export default app;