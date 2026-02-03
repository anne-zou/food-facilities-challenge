import { useSearch } from '../contexts/SearchContext';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    position: 'relative',
    flexShrink: 0,
  },
  button: {
    whiteSpace: 'nowrap',
  },
  dropdown: {
    border: '1px solid #dee2e6',
    borderRadius: '0.375rem',
    padding: '1rem',
    marginTop: '0.5rem',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1000,
    minWidth: '250px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  checkboxItem: {
    marginBottom: '0.5rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  }
});

function SearchFieldsFilter() {
  const {
    searchByApplicant,
    setSearchByApplicant,
    searchByAddress,
    setSearchByAddress,
    showFieldsDropdown,
    setShowFieldsDropdown
  } = useSearch();

  const getSelectedCount = (): number => {
    let count = 0;
    if (searchByApplicant) count++;
    if (searchByAddress) count++;
    return count;
  };

  return (
    <div {...stylex.props(styles.container)}>
      <button
        data-testid="search-fields-filter-button"
        type="button"
        onClick={() => setShowFieldsDropdown(!showFieldsDropdown)}
        {...stylex.props(styles.button)}
        className="btn btn-outline-secondary"
      >
        Search Fields ({getSelectedCount()}/2)
      </button>
      {showFieldsDropdown && (
        <div {...stylex.props(styles.dropdown)}>
          <div {...stylex.props(styles.checkboxItem)}>
            <label {...stylex.props(styles.label)} className="form-check-label">
              <input
                data-testid="search-by-applicant-checkbox"
                type="checkbox"
                checked={searchByApplicant}
                onChange={(e) => setSearchByApplicant(e.target.checked)}
                className="form-check-input"
              />
              Search by Applicant
            </label>
          </div>
          <div {...stylex.props(styles.checkboxItem)}>
            <label {...stylex.props(styles.label)} className="form-check-label">
              <input
                data-testid="search-by-address-checkbox"
                type="checkbox"
                checked={searchByAddress}
                onChange={(e) => setSearchByAddress(e.target.checked)}
                className="form-check-input"
              />
              Search by Address
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFieldsFilter;
