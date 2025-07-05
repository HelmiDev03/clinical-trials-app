const express = require('express');
const router = express.Router();
const clinicalTrialsService = require('../services/clinicalTrialsService');

// GET /api/trials - Get trials with filtering
router.get('/', async (req, res, next) => {
  try {
    const {
      searchTerm,
      condition,
      country,
      status,
      phase,
      page = 1,
      limit = 10,
      pageToken  // For API pagination
    } = req.query;

    const filters = {
      searchTerm,
      condition,
      country,
      status,
      phase,
      page: parseInt(page),
      limit: parseInt(limit),
      pageToken
    };

    const result = await clinicalTrialsService.getTrials(filters);
    
    res.json({
      success: true,
      data: result.trials,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextPageToken: result.nextPageToken,
        prevPageToken: result.prevPageToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trials/:nctId - Get specific trial details
router.get('/:nctId', async (req, res, next) => {
  try {
    const { nctId } = req.params;
    
    const trial = await clinicalTrialsService.getTrialById(nctId);
    
    if (!trial) {
      return res.status(404).json({
        success: false,
        error: 'Trial not found'
      });
    }

    res.json({
      success: true,
      data: trial
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
