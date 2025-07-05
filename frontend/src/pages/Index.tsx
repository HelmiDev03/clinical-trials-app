
import React, { useState, useEffect, useMemo, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import TrialTable from '../components/TrialTable';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import { ClinicalTrial, TrialFilters } from '../types/clinical-trial';
import { apiService } from '../services/apiService';
import { Microscope, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TrialFilters>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [pageTokens, setPageTokens] = useState<{[key: number]: string}>({});
  const [originalTotal, setOriginalTotal] = useState(0); // Store the original total from first page

  // Ref to prevent infinite loops
  const loadingRef = useRef(false);

  // Debounced search and filters with pagination
  const currentPageToken = currentPage > 1 ? pageTokens[currentPage] : undefined;
  
  const debouncedFilters = useMemo(() => {
    return {
      ...filters,
      searchTerm: searchTerm.trim(),
      page: currentPage,
      limit: 10,  // 10 trials per page
      pageToken: currentPageToken
    };
  }, [filters, searchTerm, currentPage, currentPageToken]);

  const loadTrials = async (currentFilters: TrialFilters) => {
    if (loadingRef.current) return; // Prevent concurrent requests
    
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await apiService.getTrials(currentFilters);
      
      // Check if we got a pagination error
      if (response.error === 'PAGINATION_TOKEN_REQUIRED') {
        // Show message that sequential navigation is required
        console.warn('Sequential navigation required for this page');
        setTrials([]);
        setTotalPages(1);
        setTotalResults(0);
        return;
      }
      
      setTrials(response.trials);
      
      // If this is the first page (has total count), store it
      if (response.total > 0) {
        setTotalResults(response.total);
        setOriginalTotal(response.total);
        setTotalPages(Math.ceil(response.total / 10));
      } else if (originalTotal > 0) {
        // Use the stored total from the first page
        setTotalResults(originalTotal);
        setTotalPages(Math.ceil(originalTotal / 10));
      } else {
        // No total available, use response values
        setTotalPages(response.totalPages);
        setTotalResults(response.total);
      }
      
      // Store the next page token for pagination (for any page that has a nextPageToken)
      if (response.nextPageToken) {
        setPageTokens(prev => {
          const newPageTokens = { ...prev };
          newPageTokens[currentPage + 1] = response.nextPageToken;
          return newPageTokens;
        });
      }
      
    } catch (error) {
      console.error('Error loading trials:', error);
      // Fallback to empty array on error
      setTrials([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTrials(debouncedFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [debouncedFilters]);

  // Reset page tokens when search term changes
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setCurrentPage(1);
      setPageTokens({});
      setOriginalTotal(0); // Reset stored total when search changes
    }
  }, [searchTerm]);

  const handleFiltersChange = (newFilters: TrialFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setPageTokens({}); // Clear page tokens when filters change
    setOriginalTotal(0); // Reset stored total when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing filters
    setPageTokens({}); // Clear page tokens when clearing filters
    setOriginalTotal(0); // Reset stored total when clearing filters
  };

  const handlePageChange = async (page: number) => {
    // If going to the current page, do nothing
    if (page === currentPage) return;
    
    // If going to page 1, reset everything
    if (page === 1) {
      setCurrentPage(1);
      setPageTokens({}); // Clear tokens when going back to page 1
      return;
    }
    
    // If we have the pageToken for this page, navigate directly
    if (pageTokens[page]) {
      setCurrentPage(page);
      return;
    }
    
    // For pages we don't have tokens for, warn the user
    if (page > 1) {
      alert(
        `Cannot jump directly to page ${page}. ` +
        `Due to API limitations, you need to navigate sequentially using the Next button. ` +
        `You can navigate to page 1 and then use Next to reach page ${page}.`
      );
      return;
    }
    
    setCurrentPage(page);
  };

  const renderContent = () => {
    return (
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="mb-4"
          >
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 md:p-4 bg-primary/10 rounded-3xl">
              <Microscope className="h-12 w-12 md:h-16 md:w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Clinical Trials Search
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Discover and analyze clinical trials from around the world. Search, filter, and explore 
            medical research data with our interactive platform.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4 md:space-y-6 px-4 md:px-0">
          <div className="flex justify-center">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search for conditions, interventions, or studies..."
            />
          </div>
          
          <div className="max-w-6xl mx-auto">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {/* Search Results Table */}
        <div className="max-w-6xl mx-auto space-y-4 px-4 md:px-0">
          <TrialTable 
            trials={trials} 
            loading={loading} 
            totalResults={totalResults}
          />
          
          {/* Pagination */}
          {totalResults > 0 && (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalResults)} of {totalResults} results
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
                availablePages={[1, ...Object.keys(pageTokens).map(Number)]}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

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
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
