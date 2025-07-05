const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://clinicaltrials.gov/api/v2';

class ClinicalTrialsService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClinicalTrials-Data-Platform/1.0'
      }
    });
  }

  /**
   * Get trials with filtering using optimized pagination for client-side filtering
   */
  async getTrials(filters = {}) {
    try {
      const {
        searchTerm,
        condition,
        country,
        status,
        phase,
        page = 1,
        limit = 10,
        pageToken
      } = filters;

      const currentPage = parseInt(page);
      const pageSize = parseInt(limit);

      // For regular API-supported filters, use standard pagination
      const params = {};
      params.pageSize = Math.min(pageSize, 100);

      // For first page or when no pageToken, request total count
      if (!pageToken) {
        params.countTotal = true;
      }

      // Add page token if provided (for subsequent pages)
      if (pageToken) {
        params.pageToken = pageToken;
      } else if (currentPage > 1) {
        console.warn(`Page ${currentPage} requires pageToken for access. Sequential navigation is required.`);
        return {
          trials: [],
          page: currentPage,
          limit: pageSize,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          nextPageToken: null,
          prevPageToken: null,
          error: 'PAGINATION_TOKEN_REQUIRED'
        };
      }

      // Build search queries using proper API v2 parameters
      if (searchTerm) {
        params['query.term'] = searchTerm;
      }

      if (condition) {
        if (Array.isArray(condition)) {
          params['query.cond'] = condition.join(',');
        } else {
          params['query.cond'] = condition;
        }
      }

      if (country) {
        if (Array.isArray(country)) {
          params['query.locn'] = country.map(c => c.replace(/ /g, '+')).join(' OR ');
        } else {
          params['query.locn'] = country.replace(/ /g, '+');
        }
      }

      if (status) {
        params['filter.overallStatus'] = status.toUpperCase();
      }

      if (phase) {
        params['filter.advanced'] = `AREA[Phase]${phase}`;
      }

      console.log('API Request params:', params);

      const response = await this.apiClient.get('/studies', { params });
      const studies = response.data.studies || [];
      let transformedTrials = studies.map(study => this.transformStudyToTrial(study));
      
      // Post-process for exact phase matching if phase filter was applied
      if (phase) {
        transformedTrials = transformedTrials.filter(trial => {
          if (!trial.phase || trial.phase === 'N/A' || trial.phase === 'NA' || trial.phase.trim() === '') {
            return false;
          }
          
          const trialPhases = trial.phase.split(', ');
          
          if (phase === 'Phase 1') {
            return trialPhases.includes('PHASE1') && trialPhases.length === 1;
          } else if (phase === 'Phase 2') {
            return trialPhases.includes('PHASE2') && trialPhases.length === 1;
          } else if (phase === 'Phase 3') {
            return trialPhases.includes('PHASE3') && trialPhases.length === 1;
          } else if (phase === 'Phase 4') {
            return trialPhases.includes('PHASE4') && trialPhases.length === 1;
          }
          
          return false;
        });
      }

      const totalCount = response.data.totalCount || 0;
      const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 
        (response.data.nextPageToken ? currentPage + 1 : currentPage);

      const hasNextPage = !!response.data.nextPageToken;
      const hasPrevPage = !!pageToken;

      return {
        trials: transformedTrials,
        page: currentPage,
        limit: pageSize,
        total: totalCount,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPageToken: response.data.nextPageToken,
        prevPageToken: response.data.prevPageToken
      };

    } catch (error) {
      console.error('Error fetching trials:', error.message);
      throw new Error(`Failed to fetch trials: ${error.message}`);
    }
  }

  /**
   * Optimized method for client-side filtering with proper pagination
   */
  async getTrialsWithClientSideFiltering(filters, targetPhase) {
    const { page = 1, limit = 10, searchTerm, condition, country, status } = filters;
    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);

    try {
      // Build cache key for this filter combination
      const cacheKey = this.buildCacheKey(filters, targetPhase);
      
      // Check if we have cached results for this filter combination
      if (!this.filterCache) {
        this.filterCache = new Map();
      }

      let allFilteredResults = this.filterCache.get(cacheKey);
      
      if (!allFilteredResults) {
        console.log(`Building cache for ${targetPhase} filter...`);
        allFilteredResults = await this.buildFilteredResultsCache(filters, targetPhase);
        this.filterCache.set(cacheKey, allFilteredResults);
        
        // Cache for 5 minutes to avoid repeated API calls
        setTimeout(() => {
          this.filterCache.delete(cacheKey);
        }, 5 * 60 * 1000);
      }

      // Calculate pagination
      const total = allFilteredResults.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const paginatedResults = allFilteredResults.slice(startIndex, endIndex);

      console.log(`${targetPhase} pagination: Page ${currentPage}/${totalPages}, Total: ${total}, Showing: ${paginatedResults.length}`);

      return {
        trials: paginatedResults,
        page: currentPage,
        limit: pageSize,
        total: total,
        totalPages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPageToken: null,
        prevPageToken: null
      };

    } catch (error) {
      console.error(`Error in client-side filtering for ${targetPhase}:`, error.message);
      throw error;
    }
  }

  /**
   * Build cache of filtered results for N/A filters
   */
  async buildFilteredResultsCache(filters, targetPhase) {
    const { searchTerm, condition, country, status } = filters;
    const allResults = [];
    let pageToken = null;
    let fetchedPages = 0;
    const maxPages = 15; // Fetch pages for coverage

    console.log(`Starting to build cache for ${targetPhase}...`);

    do {
      try {
        const params = {
          pageSize: 100, // Use max page size for efficiency
          countTotal: !pageToken
        };

        if (pageToken) {
          params.pageToken = pageToken;
        }

        // Apply non-phase filters
        if (searchTerm) {
          params['query.term'] = searchTerm;
        }
        if (condition) {
          if (Array.isArray(condition)) {
            params['query.cond'] = condition.join(',');
          } else {
            params['query.cond'] = condition;
          }
        }
        if (country) {
          if (Array.isArray(country)) {
            params['query.locn'] = country.map(c => c.replace(/ /g, '+')).join(' OR ');
          } else {
            params['query.locn'] = country.replace(/ /g, '+');
          }
        }
        if (status) {
          params['filter.overallStatus'] = status.toUpperCase();
        }

        const response = await this.apiClient.get('/studies', { params });
        const studies = response.data.studies || [];
        
        if (studies.length === 0) {
          break;
        }

        const transformedTrials = studies.map(study => this.transformStudyToTrial(study));
        
        // Filter for target phase
        const filteredTrials = transformedTrials.filter(trial => {
          if (targetPhase === 'N/A') {
            return this.isNAPhase(trial.phase);
          }
          return false;
        });

        allResults.push(...filteredTrials);
        pageToken = response.data.nextPageToken;
        fetchedPages++;

        console.log(`Fetched page ${fetchedPages}, got ${filteredTrials.length} ${targetPhase} studies (total so far: ${allResults.length})`);

        // Stop if we have enough results or reached max pages
        if (allResults.length >= 1000 || fetchedPages >= maxPages) {
          break;
        }

      } catch (error) {
        console.error(`Error fetching page ${fetchedPages + 1}:`, error.message);
        break;
      }
    } while (pageToken && fetchedPages < maxPages);

    console.log(`Cache built for ${targetPhase}: ${allResults.length} studies from ${fetchedPages} pages`);
    return allResults;
  }

  /**
   * Helper method to check if a phase is N/A
   */
  isNAPhase(phase) {
    if (!phase || phase === null || phase === undefined) {
      return true;
    }
    
    const normalizedPhase = phase.toString().trim().toLowerCase();
    
    return normalizedPhase === '' || 
           normalizedPhase === 'n/a' || 
           normalizedPhase === 'na' || 
           normalizedPhase === 'not applicable' ||
           normalizedPhase === 'not available' ||
           normalizedPhase === 'none' ||
           normalizedPhase === 'null';
  }

  /**
   * Build cache key for filter combination
   */
  buildCacheKey(filters, targetPhase) {
    const { searchTerm, condition, country, status } = filters;
    return `${targetPhase}_${searchTerm || ''}_${condition || ''}_${country || ''}_${status || ''}`;
  }

  /**
   * Get total count for current filters (optimized version)
   */
  async getTotalCount(filters = {}) {
    try {
      const {
        searchTerm,
        condition,
        country,
        status,
        phase
      } = filters;

      // For N/A phase, use the optimized approach
      if (phase === 'N/A') {
        return await this.getTotalCountForPhase(phase, filters);
      }

      const params = {
        pageSize: 1, // Minimum to just get the count
        countTotal: true
      };

      // Apply same filters as getTrials
      if (searchTerm) {
        params['query.term'] = searchTerm;
      }
      if (condition) {
        if (Array.isArray(condition)) {
          params['query.cond'] = condition.join(',');
        } else {
          params['query.cond'] = condition;
        }
      }
      if (country) {
        if (Array.isArray(country)) {
          params['query.locn'] = country.map(c => c.replace(/ /g, '+')).join(' OR ');
        } else {
          params['query.locn'] = country.replace(/ /g, '+');
        }
      }
      if (status) {
        params['filter.overallStatus'] = status.toUpperCase();
      }
      if (phase && phase !== 'N/A' && phase !== 'Multi-Phase') {
        params['filter.advanced'] = `AREA[Phase]${phase}`;
      }

      const response = await this.apiClient.get('/studies', { params });
      return response.data.totalCount || 0;
    } catch (error) {
      console.error('Error fetching total count:', error.message);
      return 0;
    }
  }

  /**
   * Get specific trial by NCT ID
   */
  async getTrialById(nctId) {
    try {
      const response = await this.apiClient.get(`/studies/${nctId}`);
      
      if (response.data && response.data.protocolSection) {
        return this.transformStudyToTrial(response.data);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching trial ${nctId}:`, error.message);
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch trial ${nctId}: ${error.message}`);
    }
  }

  /**
   * Transform ClinicalTrials.gov API response to our trial format
   */
  transformStudyToTrial(study) {
    const protocol = study.protocolSection || {};
    const identification = protocol.identificationModule || {};
    const status = protocol.statusModule || {};
    const conditions = protocol.conditionsModule || {};
    const design = protocol.designModule || {};
    const contacts = protocol.contactsLocationsModule || {};
    const sponsors = protocol.sponsorCollaboratorsModule || {};

    // Extract locations/countries - simple approach
    let allCountries = 'Not specified';
    let countriesArray = [];
    
    // Check if locations exist in the API response
    if (
      contacts &&
      Array.isArray(contacts.locations) &&
      contacts.locations.length > 0
    ) {
      const countries = [...new Set(
        contacts.locations
          .map(loc => loc.country)
          .filter(country => country && country.trim())
      )];

      if (countries.length > 0) {
        allCountries = countries.join(', ');
        countriesArray = countries;
      } else {
        allCountries = 'Not specified';
        countriesArray = [];
      }
    } else {
      // If no locations, set to 'Not specified'
      console.log('No locations found in the study data.');
      allCountries = 'Not specified';
      countriesArray = [];
    }

    // Extract conditions - show all conditions found
    const conditionsList = conditions.conditions || [];
    const allConditions = conditionsList.length > 0 ? conditionsList.join(', ') : 'Not specified';

    // Extract phases
    const phases = design.phases || [];
    const phase = phases.length > 0 ? phases.join(', ') : 'N/A';

    // Extract sponsor
    const sponsor = sponsors.leadSponsor?.name || 'Unknown';

    return {
      id: identification.nctId || '',
      nctId: identification.nctId || '',
      title: identification.briefTitle || 'No title available',
      condition: allConditions, // Now shows all conditions
      status: status.overallStatus || 'Unknown',
      phase: phase,
      country: allCountries, // Now shows all countries
      sponsor: sponsor,
      startDate: status.startDateStruct?.date || null,
      completionDate: status.completionDateStruct?.date || null,
      enrollmentCount: design.enrollmentInfo?.count || 0,
      studyType: design.studyType || 'Unknown',
      lastUpdateDate: status.lastUpdatePostDateStruct?.date || null,
      
      // Additional fields for detailed view
      officialTitle: identification.officialTitle || identification.briefTitle || '',
      briefSummary: protocol.descriptionModule?.briefSummary || '',
      detailedDescription: protocol.descriptionModule?.detailedDescription || '',
      conditions: conditionsList,
      countries: countriesArray, // Now uses the extracted countries array
      locations: (contacts.locations || []).map(loc => ({
        facility: loc.facility || '',
        city: loc.city || '',
        state: loc.state || '',
        country: loc.country || '',
        zip: loc.zip || ''
      })),
      eligibilityCriteria: protocol.eligibilityModule?.eligibilityCriteria || '',
      minimumAge: protocol.eligibilityModule?.minimumAge || '',
      maximumAge: protocol.eligibilityModule?.maximumAge || '',
      sex: protocol.eligibilityModule?.sex || 'ALL'
    };
  }

  /**
   * Calculate page token for pagination (simplified)
   */
  calculatePageToken(page, limit) {
    return (page - 1) * limit;
  }

  /**
   * Get trials for analytics (larger dataset)
   */
  async getTrialsForAnalytics(limit = 1000) {
    try {
      // Try multiple approaches to get real clinical trials data
      const searchStrategies = [
        // Strategy 1: Search for recruiting trials
        {
          pageSize: Math.min(limit, 1000),
          countTotal: true,
          'filter.overallStatus': 'RECRUITING'
        },
        // Strategy 2: Search for common conditions
        {
          pageSize: Math.min(limit, 1000),
          countTotal: true,
          'query.cond': 'cancer'
        },
        // Strategy 3: Search by phase
        {
          pageSize: Math.min(limit, 1000),
          countTotal: true,
          'filter.advanced': 'AREA[Phase]Phase 3'
        },
        // Strategy 4: Just get any recent studies (fallback)
        {
          pageSize: Math.min(limit, 1000),
          countTotal: true
        }
      ];

      for (let i = 0; i < searchStrategies.length; i++) {
        try {
          const params = searchStrategies[i];
          console.log(`Analytics API call attempt ${i + 1}:`, params);
          
          const response = await this.apiClient.get('/studies', { params });
          console.log(`Analytics API response attempt ${i + 1}:`, {
            totalCount: response.data.totalCount,
            studiesCount: response.data.studies?.length,
            hasStudies: !!response.data.studies
          });
          
          const studies = response.data.studies || [];
          
          if (studies.length > 0) {
            console.log(`Success with strategy ${i + 1}, got ${studies.length} studies`);
            return studies.map(study => this.transformStudyToTrial(study));
          }
          
          console.log(`Strategy ${i + 1} returned no results, trying next...`);
        } catch (strategyError) {
          console.warn(`Strategy ${i + 1} failed:`, strategyError.message);
          continue;
        }
      }
      
      console.warn('All analytics search strategies failed, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching trials for analytics:', error.message);
      console.error('Error details:', error.response?.data);
      // Return empty array instead of throwing, so analytics don't break completely
      return [];
    }
  }

  /**
   * Get total count for a specific phase (optimized version)
   */
  async getTotalCountForPhase(phase, filters = {}) {
    try {
      if (phase === 'N/A') {
        // For N/A phase, use the cached data or quick estimation
        const cacheKey = this.buildCacheKey(filters, 'N/A');
        
        if (this.naPhaseCache && this.naPhaseCache.has(cacheKey)) {
          const cachedData = this.naPhaseCache.get(cacheKey);
          if ((Date.now() - cachedData.timestamp) <= this.cacheTTL) {
            return cachedData.totalCount;
          }
        }
        
        // If no cache, do a quick estimation
        try {
          const params = {
            pageSize: 100,
            countTotal: true
          };

          // Apply filters
          if (filters.searchTerm) {
            params['query.term'] = filters.searchTerm;
          }
          if (filters.condition) {
            params['query.cond'] = Array.isArray(filters.condition) ? 
              filters.condition.join(',') : filters.condition;
          }
          if (filters.country) {
            params['query.locn'] = Array.isArray(filters.country) ? 
              filters.country.map(c => c.replace(/ /g, '+')).join(' OR ') : 
              filters.country.replace(/ /g, '+');
          }
          if (filters.status) {
            params['filter.overallStatus'] = filters.status.toUpperCase();
          }

          const response = await this.apiClient.get('/studies', { params });
          const studies = response.data.studies || [];
          
          if (studies.length === 0) {
            return 0;
          }

          // Sample and estimate
          const transformedTrials = studies.map(study => this.transformStudyToTrial(study));
          const naTrials = transformedTrials.filter(trial => this.isNAPhase(trial.phase));
          const naRatio = naTrials.length / studies.length;
          const totalApiCount = response.data.totalCount || 0;
          
          const estimatedTotal = Math.round(naRatio * totalApiCount);
          
          console.log(`N/A count estimation: ${naTrials.length}/${studies.length} = ${naRatio.toFixed(3)}, Total API: ${totalApiCount}, Estimated N/A: ${estimatedTotal}`);
          
          return estimatedTotal;
        } catch (error) {
          console.error('Error estimating N/A count, using fallback:', error.message);
          return 100; // Fallback estimate
        }
      } else {
        // For regular phases, use the API filter
        const params = {
          pageSize: 1,
          countTotal: true,
          'filter.advanced': `AREA[Phase]${phase}`
        };
        
        const response = await this.apiClient.get('/studies', { params });
        return response.data.totalCount || 0;
      }
    } catch (error) {
      console.error(`Error getting total count for phase ${phase}:`, error.message);
      return 0;
    }
  }

  /**
   * Basic fallback method for API calls
   */
  async getTrialsBasic(filters) {
    const {
      searchTerm,
      condition,
      country,
      status,
      page = 1,
      limit = 10,
      pageToken
    } = filters;

    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);

    try {
      const params = {};
      params.pageSize = Math.min(pageSize, 100);

      if (!pageToken) {
        params.countTotal = true;
      }

      if (pageToken) {
        params.pageToken = pageToken;
      }

      if (searchTerm) {
        params['query.term'] = searchTerm;
      }
      if (condition) {
        if (Array.isArray(condition)) {
          params['query.cond'] = condition.join(',');
        } else {
          params['query.cond'] = condition;
        }
      }
      if (country) {
        if (Array.isArray(country)) {
          params['query.locn'] = country.map(c => c.replace(/ /g, '+')).join(' OR ');
        } else {
          params['query.locn'] = country.replace(/ /g, '+');
        }
      }
      if (status) {
        params['filter.overallStatus'] = status.toUpperCase();
      }

      const response = await this.apiClient.get('/studies', { params });
      const studies = response.data.studies || [];
      const transformedTrials = studies.map(study => this.transformStudyToTrial(study));

      const totalCount = response.data.totalCount || transformedTrials.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        trials: transformedTrials,
        page: currentPage,
        limit: pageSize,
        total: totalCount,
        totalPages: totalPages,
        hasNextPage: response.data.nextPageToken ? true : currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPageToken: response.data.nextPageToken,
        prevPageToken: null
      };

    } catch (error) {
      console.error('Error in basic API call:', error.message);
      throw error;
    }
  }
}

module.exports = new ClinicalTrialsService();
