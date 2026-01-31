import { useSearch } from '../contexts/SearchContext';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  ellipsis: {
    padding: '0.375rem 0.75rem',
    color: '#6c757d',
  }
});

function Pagination() {
  // Get pagination state from SearchContext
  const { currentPage, setCurrentPage, totalPages, isLatLongSearch } = useSearch();

  // Calculate which page numbers to display with smart ellipsis
  // Shows: [1] ... [currentPage-1] [currentPage] [currentPage+1] ... [lastPage]
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;

    // If total pages fit within max, show all page numbers
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate range around current page (current ± 1)
      const leftSide = Math.max(2, currentPage - 1);
      const rightSide = Math.min(totalPages - 1, currentPage + 1);

      // Always show first page
      pageNumbers.push(1);

      // Add left ellipsis if there's a gap after page 1
      if (leftSide > 2) {
        pageNumbers.push('...');
      }

      // Add pages around current page
      for (let i = leftSide; i <= rightSide; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      // Add right ellipsis if there's a gap before last page
      if (rightSide < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Hide pagination for geolocation searches (always 5 results) or single page
  if (isLatLongSearch || totalPages <= 1) {
    return null;
  }

  return (
    <div {...stylex.props(styles.container)}>
      {/* Previous button - decrements page, disabled on first page */}
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="btn btn-sm btn-outline-secondary"
      >
        Previous
      </button>
      {/* Render page numbers or ellipsis */}
      {getPageNumbers().map((pageNum, index) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`} {...stylex.props(styles.ellipsis)}>...</span>
        ) : (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            disabled={pageNum === currentPage}
            className={pageNum === currentPage ? 'btn btn-sm btn-secondary page-number-btn' : 'btn btn-sm btn-outline-secondary page-number-btn'}
          >
            {pageNum}
          </button>
        )
      ))}
      {/* Next button - increments page, disabled on last page */}
      <button
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="btn btn-sm btn-outline-secondary"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
