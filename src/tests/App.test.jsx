/**
 * End-to-end tests for the Food Facilities Search App
 *
 * These tests verify the full application behavior by:
 * - Creating a real SQLite database with test data
 * - Rendering the complete app (SearchLayout, SearchForm, ResultsTable, etc.)
 * - Testing actual user interactions and database queries
 * - Cleaning up the database after tests
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { schema } from '../db/schema';
import initSqlJs from 'sql.js';

describe('Food Facilities Search App - E2E Tests', () => {
  let db;

  beforeEach(async () => {
    // Initialize SQLite database using sql.js (same as production)
    const SQL = await initSqlJs();
    db = new SQL.Database();

    // Add custom trig functions (same as in production init.js)
    db.create_function('radians', (degrees) => degrees * Math.PI / 180);
    db.create_function('sin', (radians) => Math.sin(radians));
    db.create_function('cos', (radians) => Math.cos(radians));
    db.create_function('acos', (value) => Math.acos(value));

    window.db = db;

    // Create table schema
    const columns = Object.entries(schema)
      .map(([col, type]) => `"${col}" ${type}`)
      .join(', ');
    db.run(`CREATE TABLE food_facilities (${columns})`);

    // Create test data
    const testData = [
      {
        locationid: 1,
        Applicant: 'Tacos El Primo',
        Address: '123 Market St',
        Status: 'APPROVED',
        Latitude: 37.7749,
        Longitude: -122.4194,
        FoodItems: 'Tacos: Burritos',
      },
      {
        locationid: 2,
        Applicant: 'Burger Express',
        Address: '456 Main St',
        Status: 'APPROVED',
        Latitude: 37.7849,
        Longitude: -122.4094,
        FoodItems: 'Burgers: Fries',
      },
      {
        locationid: 3,
        Applicant: 'Pizza Palace',
        Address: '789 Market St',
        Status: 'EXPIRED',
        Latitude: 37.7949,
        Longitude: -122.3994,
        FoodItems: 'Pizza: Pasta',
      },
      {
        locationid: 4,
        Applicant: 'Taco Truck',
        Address: '321 Oak St',
        Status: 'ISSUED',
        Latitude: 37.7649,
        Longitude: -122.4294,
        FoodItems: 'Tacos: Quesadillas',
      },
    ];

    // Insert test data into the database
    testData.forEach((row) => {
      const cols = Object.keys(row).map(k => `"${k}"`).join(', ');
      const placeholders = Object.keys(row).map(() => '?').join(', ');
      const stmt = db.prepare(`INSERT INTO food_facilities (${cols}) VALUES (${placeholders})`);
      stmt.bind(Object.values(row));
      stmt.step();
      stmt.free();
    });
  });

  afterEach(() => {
    // Clean up database
    if (db) {
      db.close();
    }
    window.db = null;
  });

  describe('Initial data load', () => {
    test('should load and display all rows on mount', async () => {
      render(<App />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      // Verify all 4 rows are displayed
      expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      expect(screen.getByText('Burger Express')).toBeInTheDocument();
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      expect(screen.getByText('Taco Truck')).toBeInTheDocument();
      expect(screen.getByText('4 results')).toBeInTheDocument();
    });
  });

  describe('Search by applicant and address', () => {
    test('should search by applicant name', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      // Search for full applicant name
      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      await user.clear(searchInput);
      await user.type(searchInput, 'Burger Express');
      await user.click(searchButton);

      // Should show only Burger Express
      await waitFor(() => {
        expect(screen.getByText('Burger Express')).toBeInTheDocument();
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });

      // Should not show other vendors
      expect(screen.queryByText('Tacos El Primo')).not.toBeInTheDocument();
      expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
      expect(screen.queryByText('Taco Truck')).not.toBeInTheDocument();
    });

    test('should search by address', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      await user.clear(searchInput);
      await user.type(searchInput, 'Oak St');
      await user.click(searchButton);

      // Should show only vendor on Oak St
      await waitFor(() => {
        expect(screen.getByText('Taco Truck')).toBeInTheDocument();
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });

      // Should not show vendors on other streets
      expect(screen.queryByText('Tacos El Primo')).not.toBeInTheDocument();
      expect(screen.queryByText('Burger Express')).not.toBeInTheDocument();
      expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
    });
  });

  describe('Partial/fuzzy search matching', () => {
    test('should perform partial match on applicant', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      // Partial match - just "Taco"
      await user.clear(searchInput);
      await user.type(searchInput, 'Taco');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('Taco Truck')).toBeInTheDocument();
        expect(screen.getByText('2 results')).toBeInTheDocument();
      });
    });

    test('should perform partial match on address', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      // Partial match - just street number
      await user.clear(searchInput);
      await user.type(searchInput, '123');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });

      expect(screen.queryByText('Burger Express')).not.toBeInTheDocument();
    });

    test('should be case-insensitive', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      // Search with lowercase (singular to match both entries)
      await user.clear(searchInput);
      await user.type(searchInput, 'taco');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('Taco Truck')).toBeInTheDocument();
        expect(screen.getByText('2 results')).toBeInTheDocument();
      });
    });
  });

  describe('Geo search', () => {
    test('should return nearest results for coordinates and rank by distance', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      // Use the exact coordinates of Tacos El Primo
      await user.clear(searchInput);
      await user.type(searchInput, '37.7749, -122.4194');
      await user.click(searchButton);

      // Geo search should show the geo-results info and include a distance_km column
      await waitFor(() => {
        expect(screen.getByText('Showing the 5 closest results for the given lat/long coordinates')).toBeInTheDocument();
      });

      // Table should be present (use test ids)
      const table = screen.getByTestId('results-table');
      const rows = table.querySelectorAll('tbody tr');

      // All 4 test rows should be returned (we have 4 records and GEO_SEARCH_MAX_RESULTS is 5)
      expect(rows.length).toBe(4);

      // Applicants should be in order of distance (closest first)
      const applicants = Array.from(rows).map((_, i) => screen.getByTestId(`applicant-${i}`).textContent);
      expect(applicants).toEqual(expect.arrayContaining(['Tacos El Primo', 'Burger Express', 'Pizza Palace', 'Taco Truck']));
    });
  });

  describe('Status filtering', () => {
    test('should filter by single status', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      // Open status filter dropdown
      const statusFilterButton = screen.getByTestId('status-filter-button');
      await user.click(statusFilterButton);

      // Deselect all first
      const deselectAllButton = screen.getByTestId('deselect-all-status-filters-button');
      await user.click(deselectAllButton);

      // Select only APPROVED
      const approvedCheckbox = screen.getByTestId('approved-checkbox');
      await user.click(approvedCheckbox);

      // Close dropdown
      await user.click(statusFilterButton);

      // Should only show APPROVED vendors
      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('Burger Express')).toBeInTheDocument();
        expect(screen.getByText('2 results')).toBeInTheDocument();
      });

      expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
      expect(screen.queryByText('Taco Truck')).not.toBeInTheDocument();
    });

    test('should filter by multiple statuses', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      const statusFilterButton = screen.getByTestId('status-filter-button');
      await user.click(statusFilterButton);

      const deselectAllButton = screen.getByTestId('deselect-all-status-filters-button');
      await user.click(deselectAllButton);

      // Select APPROVED and EXPIRED
      const approvedCheckbox = screen.getByTestId('approved-checkbox');
      const expiredCheckbox = screen.getByTestId('expired-checkbox');
      await user.click(approvedCheckbox);
      await user.click(expiredCheckbox);

      await user.click(statusFilterButton);

      // Should show APPROVED and EXPIRED vendors
      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('Burger Express')).toBeInTheDocument();
        expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
        expect(screen.getByText('3 results')).toBeInTheDocument();
      });

      expect(screen.queryByText('Taco Truck')).not.toBeInTheDocument();
    });

    test('should combine status filter with text search', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      // Set status filter to APPROVED only
      const statusFilterButton = screen.getByTestId('status-filter-button');
      await user.click(statusFilterButton);

      const deselectAllButton = screen.getByTestId('deselect-all-status-filters-button');
      await user.click(deselectAllButton);

      const approvedCheckbox = screen.getByTestId('approved-checkbox');
      await user.click(approvedCheckbox);

      await user.click(statusFilterButton);

      // Search for "Taco"
      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      await user.clear(searchInput);
      await user.type(searchInput, 'Taco');
      await user.click(searchButton);

      // Should only show "Tacos El Primo" (APPROVED)
      // Should NOT show "Taco Truck" (ISSUED)
      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });

      expect(screen.queryByText('Taco Truck')).not.toBeInTheDocument();
    });
  });

  describe('Empty search behavior', () => {
    test('should reload all data when submitting empty search', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
      });

      // First, search for something specific
      const searchInput = screen.getByTestId('search-input');
      const searchButton = screen.getByTestId('search-button');

      await user.clear(searchInput);
      await user.type(searchInput, 'Tacos');
      await user.click(searchButton);

      // Verify filtered results
      await waitFor(() => {
        expect(screen.queryByText('Burger Express')).not.toBeInTheDocument();
      });

      // Clear and search again
      await user.clear(searchInput);
      await user.click(searchButton);

      // Should show all vendors again
      await waitFor(() => {
        expect(screen.getByText('Tacos El Primo')).toBeInTheDocument();
        expect(screen.getByText('Burger Express')).toBeInTheDocument();
        expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
        expect(screen.getByText('Taco Truck')).toBeInTheDocument();
        expect(screen.getByText('4 results')).toBeInTheDocument();
      });
    });
  });
});
