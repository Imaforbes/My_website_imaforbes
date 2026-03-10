# Work Experiences Migration

## Setup Instructions

### 1. Create the Database Table

Run the SQL migration file to create the `work_experiences` table:

```bash
# Using MySQL command line
mysql -u root -proot -P 8889 portfolio < migrations/create_experiences_table.sql

# Or using phpMyAdmin:
# 1. Go to phpMyAdmin
# 2. Select the 'portfolio' database
# 3. Go to SQL tab
# 4. Copy and paste the contents of create_experiences_table.sql
# 5. Click "Go"
```

### 2. Verify Table Creation

You can verify the table was created with:

```sql
SHOW TABLES LIKE 'work_experiences';
DESCRIBE work_experiences;
```

### 3. Test the API

The API endpoint is available at:
- Development: `http://localhost:8888/api_db_portfolio/api/experiences.php`
- Production: `https://www.imaforbes.com/api_db/api/experiences.php`

### 4. Access the Admin Panel

1. Log in to the dashboard: `/admin`
2. Click on "Experiencias" card
3. You can now add, edit, and delete work experiences

## Table Structure

```sql
CREATE TABLE work_experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    period VARCHAR(100) NOT NULL,
    description TEXT,
    responsibilities JSON,
    technologies JSON,
    sort_order INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### GET /api/experiences.php
- Get all published experiences (public)
- Get all experiences including drafts (admin only)
- Query params: `?status=all` (admin only)

### POST /api/experiences.php
- Create a new experience (admin only)
- Requires authentication and CSRF token

### PUT /api/experiences.php?id={id}
- Update an experience (admin only)
- Requires authentication and CSRF token

### DELETE /api/experiences.php
- Delete an experience (admin only)
- Requires authentication and CSRF token
- Body: `{ "id": 1 }`

## Example Experience Data

```json
{
  "title": "Software Engineer",
  "company": "Hostal Altaista S.A DE C.V",
  "location": "Mexico City, MX",
  "period": "2025 - Present",
  "description": "Developing full-stack web applications and providing technical consulting services to clients.",
  "responsibilities": [
    "Design and develop responsive web applications",
    "Implement RESTful APIs and database solutions",
    "Collaborate with clients to understand requirements",
    "Optimize application performance and security"
  ],
  "technologies": ["React", "PHP", "MySQL", "Python"],
  "sort_order": 0,
  "status": "published"
}
```

