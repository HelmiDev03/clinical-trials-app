const clinicalTrialsService = require('./clinicalTrialsService');
const axios = require('axios');

class AnalyticsService {
  /**
   * Get country analytics
   */
  async getCountryAnalytics() {
    try {
      console.log('Fetching country analytics from ClinicalTrials.gov API...');
      
      // Define top countries to analyze (most likely to have clinical trials)
      const countries = [
        'United States',
        'China',
        'Germany',
        'United Kingdom',
        'France',
        'Canada',
        'Italy',
        'Spain',
        'Netherlands',
        'Australia',
        'Japan',
        'Belgium',
        'Switzerland',
        'South Korea',
        'Israel'
      ];

      const countryResults = [];
      let totalCount = 0;

      // Fetch count for each country in parallel
      const countryPromises = countries.map(async (country) => {
        try {
          const url = `https://clinicaltrials.gov/api/v2/studies?query.locn=${encodeURIComponent(country)}&countTotal=true&pageSize=1`;
          console.log(`Fetching count for country: ${country}`);
          
          const response = await axios.get(url);
          const count = response.data.totalCount || 0;
          console.log(`Country ${country}: ${count} studies`);
          
          return { country, count };
        } catch (error) {
          console.warn(`Error fetching country ${country}:`, error.message);
          return { country, count: 0 };
        }
      });

      const results = await Promise.all(countryPromises);
      
      // Filter out countries with no trials and sort by count
      const validResults = results.filter(result => result.count > 0);
      validResults.sort((a, b) => b.count - a.count);
      
      // Take top 10 countries
      const top10Countries = validResults.slice(0, 10);
      
      // Calculate total for percentage calculation
      totalCount = top10Countries.reduce((sum, result) => sum + result.count, 0);
      
      top10Countries.forEach(({ country, count }) => {
        countryResults.push({
          name: country,
          value: count,
          percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0',
          flag: this.getCountryFlag(country),
          description: this.getCountryDescription(country)
        });
      });

      console.log(`Country Analytics: Found top ${countryResults.length} countries with total ${totalCount} studies`);
      return countryResults;
    } catch (error) {
      console.error('Error getting country analytics:', error.message);
      return this.getCountryAnalyticsFallback();
    }
  }

  /**
   * Get country flag emoji
   */
  getCountryFlag(country) {
    const flagMap = {
      'United States': '🇺🇸',
      'China': '🇨🇳',
      'Germany': '🇩🇪',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Canada': '🇨🇦',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'Belgium': '🇧🇪',
      'Switzerland': '🇨🇭',
      'South Korea': '🇰🇷',
      'Israel': '🇮🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Austria': '🇦🇹',
      'Finland': '🇫🇮'
    };
    return flagMap[country] || '🌍';
  }

  /**
   * Get country descriptions
   */
  getCountryDescription(country) {
    const descriptions = {
      'United States': 'Leading in clinical trial volume and innovation',
      'China': 'Rapidly expanding clinical research market',
      'Germany': 'Strong pharmaceutical research infrastructure',
      'United Kingdom': 'Major European clinical trials hub',
      'France': 'Prominent in biomedical research',
      'Canada': 'Growing clinical trials market',
      'Italy': 'Significant European research contributor',
      'Spain': 'Active in international clinical studies',
      'Netherlands': 'High-quality research environment',
      'Australia': 'Leading Asia-Pacific research hub',
      'Japan': 'Advanced pharmaceutical development',
      'Belgium': 'European regulatory expertise',
      'Switzerland': 'Pharmaceutical industry center',
      'South Korea': 'Emerging clinical trials market',
      'Israel': 'Innovation in biotechnology research'
    };
    return descriptions[country] || 'Active in clinical research';
  }

