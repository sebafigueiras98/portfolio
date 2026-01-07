# Photography Portfolio - Seba Figueiras

A modern, elegant photography portfolio built with Next.js and Sanity CMS.

## Features

- 🎨 **Auto-scrolling carousel** - Showcase featured images
- 📸 **Category filtering** - Color, Black & White, and Series galleries
- ⚡ **Fast loading** - Optimized images via Sanity CDN
- 🎯 **Admin panel** - Easy drag-and-drop image management
- 📱 **Responsive design** - Beautiful on all devices
- 🔄 **Real-time updates** - Changes appear instantly

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Sanity CMS

Follow the detailed guide in **[SANITY-SETUP-GUIDE.md](./SANITY-SETUP-GUIDE.md)**

Quick version:
1. Create account at [sanity.io](https://sanity.io)
2. Create a new project
3. Copy your project ID
4. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
5. Run `npx sanity@latest deploy`

### 3. Start Development Server

```bash
npm run dev
```

Visit:
- **Portfolio**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

## Managing Your Images

### Upload Images

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Choose **Featured Images** or **Gallery Images**
3. Click **Create**
4. Upload your photo, add title, set order, and publish!

### Image Categories

- **Featured Images**: Carousel at the top (use vertical photos)
- **Color**: Color photography gallery
- **Blanco y Negro**: Black and white gallery
- **Series**: Photo series/collections

### Order Management

Images are sorted by the **order** field:
- Lower numbers appear first
- Use 10, 20, 30... for easy reordering later

## Project Structure

```
photography-portfolio/
├── app/
│   ├── page.tsx           # Main portfolio page
│   ├── layout.tsx         # Global layout
│   └── admin/             # Sanity Studio admin panel
├── sanity/
│   ├── config.ts          # Sanity configuration
│   ├── schemas/           # Content schemas
│   └── lib/               # Sanity client & queries
├── public/
│   └── images/            # (Optional) Local images
└── lib/
    └── images.ts          # (Legacy) Local image config
```

## Tech Stack

- **Framework**: Next.js 16
- **CMS**: Sanity.io
- **Styling**: Tailwind CSS
- **Font**: Instrument Serif
- **Hosting**: Vercel (recommended)
- **Images**: Sanity CDN

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project to [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
4. Deploy!

Your admin panel will be at `yourdomain.com/admin`

### Secure Your Admin

Add CORS origins in Sanity dashboard:
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. API → CORS origins
4. Add your production domain

## Customization

### Update Contact Info

Edit `app/page.tsx`:
- Email link (line 80)
- Instagram link (line 82)

### Change Colors

Edit `app/globals.css`:
- Background: `--background`
- Text: `--foreground`

### Adjust Carousel Speed

Edit `app/page.tsx` line 92:
```tsx
animation: 'scroll-right 60s linear infinite'
```
Change `60s` to make it faster (lower) or slower (higher)

## Support

- **Setup Guide**: [SANITY-SETUP-GUIDE.md](./SANITY-SETUP-GUIDE.md)
- **Sanity Docs**: [sanity.io/docs](https://sanity.io/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

Built with ❤️ using Next.js and Sanity CMS
