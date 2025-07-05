const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /phase-analytics - Get phase analytics
router.get('/', async (req, res, next) => {
  try {
    const phases = await analyticsService.getPhaseAnalytics();
    
    res.json({
      success: true,
      data: phases
    });
  } catch (error) {
    next(error);
  }
});

// GET /phase-analytics/distribution - Get phase size distribution
router.get('/distribution', async (req, res, next) => {
  try {
    const distribution = await analyticsService.getPhaseDistributionAnalytics();
    
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
