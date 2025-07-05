import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../../services/apiService';
import { ChartData } from '../../types/clinical-trial';
import { Beaker, Target, TrendingUp, Zap, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const PhaseAnalytics: React.FC = () => {
  const [phaseData, setPhaseData] = useState<ChartData[]>([]);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [phases, distribution] = await Promise.all([
          apiService.getPhaseAnalytics(),
          apiService.getPhaseDistributionAnalytics()
        ]);
        
        setPhaseData((phases as ChartData[]) || []);
        setDistributionData(distribution || null);
      } catch (error) {
        console.error('Error loading phase data:', error);
        setPhaseData([]);
        setDistributionData(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const chartConfig = {
    value: { label: "Trials" },
  };

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <Card className="h-96">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
        <Card className="h-96">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 md:p-3 bg-green-500/10 rounded-2xl">
          <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Phase Analysis</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Distribution and breakdown of clinical trial phases
            {phaseData.find(p => p.type === 'total') && (
              <span className="block md:inline text-xs md:text-sm md:ml-2 text-blue-600 font-medium">
                ({phaseData.find(p => p.type === 'total')?.value.toLocaleString()} total studies)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Phase Distribution Overview */}
      {distributionData && (
        <Card className="shadow-lg border-2 border-border/50 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <PieChartIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              Phase Distribution Overview
            </CardTitle>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <p className="text-xs md:text-sm text-muted-foreground">
                Distribution of studies by number of phases • Source: {distributionData.source}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-6 px-4 md:px-0">
              {/* Pie Chart */}
              <ChartContainer config={chartConfig} className="h-64 md:h-80 flex items-center justify-center mx-auto w-full max-w-sm md:max-w-none">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData.distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {distributionData.distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Distribution Details */}
              <div className="space-y-3 md:space-y-4">
                {distributionData.distribution.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <h4 className="font-medium text-sm md:text-base truncate">{item.name}</h4>
                        <span className="text-base md:text-lg font-bold text-green-600">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <p className="text-xs md:text-sm font-medium text-blue-600">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Phase Breakdown */}
      <Card className="shadow-lg border-2 border-border/50 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            Single-Phase Studies Breakdown
          </CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Distribution of studies with exactly one phase designation (filterable studies)
          </p>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          <ChartContainer config={chartConfig} className="h-80 md:h-80 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={phaseData.filter((p: any) => p.type === 'phase')} 
                margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
              >
                <XAxis 
                  dataKey="name" 
                  fontSize={9} 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 9 }}
                />
                <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                <Bar 
                  dataKey="value" 
                  fill="hsl(142, 76%, 36%)"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 px-2 md:px-0">
        {/* Single Phase Studies */}
        {phaseData.filter((p: any) => p.type === 'phase').map((phase, index) => (
          <Card key={index} className="p-3 md:p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base truncate">{phase.name}</h3>
                <p className="text-lg md:text-2xl font-bold text-green-500">{phase.value.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{phase.percentage}% of all studies</p>
              </div>
            </div>
          </Card>
        ))}

        {/* Studies Summary */}
        {phaseData.filter((p: any) => p.type === 'summary').map((item, index) => (
          <Card key={`summary-${index}`} className="p-3 md:p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Beaker className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
                <p className="text-lg md:text-2xl font-bold text-blue-500">{item.value.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{item.percentage}% of all studies</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Total Studies */}
        {phaseData.filter((p: any) => p.type === 'total').map((item, index) => (
          <Card key={`total-${index}`} className="p-3 md:p-4 hover:shadow-md transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
                <p className="text-lg md:text-2xl font-bold text-purple-500">{item.value.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Complete database</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhaseAnalytics;
