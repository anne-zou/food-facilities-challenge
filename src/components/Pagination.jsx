import { useSearch } from '../contexts/SearchContext';

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
    <div>
      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
        First
      </button>
      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
        Previous
      </button>
      {getPageNumbers().map((pageNum, index) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`}> ... </span>
        ) : (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            disabled={pageNum === currentPage}
            style={{
              fontWeight: pageNum === currentPage ? 'bold' : 'normal',
              backgroundColor: pageNum === currentPage ? '#e0e0e0' : 'transparent'
            }}
          >
            {pageNum}
          </button>
        )
      ))}
      <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
        Next
      </button>
      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
        Last
      </button>
    </div>
  );
}

export default Pagination;
