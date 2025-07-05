
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
  Activity, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Pause,
  PlayCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface StatusData extends ChartData {
  description?: string;
  rawStatus?: string;
}

const StatusAnalytics: React.FC = () => {
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Enhanced color palette for different status types
  const statusColors = [
    '#10b981', // Green - Recruiting
    '#3b82f6', // Blue - Active Not Recruiting  
    '#8b5cf6', // Purple - Completed
    '#f59e0b', // Amber - Enrolling by Invitation
    '#06b6d4', // Cyan - Not Yet Recruiting
    '#ef4444', // Red - Terminated
    '#f97316', // Orange - Suspended
    '#6b7280', // Gray - Withdrawn
    '#84cc16', // Lime - Available
    '#64748b', // Slate - No Longer Available
    '#a855f7', // Violet - Temporarily Not Available
    '#22c55e', // Green variant - Approved for Marketing
    '#94a3b8', // Blue Gray - Withheld
    '#475569'  // Dark Slate - Unknown
  ];

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('recruiting')) return Users;
    if (statusLower.includes('completed')) return CheckCircle;
    if (statusLower.includes('active')) return PlayCircle;
    if (statusLower.includes('not yet')) return Clock;
    if (statusLower.includes('terminated')) return XCircle;
    if (statusLower.includes('suspended')) return Pause;
    if (statusLower.includes('withdrawn')) return AlertTriangle;
    return Activity;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getStatusAnalytics();
        const enhancedData = (data as StatusData[]).map((item, index) => ({
          ...item,
          color: statusColors[index % statusColors.length],
          fill: statusColors[index % statusColors.length]
        }));
        setStatusData(enhancedData || []);
        setAnimationKey(prev => prev + 1); // Trigger re-animation
      } catch (error) {
        console.error('Error loading status data:', error);
        setStatusData([]);
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

  const totalTrials = statusData.reduce((sum, item) => sum + item.value, 0);
  const topStatuses = statusData.slice(0, 5);
  const activeTrials = statusData.filter(s => 
    s.name.toLowerCase().includes('recruiting') || 
    s.name.toLowerCase().includes('active')
  ).reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip for enhanced interactivity
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
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
            {data.percentage}% of total
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
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl animate-pulse-subtle">
          <Activity className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trial Status Analysis
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time distribution of clinical trial statuses worldwide
            <span className="text-sm ml-2 text-blue-600 font-medium">
              ({totalTrials.toLocaleString()} total trials)
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

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 animate-slide-in-from-bottom delay-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Status Types</p>
              <p className="text-2xl font-bold text-purple-700">
                {statusData.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-all duration-300 animate-slide-in-from-bottom delay-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Top Status</p>
              <p className="text-lg font-bold text-amber-700">
                {topStatuses[0]?.name || 'N/A'}
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
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              Status Distribution Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Interactive breakdown of all trial statuses with real-time data
            </p>
          </CardHeader>
          <CardContent className="pb-8 md:pb-6">
            <div className="h-[550px] md:h-[500px] [&_.recharts-legend-wrapper]:transform [&_.recharts-legend-wrapper]:md:transform-none [&_.recharts-legend-wrapper]:-translate-y-[108px] [&_.recharts-legend-wrapper]:md:translate-y-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={animationKey}>
                  <Pie
                    data={statusData}
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
                    {statusData.map((entry, index) => (
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
                    formatter={(value) => (
                      <span className="text-sm font-medium">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Statistics Panel */}
        <div className="space-y-4 animate-slide-in-from-right">
          
        

          {/* Detailed Status List */}
          <Card className="shadow-lg border-2 border-border/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                All Statuses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {statusData.map((item, index) => {
                  const IconComponent = getStatusIcon(item.name);
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full animate-pulse" 
                            style={{ backgroundColor: item.color }}
                          />
                          <IconComponent className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {item.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatusAnalytics;
