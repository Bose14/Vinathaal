// utils/env_extractor.js
// Supports both local .env (development) and MySQL config table (production)

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

let configCache = null;
let cacheExpiry = null;
const CACHE_TTL = 5 * 60 * 1000; // Cache for 5 minutes

/**
 * Fetches a configuration value from .env file (local) or MySQL config table (production)
 * @param {string} parameterName - The name of the configuration parameter
 * @returns {Promise<string>} The value of the parameter
 */
async function getSecret(parameterName) {
  try {
    // 1. Try to get from .env file first (local development)
    if (process.env[parameterName]) {
      return process.env[parameterName];
    }

    // 2. If not in .env, try to get from database (production)
    // Return cached value if still valid
    if (configCache && cacheExpiry && Date.now() < cacheExpiry) {
      const cachedValue = configCache[parameterName];
      if (cachedValue !== undefined) {
        return cachedValue;
      }
    }

    // Create connection to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'vinathaal',
      password: process.env.DB_PASSWORD || 'AppUser@2024',
      database: process.env.DB_NAME || 'vinathaal',
    });

    try {
      // Fetch all config at once
      const [rows] = await connection.execute(
        'SELECT key_name, value FROM config'
      );

      // Build config object
      configCache = {};
      rows.forEach(row => {
        configCache[row.key_name] = row.value;
      });

      // Set cache expiry
      cacheExpiry = Date.now() + CACHE_TTL;

      // Return the requested parameter
      if (configCache[parameterName]) {
        return configCache[parameterName];
      } else {
        throw new Error(`Parameter '${parameterName}' not found in .env or config table.`);
      }
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error(`❌ Error fetching parameter '${parameterName}': ${error.message}`);
    throw error;
  }
}

module.exports = { getSecret };