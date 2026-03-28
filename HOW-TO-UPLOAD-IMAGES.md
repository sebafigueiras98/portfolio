# How to Upload Your Images

This guide will show you how to add your own photographs to your portfolio.

## Folder Structure

Your images are organized in these folders:

```
photography-portfolio/
└── public/
    └── images/
        ├── featured/          # Images for the scrolling carousel
        ├── color/             # Color photography gallery
        ├── blanco-y-negro/    # Black and white gallery
        └── series/            # Series gallery (optional)
```

## Step 1: Add Your Images to the Folders

1. **Navigate to the folders:**
   - Open Finder and go to `photography-portfolio/public/images/`

2. **Copy your images:**
   - **Featured (Carousel):** Add 6+ vertical images (3:2 aspect ratio) to `featured/`
   - **Color Gallery:** Add your color photos to `color/`
   - **Black & White Gallery:** Add your B&W photos to `blanco-y-negro/`
   - **Series:** Add series photos to `series/` (optional)

3. **File naming tips:**
   - Use descriptive names: `portrait-1.jpg`, `landscape-sunset.jpg`
   - No spaces in filenames (use dashes or underscores)
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

## Step 2: Update the Image Configuration

Open the file `lib/images.ts` and update the image paths:

```typescript
export const images = {
  // Featured images for the carousel
  featured: [
    '/images/featured/photo1.jpg',    // Replace with your filenames
    '/images/featured/photo2.jpg',
    '/images/featured/photo3.jpg',
    '/images/featured/photo4.jpg',
    '/images/featured/photo5.jpg',
    '/images/featured/photo6.jpg',
    // Add more images here if you want
  ],

  // Color gallery images
  color: [
    '/images/color/sunset.jpg',       // Replace with your filenames
    '/images/color/portrait.jpg',
    '/images/color/landscape.jpg',
    // Add as many as you want
  ],

  // Black and white gallery images
  blancoYNegro: [
    '/images/blanco-y-negro/street1.jpg',  // Replace with your filenames
    '/images/blanco-y-negro/portrait1.jpg',
    // Add as many as you want
  ],

  // Series images (optional)
  series: [
    '/images/series/project1-1.jpg',
    '/images/series/project1-2.jpg',
  ],
};
```

## Step 3: Save and View

1. Save the `lib/images.ts` file
2. The development server will automatically reload
3. View your portfolio at http://localhost:3000

## Tips

- **Featured carousel images:** Vertical photos work best (portrait orientation, 3:2 ratio)
- **Gallery images:** Can be any orientation, will be cropped to fit
- **Image optimization:** Next.js automatically optimizes your images
- **File sizes:** Keep images under 5MB for best performance
- **Aspect ratios:**
  - Featured: 494px × 741px (2:3 ratio) recommended
  - Gallery: Any size, will be cropped to square-ish

## Filter Tabs

The three filter tabs at the top of the gallery will automatically switch between:
- **color** → Shows images from `color` array
- **blanco y negro** → Shows images from `blancoYNegro` array
- **series** → Shows images from `series` array

The active tab is underlined.

## Load More Button

The "cargar más" button will show more images if you have more than 15 in a category. It automatically hides when all images are shown.

## Need Help?

If images don't show up:
1. Check that the filename in `lib/images.ts` matches the actual file
2. Make sure files are in the correct folder
3. Check that file extensions are correct (.jpg, .jpeg, .png)
4. Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again
