import { SearchProvider } from './contexts/SearchContext';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import Pagination from './components/Pagination';

function SearchLayout() {
  return (
    <SearchProvider>
      <div>
        <h1>San Francisco Food Facilities</h1>
        <SearchForm />
        <ResultsTable />
        <Pagination />
      </div>
    </SearchProvider>
  );
}

export default SearchLayout;
