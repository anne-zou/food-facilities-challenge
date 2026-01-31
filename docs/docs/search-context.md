---
sidebar_position: 3
---

# State Management

Application state is managed through the `SearchContext`, which uses React Context API to centralize search queries, results, filtering, and pagination.

## Usage

**Context is provided in `SearchLayout`:**

```jsx
import { SearchProvider } from './contexts/SearchContext';
...
function SearchLayout() {
  return (
    <SearchProvider>
      ...{children}
    </SearchProvider>
  );
}
```

**Access context in components using useSearch:**

```jsx
import { useSearch } from './contexts/SearchContext';

const { searchQuery, results, handleSubmit } = useSearch();
```

## State

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `searchQuery` | `string` | `''` | Search input |
| `results` | `array` | `[]` | Search results |

| `currentPage` | `number` | `1` | Current page |
| `itemsPerPage` | `number` | `25` | Items per page |
| `totalPages` | `number` | computed | Total pages |
| `currentPageResults` | `array` | computed | Current page items |

| `showStatusDropdown` | `boolean` | `false` | Status dropdown visible |
| `showFieldsDropdown` | `boolean` | `false` | Fields dropdown visible |

| `selectedStatuses` | `array` | all | Selected statuses |
| `searchByApplicant` | `boolean` | `true` | Search Applicant field |
| `searchByAddress` | `boolean` | `true` | Search Address field |

| `isLatLongSearch` | `boolean` | `false` | Current results search type |

## Handlers

**`handleSubmit(e)`**: Submits search query based on input:
 - empty = load all
 - lat/long coordinates = proximity search returning 5 nearest items
 - text = field text search with partial matching

**`handleStatusToggle(status)`**: Toggle status filters

**`handleSelectAllStatuses()`**: Select all status filters

**`handleDeselectAllStatuses()`**: Deselect all status filters

## Auto-refresh

SearchContext auto-refreshes the search when `selectedStatuses`, `searchByApplicant`, or `searchByAddress` changes.

## Pagination

Show a maximum of 25 results per page:
```js
totalPages = Math.ceil(results.length / 25)
currentPageResults = isLatLongSearch ? results : results.slice(start, end)
```

Geolocation searches show a maximum of 5 results (no pagination).
