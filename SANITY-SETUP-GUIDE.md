# Sanity CMS Setup Guide

Your photography portfolio now includes a professional admin panel powered by Sanity CMS! This guide will help you set it up.

## What You Get

✅ **Professional Admin Panel** - Easy drag-and-drop image uploads
✅ **CDN Image Hosting** - Fast loading times worldwide
✅ **Automatic Optimization** - Images are automatically compressed and resized
✅ **No Code Editing** - Manage all images through a web interface

---

## Step 1: Create a Sanity Account

1. Go to [sanity.io](https://sanity.io)
2. Click "Get started" and sign up with Google or GitHub
3. It's free! No credit card required.

---

## Step 2: Create a New Project

1. Once logged in, go to [sanity.io/manage](https://sanity.io/manage)
2. Click "Create project"
3. Choose a name like "Photography Portfolio"
4. Select a region close to you (for best performance)
5. Choose the **Free** plan
6. Click "Create project"

---

## Step 3: Get Your Project Credentials

After creating the project:

1. You'll see your **Project ID** on the project dashboard
2. Copy it - you'll need it in the next step
3. Go to the **Datasets** tab and note your dataset name (usually "production")

---

## Step 4: Add Credentials to Your Project

1. In your project folder, create a file called `.env.local`
2. Add these lines (replace with your actual values):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

**Example:**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
```

3. Save the file

---

## Step 5: Deploy the Schema to Sanity

Run this command in your terminal:

```bash
npx sanity@latest deploy
```

This uploads your content structure to Sanity. When prompted:
- Choose "Yes" to deploy
- You may need to log in via browser

---

## Step 6: Access Your Admin Panel

1. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. Visit your admin panel at:
   ```
   http://localhost:3000/admin
   ```

3. You'll see the Sanity Studio interface!

---

## How to Upload Images

### Featured Images (Carousel)

1. In the admin panel, click **"Featured Images (Carousel)"**
2. Click **"Create"**
3. Fill in:
   - **Title**: Internal name (e.g., "Sunset Portrait")
   - **Image**: Click to upload your photo
   - **Order**: Number (0, 1, 2, etc.) - lower numbers appear first
4. Click **"Publish"**

Repeat for all your carousel images (recommend 6-10).

### Gallery Images

1. Click **"Gallery Images"**
2. Click **"Create"**
3. Fill in:
   - **Title**: Internal name
   - **Image**: Upload your photo
   - **Category**: Choose Color, Blanco y Negro, or Series
   - **Order**: Number for sorting
4. Click **"Publish"**

Add as many as you want!

---

## Tips

### Image Organization
- **Order numbers**: Use 10, 20, 30... so you can easily insert images between them later
- **Titles**: Use descriptive names to find images easily later
- **Categories**:
  - Color = Your color photographs
  - Blanco y Negro = Black and white photos
  - Series = Photo series or collections

### Image Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Any size - Sanity automatically optimizes
- **Featured images**: Portrait orientation (vertical) works best
- **Gallery images**: Any orientation works

### Managing Images
- **Edit**: Click on any image to edit details
- **Delete**: Use the menu (⋮) next to an image
- **Reorder**: Change the order number and republish
- **Bulk operations**: Select multiple images with checkboxes

---

## Making Changes Live

After uploading images in the admin panel:

1. Go to your portfolio: `http://localhost:3000`
2. Images should appear automatically!
3. No need to refresh - React updates automatically

---

## Production Deployment

When you're ready to launch your portfolio:

1. Make sure `.env.local` is NOT committed to git
2. Add the same environment variables to your hosting platform (Vercel, Netlify, etc.)
3. Your admin panel will be available at `yourdomain.com/admin`

### Securing Your Admin Panel (Recommended)

By default, anyone can access `/admin`. To secure it:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **API** → **CORS origins**
4. Add your production domain (e.g., `https://yourdomain.com`)

You can also add authentication to the admin route if needed.

---

## Troubleshooting

### "Project ID not found"
- Check `.env.local` has the correct project ID
- Restart your dev server after adding the file

### Images not showing
- Make sure you clicked "Publish" in Sanity Studio
- Check browser console for errors
- Verify the project ID is correct

### Admin panel won't load
- Run `npx sanity@latest deploy` again
- Clear browser cache
- Try in an incognito window

### Need to start fresh?
1. Delete all content in Sanity Studio
2. Or create a new dataset in the Sanity dashboard

---

## Next Steps

- Upload your featured carousel images
- Add your color photography
- Add black and white photos
- Test the filter tabs
- Try the "load more" button

---

## Support

- **Sanity Docs**: [sanity.io/docs](https://sanity.io/docs)
- **Sanity Community**: [slack.sanity.io](https://slack.sanity.io)

Your portfolio is now ready for easy image management! 📸
