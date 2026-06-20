# Database

## Connection

File: `backend/awsdb.js`

```js
const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  dateStrings: true          // ← DATE/DATETIME returned as strings, not Date objects
});

pool.query = util.promisify(pool.query);  // ← critical: rows returned directly
```

- Driver: `mysql2` (not `mysql2/promise`)
- Database: AWS RDS MySQL, region `ap-southeast-2`
- `dateStrings: true` — all date columns return strings like `"2025-11-15 14:30:00"`

---

## Query Pattern — CRITICAL

`util.promisify(pool.query)` makes `db.query()` return the **rows array directly**.  
This is different from the native mysql2 promise interface which returns `[rows, fields]`.

```js
// ✅ CORRECT — used everywhere except stats.js
const rows = await db.query("SELECT * FROM users WHERE email = ?", [email]);
rows[0].email      // first row
rows.length        // count

// ✅ ALSO WORKS but inconsistent — avoid
const [rows] = await db.promise().query("SELECT ...");

// ❌ WRONG — will give you the first row object as "rows", not an array
const [rows, fields] = await db.query(...);
```

---

## Tables

### `users`
Inferred from `auth.js`, `creditsHandling.js`, `user.js`:

```sql
CREATE TABLE users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(255),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255),          -- bcrypt; NULL for Google-only users
  api_token           VARCHAR(255) UNIQUE,   -- used for Bearer auth
  role                VARCHAR(50),           -- 'user', 'admin', etc.
  credits             INT DEFAULT 5,         -- generation credits
  reset_token         VARCHAR(255),
  reset_token_expires DATETIME,
  created_at          DATETIME,
  updated_at          DATETIME,
  is_active           TINYINT(1) DEFAULT 1
);
```

### `question_papers`
Inferred from `s3Upload.js`:

```sql
CREATE TABLE question_papers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,              -- FK → users.id
  qp_s3_url   VARCHAR(1024),            -- S3 public object URL
  created_at  DATETIME,                 -- IST time sent from frontend
  subjectName VARCHAR(255),
  -- NOTE: template_id column does NOT exist (templateId is sent from frontend but not stored)
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Key Queries

### Login
```js
const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
// bcrypt.compare(password, rows[0].password_hash)
```

### Signup
```js
await db.query(
  'INSERT INTO users (name, email, password_hash, api_token, credits) VALUES (?, ?, ?, ?, 5)',
  [name, email, hashedPassword, api_token]
);
```

### Forgot Password — Set token
```js
await db.query(
  'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
  [resetToken, expiresAt, users[0].id]
);
```

### Reset Password — Validate token
```js
const result = await db.query(
  'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
  [token]
);
```

### Get Credits
```js
const rows = await db.query("SELECT credits FROM users WHERE email = ?", [email]);
// rows[0].credits
```

### Deduct 1 Credit
```js
await db.query("UPDATE users SET credits = credits - 1 WHERE email = ?", [email]);
```

### Store PDF Metadata
```js
const users = await db.query("SELECT id FROM users WHERE email = ?", [email]);
await db.query(
  'INSERT INTO question_papers (user_id, qp_s3_url, created_at, subjectName) VALUES (?,?,?,?)',
  [users[0].id, objectURL, dateTime, subjectName]
);
```

### Last 3 Papers (History)
```js
await db.query(`
  SELECT qp.qp_s3_url AS objectUrl, DATE(qp.created_at) AS created_at, qp.subjectName
  FROM question_papers qp
  JOIN users u ON u.id = qp.user_id
  WHERE u.email = ?
  ORDER BY qp.created_at DESC
  LIMIT 3
`, [email]);
```

### Stats Count
```js
// stats.js — uses db.promise().query() (inconsistent but works)
const [userRows] = await db.promise().query('SELECT COUNT(*) as count FROM users');
const [paperRows] = await db.promise().query('SELECT COUNT(*) as count FROM question_papers');
```

---

## Date Handling

Frontend sends IST-adjusted datetime to avoid timezone issues:

```ts
const istOffset = 5.5 * 60 * 60 * 1000;
const istTime = new Date(Date.now() + istOffset);
const dateTime = istTime.toISOString().replace('T', ' ').slice(0, 19);
// Result: "2025-11-15 14:30:00"
```

Reading back: `dateStrings: true` returns `"2025-11-15 14:30:00"` (string, not Date).  
History query uses `DATE(qp.created_at)` → returns just `"2025-11-15"`.
