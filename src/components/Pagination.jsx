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
  const { currentPage, setCurrentPage, totalPages, isLatLongSearch } = useSearch();

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSide = Math.max(2, currentPage - 1);
      const rightSide = Math.min(totalPages - 1, currentPage + 1);

      pageNumbers.push(1);

      if (leftSide > 2) {
        pageNumbers.push('...');
      }

      for (let i = leftSide; i <= rightSide; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      if (rightSide < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (isLatLongSearch || totalPages <= 1) {
    return null;
  }

  return (
    <div {...stylex.props(styles.container)}>
      <button
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="btn btn-sm btn-outline-secondary"
      >
        Previous
      </button>
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
