import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  availablePages?: number[]; // Pages that can be navigated to
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  availablePages = []
}) => {
  const [pageInput, setPageInput] = useState('');

  const handleGoToPage = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      if (pageNumber > 1 && !availablePages.includes(pageNumber)) {
        alert(
          `Cannot jump directly to page ${pageNumber}. ` +
          `Due to API limitations, you need to navigate sequentially using the Next button. ` +
          `You can go to page 1 and then use Next to reach page ${pageNumber}.`
        );
        setPageInput('');
        return;
      }
      onPageChange(pageNumber);
      setPageInput('');
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };
  const isPageAvailable = (page: number) => {
    // Page 1 is always available
    if (page === 1) return true;
    // Current page and adjacent pages with tokens are available
    if (Math.abs(page - currentPage) <= 1 && availablePages.includes(page)) return true;
    // Check if we have specific page in available pages
    return availablePages.includes(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4 mt-6">
      {/* Mobile-first pagination */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="flex items-center gap-1 px-3"
        >
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        {/* Desktop: Show page numbers */}
        <div className="hidden md:flex items-center space-x-2">
          {/* First page */}
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={loading || !isPageAvailable(1)}
              >
                1
              </Button>
              {pageNumbers[0] > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}

          {/* Page numbers */}
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={loading || !isPageAvailable(page)}
              className={page === currentPage ? "bg-primary text-primary-foreground" : ""}
            >
              {page}
            </Button>
          ))}

          {/* Last page */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={loading || !isPageAvailable(totalPages)}
                title={!isPageAvailable(totalPages) ? "Navigate sequentially to reach this page" : ""}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Mobile: Show current page info */}
        <div className="md:hidden flex items-center space-x-2 px-4">
          <span className="text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="flex items-center gap-1 px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>

      {/* Page info and Go to page input - Desktop only */}
      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <span>Go to:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Page"
            className="w-16 h-8 text-center"
            disabled={loading}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleGoToPage}
            disabled={loading || !pageInput || parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages}
            className="h-8"
          >
            Go
          </Button>
        </div>
      </div>

      {/* Mobile: Simple go to page */}
      <div className="md:hidden flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Go to page:</span>
        <Input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyPress={handleInputKeyPress}
          placeholder="Page"
          className="w-20 h-8 text-center text-sm"
          disabled={loading}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleGoToPage}
          disabled={loading || !pageInput || parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages}
          className="h-8 px-3 text-sm"
        >
          Go
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
