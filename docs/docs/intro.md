---
sidebar_position: 1
---

# Overview

**Food Facilities Search** is a React-based web app for **searching mobile food facility permits** on file with the San Francisco Department of Public Works.

## Key Features

**Text Search**: Search by `Applicant` (business name) or `Address` (street address); partial matching is supported

**Geolocation Search**: Find the nearest facilities to the given coordinates
```
Format: latitude, longitude
Example: 6004575.869, 2105666.974
```

**Status Filtering**: Filter by APPROVED, REQUESTED, EXPIRED, etc.

**Pagination**: 25 items/page (geolocation searches show 5 items maximum)

## Tech Stack

- **Frontend:** React 19 + Vite
- **Database:** SQL.js (in-browser SQLite)
- **Styles:** Bootstrap + StyleX

## Component Architecture

- **SearchLayout**: Page layout
- **SearchForm**: User input, search submission
  - SearchFieldsFilter, StatusFilter
- **ResultsTable**: Paginated results
- **Pagination**: Navigation buttons for paginated results
- **SearchContext**: Centralized state via React Context API

## Database Schema
Database schema is defined in `src/db/schema.js`:
```sql
food_facilities (
  Applicant TEXT,
  Address TEXT,
  Status TEXT,
  Latitude REAL,
  Longitude REAL,
  ...
)
```
