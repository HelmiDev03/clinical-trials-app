const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /country-analytics - Get country analytics
router.get('/', async (req, res, next) => {
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

module.exports = router;
