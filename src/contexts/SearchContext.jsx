import { createContext, useState, useEffect, useContext } from 'react';
import { STATUS_VALUES } from '../db/schema';
import { buildGeoSearchQuery, buildTextSearchQuery, buildLoadAllQuery } from '../db/queries';

const SearchContext = createContext();

export function SearchProvider({ children, db: dbProp }) {
  const [db] = useState(() => dbProp || window.db || null);
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

  // Refresh table on component mount and when user selects/deselects 
  // a search field or status filter
  useEffect(() => {
    if (!db) {
      return;
    }
    if (searchQuery.trim()) {
      performSearch(); // perform search if there's a query
    } else {
      loadAllRows(); // load all rows on component mount
    }
  }, [db, selectedStatuses, searchByApplicant, searchByAddress]);

  // Handler function for search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      console.log('Submitted empty search input, loading all rows again');
      loadAllRows();
      return;
    }
    performSearch();
  };

  // Handler functions for status filter toggles
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

  // Helper function for loading all rows without any search query
  const loadAllRows = () => {
    if (!db) {
      console.log('Database not ready');
      return;
    }
    const { sql, bindings } = buildLoadAllQuery(selectedStatuses);
    const stmt = db.prepare(sql);
    if (bindings.length > 0) {
      stmt.bind(bindings);
    }
    const allResults = [];
    while (stmt.step()) {
      allResults.push(stmt.getAsObject());
    }
    stmt.free();
    setResults(allResults);
    setIsLatLongSearch(false);
    setCurrentPage(1);
    console.log(`Loaded ${allResults.length} rows`);
  };

  // Helper function for performing search
  const performSearch = () => {
    if (!db) {
      console.log('Database not ready');
      return;
    }
    const maybeCoordinates = parseCoordinates(searchQuery);
    if (maybeCoordinates) {
      searchByCoordinates(maybeCoordinates);
    } else {
      searchByText();
    }
  };

  // Helper to search by text fields
  const searchByText = () => {
    const queryResult = buildTextSearchQuery(searchQuery, searchByApplicant, searchByAddress, selectedStatuses);

    if (!queryResult) {
      setResults([]);
      setIsLatLongSearch(false);
      setCurrentPage(1);
      console.log('No search fields selected');
      return;
    }

    const { sql, bindings } = queryResult;
    const stmt = db.prepare(sql);
    stmt.bind(bindings);

    const searchResults = [];
    while (stmt.step()) {
      searchResults.push(stmt.getAsObject());
    }
    stmt.free();

    setResults(searchResults);
    setIsLatLongSearch(false);
    setCurrentPage(1);
    console.log(`Found ${searchResults.length} text search results:`, searchResults);
  };

  // Helper to search by latitude and longitude
  const searchByCoordinates = (coordinates) => {
    const searchLat = parseFloat(coordinates[1]);
    const searchLon = parseFloat(coordinates[2]);

    console.log(`Searching for nearest locations to: ${searchLat}, ${searchLon}`);

    const { sql, bindings } = buildGeoSearchQuery(searchLat, searchLon, selectedStatuses);
    const stmt = db.prepare(sql);
    stmt.bind(bindings);

    const searchResults = [];
    while (stmt.step()) {
      searchResults.push(stmt.getAsObject());
    }
    stmt.free();

    setResults(searchResults);
    setIsLatLongSearch(true);
    setCurrentPage(1);
    console.log(`Found ${searchResults.length} nearest results:`, searchResults);
  };

  // Helper to check if input matches lat,long pattern
  const parseCoordinates = (query) => {
    const coordPattern = /^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/;
    const coordMatch = query.match(coordPattern);
    return coordMatch; // returns null if input does not match lat,long pattern
  }

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
