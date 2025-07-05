const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /status-analytics - Get status analytics
router.get('/', async (req, res, next) => {
  try {
    const statuses = await analyticsService.getStatusAnalytics();
    
    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
