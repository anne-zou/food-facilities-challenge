import { createContext, useState, useEffect, useContext } from 'react';
import { STATUS_VALUES } from '../schema';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLatLongSearch, setIsLatLongSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState([...STATUS_VALUES]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [searchByApplicant, setSearchByApplicant] = useState(true);
  const [searchByAddress, setSearchByAddress] = useState(true);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const itemsPerPage = 25;

  // Load all rows on component mount and when filters change
  useEffect(() => {
    if (!window.db) {
      return;
    }

    if (searchQuery.trim()) {
      performSearch();
    } else {
      loadAllRows();
    }
  }, [selectedStatuses, searchByApplicant, searchByAddress]);

  const performSearch = () => {
    if (!window.db) {
      console.log('Database not ready');
      return;
    }

    const coordPattern = /^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/;
    const coordMatch = searchQuery.match(coordPattern);

    if (coordMatch) {
      searchByCoordinates(coordMatch);
    } else {
      searchByText();
    }
  };

  const searchByCoordinates = (coordMatch) => {
    const searchLat = parseFloat(coordMatch[1]);
    const searchLon = parseFloat(coordMatch[2]);

    console.log(`Searching for nearest locations to: ${searchLat}, ${searchLon}`);

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

    if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
      const placeholders = selectedStatuses.map(() => '?').join(', ');
      sql += ` AND "Status" IN (${placeholders})`;
    }

    sql += ` ORDER BY distance_km LIMIT 5`;

    const stmt = window.db.prepare(sql);
    const bindings = [searchLat, searchLon, searchLat];

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
  };

  const searchByText = () => {
    const whereConditions = [];
    const bindings = [];

    if (searchByApplicant) {
      whereConditions.push('"Applicant" LIKE ?');
      bindings.push(`%${searchQuery}%`);
    }

    if (searchByAddress) {
      whereConditions.push('"Address" LIKE ?');
      bindings.push(`%${searchQuery}%`);
    }

    if (whereConditions.length === 0) {
      setResults([]);
      setIsLatLongSearch(false);
      setCurrentPage(1);
      console.log('No search fields selected');
      return;
    }

    let sql = `
      SELECT * FROM food_facilities
      WHERE (${whereConditions.join(' OR ')})
    `;

    if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
      const placeholders = selectedStatuses.map(() => '?').join(', ');
      sql += ` AND "Status" IN (${placeholders})`;
    }

    const stmt = window.db.prepare(sql);

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
  };

  const loadAllRows = () => {
    if (!window.db) {
      console.log('Database not ready');
      return;
    }

    let sql = `SELECT * FROM food_facilities`;
    if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
      const placeholders = selectedStatuses.map(() => '?').join(', ');
      sql += ` WHERE "Status" IN (${placeholders})`;
    }

    const stmt = window.db.prepare(sql);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      console.log('Submitted empty search input, loading all rows again');
      loadAllRows();
      return;
    }

    performSearch();
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

  // Calculate pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageResults = isLatLongSearch ? results : results.slice(startIndex, endIndex);

  const value = {
    searchQuery,
    setSearchQuery,
    results,
    isLatLongSearch,
    currentPage,
    setCurrentPage,
    selectedStatuses,
    showStatusDropdown,
    setShowStatusDropdown,
    searchByApplicant,
    setSearchByApplicant,
    searchByAddress,
    setSearchByAddress,
    showFieldsDropdown,
    setShowFieldsDropdown,
    itemsPerPage,
    totalPages,
    currentPageResults,
    handleSubmit,
    handleStatusToggle,
    handleSelectAllStatuses,
    handleDeselectAllStatuses
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