  /**
   * Fallback method using sample data
   */
  async getCountryAnalyticsFallback() {
    try {
      const trials = await clinicalTrialsService.getTrialsForAnalytics(1000);
      console.log(`Country Analytics Fallback: Processing ${trials.length} trials`);
      
      if (trials.length === 0) {
        console.warn('No trials available for country analytics fallback');
        return [];
      }
      
      const countryData = {};
      
      trials.forEach(trial => {
        // Handle both country string and countries array
        let countries = [];
        if (trial.countries && Array.isArray(trial.countries) && trial.countries.length > 0) {
          countries = trial.countries;
        } else if (trial.country && trial.country !== 'Not specified' && trial.country !== 'Unknown') {
          countries = trial.country.split(', ').filter(c => c.trim());
        }
        
        countries.forEach(country => {
          if (country && country.trim()) {
            const cleanCountry = country.trim();
            countryData[cleanCountry] = (countryData[cleanCountry] || 0) + 1;
          }
        });
      });

      const sortedCountries = Object.entries(countryData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Top 10 countries
        .map(([country, count]) => ({
          name: country,
          value: count,
          percentage: ((count / trials.length) * 100).toFixed(1),
          flag: this.getCountryFlag(country),
          description: 'Based on sample data'
        }));

      console.log(`Country Analytics Fallback: Generated ${sortedCountries.length} country entries`);
      return sortedCountries;
    } catch (error) {
      console.error('Error in country analytics fallback:', error.message);
      return [];
    }
  }

  /**
   * Get status analytics
   */
  async getStatusAnalytics() {
    try {
      console.log('Fetching status analytics from ClinicalTrials.gov API...');
      
      // Define all possible trial statuses
      const statuses = [
        'RECRUITING',
        'ACTIVE_NOT_RECRUITING', 
        'COMPLETED',
        'ENROLLING_BY_INVITATION',
        'NOT_YET_RECRUITING',
        'SUSPENDED',
        'TERMINATED',
        'WITHDRAWN',
        'AVAILABLE',
        'NO_LONGER_AVAILABLE',
        'TEMPORARILY_NOT_AVAILABLE',
        'APPROVED_FOR_MARKETING',
        'WITHHELD',
        'UNKNOWN'
      ];

      const statusResults = [];
      let totalCount = 0;

      // Fetch count for each status in parallel
      const statusPromises = statuses.map(async (status) => {
        try {
          const url = `https://clinicaltrials.gov/api/v2/studies?filter.overallStatus=${status}&countTotal=true&pageSize=1`;
          console.log(`Fetching count for status: ${status}`);
          
          const response = await axios.get(url);
          const count = response.data.totalCount || 0;
          console.log(`Status ${status}: ${count} studies`);
          
          return { status, count };
        } catch (error) {
          console.warn(`Error fetching status ${status}:`, error.message);
          return { status, count: 0 };
        }
      });

      const results = await Promise.all(statusPromises);
      
      // Calculate total and build results
      totalCount = results.reduce((sum, result) => sum + result.count, 0);
      
      results.forEach(({ status, count }) => {
        if (count > 0) { // Only include statuses with actual trials
          statusResults.push({
            name: this.formatStatusName(status),
            value: count,
            percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0',
            rawStatus: status,
            description: this.getStatusDescription(status)
          });
        }
      });

      // Sort by count (descending)
      statusResults.sort((a, b) => b.value - a.value);

      console.log(`Status Analytics: Found ${statusResults.length} statuses with total ${totalCount} studies`);
      return statusResults;
    } catch (error) {
      console.error('Error getting status analytics:', error.message);
      return this.getStatusAnalyticsFallback();
    }
  }

  /**
   * Format status names for display
   */
  formatStatusName(status) {
    const statusMap = {
      'RECRUITING': 'Recruiting',
      'ACTIVE_NOT_RECRUITING': 'Active, Not Recruiting',
      'COMPLETED': 'Completed',
      'ENROLLING_BY_INVITATION': 'Enrolling by Invitation',
      'NOT_YET_RECRUITING': 'Not Yet Recruiting',
      'SUSPENDED': 'Suspended',
      'TERMINATED': 'Terminated',
      'WITHDRAWN': 'Withdrawn',
      'AVAILABLE': 'Available',
      'NO_LONGER_AVAILABLE': 'No Longer Available',
      'TEMPORARILY_NOT_AVAILABLE': 'Temporarily Not Available',
      'APPROVED_FOR_MARKETING': 'Approved for Marketing',
      'WITHHELD': 'Withheld',
      'UNKNOWN': 'Unknown'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status descriptions
   */
  getStatusDescription(status) {
    const descriptions = {
      'RECRUITING': 'Currently recruiting participants',
      'ACTIVE_NOT_RECRUITING': 'Active but no longer recruiting',
      'COMPLETED': 'Study has concluded',
      'ENROLLING_BY_INVITATION': 'Only enrolling invited participants',
      'NOT_YET_RECRUITING': 'Study approved but not yet recruiting',
      'SUSPENDED': 'Study temporarily paused',
      'TERMINATED': 'Study stopped early',
      'WITHDRAWN': 'Study withdrawn before enrollment',
      'AVAILABLE': 'Treatment/intervention available',
      'NO_LONGER_AVAILABLE': 'Treatment no longer available',
      'TEMPORARILY_NOT_AVAILABLE': 'Treatment temporarily unavailable',
      'APPROVED_FOR_MARKETING': 'Approved for marketing',
      'WITHHELD': 'Study withheld',
      'UNKNOWN': 'Status unknown'
    };
    return descriptions[status] || 'No description available';
  }

  /**
   * Fallback method using sample data
   */
  async getStatusAnalyticsFallback() {
    try {
      const trials = await clinicalTrialsService.getTrialsForAnalytics(1000);
      console.log(`Status Analytics Fallback: Processing ${trials.length} trials`);
      
      if (trials.length === 0) {
        console.warn('No trials available for status analytics fallback');
        return [];
      }
      
      const statusData = {};
      
      trials.forEach(trial => {
        if (trial.status) {
          const status = this.normalizeStatus(trial.status);
          statusData[status] = (statusData[status] || 0) + 1;
        }
      });

      const statusList = Object.entries(statusData)
        .map(([status, count]) => ({
          name: status,
          value: count,
          percentage: ((count / trials.length) * 100).toFixed(1),
          description: 'Based on sample data'
        }))
        .sort((a, b) => b.value - a.value);

      console.log(`Status Analytics Fallback: Generated ${statusList.length} status entries`);
      return statusList;
    } catch (error) {
      console.error('Error in status analytics fallback:', error.message);
      return [];
    }
  }

  /**
   * Get phase analytics using ClinicalTrials.gov stats API
   */
  async getPhaseAnalytics() {
    try {
      // Get the total count of all studies first
      const totalStudies = await clinicalTrialsService.getTotalCount({});
      console.log(`Total studies in database: ${totalStudies}`);
      
      // Get individual phase counts by filtering each phase (single-phase only)
      const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
      const phaseResults = [];
      let singlePhaseTotal = 0;
      
      for (const phase of phases) {
        try {
          const count = await clinicalTrialsService.getTotalCount({ phase });
          if (count > 0) {
            phaseResults.push({
              name: phase,
              value: count,
              percentage: totalStudies > 0 ? ((count / totalStudies) * 100).toFixed(1) : '0.0',
              type: 'phase'
            });
            singlePhaseTotal += count;
          }
        } catch (error) {
          console.warn(`Error getting count for ${phase}:`, error.message);
        }
      }
      
      // Add summary information
      const results = [
        ...phaseResults,
        {
          name: 'Total Studies',
          value: totalStudies,
          percentage: '100.0',
          type: 'total',
          description: 'All studies in the database'
        }
      ];
      
      console.log('Phase analytics results:', results);
      console.log(`Single-phase total: ${singlePhaseTotal}, Grand total: ${totalStudies}`);
      
      return results;
      
    } catch (error) {
      console.error('Error getting phase analytics:', error.message);
      return this.getPhaseAnalyticsFallback();
    }
  }

  /**
   * Fallback method for phase analytics using trial data
   */
  async getPhaseAnalyticsFallback() {
    try {
      const trials = await clinicalTrialsService.getTrialsForAnalytics(1000);
      
      const phaseData = {};
      
      trials.forEach(trial => {
        if (trial.phase) {
          const phase = this.normalizePhase(trial.phase);
          phaseData[phase] = (phaseData[phase] || 0) + 1;
        }
      });

      const phaseList = Object.entries(phaseData)
        .map(([phase, count]) => ({
          name: phase,
          value: count,
          percentage: ((count / trials.length) * 100).toFixed(1),
          type: 'phase'
        }))
        .sort((a, b) => {
          // Custom sort for phases
          const phaseOrder = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'N/A'];
          const aIndex = phaseOrder.indexOf(a.name);
          const bIndex = phaseOrder.indexOf(b.name);
          
          if (aIndex === -1 && bIndex === -1) return b.value - a.value;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          
          return aIndex - bIndex;
        });

      return phaseList;
    } catch (error) {
      console.error('Error getting phase analytics fallback:', error.message);
      return [];
    }
  }

  /**
   * Get phase distribution analytics specifically for the distribution view
   */
  async getPhaseDistributionAnalytics() {
    try {
      // Get phase size distribution from the stats API
      const response = await axios.get('https://clinicaltrials.gov/api/v2/stats/field/sizes?fields=Phase');
      
      const data = response.data;
      console.log('Stats API response:', JSON.stringify(data, null, 2));
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('Invalid stats API response structure for phase distribution');
        return this.getPhaseDistributionFallback();
      }
      
      const phaseStats = data[0]; // Get the first (and only) element
      
      if (!phaseStats.topSizes || !Array.isArray(phaseStats.topSizes)) {
        console.warn('Invalid topSizes in stats API response');
        return this.getPhaseDistributionFallback();
      }
      
      // Calculate total studies from topSizes
      const totalStudies = phaseStats.topSizes.reduce((sum, item) => sum + item.studiesCount, 0);
      
      // Create distribution based on topSizes
      const distribution = phaseStats.topSizes.map(item => {
        const sizeText = item.size === 1 ? 'Single Phase Studies' : `${item.size} Phase Studies`;
        const description = item.size === 1 
          ? 'Studies with exactly one phase designation'
          : `Studies spanning ${item.size} phases`;
        
        return {
          name: sizeText,
          value: item.studiesCount,
          percentage: ((item.studiesCount / totalStudies) * 100).toFixed(1),
          description: description
        };
      });
      
      return {
        distribution,
        totalStudies,
        source: 'ClinicalTrials.gov Stats API',
        lastUpdated: new Date().toISOString(),
        minSize: phaseStats.minSize,
        maxSize: phaseStats.maxSize,
        uniqueSizesCount: phaseStats.uniqueSizesCount
      };
      
    } catch (error) {
      console.error('Error getting phase distribution analytics:', error.message);
      return this.getPhaseDistributionFallback();
    }
  }

  /**
   * Fallback for phase distribution analytics
   */
  async getPhaseDistributionFallback() {
    try {
      const trials = await clinicalTrialsService.getTrialsForAnalytics(1000);
      
      let singlePhase = 0;
      let multiPhase = 0;
      
      trials.forEach(trial => {
        if (trial.phase) {
          const hasMultiplePhases = trial.phase.includes('/') || 
                                   trial.phase.includes(',') || 
                                   trial.phase.includes('|');
          
          if (hasMultiplePhases) {
            multiPhase++;
          } else {
            singlePhase++;
          }
        }
      });
      
      const total = singlePhase + multiPhase;
      
      return {
        distribution: [
          {
            name: 'Single Phase Studies',
            value: singlePhase,
            percentage: ((singlePhase / total) * 100).toFixed(1),
            description: 'Studies with exactly one phase designation'
          },
        ],
        totalStudies: total,
        source: 'Limited trial data (fallback)',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting phase distribution fallback:', error.message);
      return {
        distribution: [],
        totalStudies: 0,
        source: 'Error - no data available',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Normalize status values
   */
  normalizeStatus(status) {
    const statusMap = {
      'RECRUITING': 'Recruiting',
      'ACTIVE_NOT_RECRUITING': 'Active, not recruiting',
      'COMPLETED': 'Completed',
      'TERMINATED': 'Terminated',
      'SUSPENDED': 'Suspended',
      'WITHDRAWN': 'Withdrawn',
      'ENROLLING_BY_INVITATION': 'Enrolling by invitation',
      'NOT_YET_RECRUITING': 'Not yet recruiting',
      'UNKNOWN': 'Unknown status'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Normalize phase values
   */
  normalizePhase(phase) {
    if (!phase || phase === 'N/A' || phase === 'NA' || phase === 'Not Applicable') return 'N/A';
    
    // Handle stats API format (e.g., "PHASE1", "PHASE2", etc.)
    if (phase === 'PHASE1' || phase === 'Phase 1') return 'Phase 1';
    if (phase === 'PHASE2' || phase === 'Phase 2') return 'Phase 2';
    if (phase === 'PHASE3' || phase === 'Phase 3') return 'Phase 3';
    if (phase === 'PHASE4' || phase === 'Phase 4') return 'Phase 4';
    
    // Handle multiple phases - return first phase for consistency
    if (phase.includes(',') || phase.includes('|')) {
      const firstPhase = phase.split(/[,|]/)[0].trim();
      return this.normalizePhase(firstPhase);
    }
    
    // Handle early phase combinations
    if (phase.includes('Early Phase 1') || phase.includes('EARLY_PHASE1')) return 'Phase 1';
    
    return phase;
  }
}

module.exports = new AnalyticsService();
