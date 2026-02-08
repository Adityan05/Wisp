
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(4) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('file', 'link', 'text')),
  file_path TEXT,
  original_name TEXT,
  text_data TEXT,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip VARCHAR(50) NOT NULL,
  endpoint VARCHAR(50) NOT NULL,
  count INT DEFAULT 1,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (ip, endpoint)
);