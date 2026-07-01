// utils/env_extractor.js
require("dotenv").config();

async function getSecret(parameterName) {
  const value = process.env[parameterName];
  if (!value && value !== '') {
    throw new Error(`Parameter '${parameterName}' not found in .env`);
  }
  return value;
}

module.exports = { getSecret };