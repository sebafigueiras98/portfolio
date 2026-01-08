'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { client, urlFor } from "@/sanity/lib/client";
import { FEATURED_IMAGES_QUERY, GALLERY_IMAGES_QUERY } from "@/sanity/lib/queries";
import { FastAverageColor } from "fast-average-color";

type Category = 'color' | 'blancoYNegro' | 'series';

interface ExifData {
  ISO?: number;
  ExposureTime?: string;
  FNumber?: number;
  FocalLength?: number;
  LensModel?: string;
  Make?: string;
  Model?: string;
  DateTimeOriginal?: string;
}

interface ImageMetadata {
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  exif?: ExifData;
}

interface SanityImage {
  asset?: {
    url?: string;
    metadata?: ImageMetadata;
  };
}

interface FeaturedImage {
  _id: string;
  title: string;
  image: SanityImage;
  caption?: string;
  location?: string;
  order: number;
}

interface GalleryImage {
  _id: string;
  title: string;
  image: SanityImage;
  caption?: string;
  location?: string;
  category: string;
  order: number;
}

// Helper function to format exposure time
const formatExposureTime = (exposureTime?: string): string => {
  if (!exposureTime) return '';
  const seconds = parseFloat(exposureTime);
  if (seconds >= 1) return `${seconds}s`;
  return `1/${Math.round(1 / seconds)}s`;
};

