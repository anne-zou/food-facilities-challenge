import { useSearch } from '../contexts/SearchContext';
import { STATUS_VALUES } from '../schema';

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
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
        Filter by Status ({selectedStatuses.length}/{STATUS_VALUES.length})
      </button>
      {showStatusDropdown && (
        <div style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginTop: '5px',
          backgroundColor: 'white',
          position: 'absolute',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <button type="button" onClick={handleSelectAllStatuses} style={{ marginRight: '5px' }}>
              Select All
            </button>
            <button type="button" onClick={handleDeselectAllStatuses}>
              Deselect All
            </button>
          </div>
          {STATUS_VALUES.map(status => (
            <div key={status} style={{ marginBottom: '5px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                />
                {' '}{status}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusFilter;
