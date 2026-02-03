import { SearchProvider } from '../contexts/SearchContext';
import SearchForm from './SearchForm';
import ResultsTable from './ResultsTable';
import Pagination from './Pagination';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    maxWidth: '100%',
    width: '100%',
    height: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
    minHeight: 0,
  },
  bottomPagination: {
    paddingTop: '1rem',
  }
});

function SearchLayout() {
  return (
    <SearchProvider>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.header)}>
          <h1 {...stylex.props(styles.title)}>San Francisco Mobile Food Facility Permit Search</h1>
        </div>
        <div {...stylex.props(styles.card)}>
          <SearchForm />
          <ResultsTable />
        </div>
        <div {...stylex.props(styles.bottomPagination)}>
          <Pagination />
        </div>
      </div>
    </SearchProvider>
  );
}

export default SearchLayout;
