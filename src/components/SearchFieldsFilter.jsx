import { useSearch } from '../contexts/SearchContext';

function SearchFieldsFilter() {
  const {
    searchByApplicant,
    setSearchByApplicant,
    searchByAddress,
    setSearchByAddress,
    showFieldsDropdown,
    setShowFieldsDropdown
  } = useSearch();

  const getSelectedCount = () => {
    let count = 0;
    if (searchByApplicant) count++;
    if (searchByAddress) count++;
    return count;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setShowFieldsDropdown(!showFieldsDropdown)}>
        Search Fields ({getSelectedCount()}/2)
      </button>
      {showFieldsDropdown && (
        <div style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginTop: '5px',
          backgroundColor: 'white',
          position: 'absolute',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <div style={{ marginBottom: '5px' }}>
            <label>
              <input
                type="checkbox"
                checked={searchByApplicant}
                onChange={(e) => setSearchByApplicant(e.target.checked)}
              />
              {' '}Search by Applicant
            </label>
          </div>
          <div style={{ marginBottom: '5px' }}>
            <label>
              <input
                type="checkbox"
                checked={searchByAddress}
                onChange={(e) => setSearchByAddress(e.target.checked)}
              />
              {' '}Search by Address
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFieldsFilter;
