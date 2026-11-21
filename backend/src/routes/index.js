const express = require('express');
const healthRoutes = require('./healthRoutes');
const intelligenceRoutes = require('./intelligenceRoutes');
const locationRoutes = require('./locationRoutes');
const aiRoutes = require('./aiRoutes');
const weatherRoutes = require('./weatherRoutes');

const router = express.Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/intelligence', intelligenceRoutes);
router.use('/location', locationRoutes);
router.use('/ai', aiRoutes);
router.use('/weather', weatherRoutes);

// Root API welcome endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'BlindSpot API',
    version: '1.0.0',
    documentation: '/api/health for system diagnostic status',
    status: 'online',
  });
});

module.exports = router;
