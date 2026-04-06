export function errorHandler(err, req, res, _next) {
    console.error({
      message: err.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  
    const status = err.status || err.statusCode || 500;
    const message = status < 500
      ? err.message
      : 'Error interno del servidor';
  
    res.status(status).json({ error: message });
  }