import squel from 'squel';
import type { Select } from 'squel';
import type { QueryResult, FacilityStatus } from '../types';
import {
  STATUS_VALUES,
  APPLICANT_COLUMN,
  ADDRESS_COLUMN,
  STATUS_COLUMN,
  LATITUDE_COLUMN,
  LONGITUDE_COLUMN
} from './schema';

// Maximum number of nearest results to return for geo searches
export const GEO_SEARCH_MAX_RESULTS = 5;

/**
 * Builds a SQL query to load all rows with optional status filtering
 */
export function buildLoadAllQuery(selectedStatuses: FacilityStatus[]): QueryResult {
  let query = squel.select().from('food_facilities');
  query = applyStatusFilters(selectedStatuses, query);
  const { text, values } = query.toParam();
  return { sql: text, bindings: values };
}

/**
 * Builds a SQL query for coordinate-based search using Haversine formula
 * Uses SQL math functions for the calculation
 */
export function buildGeoSearchQuery(
  searchLat: number,
  searchLon: number,
  selectedStatuses: FacilityStatus[]
): QueryResult {
  const earthRadiusKm = 6371;

  // Haversine formula using SQL math functions
  // Formula: R * acos(cos(lat1) * cos(lat2) * cos(lon2 - lon1) + sin(lat1) * sin(lat2))
  // where angles are in radians and R is Earth's radius
  const distanceFormula = `(${earthRadiusKm} * acos(
    cos(radians(?)) * cos(radians(CAST("${LATITUDE_COLUMN}" AS REAL))) *
    cos(radians(CAST("${LONGITUDE_COLUMN}" AS REAL) - ?)) +
    sin(radians(?)) * sin(radians(CAST("${LATITUDE_COLUMN}" AS REAL)))
  ))`;

  let query = squel.select()
    .from('food_facilities')
    .field('*')
    .field(distanceFormula, 'distance_km')
    .where(`"${LATITUDE_COLUMN}" IS NOT NULL`)
    .where(`"${LONGITUDE_COLUMN}" IS NOT NULL`)
    .order('distance_km')
    .limit(GEO_SEARCH_MAX_RESULTS);

  query = applyStatusFilters(selectedStatuses, query);

  const { text, values } = query.toParam();

  // Manually prepend the haversine formula parameters
  // The formula uses searchLat, searchLon, searchLat in that order
  const haversineParams = [searchLat, searchLon, searchLat];
  const bindings = [...haversineParams, ...values];

  return { sql: text, bindings };
}

/**
 * Builds a SQL query for text-based search
 */
export function buildTextSearchQuery(
  searchQuery: string,
  searchByApplicant: boolean,
  searchByAddress: boolean,
  selectedStatuses: FacilityStatus[]
): QueryResult | null {
  if (!searchByApplicant && !searchByAddress) {
    return null; // No text fields selected for search
  }
  let query = squel.select().from('food_facilities');

  // Build OR condition for text search
  const orCondition = squel.expr();
  if (searchByApplicant) {
    orCondition.or(`"${APPLICANT_COLUMN}" LIKE ?`, `%${searchQuery}%`);
  }
  if (searchByAddress) {
    orCondition.or(`"${ADDRESS_COLUMN}" LIKE ?`, `%${searchQuery}%`);
  }

  query = query.where(orCondition);
  query = applyStatusFilters(selectedStatuses, query);

  const { text, values } = query.toParam();
  return { sql: text, bindings: values };
}

/**
 * Helper function to apply status filters to the SQL query if needed
 */
function applyStatusFilters(selectedStatuses: FacilityStatus[], query: Select): Select {
  // Apply status filters only if some but not all statuses are selected
  if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
    query = query.where(`"${STATUS_COLUMN}" IN ?`, selectedStatuses);
  }
  return query;
}
