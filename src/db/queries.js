import squel from 'squel';
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
 * @param {Array<string>} selectedStatuses - Array of selected status values
 * @returns {Object} Object containing SQL query and bindings array
 */
export function buildLoadAllQuery(selectedStatuses) {
  let query = squel.select().from('food_facilities');
  query = applyStatusFilters(selectedStatuses, query);
  const { text, values } = query.toParam();
  return { sql: text, bindings: values };
}

/**
 * Builds a SQL query for coordinate-based search using Haversine formula
 * Uses SQL math functions for the calculation
 * @param {number} searchLat - Search latitude
 * @param {number} searchLon - Search longitude
 * @param {Array<string>} selectedStatuses - Array of selected status values
 * @returns {Object} Object containing SQL query and bindings array {sql, bindings}
 */
export function buildGeoSearchQuery(searchLat, searchLon, selectedStatuses) {
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
 * @param {string} searchQuery - The search text
 * @param {boolean} searchByApplicant - Whether to search in Applicant field
 * @param {boolean} searchByAddress - Whether to search in Address field
 * @param {Array<string>} selectedStatuses - Array of selected status values
 * @returns {Object} Object containing SQL query and bindings array, or null if no fields selected
 */
export function buildTextSearchQuery(searchQuery, searchByApplicant, searchByAddress, selectedStatuses) {
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
 * @param {Array<string>} selectedStatuses - Array of selected status values
 * @param {Object} query - Squel query object to modify
 * @returns {Object} Modified squel query object
 */
function applyStatusFilters(selectedStatuses, query) {
  // Apply status filters only if some but not all statuses are selected
  if (selectedStatuses.length > 0 && selectedStatuses.length < STATUS_VALUES.length) {
    query = query.where(`"${STATUS_COLUMN}" IN ?`, selectedStatuses);
  }
  return query;
}