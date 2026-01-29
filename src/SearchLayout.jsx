import { useState, useEffect } from 'react';

function SearchLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  // Load all rows on component mount
  useEffect(() => {
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
    console.log(`Loaded ${allResults.length} rows`);
  }, []);

  // Handle search input submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      console.log('Submitted empty search input');
      return;
    }

    if (!window.db) {
      console.log('Database not ready');
      return;
    }

    // Query the database for matches in Applicant or Address columns
    const sql = `
      SELECT * FROM food_facilities
      WHERE "Applicant" LIKE ? OR "Address" LIKE ?
      LIMIT 50
    `;
    const stmt = window.db.prepare(sql);
    
    // Bind search patterns to search both columns
    const searchPattern = `%${searchQuery}%`;
    stmt.bind([searchPattern, searchPattern]);

    const searchResults = [];
    while (stmt.step()) {
      searchResults.push(stmt.get({}));
    }
    stmt.finalize();

    setResults(searchResults);
    console.log(`Found ${searchResults.length} results:`, searchResults);
  };

  return (
    <div>
      <h1>San Francisco Food Facilities</h1>

      <form onSubmit={handleSubmit}>
        <p>
          {"Search food facilities by name, street, address, or nearby lat/long coordinates (e.g. 6004575.869, 2105666.974)"}
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
            {results.length} result{results.length !== 1 ? 's' : ''}
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