// Helper function to format aperture
const formatAperture = (fNumber?: number): string => {
  if (!fNumber) return '';
  return `f/${fNumber.toFixed(1)}`;
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('color');
  const [visibleCount, setVisibleCount] = useState(16);
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxMetadata, setLightboxMetadata] = useState<(ImageMetadata | null)[]>([]);
  const [lightboxCaptions, setLightboxCaptions] = useState<(string | undefined)[]>([]);
  const [lightboxLocations, setLightboxLocations] = useState<(string | undefined)[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const [imageColors, setImageColors] = useState<Record<string, string>>({});
  const [isLargeViewport, setIsLargeViewport] = useState(false);
  const [isUltraWideViewport, setIsUltraWideViewport] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Detect scroll position for sticky nav background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect large viewport (4K/ultrawide displays)
  useEffect(() => {
    const checkViewportSize = () => {
      setIsLargeViewport(window.innerWidth >= 1920);
      setIsUltraWideViewport(window.innerWidth >= 2560);
    };
    checkViewportSize();
    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, []);

  // Fetch featured images on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await client.fetch(FEATURED_IMAGES_QUERY);
        console.log('Featured images with metadata:', data);
        setFeaturedImages(data);
      } catch (error) {
        console.error('Error fetching featured images:', error);
      }
    };
    fetchFeatured();
  }, []);

  // Extract colors from featured images
  useEffect(() => {
    if (featuredImages.length === 0) return;

    const fac = new FastAverageColor();
    const extractColors = async () => {
      const colors: Record<string, string> = {};

      for (const image of featuredImages) {
        try {
          const imageUrl = urlFor(image.image).width(100).height(100).url();
          const color = await fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' });
          // Parse rgba and set opacity to 0.3 for cinematic shadow effect
          const rgbaMatch = color.rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
          if (rgbaMatch) {
            colors[image._id] = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, 0.3)`;
          } else {
            colors[image._id] = color.rgba;
          }
        } catch (error) {
          console.error('Error extracting color:', error);
          colors[image._id] = 'rgba(100, 100, 150, 0.3)'; // Fallback color
        }
      }

      setImageColors(colors);
    };

    extractColors();

    return () => {
      fac.destroy();
    };
  }, [featuredImages]);

  // Fetch gallery images when category changes
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const data = await client.fetch(GALLERY_IMAGES_QUERY, { category: activeCategory });
        console.log('Gallery images with metadata:', data);
        setGalleryImages(data);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [activeCategory]);

  const displayedImages = galleryImages.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => prev + 16);
  };

  const nextCarouselImage = () => {
    setCurrentCenterIndex((prev) => (prev + 1) % featuredImages.length);
  };

  const prevCarouselImage = () => {
    setCurrentCenterIndex((prev) => (prev - 1 + featuredImages.length) % featuredImages.length);
  };

  const openLightbox = (
    imageUrl: string,
    allImages: string[],
    metadata: (ImageMetadata | null)[],
    captions: (string | undefined)[],
    locations: (string | undefined)[],
    index: number
  ) => {
    setLightboxImage(imageUrl);
    setLightboxImages(allImages);
    setLightboxMetadata(metadata);
    setLightboxCaptions(captions);
    setLightboxLocations(locations);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (currentImageIndex < lightboxImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setLightboxImage(lightboxImages[currentImageIndex + 1]);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setLightboxImage(lightboxImages[currentImageIndex - 1]);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Auto-advance carousel
  useEffect(() => {
    if (featuredImages.length < 3) return;

    const interval = setInterval(() => {
      setCurrentCenterIndex((prev) => (prev + 1) % featuredImages.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [featuredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, currentImageIndex, lightboxImages]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!lightboxImage) return;

      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };

    const lightboxEl = document.querySelector('.lightbox-container');
    if (lightboxEl) {
      lightboxEl.addEventListener('wheel', handleWheel, { passive: false });
      return () => lightboxEl.removeEventListener('wheel', handleWheel);
    }
  }, [lightboxImage, zoomLevel]);

  // Copyright protection: disable right-click and drag on images
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.style.backgroundImage) {
        e.preventDefault();
        return false;
      }
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventSelection = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.style.backgroundImage) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('selectstart', preventSelection);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('selectstart', preventSelection);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1199px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between py-6 md:py-8">
            <h1 className="font-serif text-[24px] md:text-[32px] leading-normal">
              SEBA FIGUEIRAS
            </h1>
            <nav className="flex gap-4 font-serif text-[24px] md:text-[32px] leading-normal underline">
              <a href="mailto:sebafigueiras@gmail.com" className="hover:opacity-70 transition-opacity">
                email
              </a>
              <a href="https://instagram.com/sebafigueiras" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                instagram
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[88px] md:h-[96px]"></div>

      {/* Hero Section - Scrollable Carousel with Center Focus */}
      <section className="py-8 md:py-12 relative overflow-visible">
        {featuredImages.length >= 3 ? (
          <div className="relative overflow-visible">
            {/* Cinematic Shadow Layer - Behind all images */}
            <div
              className="absolute left-1/2 top-1/2 w-[318px] h-[477px] md:w-[566px] md:h-[849px] z-0 transition-all duration-1000 ease-in-out rounded-lg pointer-events-none"
              style={{
                transform: 'translate(-50%, -50%) scaleY(0.6)',
                boxShadow: `0 0 200px 100px ${imageColors[featuredImages[currentCenterIndex]?._id] || 'rgba(100, 100, 150, 0.3)'}, 0 0 400px 200px ${imageColors[featuredImages[currentCenterIndex]?._id] || 'rgba(100, 100, 150, 0.25)'}, 0 0 600px 300px ${imageColors[featuredImages[currentCenterIndex]?._id] || 'rgba(100, 100, 150, 0.2)'}`
              }}
            />

            {/* Previous Button */}
            <button
              onClick={prevCarouselImage}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 text-white text-4xl md:text-6xl hover:opacity-70 transition-opacity"
              aria-label="Previous image"
            >
              ‹
            </button>

            {/* Carousel Images */}
            <div className="flex gap-2 md:gap-4 items-center justify-center relative z-10 select-none">
              {/* Ultra Far Left image - Only on ultra-wide viewports */}
              {isUltraWideViewport && featuredImages.length >= 7 && (() => {
                const ultraFarLeftIndex = (currentCenterIndex - 3 + featuredImages.length) % featuredImages.length;
                const item = featuredImages[ultraFarLeftIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-ultra-far-left"
                    className="relative h-[741px] w-[494px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, ultraFarLeftIndex)}
                    style={{
                      opacity: 0.05,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(494).height(741).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Gradient overlay - left to right */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
                );
              })()}

              {/* Far Left image - Only on large viewports */}
              {isLargeViewport && featuredImages.length >= 5 && (() => {
                const farLeftIndex = (currentCenterIndex - 2 + featuredImages.length) % featuredImages.length;
                const item = featuredImages[farLeftIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-far-left"
                    className="relative h-[741px] w-[494px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, farLeftIndex)}
                    style={{
                      opacity: 0.4,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(494).height(741).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Gradient overlay - left to right */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
                );
              })()}

              {/* Left image - Mobile: 262x393, Desktop: 494x741 */}
              {(() => {
                const leftIndex = (currentCenterIndex - 1 + featuredImages.length) % featuredImages.length;
                const item = featuredImages[leftIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-left"
                    className="relative h-[393px] w-[262px] md:h-[741px] md:w-[494px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, leftIndex)}
                    style={{
                      opacity: 0.6,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(494).height(741).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Gradient overlay - left to right */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
                );
              })()}

              {/* Center image - Mobile: 318x477, Desktop: 566x849 (taller) */}
              {(() => {
                const item = featuredImages[currentCenterIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-center"
                    className="relative h-[477px] w-[318px] md:h-[849px] md:w-[566px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, currentCenterIndex)}
                    style={{
                      opacity: 1,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(566).height(849).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </div>
                );
              })()}

              {/* Right image - Mobile: 262x393, Desktop: 494x741 */}
              {(() => {
                const rightIndex = (currentCenterIndex + 1) % featuredImages.length;
                const item = featuredImages[rightIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-right"
                    className="relative h-[393px] w-[262px] md:h-[741px] md:w-[494px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, rightIndex)}
                    style={{
                      opacity: 0.6,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(494).height(741).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Gradient overlay - right to left */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
                );
              })()}

              {/* Far Right image - Only on large viewports */}
              {isLargeViewport && featuredImages.length >= 5 && (() => {
                const farRightIndex = (currentCenterIndex + 2) % featuredImages.length;
                const item = featuredImages[farRightIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-far-right"
                    className="relative h-[741px] w-[494px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, farRightIndex)}
                    style={{
                      opacity: 0.4,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(494).height(741).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Gradient overlay - right to left */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
                );
              })()}

              {/* Ultra Far Right image - Only on ultra-wide viewports */}
              {isUltraWideViewport && featuredImages.length >= 7 && (() => {
                const ultraFarRightIndex = (currentCenterIndex + 3) % featuredImages.length;
                const item = featuredImages[ultraFarRightIndex];
                const imageUrl = urlFor(item.image).url();
                const allCarouselImages = featuredImages.map(img => urlFor(img.image).url());
                const allCarouselMetadata = featuredImages.map(img => img.image.asset?.metadata || null);
                const allCarouselCaptions = featuredImages.map(img => img.caption);
                const allCarouselLocations = featuredImages.map(img => img.location);
                return (
                  <div
                    key="carousel-ultra-far-right"
                    className="relative h-[741px] w-[494px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-zinc-900"
                    onClick={() => openLightbox(imageUrl, allCarouselImages, allCarouselMetadata, allCarouselCaptions, allCarouselLocations, ultraFarRightIndex)}
                    style={{
                      opacity: 0.05,
                      transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-1000 ease-in-out"
                      style={{
                        backgroundImage: `url(${urlFor(item.image).width(494).height(741).fit('crop').crop('center').quality(90).url()})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Gradient overlay - right to left */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={nextCarouselImage}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 text-white text-4xl md:text-6xl hover:opacity-70 transition-opacity"
              aria-label="Next image"
            >
              ›
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[741px] text-zinc-500">
            <p className="font-serif text-2xl">Add at least 3 featured images in the admin panel to see the carousel!</p>
          </div>
        )}
      </section>

      {/* Centered Container for Gallery Section */}
      <div className="max-w-[1199px] mx-auto px-6 md:px-10">
        <section className="py-16">
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Filter Tabs */}
            <div className="flex gap-6 font-serif text-[24px] md:text-[32px] leading-normal">
              <button
                onClick={() => {
                  setActiveCategory('color');
                  setVisibleCount(16);
                }}
                className={`hover:opacity-70 transition-opacity ${activeCategory === 'color' ? 'underline' : ''}`}
              >
                color
              </button>
              <button
                onClick={() => {
                  setActiveCategory('blancoYNegro');
                  setVisibleCount(16);
                }}
                className={`hover:opacity-70 transition-opacity ${activeCategory === 'blancoYNegro' ? 'underline' : ''}`}
              >
                blanco y negro
              </button>
            </div>

            {/* Photo Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-zinc-500">
                <p className="font-serif text-2xl">Loading...</p>
              </div>
            ) : displayedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 select-none">
                {displayedImages.map((item, index) => {
                  const imageUrl = urlFor(item.image).url();
                  const allGalleryImages = displayedImages.map(img => urlFor(img.image).url());
                  const allGalleryMetadata = displayedImages.map(img => img.image.asset?.metadata || null);
                  const allGalleryCaptions = displayedImages.map(img => img.caption);
                  const allGalleryLocations = displayedImages.map(img => img.location);
                  return (
                    <div
                      key={item._id}
                      className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 cursor-pointer"
                      onClick={() => openLightbox(imageUrl, allGalleryImages, allGalleryMetadata, allGalleryCaptions, allGalleryLocations, index)}
                    >
                      <Image
                        src={urlFor(item.image).width(227).height(340).url()}
                        alt={item.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-zinc-500">
                <p className="font-serif text-2xl">No images in this category yet. Add them in the admin panel!</p>
              </div>
            )}

            {/* Load More Button */}
            {visibleCount < galleryImages.length && (
              <button
                onClick={loadMore}
                className="font-serif text-[24px] md:text-[32px] leading-normal text-center underline hover:opacity-70 transition-opacity w-full py-4"
              >
                cargar más
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-16">
        <div className="max-w-[1199px] mx-auto px-6 md:px-10">
          <p className="font-serif text-sm text-zinc-400 text-center">
            © 2026 Seba Figueiras. Todos los derechos reservados. Queda prohibido su uso no autorizado.
          </p>
        </div>
      </footer>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          className="lightbox-container fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white text-3xl md:text-4xl hover:opacity-70 transition-opacity z-50"
          >
            ×
          </button>

          {currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 md:left-8 text-white text-4xl md:text-5xl hover:opacity-70 transition-opacity z-50"
            >
              ‹
            </button>
          )}

          {currentImageIndex < lightboxImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 md:right-8 text-white text-4xl md:text-5xl hover:opacity-70 transition-opacity z-50"
            >
              ›
            </button>
          )}

          <div
            className="relative flex flex-col items-center justify-center gap-6 max-w-[95vw] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image and Zoom Controls Row */}
            <div className="flex flex-row items-center justify-center gap-8">
              {/* Image with colored shadow */}
              <div
                className="relative overflow-hidden"
                style={{ cursor: zoomLevel > 1 ? 'move' : 'default' }}
                onMouseDown={(e) => {
                  if (zoomLevel > 1) {
                    e.stopPropagation();
                    setIsDragging(true);
                    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
                  }
                }}
                onMouseMove={(e) => {
                  if (isDragging && zoomLevel > 1) {
                    e.stopPropagation();
                    setPanPosition({
                      x: e.clientX - dragStart.x,
                      y: e.clientY - dragStart.y
                    });
                  }
                }}
                onMouseUp={(e) => {
                  if (zoomLevel > 1) {
                    e.stopPropagation();
                    setIsDragging(false);
                  }
                }}
                onMouseLeave={() => setIsDragging(false)}
              >
                <img
                  src={lightboxImage}
                  alt="Full screen image"
                  className="max-w-full md:max-w-[75vw] max-h-[70vh] md:max-h-[85vh] object-contain select-none pointer-events-none relative z-10 transition-transform duration-200"
                  draggable="false"
                  style={{
                    filter: `drop-shadow(0 0 250px ${imageColors[lightboxImage] || 'rgba(255,255,255,0.15)'}) drop-shadow(0 0 150px ${imageColors[lightboxImage] || 'rgba(255,255,255,0.1)'})`,
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    transformOrigin: 'center center'
                  }}
                />
              </div>

              {/* Zoom Controls */}
              <div className="hidden md:flex flex-col gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    zoomIn();
                  }}
                  className="bg-black bg-opacity-70 text-white w-16 h-16 rounded-lg hover:bg-opacity-90 transition-all font-serif text-4xl"
                  title="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    zoomOut();
                  }}
                  className="bg-black bg-opacity-70 text-white w-16 h-16 rounded-lg hover:bg-opacity-90 transition-all font-serif text-4xl"
                  title="Zoom out"
                >
                  −
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetZoom();
                    }}
                    className="bg-black bg-opacity-70 text-white w-16 h-16 rounded-lg hover:bg-opacity-90 transition-all font-serif text-base"
                    title="Reset zoom"
                  >
                    1:1
                  </button>
                )}
              </div>
            </div>

            {/* Copyright Notice - Below image, centered */}
            <div className="text-center">
              <span className="text-white text-xs font-serif">
                © 2026 Seba Figueiras
              </span>
              <span className="text-zinc-400 text-xs font-serif"> · </span>
              <span className="text-zinc-400 text-xs font-serif">
                Todos los derechos reservados
              </span>
            </div>

            {/* Metadata Panel - Hidden, keeping for reference */}
            <div className="hidden flex-col gap-4 md:gap-6 max-w-full md:max-w-xs w-full md:w-auto">
              {/* Caption and Location */}
              {(lightboxCaptions[currentImageIndex] || lightboxLocations[currentImageIndex]) && (
                <div className="bg-black bg-opacity-70 px-6 py-4 rounded-lg">
                  {lightboxCaptions[currentImageIndex] && (
                    <p className="font-serif text-base text-white mb-2">
                      {lightboxCaptions[currentImageIndex]}
                    </p>
                  )}
                  {lightboxLocations[currentImageIndex] && (
                    <p className="font-serif text-sm text-zinc-400">
                      {lightboxLocations[currentImageIndex]}
                    </p>
                  )}
                </div>
              )}

              {/* EXIF Metadata Display */}
              {lightboxMetadata[currentImageIndex]?.exif && (
                <div className="bg-black bg-opacity-70 px-6 py-4 rounded-lg font-serif text-sm text-zinc-300 flex flex-col gap-3">
                  {lightboxMetadata[currentImageIndex]?.exif?.Make && lightboxMetadata[currentImageIndex]?.exif?.Model && (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs mb-1">Camera</span>
                      <span className="text-white">
                        {lightboxMetadata[currentImageIndex]?.exif?.Make} {lightboxMetadata[currentImageIndex]?.exif?.Model}
                      </span>
                    </div>
                  )}
                  {lightboxMetadata[currentImageIndex]?.exif?.LensModel && (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs mb-1">Lens</span>
                      <span className="text-white">
                        {lightboxMetadata[currentImageIndex]?.exif?.LensModel}
                      </span>
                    </div>
                  )}
                  {lightboxMetadata[currentImageIndex]?.exif?.FocalLength && (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs mb-1">Focal Length</span>
                      <span className="text-white">
                        {lightboxMetadata[currentImageIndex]?.exif?.FocalLength}mm
                      </span>
                    </div>
                  )}
                  {lightboxMetadata[currentImageIndex]?.exif?.FNumber && (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs mb-1">Aperture</span>
                      <span className="text-white">
                        {formatAperture(lightboxMetadata[currentImageIndex]?.exif?.FNumber)}
                      </span>
                    </div>
                  )}
                  {lightboxMetadata[currentImageIndex]?.exif?.ExposureTime && (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs mb-1">Shutter Speed</span>
                      <span className="text-white">
                        {formatExposureTime(lightboxMetadata[currentImageIndex]?.exif?.ExposureTime)}
                      </span>
                    </div>
                  )}
                  {lightboxMetadata[currentImageIndex]?.exif?.ISO && (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs mb-1">ISO</span>
                      <span className="text-white">
                        {lightboxMetadata[currentImageIndex]?.exif?.ISO}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Copyright Notice - Always visible */}
              <div className="bg-black bg-opacity-70 px-6 py-4 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-white text-xs font-serif">
                    © 2026 Seba Figueiras
                  </span>
                  <span className="text-zinc-400 text-xs mt-1 font-serif">
                    Todos los derechos reservados
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
