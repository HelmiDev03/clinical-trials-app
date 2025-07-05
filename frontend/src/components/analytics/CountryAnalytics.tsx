import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { apiService } from '../../services/apiService';
import { ChartData } from '../../types/clinical-trial';
import { 
  MapPin, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  Users,
  Building2,
  Award,
  Map
} from 'lucide-react';

interface CountryData extends ChartData {
  flag?: string;
  description?: string;
}

const CountryAnalytics: React.FC = () => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Enhanced color palette for different countries
  const countryColors = [
    '#3b82f6', // Blue - Primary
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#a855f7', // Purple
    '#22c55e', // Green
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f59e0b', // Yellow
    '#64748b'  // Slate
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getCountryAnalytics();
        const enhancedData = (data as CountryData[]).map((item, index) => ({
          ...item,
          color: countryColors[index % countryColors.length],
          fill: countryColors[index % countryColors.length]
        }));
        setCountryData(enhancedData || []);
        setAnimationKey(prev => prev + 1); // Trigger re-animation
      } catch (error) {
        console.error('Error loading country data:', error);
        setCountryData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-96">
            <CardContent className="h-full">
              <div className="h-full bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="h-32">
              <CardContent className="h-full">
                <div className="h-full bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
            <Card className="h-60">
              <CardContent className="h-full">
                <div className="h-full bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const totalTrials = countryData.reduce((sum, item) => sum + item.value, 0);
  const topCountries = countryData.slice(0, 5);

  // Custom tooltip for enhanced interactivity
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            {data.flag && (
              <span className="text-lg">{data.flag}</span>
            )}
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <h4 className="font-semibold">{data.name}</h4>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {data.value.toLocaleString()} trials
          </p>
          <p className="text-sm text-blue-500">
            {data.percentage}% of top 10
          </p>
          {data.description && (
            <p className="text-xs text-gray-600 mt-1">
              {data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section with Animation */}
      <div className="flex items-center gap-3 animate-slide-in-from-left">
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl animate-pulse-subtle">
          <Globe className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Geographic Distribution
          </h1>
          <p className="text-muted-foreground text-lg">
            Clinical trials distribution across top countries worldwide
            <span className="text-sm ml-2 text-blue-600 font-medium">
              ({totalTrials.toLocaleString()} trials in top 10)
            </span>
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all duration-300 animate-slide-in-from-bottom delay-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Trials</p>
              <p className="text-2xl font-bold text-blue-700">
                {totalTrials.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 animate-slide-in-from-bottom delay-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Map className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Countries</p>
              <p className="text-2xl font-bold text-green-700">
                {countryData.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 animate-slide-in-from-bottom delay-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Leading Country</p>
              <p className="text-lg font-bold text-purple-700 flex items-center gap-1">
                {topCountries[0]?.flag} {topCountries[0]?.name || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-all duration-300 animate-slide-in-from-bottom delay-400">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Top Share</p>
              <p className="text-2xl font-bold text-amber-700">
                {topCountries[0]?.percentage || '0'}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-6">
        {/* Enhanced Pie Chart */}
        <Card className="xl:col-span-2 shadow-xl border-2 border-border/50 hover:shadow-2xl transition-all duration-500 animate-slide-in-from-left mb-8 md:mb-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              Geographic Distribution Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Interactive breakdown of clinical trials by country with real-time data
            </p>
          </CardHeader>
          <CardContent className="pb-8 md:pb-6">
            <div className="h-[550px] md:h-[500px] [&_.recharts-legend-wrapper]:transform [&_.recharts-legend-wrapper]:md:transform-none [&_.recharts-legend-wrapper]:-translate-y-[108px] [&_.recharts-legend-wrapper]:md:translate-y-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={animationKey}>
                  <Pie
                    data={countryData.slice(0, 8)} // Show top 8 in pie chart for clarity
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {countryData.slice(0, 8).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom"
                    height={80}
                    formatter={(value, entry: any) => (
                      <span className="text-sm font-medium flex items-center gap-1">
                        {entry.payload?.flag} {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Statistics Panel */}
        <div className="space-y-4 animate-slide-in-from-right">
          

          {/* Country Rankings List */}
          <Card className="shadow-lg border-2 border-border/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
                All Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {countryData.map((country, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-green-50 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full animate-pulse" 
                          style={{ backgroundColor: country.color }}
                        />
                        <span className="text-lg font-medium">#{index + 1}</span>
                        {country.flag && (
                          <span className="text-lg">{country.flag}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{country.name}</span>
                        {country.description && (
                          <p className="text-xs text-gray-500 mt-1">{country.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {country.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {country.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CountryAnalytics;
