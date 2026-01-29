import { useState, useEffect } from 'react';

function SearchLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLatLongSearch, setIsLatLongSearch] = useState(false);

  // Load all rows on component mount
  useEffect(() => {
    loadAllRows();
  }, []);

  // Load all rows from the database
  const loadAllRows = () => {
    if (!window.db) {
      console.log('Database not ready');
      return;
    }
    const sql = `SELECT * FROM food_facilities LIMIT 500`;
    const stmt = window.db.prepare(sql);

    const allResults = [];
    while (stmt.step()) {
      allResults.push(stmt.get({}));
    }
    stmt.finalize();

    setResults(allResults);
    setIsLatLongSearch(false);
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
      // Distance = R * acos(cos(lat1) * cos(lat2) * cos(lon2 - lon1) + sin(lat1) * sin(lat2))
      // Using simplified calculation for SQLite
      const sql = `
        SELECT *,
          (6371 * acos(
            cos(? * 3.14159265359 / 180) * cos(CAST("Latitude" AS REAL) * 3.14159265359 / 180) *
            cos((CAST("Longitude" AS REAL) - ?) * 3.14159265359 / 180) +
            sin(? * 3.14159265359 / 180) * sin(CAST("Latitude" AS REAL) * 3.14159265359 / 180)
          )) AS distance_km
        FROM food_facilities
        WHERE "Latitude" IS NOT NULL AND "Longitude" IS NOT NULL
        ORDER BY distance_km
        LIMIT 5
      `;

      const stmt = window.db.prepare(sql);
      stmt.bind([searchLat, searchLon, searchLat]);

      const searchResults = [];
      while (stmt.step()) {
        searchResults.push(stmt.get({}));
      }
      stmt.finalize();

      setResults(searchResults);
      setIsLatLongSearch(true);
      console.log(`Found ${searchResults.length} nearest results:`, searchResults);
    } else {
      // Text search on Applicant or Address columns
      const sql = `
        SELECT * FROM food_facilities
        WHERE "Applicant" LIKE ? OR "Address" LIKE ?
        LIMIT 50
      `;
      const stmt = window.db.prepare(sql);

      const searchPattern = `%${searchQuery}%`;
      stmt.bind([searchPattern, searchPattern]);

      const searchResults = [];
      while (stmt.step()) {
        searchResults.push(stmt.get({}));
      }
      stmt.finalize();

      setResults(searchResults);
      setIsLatLongSearch(false);
      console.log(`Found ${searchResults.length} text search results:`, searchResults);
    }
  };

  return (
    <div>
      <h1>San Francisco Food Facilities</h1>

      <form onSubmit={handleSubmit}>
        <p>
          {"Search food facilities by name, street, address, or lat/long coordinates (e.g. 6004575.869, 2105666.974)"}
        </p>
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
          />
          <button type="submit">
            Search
          </button>
        </div>
      </form>

      {results.length > 0 ? (
        <div>
          <p>
            {isLatLongSearch
              ? "Showing 5 closest results for the given lat/long coordinates"
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
                {results.map((result, index) => (
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
