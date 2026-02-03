import { createContext, useState, useEffect, useContext } from 'react';
import type { Database } from 'sql.js';
import type { FacilityStatus, SearchResultRecord } from '../types';
import { STATUS_VALUES } from '../db/schema';
import { buildGeoSearchQuery, buildTextSearchQuery, buildLoadAllQuery } from '../db/queries';

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  results: SearchResultRecord[];
  isLatLongSearch: boolean;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  selectedStatuses: FacilityStatus[];
  showStatusDropdown: boolean;
  setShowStatusDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  searchByApplicant: boolean;
  setSearchByApplicant: React.Dispatch<React.SetStateAction<boolean>>;
  searchByAddress: boolean;
  setSearchByAddress: React.Dispatch<React.SetStateAction<boolean>>;
  showFieldsDropdown: boolean;
  setShowFieldsDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  itemsPerPage: number;
  totalPages: number;
  currentPageResults: SearchResultRecord[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleStatusToggle: (status: FacilityStatus) => void;
  handleSelectAllStatuses: () => void;
  handleDeselectAllStatuses: () => void;
}

interface SearchProviderProps {
  children: React.ReactNode;
  db?: Database | null;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children, db: dbProp }: SearchProviderProps) {
  const [db] = useState<Database | null>(() => dbProp || window.db || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultRecord[]>([]);
  const [isLatLongSearch, setIsLatLongSearch] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedStatuses, setSelectedStatuses] = useState<FacilityStatus[]>([...STATUS_VALUES]);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [searchByApplicant, setSearchByApplicant] = useState<boolean>(true);
  const [searchByAddress, setSearchByAddress] = useState<boolean>(true);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState<boolean>(false);
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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      console.log('Submitted empty search input, loading all rows again');
      loadAllRows();
      return;
    }
    performSearch();
  };

  // Handler functions for status filter toggles
  const handleStatusToggle = (status: FacilityStatus): void => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };
  const handleSelectAllStatuses = (): void => {
    setSelectedStatuses([...STATUS_VALUES]);
  };
  const handleDeselectAllStatuses = (): void => {
    setSelectedStatuses([]);
  };

  // Helper function for loading all rows without any search query
  const loadAllRows = (): void => {
    if (!db) {
      console.log('Database not ready');
      return;
    }
    const { sql, bindings } = buildLoadAllQuery(selectedStatuses);
    const stmt = db.prepare(sql);
    if (bindings.length > 0) {
      stmt.bind(bindings);
    }
    const allResults: SearchResultRecord[] = [];
    while (stmt.step()) {
      allResults.push(stmt.getAsObject() as any);
    }
    stmt.free();
    setResults(allResults);
    setIsLatLongSearch(false);
    setCurrentPage(1);
    console.log(`Loaded ${allResults.length} rows`);
  };

  // Helper function for performing search
  const performSearch = (): void => {
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
  const searchByText = (): void => {
    const queryResult = buildTextSearchQuery(searchQuery, searchByApplicant, searchByAddress, selectedStatuses);

    if (!queryResult) {
      setResults([]);
      setIsLatLongSearch(false);
      setCurrentPage(1);
      console.log('No search fields selected');
      return;
    }

    const { sql, bindings } = queryResult;
    const stmt = db!.prepare(sql);
    stmt.bind(bindings);

    const searchResults: SearchResultRecord[] = [];
    while (stmt.step()) {
      searchResults.push(stmt.getAsObject() as any);
    }
    stmt.free();

    setResults(searchResults);
    setIsLatLongSearch(false);
    setCurrentPage(1);
    console.log(`Found ${searchResults.length} text search results:`, searchResults);
  };

  // Helper to search by latitude and longitude
  const searchByCoordinates = (coordinates: RegExpMatchArray): void => {
    const searchLat = parseFloat(coordinates[1]);
    const searchLon = parseFloat(coordinates[2]);

    console.log(`Searching for nearest locations to: ${searchLat}, ${searchLon}`);

    const { sql, bindings } = buildGeoSearchQuery(searchLat, searchLon, selectedStatuses);
    const stmt = db!.prepare(sql);
    stmt.bind(bindings);

    const searchResults: SearchResultRecord[] = [];
    while (stmt.step()) {
      searchResults.push(stmt.getAsObject() as any);
    }
    stmt.free();

    setResults(searchResults);
    setIsLatLongSearch(true);
    setCurrentPage(1);
    console.log(`Found ${searchResults.length} nearest results:`, searchResults);
  };

  // Helper to check if input matches lat,long pattern
  const parseCoordinates = (query: string): RegExpMatchArray | null => {
    const coordPattern = /^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/;
    const coordMatch = query.match(coordPattern);
    return coordMatch; // returns null if input does not match lat,long pattern
  }

  // Calculate pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageResults = isLatLongSearch ? results : results.slice(startIndex, endIndex);

  const value: SearchContextValue = {
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

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
