import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CountryAnalytics from '../components/analytics/CountryAnalytics';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const CountryAnalyticsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Sidebar - Single instance for both mobile and desktop */}
      <div className="flex-shrink-0 hidden md:block">
        {/* Desktop Sidebar - always visible */}
        <Sidebar />
      </div>

      {/* Mobile Sidebar - toggleable */}
      <div className="md:hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
            {/* Mobile Menu Button */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </div>
            
            <CountryAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryAnalyticsPage;
