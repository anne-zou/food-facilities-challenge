import { useState, useEffect } from 'react';
import { STATUS_VALUES } from './schema';

function SearchLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLatLongSearch, setIsLatLongSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState([...STATUS_VALUES]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const itemsPerPage = 25;

  // Load all rows on component mount and when status filter changes
  useEffect(() => {
    if (!window.db) {
      return;
    }

    // If there's an active search query, re-run the search
    if (searchQuery.trim()) {
      performSearch();
    } else {
      loadAllRows();
    }
  }, [selectedStatuses]);

  const performSearch = () => {
    if (!window.db) {
      console.log('Database not ready');
      return;
    }

    // Check if search query is a comma-separated pair of coordinates
    const coordPattern = /^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/;
    const coordMatch = searchQuery.match(coordPattern);

    if (coordMatch) {
      // Parse coordinates
      const searchLat = parseFloat(coordMatch[1]);
      const searchLon = parseFloat(coordMatch[2]);

      console.log(`Searching for nearest locations to: ${searchLat}, ${searchLon}`);

      // Query by distance using Haversine formula
      let sql = `
        SELECT *,
          (6371 * acos(
            cos(? * 3.14159265359 / 180) * cos(CAST("Latitude" AS REAL) * 3.14159265359 / 180) *
            cos((CAST("Longitude" AS REAL) - ?) * 3.14159265359 / 180) +
            sin(? * 3.14159265359 / 180) * sin(CAST("Latitude" AS REAL) * 3.14159265359 / 180)
          )) AS distance_km
        FROM food_facilities
        WHERE "Latitude" IS NOT NULL AND "Longitude" IS NOT NULL
      `;

      // Add status filter
      if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
        const placeholders = selectedStatuses.map(() => '?').join(', ');
        sql += ` AND "Status" IN (${placeholders})`;
      }

      sql += ` ORDER BY distance_km LIMIT 5`;

      const stmt = window.db.prepare(sql);

      const bindings = [searchLat, searchLon, searchLat];

      // Add status values to bindings if filtering
      if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
        bindings.push(...selectedStatuses);
      }

      stmt.bind(bindings);

      const searchResults = [];
      while (stmt.step()) {
        searchResults.push(stmt.get({}));
      }
      stmt.finalize();

      setResults(searchResults);
      setIsLatLongSearch(true);
      setCurrentPage(1);
      console.log(`Found ${searchResults.length} nearest results:`, searchResults);
    } else {
      // Text search on Applicant or Address columns
      let sql = `
        SELECT * FROM food_facilities
        WHERE ("Applicant" LIKE ? OR "Address" LIKE ?)
      `;

      // Add status filter
      if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
        const placeholders = selectedStatuses.map(() => '?').join(', ');
        sql += ` AND "Status" IN (${placeholders})`;
      }

      const stmt = window.db.prepare(sql);

      const searchPattern = `%${searchQuery}%`;
      const bindings = [searchPattern, searchPattern];

      // Add status values to bindings if filtering
      if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
        bindings.push(...selectedStatuses);
      }

      stmt.bind(bindings);

      const searchResults = [];
      while (stmt.step()) {
        searchResults.push(stmt.get({}));
      }
      stmt.finalize();

      setResults(searchResults);
      setIsLatLongSearch(false);
      setCurrentPage(1);
      console.log(`Found ${searchResults.length} text search results:`, searchResults);
    }
  };

  // Load all rows from the database
  const loadAllRows = () => {
    if (!window.db) {
      console.log('Database not ready');
      return;
    }

    // Build WHERE clause for status filter
    let sql = `SELECT * FROM food_facilities`;
    if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
      const placeholders = selectedStatuses.map(() => '?').join(', ');
      sql += ` WHERE "Status" IN (${placeholders})`;
    }

    const stmt = window.db.prepare(sql);

    // Bind status values if filtering
    if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
      stmt.bind(selectedStatuses);
    }

    const allResults = [];
    while (stmt.step()) {
      allResults.push(stmt.get({}));
    }
    stmt.finalize();

    setResults(allResults);
    setIsLatLongSearch(false);
    setCurrentPage(1);
    console.log(`Loaded ${allResults.length} rows`);
  };

  // Handle search input submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // If search input is empty, load all rows again
    if (!searchQuery.trim()) {
      console.log('Submitted empty search input, loading all rows again');
      loadAllRows();
      return;
    }

    performSearch();
  };

  // Calculate pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageResults = isLatLongSearch ? results : results.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleSelectAllStatuses = () => {
    setSelectedStatuses([...STATUS_VALUES]);
  };

  const handleDeselectAllStatuses = () => {
    setSelectedStatuses([]);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, current page, and nearby pages
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

  return (
    <div>
      <h1>San Francisco Food Facilities</h1>

      <form onSubmit={handleSubmit}>
        <p>
          {"Search food facilities by name, street, address, or lat/long coordinates (e.g. 6004575.869, 2105666.974)"}
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
            style={{ flex: 1 }}
          />
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
              Filter by Status ({selectedStatuses.length}/{STATUS_VALUES.length})
            </button>
            {showStatusDropdown && (
              <div style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginTop: '5px',
                backgroundColor: 'white',
                position: 'absolute',
                zIndex: 1000,
                minWidth: '200px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <button type="button" onClick={handleSelectAllStatuses} style={{ marginRight: '5px' }}>
                    Select All
                  </button>
                  <button type="button" onClick={handleDeselectAllStatuses}>
                    Deselect All
                  </button>
                </div>
                {STATUS_VALUES.map(status => (
                  <div key={status} style={{ marginBottom: '5px' }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                      />
                      {' '}{status}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit">
            Search
          </button>
        </div>
      </form>

      {results.length > 0 ? (
        <div>
          <p>
            {isLatLongSearch
              ? "Showing the 5 closest results for the given lat/long coordinates"
              : `${results.length} result${results.length !== 1 ? 's' : ''}`
            }
          </p>
          <div>
            <table>
              <thead>
                <tr>
                  {Object.keys(results[0]).map((column) => (
                    <th key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentPageResults.map((result, index) => (
                  <tr key={index}>
                    {Object.keys(result).map((column) => (
                      <td key={column}>
                        {result[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLatLongSearch && totalPages > 1 && (
            <div>
              <button onClick={handleFirstPage} disabled={currentPage === 1}>
                First
              </button>
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </button>
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`}> ... </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum)}
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
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
              <button onClick={handleLastPage} disabled={currentPage === totalPages}>
                Last
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>
            No results found
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchLayout;
