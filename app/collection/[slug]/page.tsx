'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { client, urlFor } from "@/sanity/lib/client";
import { COLLECTION_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { FastAverageColor } from "fast-average-color";

interface ImageMetadata {
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

interface CollectionImage {
  _id: string;
  title: string;
  image: {
    asset?: {
      url?: string;
      metadata?: ImageMetadata;
    };
  };
  caption?: string;
  location?: string;
}

interface Collection {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  subtitle?: string;
  description: string;
  allImages: CollectionImage[];
}

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [slug, setSlug] = useState<string | null>(null);
  const router = useRouter();

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxCaptions, setLightboxCaptions] = useState<(string | undefined)[]>([]);
  const [lightboxLocations, setLightboxLocations] = useState<(string | undefined)[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageColors, setImageColors] = useState<Record<string, string>>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchCollection = async () => {
      try {
        console.log('Fetching collection with slug:', slug);
        const data = await client.fetch(COLLECTION_BY_SLUG_QUERY, { slug });
        console.log('Collection data received:', data);
        console.log('Has images:', data?.allImages?.length || 0);
        setCollection(data);
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [slug]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // Extract colors from collection images
  useEffect(() => {
    if (!collection || collection.allImages.length === 0) return;

    const fac = new FastAverageColor();
    const extractColors = async () => {
      const colors: Record<string, string> = {};

      for (const image of collection.allImages) {
        try {
          const imageUrl = urlFor(image.image).width(100).height(100).url();
          const color = await fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' });
          const rgbaMatch = color.rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
          if (rgbaMatch) {
            colors[image.image?.asset?.url || ''] = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, 0.3)`;
          } else {
            colors[image.image?.asset?.url || ''] = color.rgba;
          }
        } catch (error) {
          console.error('Error extracting color:', error);
          colors[image.image?.asset?.url || ''] = 'rgba(100, 100, 150, 0.3)';
        }
      }

      setImageColors(colors);
    };

    extractColors();

    return () => {
      fac.destroy();
    };
  }, [collection]);

  // Lightbox functions
  const openLightbox = (
    imageUrl: string,
    allImages: string[],
    captions: (string | undefined)[],
    locations: (string | undefined)[],
    index: number
  ) => {
    setLightboxImage(imageUrl);
    setLightboxImages(allImages);
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
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

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
    const handleWheel = (e: Event) => {
      if (!lightboxImage) return;

      const wheelEvent = e as WheelEvent;
      e.preventDefault();
      if (wheelEvent.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };

    const lightboxContainer = document.querySelector('.lightbox-container');
    if (lightboxContainer) {
      lightboxContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => lightboxContainer.removeEventListener('wheel', handleWheel);
    }
  }, [lightboxImage, zoomLevel]);

  // Disable body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [lightboxImage]);

  // Copyright protection: disable right-click and drag on images
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    const preventDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('dragstart', preventDrag);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('dragstart', preventDrag);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="font-serif text-2xl">Loading...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl mb-4">Collection not found</p>
          <Link href="/" className="font-serif text-xl underline hover:opacity-70">
            volver
          </Link>
        </div>
      </div>
    );
  }

  const displayedImages = collection.allImages.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Main Content Container */}
      <div className="max-w-[1199px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="flex flex-col gap-12 md:gap-14">
          {/* Back Link */}
          <Link
            href="/"
            className="font-serif text-[24px] md:text-[32px] underline hover:opacity-70 transition-opacity self-start"
          >
            volver
          </Link>

          {/* Collection Header */}
          <div className="flex flex-col" style={{ gap: '0px' }}>
            {collection.subtitle && (
              <p className="font-serif text-[16px] md:text-[24px] text-white/60 leading-normal">
                {collection.subtitle}
              </p>
            )}
            <h1 className="font-serif text-[32px] md:text-[48px] text-white leading-normal">
              {collection.title}
            </h1>
            <p className="font-serif text-[16px] md:text-[24px] text-white leading-normal">
              {collection.description}
            </p>
          </div>

          {/* Image Grid - 4 columns on desktop, 2 on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {displayedImages.map((item, index) => {
              const imageUrl = item.image?.asset?.url;
              if (!imageUrl) return null;

              return (
                <div
                  key={item._id}
                  className="relative aspect-[2/3] rounded-[16px] md:rounded-[24px] overflow-hidden bg-zinc-800 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const allImageUrls = collection.allImages
                      .map(img => img.image?.asset?.url)
                      .filter(Boolean) as string[];
                    const captions = collection.allImages.map(img => img.caption);
                    const locations = collection.allImages.map(img => img.location);
                    openLightbox(imageUrl, allImageUrls, captions, locations, index);
                  }}
                >
                  <Image
                    src={urlFor(item.image).width(400).height(600).url()}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCount < collection.allImages.length && (
            <button
              onClick={loadMore}
              className="font-serif text-[24px] md:text-[32px] text-white underline hover:opacity-70 transition-opacity self-center"
            >
              cargar más
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
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
            {/* Location - Above image, centered */}
            {lightboxLocations[currentImageIndex] && (
              <div className="text-center">
                <span className="text-white text-base font-serif">
                  {lightboxLocations[currentImageIndex]}
                </span>
              </div>
            )}

            {/* Image - Centered */}
            <div className="relative flex items-center justify-center">
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
                  className="max-w-full md:max-w-[80vw] max-h-[70vh] md:max-h-[85vh] object-contain select-none pointer-events-none relative z-10 transition-transform duration-200"
                  draggable="false"
                  style={{
                    filter: `drop-shadow(0 0 250px ${imageColors[lightboxImage] || 'rgba(255,255,255,0.15)'}) drop-shadow(0 0 150px ${imageColors[lightboxImage] || 'rgba(255,255,255,0.1)'})`,
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    transformOrigin: 'center center'
                  }}
                />
              </div>

              {/* Zoom Controls - Absolutely positioned to the right */}
              <div className="hidden md:flex flex-col gap-3 absolute right-0 translate-x-[calc(100%+2rem)]">
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
          </div>
        </div>
      )}
    </div>
  );
}
