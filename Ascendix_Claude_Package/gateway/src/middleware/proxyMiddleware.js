const axios = require('axios');

/**
 * Proxy Forwarder Middleware:
 * Forwards authenticated requests to the Django REST Framework domain service.
 * Injects trusted headers:
 * - X-User-Id
 * - X-User-Email
 * - X-Gateway-Secret
 */
function createDjangoProxy(subPathPrefix = '/api') {
  return async (req, res) => {
    const djangoBaseUrl = process.env.DJANGO_URL || 'http://127.0.0.1:8000';
    const gatewaySecret = process.env.GATEWAY_SECRET || '[REDACTED]';

    // Construct destination URL on Django
    // req.originalUrl will be e.g. /api/profile or /api/profile/
    // Ensure trailing slash for Django REST convention if needed
    let [basePath] = req.originalUrl.split('?');
    if (!basePath.endsWith('/')) {
      basePath += '/';
    }

    const targetUrl = `${djangoBaseUrl}${basePath}`;

    const headers = {
      'content-type': 'application/json',
      'x-user-id': req.user ? req.user.userId : '',
      'x-user-email': req.user ? req.user.email : '',
      'x-user-role': req.user ? (req.user.role || 'STUDENT') : 'STUDENT',
      'x-gateway-secret': gatewaySecret,
    };

    try {
      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers,
        data: req.body,
        params: req.query,
        validateStatus: () => true, // Forward any status code directly
        timeout: 15000,
      });

      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Gateway Proxy Error] Failed forwarding to ${targetUrl}:`, error.message);

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
          success: false,
          error: 'Domain service (Django) is temporarily unavailable. Please verify the backend is running.',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Gateway proxy error while communicating with domain engine.',
        details: error.message,
      });
    }
  };
}

module.exports = {
  createDjangoProxy,
};
