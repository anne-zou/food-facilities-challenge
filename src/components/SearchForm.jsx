import { useSearch } from '../contexts/SearchContext';
import StatusFilter from './StatusFilter';
import SearchFieldsFilter from './SearchFieldsFilter';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  description: {
    marginBottom: 0,
    fontSize: '0.875rem',
    color: 'rgb(44, 62, 80)',
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: '100%',
  },
  inputWrapper: {
    flex: '1 1 auto',
    minWidth: '0',
  },
  searchButton: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }
});

function SearchForm() {
  const { searchQuery, setSearchQuery, handleSubmit } = useSearch();

  return (
    <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
      <p {...stylex.props(styles.description)}>
        {"Search food facilities by name (Applicant), street, or lat/long coordinates (e.g. 6004575.869, 2105666.974)"}
      </p>
      <div {...stylex.props(styles.searchRow)}>
        <div {...stylex.props(styles.inputWrapper)}>
          <input
            data-testid="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
            className="form-control"
          />
        </div>
        <SearchFieldsFilter />
        <StatusFilter />
        <button data-testid="search-button" type="submit" {...stylex.props(styles.searchButton)} className="btn btn-primary">
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
