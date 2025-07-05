
import { ClinicalTrial, TrialFilters, ChartData } from '../types/clinical-trial';

const mockTrials: ClinicalTrial[] = [
  {
    nctId: 'NCT05123456',
    briefTitle: 'Phase III Study of Novel Immunotherapy for Advanced Melanoma',
    condition: ['Melanoma', 'Skin Cancer'],
    interventionName: ['Pembrolizumab', 'Ipilimumab'],
    overallStatus: 'Recruiting',
    locationCountry: ['United States', 'Canada', 'Germany'],
    phase: 'Phase 3',
    studyType: 'Interventional',
    enrollmentCount: 450,
    startDate: '2024-01-15',
    completionDate: '2026-12-31',
    primaryOutcome: 'Overall Survival',
    sponsor: 'Merck Sharp & Dohme'
  },
  {
    nctId: 'NCT05234567',
    briefTitle: 'Diabetes Management with Continuous Glucose Monitoring',
    condition: ['Type 2 Diabetes', 'Diabetes Mellitus'],
    interventionName: ['Continuous Glucose Monitor', 'Insulin Therapy'],
    overallStatus: 'Active, not recruiting',
    locationCountry: ['United States', 'United Kingdom', 'Australia'],
    phase: 'Phase 2',
    studyType: 'Interventional',
    enrollmentCount: 280,
    startDate: '2023-06-01',
    completionDate: '2025-08-30',
    primaryOutcome: 'HbA1c Reduction',
    sponsor: 'Dexcom Inc'
  },
  {
    nctId: 'NCT05345678',
    briefTitle: 'Alzheimer\'s Disease Prevention with Cognitive Training',
    condition: ['Alzheimer Disease', 'Mild Cognitive Impairment'],
    interventionName: ['Cognitive Training', 'Brain Games'],
    overallStatus: 'Completed',
    locationCountry: ['United States', 'Japan', 'Sweden'],
    phase: 'N/A',
    studyType: 'Behavioral',
    enrollmentCount: 320,
    startDate: '2022-03-15',
    completionDate: '2024-01-30',
    primaryOutcome: 'Cognitive Function Score',
    sponsor: 'National Institute on Aging'
  },
  {
    nctId: 'NCT05456789',
    briefTitle: 'CAR-T Cell Therapy for Relapsed B-Cell Lymphoma',
    condition: ['B-Cell Lymphoma', 'Non-Hodgkin Lymphoma'],
    interventionName: ['CAR-T Cell Therapy', 'Tisagenlecleucel'],
    overallStatus: 'Recruiting',
    locationCountry: ['United States', 'France', 'Italy'],
    phase: 'Phase 1/Phase 2',
    studyType: 'Interventional',
    enrollmentCount: 150,
    startDate: '2024-02-01',
    completionDate: '2027-01-31',
    primaryOutcome: 'Complete Response Rate',
    sponsor: 'Novartis Pharmaceuticals'
  },
  {
    nctId: 'NCT05567890',
    briefTitle: 'Heart Failure Treatment with Novel ACE Inhibitor',
    condition: ['Heart Failure', 'Cardiovascular Disease'],
    interventionName: ['ACE Inhibitor XR-123', 'Placebo'],
    overallStatus: 'Recruiting',
    locationCountry: ['United States', 'Brazil', 'India'],
    phase: 'Phase 3',
    studyType: 'Interventional',
    enrollmentCount: 800,
    startDate: '2024-03-10',
    completionDate: '2026-09-30',
    primaryOutcome: 'Cardiovascular Death',
    sponsor: 'Bristol Myers Squibb'
  },
  {
    nctId: 'NCT05678901',
    briefTitle: 'COVID-19 Vaccine Booster Effectiveness Study',
    condition: ['COVID-19', 'SARS-CoV-2 Infection'],
    interventionName: ['mRNA Vaccine Booster', 'Placebo'],
    overallStatus: 'Terminated',
    locationCountry: ['United States', 'United Kingdom', 'Israel'],
    phase: 'Phase 3',
    studyType: 'Interventional',
    enrollmentCount: 600,
    startDate: '2023-01-15',
    primaryOutcome: 'Vaccine Efficacy',
    sponsor: 'Pfizer Inc'
  }
];

export class MockDataService {
  static async getTrials(filters: TrialFilters = {}): Promise<ClinicalTrial[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredTrials = [...mockTrials];
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredTrials = filteredTrials.filter(trial =>
        trial.briefTitle.toLowerCase().includes(searchLower) ||
        trial.condition.some(c => c.toLowerCase().includes(searchLower)) ||
        trial.interventionName.some(i => i.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.status) {
      filteredTrials = filteredTrials.filter(trial => trial.overallStatus === filters.status);
    }
    
    if (filters.condition) {
      filteredTrials = filteredTrials.filter(trial =>
        trial.condition.some(c => c.toLowerCase().includes(filters.condition!.toLowerCase()))
      );
    }
    
    if (filters.country) {
      filteredTrials = filteredTrials.filter(trial =>
        trial.locationCountry.some(c => c.toLowerCase().includes(filters.country!.toLowerCase()))
      );
    }
    
    if (filters.phase) {
      filteredTrials = filteredTrials.filter(trial => trial.phase === filters.phase);
    }
    
    return filteredTrials;
  }
  
  static async getStatusDistribution(): Promise<ChartData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const statusCounts = mockTrials.reduce((acc, trial) => {
      acc[trial.overallStatus] = (acc[trial.overallStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors = {
      'Recruiting': '#10b981',
      'Active, not recruiting': '#3b82f6',
      'Completed': '#6366f1',
      'Terminated': '#ef4444',
      'Suspended': '#f59e0b',
      'Withdrawn': '#6b7280'
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status as keyof typeof colors]
    }));
  }
  
  static async getCountryDistribution(): Promise<ChartData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const countryCounts = mockTrials.reduce((acc, trial) => {
      trial.locationCountry.forEach(country => {
        acc[country] = (acc[country] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([country, count]) => ({
        name: country,
        value: count
      }));
  }
  
  static async getPhaseDistribution(): Promise<ChartData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const phaseCounts = mockTrials.reduce((acc, trial) => {
      acc[trial.phase] = (acc[trial.phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(phaseCounts).map(([phase, count]) => ({
      name: phase,
      value: count
    }));
  }
}
