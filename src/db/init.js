import Papa from 'papaparse';
import { schema } from './schema';

// Helper function to parse CSV text using PapaParse
async function parseCSV(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject
    });
  });
}

// Initialize the SQLite database, create table, and load data from CSV
export async function initDatabase() {

  const sqlite3 = await window.sqlite3InitModule({
    // Disable console.log output (enable to see SQL TRACE logs for debugging)
    print: () => {}
  });
  const db = new sqlite3.oo1.DB("/food-facilities-challenge.sqlite3", "ct");

  // Create custom SQL functions for trigonometry to calculate Haversine distance
  // SQLite doesn't have built-in trig functions, so we implement them in JavaScript
  db.createFunction({
    name: 'radians',
    xFunc: (degrees) => degrees * Math.PI / 180
  });

  db.createFunction({
    name: 'sin',
    xFunc: (radians) => Math.sin(radians)
  });

  db.createFunction({
    name: 'cos',
    xFunc: (radians) => Math.cos(radians)
  });

  db.createFunction({
    name: 'acos',
    xFunc: (value) => Math.acos(value)
  });

  // Load and parse CSV
  const response = await fetch('/Mobile_Food_Facility_Permit.csv');
  const csvText = await response.text();
  const parsedCSV = await parseCSV(csvText);

  // Get column names from schema config
  const columnNames = Object.keys(schema);

  // SQL statement to create the table:
  /* 
   * `CREATE TABLE IF NOT EXISTS food_facilities (
   *    column_name_1 TYPE_1,
   *    column_name_2 TYPE_2,
   *    ...
   * )`
   */
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS food_facilities (
      ${columnNames.map(col => `"${col}" ${schema[col]}`).join(',\n      ')}
    )
  `;
  db.exec(createTableSQL);

  // SQL statement to insert data into the table:
  /* 
   * `INSERT OR IGNORE INTO food_facilities VALUES (?, ?, ..., ?)`
   */
  const placeholders = columnNames.map(() => '?').join(', ');
  const insertSQL = db.prepare(`INSERT OR IGNORE INTO food_facilities VALUES (${placeholders})`);
  
  // Insert each row from the parsed CSV into the table:
  parsedCSV.data.forEach(row => {
    // Extract the value for each column from the row object
    // Row object: {locationid: '1571753', Applicant: 'The Geez Freeze', ...}  
    // Row values: ['1571753', 'The Geez Freeze', ...]
    const rowValues = columnNames.map(col => row[col]);
    // Bind values to placeholders, preventing SQL injection
    insertSQL.bind(rowValues || null);
    // Execute the insert statement for this row
    insertSQL.step();
    // Reset the statement for the next row
    insertSQL.reset();
  });
  insertSQL.finalize();
  console.log(`Loaded ${parsedCSV.data.length} records into database`);

  window.db = db;
  return db;
}
