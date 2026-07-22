# Blog Image Support - Setup Guide

## ✅ Image Support Added to Blog Posts

Image support has been added to the blog system. You can now add images to your poems and letters!

## 🗄️ Database Setup

### Option 1: Run the Migration Script

If you already have a database with blog posts, run this SQL script to add the image column:

```bash
cd /Applications/MAMP/htdocs/api_db_portfolio
mysql -u root -proot -h 127.0.0.1 -P 8889 portfolio < add_blog_image_column.sql
```

Or manually run the SQL:

```sql
USE portfolio;
ALTER TABLE blog_posts 
ADD COLUMN image_url VARCHAR(500) NULL AFTER content;
```

### Option 2: Fresh Database Setup

If you're setting up a fresh database, the updated `database_schema.sql` already includes the `image_url` column. Just run:

```bash
cd /Applications/MAMP/htdocs/api_db_portfolio
php setup.php
```

## 📝 How to Use

### In Admin Panel

1. Go to **Admin Blog** (`/admin/blog`)
2. Click **"Nuevo Post"** or edit an existing post
3. In the form, you'll see **"URL de Imagen (Opcional)"** field
4. Enter either:
   - **Full URL**: `https://example.com/image.jpg`
   - **Relative path**: `/uploads/images/my-image.jpg`
5. A preview will show automatically if the image is valid
6. Save your post

### Image URL Formats Supported

- ✅ Full URLs: `https://example.com/image.jpg`
- ✅ Relative paths: `/uploads/images/image.jpg`
- ✅ API upload paths: `/uploads/images/uploaded-file.jpg`

### Using Uploaded Images

1. Upload an image via the image upload API (`/api/upload/image.php`)
2. Copy the returned image path
3. Paste it into the blog post image URL field

## 🎨 Display

- **Blog Page**: Images display at the top of each blog post card
- **Admin Panel**: Images show as thumbnails in the post grid
- **Responsive**: Images adapt to different screen sizes
- **Hover Effect**: Images scale slightly on hover for better UX

## 🔧 Features

- ✅ Optional field - posts work without images
- ✅ URL validation - invalid URLs are ignored
- ✅ Image preview in admin form
- ✅ Error handling - broken images are hidden
- ✅ Responsive sizing - works on all devices
- ✅ Lazy loading - images load as you scroll

## 📋 API Changes

### Create Blog Post

```json
{
  "title": "My Poem",
  "content": "Poem content...",
  "image_url": "/uploads/images/poem.jpg",
  "type": "poem",
  "status": "published"
}
```

### Update Blog Post

```json
{
  "title": "Updated Title",
  "image_url": "/uploads/images/new-image.jpg"
}
```

## ✅ Ready to Use!

After running the database migration, you can immediately start adding images to your blog posts!

