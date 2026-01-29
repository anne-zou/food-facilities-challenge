import { useSearch } from '../contexts/SearchContext';

function ResultsTable() {
  const { currentPageResults, isLatLongSearch, results } = useSearch();

  if (currentPageResults.length === 0) {
    return (
      <div>
        <p>No results found</p>
      </div>
    );
  }

  return (
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
              {Object.keys(currentPageResults[0]).map((column) => (
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
    </div>
  );
}

export default ResultsTable;
