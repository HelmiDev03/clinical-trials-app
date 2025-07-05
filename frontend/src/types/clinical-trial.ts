
export interface ClinicalTrial {
  id?: string;
  nctId: string;
  title?: string;
  briefTitle: string;
  officialTitle?: string;
  condition: string[] | string;
  conditions?: string[];
  interventionName?: string[];
  overallStatus: 'RECRUITING' | 'ACTIVE_NOT_RECRUITING' | 'COMPLETED' | 'ENROLLING_BY_INVITATION' | 'NOT_YET_RECRUITING' | 'SUSPENDED' | 'TERMINATED' | 'WITHDRAWN' | 'AVAILABLE' | 'NO_LONGER_AVAILABLE' | 'TEMPORARILY_NOT_AVAILABLE' | 'APPROVED_FOR_MARKETING' | 'WITHHELD' | 'UNKNOWN';
  status?: string;
  locationCountry?: string[];
  country?: string;
  countries?: string[];
  phase: string;
  studyType: string;
  enrollmentCount: number;
  startDate: string;
  completionDate?: string;
  lastUpdateDate?: string;
  primaryOutcome?: string;
  sponsor: string;
  briefSummary?: string;
  detailedDescription?: string;
  eligibilityCriteria?: string;
  minimumAge?: string;
  maximumAge?: string;
  sex?: string;
  locations?: Array<{
    facility: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  }>;
}

export interface TrialFilters {
  condition?: string | string[];
  status?: string;
  country?: string | string[];
  phase?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  pageToken?: string;  // For API pagination
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
  type?: string;
  description?: string;
}
