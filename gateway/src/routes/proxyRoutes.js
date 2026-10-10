const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { createDjangoProxy } = require('../middleware/proxyMiddleware');

const proxyHandler = createDjangoProxy();

// Configure Multer for in-memory upload handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Profile endpoints forwarded to Django
router.get('/profile', verifyToken, proxyHandler);
router.put('/profile', verifyToken, proxyHandler);
router.post('/profile', verifyToken, proxyHandler);

// Phase 2: Resume endpoints forwarded to Django
router.get('/resume/latest', verifyToken, proxyHandler);

router.post('/resume/upload', verifyToken, upload.single('file'), async (req, res) => {
  const djangoBaseUrl = process.env.DJANGO_URL || 'http://127.0.0.1:8000';
  const gatewaySecret = process.env.GATEWAY_SECRET || 'ascendix_internal_secret_gateway_token_9981';
  const targetUrl = `${djangoBaseUrl}/api/resume/upload/`;

  try {
    let headers = {
      'x-user-id': req.user ? req.user.userId : '',
      'x-user-email': req.user ? req.user.email : '',
      'x-gateway-secret': gatewaySecret,
    };

    let postData;

    if (req.file) {
      // Create FormData with native Blob/Buffer
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      headers = {
        ...headers,
        ...formData.getHeaders(),
      };
      postData = formData;
    } else if (req.body && req.body.raw_text) {
      headers['content-type'] = 'application/json';
      postData = req.body;
    } else {
      return res.status(400).json({
        success: false,
        error: 'No resume file provided. Please attach a PDF document.',
      });
    }

    const response = await axios.post(targetUrl, postData, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 20000,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Gateway Resume Upload Error]:', error.message);
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { success: false, error: error.message };
    return res.status(status).json(data);
  }
});

// Phase 2: Target Roles endpoints forwarded to Django
router.get('/roles', verifyToken, proxyHandler);
router.post('/roles/select', verifyToken, proxyHandler);

// Phase 3: Skill Gap and Roadmap endpoints forwarded to Django
router.get('/skill-gap', verifyToken, proxyHandler);
router.get('/roadmap', verifyToken, proxyHandler);
router.patch('/roadmap/tasks/:id', verifyToken, proxyHandler);
router.post('/roadmap/tasks/:id/toggle', verifyToken, proxyHandler);

// Phase 4: Calibration Assessments forwarded to Django
router.get('/assessments/topics', verifyToken, proxyHandler);
router.get('/assessments/quiz/:topicId', verifyToken, proxyHandler);
router.post('/assessments/submit', verifyToken, proxyHandler);
router.get('/assessments/history', verifyToken, proxyHandler);

// Phase 4: Placement Readiness Score forwarded to Django
router.get('/readiness', verifyToken, proxyHandler);

// Company Eligibility, Admin Company Management & Notifications forwarded to Django
router.get('/companies', verifyToken, proxyHandler);
router.post('/companies', verifyToken, requireAdmin, proxyHandler);
router.get('/companies/eligibility', verifyToken, proxyHandler);
router.get('/companies/:id', verifyToken, proxyHandler);
router.put('/companies/:id', verifyToken, requireAdmin, proxyHandler);
router.delete('/companies/:id', verifyToken, requireAdmin, proxyHandler);
router.patch('/companies/:id/publish', verifyToken, requireAdmin, proxyHandler);
router.post('/companies/:id/publish', verifyToken, requireAdmin, proxyHandler);
router.get('/notifications', verifyToken, proxyHandler);
router.patch('/notifications/read-all', verifyToken, proxyHandler);
router.post('/notifications/read-all', verifyToken, proxyHandler);
router.patch('/notifications/:id/read', verifyToken, proxyHandler);
router.post('/notifications/:id/read', verifyToken, proxyHandler);

module.exports = router;

