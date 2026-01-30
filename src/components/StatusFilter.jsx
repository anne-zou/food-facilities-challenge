import { useSearch } from '../contexts/SearchContext';
import { STATUS_VALUES } from '../db/schema';
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
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
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

function StatusFilter() {
  const {
    selectedStatuses,
    showStatusDropdown,
    setShowStatusDropdown,
    handleStatusToggle,
    handleSelectAllStatuses,
    handleDeselectAllStatuses
  } = useSearch();

  return (
    <div {...stylex.props(styles.container)}>
      <button
        type="button"
        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
        {...stylex.props(styles.button)}
        className="btn btn-outline-secondary"
      >
        Filter by Status ({selectedStatuses.length}/{STATUS_VALUES.length})
      </button>
      {showStatusDropdown && (
        <div {...stylex.props(styles.dropdown)}>
          <div {...stylex.props(styles.buttonGroup)}>
            <button
              type="button"
              onClick={handleSelectAllStatuses}
              className="btn btn-sm btn-outline-primary"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAllStatuses}
              className="btn btn-sm btn-outline-secondary"
            >
              Deselect All
            </button>
          </div>
          {STATUS_VALUES.map(status => (
            <div key={status} {...stylex.props(styles.checkboxItem)}>
              <label {...stylex.props(styles.label)} className="form-check-label">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="form-check-input"
                />
                {status}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusFilter;
