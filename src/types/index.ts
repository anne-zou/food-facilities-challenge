import { STATUS_VALUES, schema } from '../db/schema';

// Status values derived from schema
export type FacilityStatus = typeof STATUS_VALUES[number];

// Helper type to map SQL types to TypeScript types
type SQLTypeToTS<T extends string> =
  T extends 'TEXT' ? string :
  T extends 'INTEGER' | 'INTEGER PRIMARY KEY' ? number :
  T extends 'REAL' ? number :
  string; // fallback

// Base facility record derived from schema
type BaseFacilityRecord = {
  [K in keyof typeof schema]: SQLTypeToTS<typeof schema[K]>
};

// Facility record from database - derived from schema with Status type override
export type FacilityRecord = Omit<BaseFacilityRecord, 'Status'> & {
  Status: FacilityStatus;
};

// Geo search result includes distance
export type GeoSearchResult = FacilityRecord & {
  distance_km: number;
};

// Result can be either type
export type SearchResultRecord = FacilityRecord | GeoSearchResult;

// Query result from squel query builders
export interface QueryResult {
  sql: string;
  bindings: any[];
}

// Schema definition type
export type SchemaDefinition = Record<string, string>;
