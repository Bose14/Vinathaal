// utils/config.js
require("dotenv").config();

module.exports = async function loadConfig() {
  try {
    const config = {
      DB_HOST:               process.env.DB_HOST,
      DB_USER:               process.env.DB_USER,
      DB_PASSWORD:           process.env.DB_PASSWORD || '',
      DB_NAME:               process.env.DB_NAME,
      PORT:                  process.env.PORT,
      EMAIL_USER:            process.env.EMAIL_USER,
      EMAIL_PASS:            process.env.EMAIL_PASS,
      REGION_AWS:            process.env.REGION_AWS,
      ACCESS_KEY_ID_AWS:     process.env.ACCESS_KEY_ID_AWS,
      SECRET_ACCESS_KEY_AWS: process.env.SECRET_ACCESS_KEY_AWS,
      S3_BUCKET_NAME:        process.env.S3_BUCKET_NAME,
      FRONTEND_URL:          process.env.FRONTEND_URL,
      PERPLEXITY_API_KEY:    process.env.PERPLEXITY_API_KEY,
      PERPLEXITY_ENDPOINT:   process.env.PERPLEXITY_ENDPOINT,
      PERPLEXITY_MODEL:      process.env.PERPLEXITY_MODEL,
      SLACK_WEBHOOK_URL:     process.env.SLACK_WEBHOOK_URL,
      JWT_SECRET:            process.env.JWT_SECRET,
    };
    return config;
  } catch (error) {
    console.error("❌ Failed to load configuration from .env");
    throw error;
  }
};