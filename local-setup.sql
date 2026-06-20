-- Vinathaal Local Database Setup

-- Create database
CREATE DATABASE IF NOT EXISTS vinathaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vinathaal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  credits INT DEFAULT 0,
  id_token VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  api_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question papers table
CREATE TABLE IF NOT EXISTS question_papers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  syllabus LONGTEXT,
  question_count INT,
  pdf_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Config table (for environment variables)
CREATE TABLE IF NOT EXISTS config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(255) UNIQUE NOT NULL,
  value LONGTEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key_name (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert configuration values (for local development)
INSERT INTO config (key_name, value, description) VALUES
('DB_HOST', 'localhost', 'MySQL database host'),
('DB_USER', 'root', 'MySQL user'),
('DB_PASSWORD', 'root', 'MySQL password'),
('DB_NAME', 'vinathaal', 'MySQL database name'),
('PORT', '3000', 'Node.js server port'),
('EMAIL_USER', 'noreply@vinathaal.local', 'Email address for sending emails'),
('EMAIL_PASS', 'test-password', 'Email app password'),
('REGION_AWS', 'us-east-1', 'AWS region'),
('ACCESS_KEY_ID_AWS', 'test-key-id', 'AWS access key'),
('SECRET_ACCESS_KEY_AWS', 'test-secret-key', 'AWS secret key'),
('S3_BUCKET_NAME', 'test-bucket', 'S3 bucket name'),
('FRONTEND_URL', 'http://localhost:5173', 'Frontend URL for local dev'),
('PERPLEXITY_API_KEY', 'test-api-key', 'Perplexity API key'),
('PERPLEXITY_ENDPOINT', 'https://api.perplexity.ai/chat/completions', 'Perplexity API endpoint'),
('PERPLEXITY_MODEL', 'llama-3.1-sonar-small-128k-online', 'Perplexity model'),
('SLACK_WEBHOOK_URL', 'test-webhook', 'Slack webhook URL')
ON DUPLICATE KEY UPDATE value=VALUES(value);

SELECT 'Database setup completed!' as status;
