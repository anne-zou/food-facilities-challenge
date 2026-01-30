# Food Facilities Search 

A React web app for searching **mobile food facility permits** on file with the **San Francisco Department of Public Works**, built as a solution for the Food Facilities Challenge (Frontend Focused Version).

The goal of this project is to provide a simple, fast **frontend-only search experience** over a small, public dataset, without introducing unnecessary backend complexity.

## Problem Statement

Users need to search and review a dataset of mobile food facility permits in San Francisco.

Dataset characteristics:
- Public
- Small (< 1 KB)
- Updated weekly
- Read-only

### Core Requirements

- Build a UI using a modern frontend framework
- Search by **Applicant** (business name)
- Search by **Address** (partial street name match)

### Optional / Bonus Features
- Filter by **Status** (APPROVED, REQUESTED, etc.)
- Geolocation-based search (nearest facilities)
- Automated tests
- API documentation tooling


## Solution Overview

This project implements a **pure frontend React application** that:

- Bundles the provided CSV dataset with the code
- Loads the data into an **in-memory SQLite database** (SQL.js)
- Executes all search, filtering, and ranking logic locally
- Displays results in a paginated table

There is **no backend service** and **no external database**. Given the size and nature of the dataset, this keeps the system simple, easy to set up, and easy to understand.

### Tech Stack

- **Frontend:** React 19 + Vite
- **Database:** SQL.js (SQLite in the browser)
- **State Management:** React Context API
- **Styling:** Bootstrap + StyleX

### Features

- **Text Search**
  - Search by `Applicant` and/or `Address`
  - Partial matching supported

- **Status Filtering**
  - Filter by permit status
  - Multi-select with select-all / deselect-all

- **Geolocation Search**
  - Input format: `latitude, longitude`
  - Returns the **5 nearest facilities** using a Haversine calculation

- **Pagination**
  - 25 results per page for text searches
  - Geolocation searches return a maximum of 5 results

- **Auto-refresh**
  - Searches re-run automatically when filters or selected fields change

## Architecture & Design Decisions

### Frontend-only architecture

The dataset is small, public, and read-only, so we do not need to worry about client-side storage limitations, data security, or persistent writes for the purposes of this challenge. We will use a frontend-only architecture to avoid the unnecessary complexity of adding a backend and external database.

### In-browser SQLite (SQL.js)

We will use SQLite since it allows us to leverage built-in text search (`LIKE`) in the browser and keep our search queries declarative and centralized.

### Context API

We will use the React Context API to make search state and update handlers accessible across the component tree without prop drilling.

### Bootstrap + StyleX

We use Bootstrap to leverage its built-in responsive design and pre-styled component library. We also use StyleX to apply component-specific CSS-in-JS atomically while ensuring predictable performance and preventing naming collisions.

### UI design

We will optimize the UI for an **administrative review use case** (e.g. permit review), not for consumer discovery:
- Results are displayed in a table
- All dataset columns are visible
- Filters are explicit and controllable
- Pagination keeps large result sets readable

### Documentation

We will use Docusaurus as own API Documentation tool to leverage its built-in support for Markdown with React-based architecture, which is conveniently consistent with our app.

## Critiques

### What would you have done differently with more time?

- Fetch data directly from the SF Data API instead of bundling a local CSV to avoid serving stale data
- Cache the dataset locally to reduce load time (the dataset is updated weekly)
- Add basic search autocomplete for Applicant and Address fields


### What are the trade-offs you might have made?

**Frontend-only search vs backend search**

Frontend:
- \- Only viable if the dataset remains small and infrequently updated
- \- Search logic is tightly coupled to the UI
- \+ Simple, centralized codebase with minimal setup and maintenance

Backend:
- \+ Can support large or frequently changing datasets
- \+ Search logic can be reused by other clients (e.g. CLI, other UIs)
- \- Requires additional infrastructure and ongoing maintenance

Given the size and usage of the dataset, the frontend-only approach was chosen intentionally.

### What are the things you left out?

- Search autocomplete (lower priority)
- Map-based visualization of results (e.g. Google Maps)
- User accounts and authentication
- Displaying user search history 

These features were excluded due to lack of clear product requirements and to keep the scope focused.

### Scaling considerations and limitations

The current implementation assumes a small, public, read-only dataset and a limited number of users. If we needed to scale to a larger number of users:

- Introduce user authentication and authorization (e.g. restrict access to SFDPW staff)
- Rate limit search requests to prevent abuse
- Move search logic to a backend service backed by an external database such as Postgres or MySQL larger, more frequently updated, or privacy-sensitive datasets
- Add scheduled jobs to keep data in sync with source APIs
- Index data with Elasticsearch to support more complex search queries and results ranking
- If we scale to support searching multiple datasets (e.g. food facility permit data from multiple cities) we will need to normalize the data into a consistent set of searchable fields
- Add logging, monitoring, and health checks
- Horizontally scale backend services and deploy them close to users to reduce latency

## Running the Application

### Prerequisites

- Node.js 18+
- npm

### Application

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

### Documentation (Docusaurus)

```bash
cd docs
npm install
npm start          # http://localhost:3000
npm run build      # Production build to build/
npm run serve      # Serve production build