const ALLOWED_DOMAINS = [
    'nominatim.openstreetmap.org',
    'api.frankfurter.dev',
  ];
  
  export function assertSafeUrl(url) {
    try {
      const { hostname } = new URL(url);
      if (!ALLOWED_DOMAINS.includes(hostname)) {
        throw new Error(`Dominio no permitido: ${hostname}`);
      }
    } catch (err) {
      if (err.message.includes('no permitido')) throw err;
      throw new Error(`URL inválida: ${url}`);
    }
  }