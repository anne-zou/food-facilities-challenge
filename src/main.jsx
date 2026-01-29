import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const init = async () => {
  // Wait for the WASM module loaded by the <script> tag in index.html
  const sqlite3 = await window.sqlite3InitModule();

  // Initialize DB ('ct' creates the table if it doesn't exist)
  const db = new sqlite3.oo1.DB("/food-facilities-challenge.sqlite3", "ct");
  console.log("Database initialized!", db.filename);

   // Make db globally accessible
  window.db = db;

  // Now that the DB is ready, render the React app
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

init();
