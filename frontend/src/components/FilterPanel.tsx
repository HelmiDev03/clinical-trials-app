
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Filter, RotateCcw, ChevronDown, Info, Clock } from 'lucide-react';
import { TrialFilters } from '../types/clinical-trial';
import ConditionModal from './ConditionModal';
import CountryModal from './CountryModal';

interface FilterPanelProps {
  filters: TrialFilters;
  onFiltersChange: (filters: TrialFilters) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  
  const statusOptions = [
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

  const phaseOptions = [
    'Phase 1',
    'Phase 2',
    'Phase 3',
    'Phase 4'
  ];

  const updateFilter = (key: keyof TrialFilters, value: string | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const handleConditionSelect = (conditions: string[]) => {
    updateFilter('condition', conditions.length > 0 ? conditions : undefined);
  };

  const handleCountrySelect = (countries: string[]) => {
    updateFilter('country', countries.length > 0 ? countries : undefined);
  };

  const getConditionDisplayText = () => {
    if (!filters.condition) return '';
    if (typeof filters.condition === 'string') return filters.condition;
    if (Array.isArray(filters.condition)) {
      if (filters.condition.length === 0) return '';
      if (filters.condition.length === 1) return filters.condition[0];
      return `${filters.condition.length} conditions selected`;
    }
    return '';
  };

  const getCurrentConditions = () => {
    if (!filters.condition) return [];
    if (typeof filters.condition === 'string') return [filters.condition];
    if (Array.isArray(filters.condition)) return filters.condition;
    return [];
  };

  const getCountryDisplayText = () => {
    if (!filters.country) return '';
    if (typeof filters.country === 'string') return filters.country;
    if (Array.isArray(filters.country)) {
      if (filters.country.length === 0) return '';
      if (filters.country.length === 1) return filters.country[0];
      return `${filters.country.length} countries selected`;
    }
    return '';
  };

  const getCurrentCountries = () => {
    if (!filters.country) return [];
    if (typeof filters.country === 'string') return [filters.country];
    if (Array.isArray(filters.country)) return filters.country;
    return [];
  };

  return (
    <Card className="w-full animate-fade-in shadow-lg border-2 border-border/50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label htmlFor="condition" className="text-xs font-medium">Medical Condition</Label>
            <div className="relative">
              <Input
                id="condition"
                placeholder="Select conditions..."
                value={getConditionDisplayText()}
                onClick={() => setIsConditionModalOpen(true)}
                readOnly
                className="h-9 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-pointer pr-8"
              />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="country" className="text-xs font-medium">Country</Label>
            <div className="relative">
              <Input
                id="country"
                placeholder="Select countries..."
                value={getCountryDisplayText()}
                onClick={() => setIsCountryModalOpen(true)}
                readOnly
                className="h-9 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary/20 cursor-pointer pr-8"
              />
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="status" className="text-xs font-medium">Status</Label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full h-9 px-2 py-1 text-xs border border-input rounded-md bg-background text-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="phase" className="text-xs font-medium">Phase</Label>
            <select
              id="phase"
              value={filters.phase || ''}
              onChange={(e) => updateFilter('phase', e.target.value)}
              className="w-full h-9 px-2 py-1 text-xs border border-input rounded-md bg-background text-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All</option>
              {phaseOptions.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </div>
        </div>
        
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="w-full h-9 mt-4 text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Clear Filters
        </Button>
      </CardContent>

      {/* Condition Modal */}
      <ConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        onSelect={handleConditionSelect}
        currentConditions={getCurrentConditions()}
      />

      {/* Country Modal */}
      <CountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountries={getCurrentCountries()}
        onCountriesChange={handleCountrySelect}
      />
    </Card>
  );
};

export default FilterPanel;
