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


  return (
    <div>
      <h1>San Francisco Food Facilities</h1>
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
