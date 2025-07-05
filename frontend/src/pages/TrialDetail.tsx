import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, MapPin, Users, Building, Globe, Phone, Mail, ExternalLink } from 'lucide-react';
import { ClinicalTrial } from '../types/clinical-trial';
import { fetchTrialById } from '../services/apiService';

const TrialDetail: React.FC = () => {
  const { nctId } = useParams<{ nctId: string }>();
  const navigate = useNavigate();
  const [trial, setTrial] = useState<ClinicalTrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrial = async () => {
      if (!nctId) return;
      
      try {
        setLoading(true);
        const trialData = await fetchTrialById(nctId);
        setTrial(trialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trial details');
      } finally {
        setLoading(false);
      }
    };

    loadTrial();
  }, [nctId]);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('recruiting')) {
      return 'bg-green-100 text-green-800';
    }
    if (normalizedStatus.includes('active')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (normalizedStatus.includes('completed')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (normalizedStatus.includes('terminated')) {
      return 'bg-red-100 text-red-800';
    }
    if (normalizedStatus.includes('suspended')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase: string) => {
    if (phase.includes('1')) return 'bg-orange-100 text-orange-800';
    if (phase.includes('2')) return 'bg-indigo-100 text-indigo-800';
    if (phase.includes('3')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-slate-100 text-slate-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderConditions = () => {
    if (!trial) return null;
    
    let conditions: string[] = [];
    if (Array.isArray(trial.conditions) && trial.conditions.length > 0) {
      conditions = trial.conditions;
    } else if (typeof trial.condition === 'string') {
      conditions = trial.condition.split(', ').filter(c => c.trim());
    } else if (Array.isArray(trial.condition)) {
      conditions = trial.condition;
    }

    if (conditions.length === 0) return <span className="text-muted-foreground">Not specified</span>;

    return (
      <div className="flex flex-wrap gap-2">
        {conditions.map((condition, idx) => (
          <Badge key={idx} variant="outline" className="text-sm">
            {condition.trim()}
          </Badge>
        ))}
      </div>
    );
  };

  const renderCountries = () => {
    // Get countries from multiple sources
    let countries: string[] = [];
    
    // First try the countries array (from backend)
    if (trial?.countries && trial.countries.length > 0) {
      countries = trial.countries;
    } 
    // Fall back to parsing the country string
    else if (trial?.country && trial.country !== 'Not specified') {
      countries = trial.country.split(', ').filter(c => c.trim());
    }
    // Fall back to extracting from locations
    else if (trial?.locations && trial.locations.length > 0) {
      const locationCountries = [...new Set(
        trial.locations
          .map(loc => loc.country)
          .filter(country => country && country.trim())
      )];
      countries = locationCountries;
    }

    if (countries.length === 0) {
      return (
        <Badge variant="outline" className="text-sm text-muted-foreground">
          Not specified
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {countries.map((country, idx) => (
          <Badge key={idx} variant="outline" className="text-sm">
            {country.trim()}
          </Badge>
        ))}
      </div>
    );
  };

  const renderLocations = () => {
    if (!trial?.locations || trial.locations.length === 0) {
      return <span className="text-sm text-muted-foreground">Not specified</span>;
    }

    return (
      <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto">
        {trial.locations.map((location, idx) => (
          <div key={idx} className="p-3 border rounded-lg bg-muted/20">
            <div className="font-medium text-sm md:text-base line-clamp-1">{location.facility || 'Unknown Facility'}</div>
            <div className="text-xs md:text-sm text-muted-foreground line-clamp-2">
              {[location.city, location.state, location.country].filter(Boolean).join(', ') || 'Location not specified'}
              {location.zip && ` ${location.zip}`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="animate-pulse space-y-4 md:space-y-6">
          <div className="h-6 md:h-8 bg-gray-200 rounded w-1/3 md:w-1/4"></div>
          <div className="h-24 md:h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="h-48 md:h-64 bg-gray-200 rounded"></div>
            <div className="h-48 md:h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <div className="text-4xl md:text-6xl mb-4">❌</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Trial Not Found</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {error || 'The requested clinical trial could not be found.'}
            </p>
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-sm">Back to Search</span>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {trial.nctId}
          </Badge>
          <Badge className={`${getStatusColor(trial.status || trial.overallStatus)} text-xs`}>
            {trial.status || trial.overallStatus}
          </Badge>
          <Badge className={`${getPhaseColor(trial.phase)} text-xs`}>
            {trial.phase}
          </Badge>
        </div>
      </div>

      {/* Title and Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl leading-tight">{trial.title || trial.briefTitle}</CardTitle>
          {trial.officialTitle && trial.officialTitle !== trial.title && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{trial.officialTitle}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {trial.briefSummary && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base md:text-lg">Brief Summary</h3>
              <div className="max-h-32 md:max-h-40 overflow-y-auto p-3 md:p-4 bg-muted/20 rounded-lg border border-border/50 shadow-sm">
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
                  {trial.briefSummary}
                </p>
              </div>
            </div>
          )}
          {trial.detailedDescription && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base md:text-lg">Detailed Description</h3>
              <div className="max-h-32 md:max-h-40 overflow-y-auto p-3 md:p-4 bg-muted/20 rounded-lg border border-border/50 shadow-sm">
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
                  {trial.detailedDescription}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Globe className="h-4 w-4 md:h-5 md:w-5" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-2">Study Countries</div>
              {renderCountries()}
            </div>
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Participants</div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                {trial.enrollmentCount.toLocaleString()}
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Study Type</div>
              <div className="text-sm md:text-base">{trial.studyType}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Study Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building className="h-4 w-4 md:h-5 md:w-5" />
              Study Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Study Type</div>
              <div className="text-sm md:text-base">{trial.studyType}</div>
            </div>
            
            <Separator />
            
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Sponsor</div>
              <div className="text-sm md:text-base line-clamp-2">{trial.sponsor}</div>
            </div>
            
            <Separator />
            
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-2">Medical Conditions</div>
              {renderConditions()}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Start Date</div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  {formatDate(trial.startDate)}
                </div>
              </div>
              <div>
                <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Completion Date</div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  {formatDate(trial.completionDate)}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Enrollment</div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                {trial.enrollmentCount.toLocaleString()} participants
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Minimum Age</div>
                <div className="text-sm md:text-base">{trial.minimumAge || 'Not specified'}</div>
              </div>
              <div>
                <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Maximum Age</div>
                <div className="text-sm md:text-base">{trial.maximumAge || 'Not specified'}</div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="font-medium text-xs md:text-sm text-muted-foreground mb-1">Sex</div>
              <div className="text-sm md:text-base">{trial.sex || 'All'}</div>
            </div>
            
            {trial.eligibilityCriteria && (
              <>
                <Separator />
                <div>
                  <div className="font-medium text-xs md:text-sm text-muted-foreground mb-2">Detailed Criteria</div>
                  <div className="max-h-32 md:max-h-40 overflow-y-auto p-3 md:p-4 bg-muted/20 rounded-lg border border-border/50 shadow-sm">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {trial.eligibilityCriteria}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Countries and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Globe className="h-4 w-4 md:h-5 md:w-5" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCountries()}
          </CardContent>
        </Card>

        {/* Detailed Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <MapPin className="h-4 w-4 md:h-5 md:w-5" />
              Study Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLocations()}
          </CardContent>
        </Card>
      </div>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
            External Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://clinicaltrials.gov/ct2/show/${trial.nctId}`, '_blank')}
              className="flex items-center gap-2 text-sm"
            >
              <Globe className="h-3 w-3 md:h-4 md:w-4" />
              View on ClinicalTrials.gov
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialDetail;
