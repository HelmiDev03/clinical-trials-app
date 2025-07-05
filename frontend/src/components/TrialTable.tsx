
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClinicalTrial } from '../types/clinical-trial';
import { Calendar, MapPin, Users, Building, Eye, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialTableProps {
  trials: ClinicalTrial[];
  loading: boolean;
  totalResults?: number;
}

const TrialTable: React.FC<TrialTableProps> = ({ trials, loading, totalResults }) => {
  const navigate = useNavigate();

  const handleRowClick = (nctId: string) => {
    navigate(`/trial/${nctId}`);
  };
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('recruiting')) {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    }
    if (normalizedStatus.includes('active')) {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
    if (normalizedStatus.includes('completed')) {
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    }
    if (normalizedStatus.includes('terminated')) {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
    if (normalizedStatus.includes('suspended')) {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  const getPhaseColor = (phase: string) => {
    if (phase.includes('1')) return 'bg-orange-100 text-orange-800';
    if (phase.includes('2')) return 'bg-indigo-100 text-indigo-800';
    if (phase.includes('3')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <Card className="w-full animate-pulse shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-2 border-border/50 hover:shadow-xl transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl font-semibold">
          <span>Clinical Trials</span>
          <Badge variant="secondary" className="w-fit px-3 py-1">
            {totalResults ? `${totalResults.toLocaleString()} total` : `${trials.length} results`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-lg font-medium mb-2">No trials found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="font-semibold">Trial</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Phase</TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trials.map((trial, index) => (
                    <TableRow 
                      key={trial.nctId} 
                      className="hover:bg-muted/50 transition-colors duration-200 animate-fade-in border-b border-border/50"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TableCell className="max-w-md">
                        <div className="space-y-2">
                          <div className="font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                            {trial.title || trial.briefTitle}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                            {trial.nctId}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              // Handle both string and array conditions
                              let conditions = [];
                              if (Array.isArray(trial.condition)) {
                                conditions = trial.condition;
                              } else if (typeof trial.condition === 'string') {
                                conditions = trial.condition.split(', ').filter(c => c.trim());
                              }
                              
                              const displayConditions = conditions.slice(0, 2);
                              const remainingCount = conditions.length - 2;
                              
                              return (
                                <>
                                  {displayConditions.map((condition, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {condition.trim()}
                                    </Badge>
                                  ))}
                                  {remainingCount > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{remainingCount} more
                                    </Badge>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(trial.status || trial.overallStatus)} transition-colors duration-200`}>
                          {trial.status || trial.overallStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPhaseColor(trial.phase)} transition-colors duration-200`}>
                          {trial.phase}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{trial.enrollmentCount} participants</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {(() => {
                                // Backend provides formatted country string in trial.country field
                                const countryString = trial.country || 'Not specified';
                                
                                // If it's "Not specified", show as is
                                if (countryString === 'Not specified') {
                                  return countryString;
                                }
                                
                                // If it's a comma-separated string, show first 2 with "+X more" if needed
                                const countries = countryString.split(', ').filter(c => c.trim());
                                const displayCountries = countries.slice(0, 2);
                                const remainingCount = countries.length - 2;
                                
                                return (
                                  <>
                                    {displayCountries.join(', ')}
                                    {remainingCount > 0 && ` +${remainingCount} more`}
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(trial.startDate).getFullYear()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span className="truncate max-w-xs">{trial.sponsor}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRowClick(trial.nctId)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors duration-200"
                          title="View trial details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {trials.map((trial, index) => (
                <Card 
                  key={trial.nctId}
                  className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 animate-fade-in border border-border/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleRowClick(trial.nctId)}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="font-medium text-primary line-clamp-2">
                        {trial.title || trial.briefTitle}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                        {trial.nctId}
                      </div>
                    </div>

                    {/* Status and Phase */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getStatusColor(trial.status || trial.overallStatus)} text-xs`}>
                        {trial.status || trial.overallStatus}
                      </Badge>
                      <Badge className={`${getPhaseColor(trial.phase)} text-xs`}>
                        {trial.phase}
                      </Badge>
                    </div>

                    {/* Conditions */}
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        let conditions = [];
                        if (Array.isArray(trial.condition)) {
                          conditions = trial.condition;
                        } else if (typeof trial.condition === 'string') {
                          conditions = trial.condition.split(', ').filter(c => c.trim());
                        }
                        
                        const displayConditions = conditions.slice(0, 2);
                        const remainingCount = conditions.length - 2;
                        
                        return (
                          <>
                            {displayConditions.map((condition, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {condition.trim()}
                              </Badge>
                            ))}
                            {remainingCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{remainingCount} more
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{trial.enrollmentCount} participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{new Date(trial.startDate).getFullYear()}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs line-clamp-1">
                          {(() => {
                            const countryString = trial.country || 'Not specified';
                            if (countryString === 'Not specified') return countryString;
                            const countries = countryString.split(', ').filter(c => c.trim());
                            const displayCountries = countries.slice(0, 1);
                            const remainingCount = countries.length - 1;
                            return (
                              <>
                                {displayCountries.join(', ')}
                                {remainingCount > 0 && ` +${remainingCount} more`}
                              </>
                            );
                          })()}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Building className="h-3 w-3" />
                        <span className="text-xs line-clamp-1">{trial.sponsor}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-primary/10"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialTable;
