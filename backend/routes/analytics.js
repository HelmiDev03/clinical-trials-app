const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /api/analytics/countries - Get trials by country
router.get('/countries', async (req, res, next) => {
  try {
    const countries = await analyticsService.getCountryAnalytics();
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/statuses - Get trials by status
router.get('/statuses', async (req, res, next) => {
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

// GET /api/analytics/phases - Get trials by phase
router.get('/phases', async (req, res, next) => {
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

// GET /api/analytics/phase-distribution - Get phase size distribution
router.get('/phase-distribution', async (req, res, next) => {
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