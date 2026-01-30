import { useSearch } from '../contexts/SearchContext';
import Pagination from './Pagination';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6c757d',
    fontSize: '0.9rem',
  },
  resultsInfo: {
    color: '#495057',
    fontSize: '0.875rem',
    fontWeight: '500',
    margin: 0,
  },
  resultsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '0.375rem',
    border: '1px solid #dee2e6',
  }
});

function ResultsTable() {
  const { currentPageResults, isLatLongSearch, results } = useSearch();

  if (currentPageResults.length === 0) {
    return (
      <div {...stylex.props(styles.noResults)}>
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.resultsRow)}>
        <p {...stylex.props(styles.resultsInfo)}>
          {isLatLongSearch
            ? "Showing the 5 closest results for the given lat/long coordinates"
            : `${results.length} result${results.length !== 1 ? 's' : ''}`
          }
        </p>
        <Pagination />
      </div>
      <div {...stylex.props(styles.tableWrapper)}>
        <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
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
