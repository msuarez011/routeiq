import 'dotenv/config';
import { validateEnv } from './config/env.js';
import app from './app.js';

validateEnv();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RouteIQ backend corriendo en puerto ${PORT}`);
});