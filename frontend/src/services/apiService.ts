import axios, { AxiosResponse } from 'axios';
import { ClinicalTrial, TrialFilters } from '../types/clinical-trial';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    nextPageToken?: string;
    prevPageToken?: string;
  };
}

interface TrialsResponse {
  trials: ClinicalTrial[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPageToken?: string;
  prevPageToken?: string;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: any): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      console.log('Making API request to:', url);
      const response: AxiosResponse<ApiResponse<T>> = await axios({
        url,
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        data: options?.data,
        params: options?.params,
      });

      console.log('API Response:', response.data);
      
      if (!response.data.success) {
        throw new Error('API request failed');
      }

      return response.data.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getTrials(filters: TrialFilters): Promise<TrialsResponse> {
    const params: any = {};
    
    if (filters.searchTerm) {
      params.searchTerm = filters.searchTerm;
    }
    if (filters.condition) {
      const conditionValue = Array.isArray(filters.condition) 
        ? filters.condition.join(',') 
        : filters.condition;
      params.condition = conditionValue;
    }
    if (filters.country) {
      const countryValue = Array.isArray(filters.country) 
        ? filters.country.join(',') 
        : filters.country;
      params.country = countryValue;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.phase) {
      params.phase = filters.phase;
    }
    if (filters.page) {
      params.page = filters.page.toString();
    }
    if (filters.limit) {
      params.limit = filters.limit.toString();
    }
    if (filters.pageToken) {
      params.pageToken = filters.pageToken;
    }

    try {
      // The backend returns pagination info in the response
      console.log('Making API request to trials endpoint with params:', params);
      
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(`${API_BASE_URL}/trials`, { params });

      console.log('API Response:', response.data);
      
      if (!response.data.success) {
        throw new Error('API request failed');
      }

      // Return the full response structure with pagination
      return {
        trials: response.data.data || [],
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 1,
        hasNextPage: response.data.pagination?.hasNextPage || false,
        hasPrevPage: response.data.pagination?.hasPrevPage || false,
        nextPageToken: response.data.pagination?.nextPageToken,
        prevPageToken: response.data.pagination?.prevPageToken,
      };
    } catch (error) {
      console.error('Failed to fetch trials:', error);
      return {
        trials: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }

  async getTrialById(nctId: string): Promise<ClinicalTrial | null> {
    try {
      return await this.request<ClinicalTrial>(`/trials/${nctId}`);
    } catch (error) {
      console.error(`Failed to fetch trial ${nctId}:`, error);
      return null;
    }
  }

  // Analytics endpoints
  async getCountryAnalytics() {
    return this.request('/analytics/countries');
  }

  async getStatusAnalytics() {
    return this.request('/analytics/statuses');
  }

  async getPhaseAnalytics() {
    return this.request('/analytics/phases');
  }

  async getPhaseDistributionAnalytics() {
    return this.request('/analytics/phase-distribution');
  }
}

export const apiService = new ApiService();
export default apiService;

// Named exports for convenience
export const fetchTrials = (filters: TrialFilters) => apiService.getTrials(filters);
export const fetchTrialById = (nctId: string) => apiService.getTrialById(nctId);
export const fetchCountryAnalytics = () => apiService.getCountryAnalytics();
export const fetchStatusAnalytics = () => apiService.getStatusAnalytics();
export const fetchPhaseAnalytics = () => apiService.getPhaseAnalytics();
export const fetchPhaseDistributionAnalytics = () => apiService.getPhaseDistributionAnalytics();
