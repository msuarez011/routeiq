export function validateEnv() {
    const required = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_KEY',
      'SUPABASE_ANON_KEY',
      'FRONTEND_URL',
    ];
  
    const missing = required.filter(key => !process.env[key]);
  
    if (missing.length > 0) {
      console.error('Variables de entorno faltantes:', missing.join(', '));
      process.exit(1);
    }
  
    console.log('Variables de entorno OK');
  }