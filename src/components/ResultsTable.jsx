import { useSearch } from '../contexts/SearchContext';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
    minHeight: 0,
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
    marginBottom: '0.5rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    overflowY: 'auto',
    borderRadius: '0.375rem',
    border: '1px solid #dee2e6',
    maxHeight: 'calc(100vh - 300px)',
    flex: 1,
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
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
      <p {...stylex.props(styles.resultsInfo)}>
        {isLatLongSearch
          ? "Showing the 5 closest results for the given lat/long coordinates"
          : `${results.length} result${results.length !== 1 ? 's' : ''}`
        }
      </p>
      <div {...stylex.props(styles.tableWrapper)}>
        <table data-testid="results-table" className="table table-striped table-hover mb-0">
          <thead className="table-light" {...stylex.props(styles.stickyHeader)}>
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
              <tr key={index} data-testid={`result-row-${index}`}>
                {Object.keys(result).map((column) => (
                  <td
                    key={column}
                    data-testid={column === 'Applicant' ? `applicant-${index}` : undefined}
                  >
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
