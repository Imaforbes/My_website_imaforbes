# 📧 How to Edit the Auto-Reply Email Message

## 📍 Location
**File**: `api_db_portfolio/utils/EmailSender.php`

## ✏️ What to Edit

The auto-reply email has **3 parts** you can customize:

### 1. **Email Subject** (Line 219)
```php
$subject = "Thank you for contacting IMAFORBES";
```
**Change this to**: Your preferred subject line

### 2. **HTML Email Content** (Lines 248-254)
This is what people see in their email client:

```php
<h1>👋 Thank You for Contacting Me!</h1>  // Header
<p>Hi {$name},</p>  // Greeting (uses their name)
<p>Thank you for reaching out through my portfolio contact form. I've received your message and will get back to you as soon as possible.</p>
<p>I typically respond within 24 hours, so please keep an eye on your inbox.</p>
<p>Best regards,<br>Imanol Pérez Arteaga<br>Full Stack Developer</p>  // Signature
```

### 3. **Plain Text Email Content** (Lines 270-277)
This is the fallback for email clients that don't support HTML:

```php
Hi {$name},

Thank you for reaching out through my portfolio contact form. I've received your message and will get back to you as soon as possible.

I typically respond within 24 hours, so please keep an eye on your inbox.

Best regards,
Imanol Pérez Arteaga
Full Stack Developer
```

## 🎨 Current Email Design

The email includes:
- **Header**: Blue background with "Thank You for Contacting Me!"
- **Content**: Light gray background with your message
- **Footer**: Dark gray with "This is an automated response from imanol@imaforbes.com"

## 📝 Quick Edit Guide

### To Change the Message:
1. Open `api_db_portfolio/utils/EmailSender.php`
2. Find the `buildAutoReplyHTML()` function (around line 230)
3. Edit the text inside the `<div class='content'>` section (lines 250-254)
4. Also update the plain text version in `buildAutoReplyText()` (lines 270-277) to match

### To Change the Subject:
1. Find line 219: `$subject = "Thank you for contacting IMAFORBES";`
2. Change the text inside the quotes

### To Change Your Name/Signature:
1. Update line 254 in HTML version: `<p>Best regards,<br>YOUR NAME<br>YOUR TITLE</p>`
2. Update lines 276-277 in text version to match

### To Change Response Time:
1. Update line 253: `I typically respond within 24 hours`
2. Update line 274 in text version to match

### To Change Footer Email:
1. Update line 257: `This is an automated response from imanol@imaforbes.com`
2. Update line 280 in text version to match

## 🔧 Variables You Can Use

- `{$name}` - Automatically replaced with the sender's name
- You can add more variables if needed (like date, custom message, etc.)

## ✅ Example Customization

**Example 1 - Professional Tone:**
```php
<p>Dear {$name},</p>
<p>Thank you for your interest in contacting me through my portfolio. I have received your message and will review it shortly.</p>
<p>I aim to respond to all inquiries within 48 hours during business days.</p>
<p>Best regards,<br>Imanol Pérez Arteaga<br>Full Stack Developer</p>
```

**Example 2 - Casual Tone:**
```php
<p>Hey {$name}!</p>
<p>Thanks for reaching out! I got your message and I'll get back to you soon.</p>
<p>I usually respond within a day or two, so stay tuned!</p>
<p>Cheers,<br>Imanol</p>
```

## 📋 Checklist

- [ ] Subject line updated
- [ ] HTML message content updated
- [ ] Plain text message content updated (should match HTML)
- [ ] Name/signature updated
- [ ] Response time updated
- [ ] Footer email updated (if needed)

## 🚀 After Editing

1. Save the file
2. Test by submitting the contact form
3. Check both HTML and plain text versions
4. Make sure the formatting looks good

## 📧 Note

There are **TWO emails** sent:
1. **Auto-reply** (this one) - Sent to the person who submitted the form
2. **Notification email** - Sent to you (the admin) when someone submits the form

This guide is for the **auto-reply email** that visitors receive.

## 🔗 Related Files

- `api_db_portfolio/api/contact.php` - Contact form handler
- `api_db_portfolio/utils/EmailSender.php` - Email sender (THIS FILE)
- `api_db_portfolio/config/email.php` - Email configuration (SMTP settings)

