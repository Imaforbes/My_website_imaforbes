# Blog Likes and Views Setup Guide

## Overview

This guide explains how to set up the likes and views tracking functionality for blog posts.

## Database Migration

### Step 1: Run the Migration Script

Run the migration SQL script to add the necessary tables and columns:

```bash
cd /Applications/MAMP/htdocs/api_db_portfolio
mysql -u root -proot -h 127.0.0.1 -P 8889 portfolio < migrations/add_blog_likes_views.sql
```

Or manually run the SQL in your MySQL client:

```sql
USE portfolio;
SOURCE migrations/add_blog_likes_views.sql;
```

### What the Migration Does

1. **Adds columns to `blog_posts` table:**

   - `likes_count` (INT, default 0) - Stores the total number of likes
   - `views_count` (INT, default 0) - Stores the total number of views

2. **Creates `blog_likes` table:**

   - Tracks individual likes by IP address
   - Prevents duplicate likes from the same IP
   - Foreign key relationship to `blog_posts`

3. **Creates `blog_views` table:**
   - Tracks individual views by IP address
   - Prevents duplicate view counts (one view per IP per 24 hours)
   - Foreign key relationship to `blog_posts`

## API Endpoints

### Like/Unlike a Post

**POST** `/api/blog/like.php`

```json
{
  "post_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "liked": true,
    "likes_count": 5
  }
}
```

### Get Like Status

**GET** `/api/blog/like.php?post_id=1`

**Response:**

```json
{
  "success": true,
  "data": {
    "liked": false,
    "likes_count": 4
  }
}
```

### Track View

**POST** `/api/blog/view.php`

```json
{
  "post_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "views_count": 10,
    "view_recorded": true
  }
}
```

### Get Statistics (Admin Only)

**GET** `/api/blog/stats.php` - Get overall statistics
**GET** `/api/blog/stats.php?post_id=1` - Get statistics for a specific post

**Response (Overall):**

```json
{
  "success": true,
  "data": {
    "total_posts": 10,
    "total_views": 150,
    "total_likes": 45,
    "views_last_7_days": 30,
    "views_last_30_days": 100,
    "most_viewed": [...],
    "most_liked": [...]
  }
}
```

## Frontend Features

### Like Button

- Each blog post now has a like button
- Click to like/unlike a post
- Button shows current like count
- Visual feedback when liked (red heart, filled icon)
- Prevents duplicate likes from same IP

### View Tracking

- Views are automatically tracked when a post is displayed
- One view per IP per 24 hours (prevents spam)
- View count is displayed next to the date
- Views are tracked in the background

### Statistics (Admin)

- Access statistics in the admin dashboard
- View overall statistics (total posts, views, likes)
- View statistics per post
- See most viewed and most liked posts
- View trends (last 7 days, last 30 days)

## How It Works

### Like System

1. User clicks like button
2. Frontend sends POST request to `/api/blog/like.php`
3. Backend checks if IP has already liked the post
4. If not liked: Adds like, increments count
5. If already liked: Removes like, decrements count
6. Returns updated like status and count

### View Tracking

1. When blog posts load, frontend tracks views
2. Frontend sends POST request to `/api/blog/view.php` for each post
3. Backend checks if IP viewed post in last 24 hours
4. If not viewed: Records view, increments count
5. If already viewed: Skips (no duplicate count)
6. Updates view count in database

### Statistics

1. Admin accesses statistics endpoint
2. Backend queries database for:
   - Total posts, views, likes
   - Views in last 7/30 days
   - Most viewed/liked posts
3. Returns comprehensive statistics

## Security Features

- **IP-based tracking**: Prevents spam and duplicate likes/views
- **24-hour view cooldown**: Prevents view count manipulation
- **Unique like constraint**: One like per IP per post
- **Admin authentication**: Statistics endpoint requires admin login
- **Input validation**: All inputs are sanitized and validated

## Troubleshooting

### Migration Fails

If the migration fails, check:

- Database connection
- Table permissions
- Existing data conflicts

### Likes/Views Not Updating

Check:

- API endpoints are accessible
- CORS headers are set correctly
- Database tables exist
- IP address detection is working

### Statistics Not Showing

Verify:

- Admin authentication is working
- Database queries are correct
- Statistics endpoint is accessible

## Next Steps

1. Run the migration script
2. Test like/unlike functionality
3. Verify view tracking is working
4. Check statistics in admin dashboard
5. Monitor performance and adjust as needed
