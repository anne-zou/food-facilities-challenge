// Possible Status values in the dataset
export const STATUS_VALUES = [
  'APPROVED',
  'EXPIRED',
  'ISSUED',
  'REQUESTED',
  'SUSPEND'
];

// Schema definition for food_facilities table
// Maps CSV column names to their SQLite data types
export const schema = {
  'locationid': 'INTEGER PRIMARY KEY',
  'Applicant': 'TEXT',
  'FacilityType': 'TEXT',
  'cnn': 'INTEGER',
  'LocationDescription': 'TEXT',
  'Address': 'TEXT',
  'blocklot': 'TEXT',
  'block': 'TEXT',
  'lot': 'TEXT',
  'permit': 'TEXT',
  'Status': 'TEXT',
  'FoodItems': 'TEXT',
  'X': 'REAL',
  'Y': 'REAL',
  'Latitude': 'REAL',
  'Longitude': 'REAL',
  'Schedule': 'TEXT',
  'dayshours': 'TEXT',
  'NOISent': 'TEXT',
  'Approved': 'TEXT',
  'Received': 'TEXT',
  'PriorPermit': 'INTEGER',
  'ExpirationDate': 'TEXT',
  'Location': 'TEXT',
  'Fire Prevention Districts': 'TEXT',
  'Police Districts': 'TEXT',
  'Supervisor Districts': 'TEXT',
  'Zip Codes': 'TEXT',
  'Neighborhoods (old)': 'TEXT'
};
