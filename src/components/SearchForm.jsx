import { useSearch } from '../contexts/SearchContext';
import StatusFilter from './StatusFilter';
import SearchFieldsFilter from './SearchFieldsFilter';

function SearchForm() {
  const { searchQuery, setSearchQuery, handleSubmit } = useSearch();

  return (
    <form onSubmit={handleSubmit}>
      <p>
        {"Search food facilities by name, street, address, or lat/long coordinates (e.g. 6004575.869, 2105666.974)"}
      </p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search query..."
          style={{ flex: 1 }}
        />
        <SearchFieldsFilter />
        <StatusFilter />
        <button type="submit">
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
