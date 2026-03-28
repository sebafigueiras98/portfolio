import Link from "next/link";

interface CollectionImage {
  image?: {
    asset?: {
      url?: string;
    };
  };
}

interface CollectionData {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  subtitle?: string;
  description: string;
  previewImages: CollectionImage[];
}

interface NewCollectionProps {
  collection: CollectionData | null;
}

export default function NewCollection({ collection }: NewCollectionProps) {
  if (!collection || !collection.previewImages || collection.previewImages.length !== 3) {
    return null;
  }

  const collectionUrl = collection.slug?.current
    ? `/collection/${collection.slug.current}`
    : '#';

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1199px] mx-auto px-6 md:px-10">
        <Link href={collectionUrl} className="block">
          <div className="rounded-[32px] md:rounded-[48px] p-6 md:p-10 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: '#2b2b2b' }}>
            <div className="flex flex-col md:flex-row items-start md:items-stretch" style={{ gap: '40px' }}>
            {/* Stacked Images Container - single image on mobile, stacked on desktop */}
            <div className="relative flex-shrink-0 h-[320px] w-full md:h-[428px] md:w-[357px]">
              {/* Mobile: Single centered image */}
              <div
                className="md:hidden absolute h-full w-full rounded-[8px] overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${collection.previewImages[0]?.image?.asset?.url})`,
                  }}
                />
              </div>

              {/* Desktop: Third image (back) - z-index 1 */}
              <div
                className="hidden md:block absolute h-full w-[213px] rounded-[8px] overflow-hidden left-[144px]"
                style={{
                  zIndex: 1,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${collection.previewImages[2]?.image?.asset?.url})`,
                  }}
                />
              </div>

              {/* Desktop: Second image (middle) - z-index 2, offset to left */}
              <div
                className="hidden md:block absolute h-full w-[213px] rounded-[8px] overflow-hidden left-[72px]"
                style={{
                  zIndex: 2,
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${collection.previewImages[1]?.image?.asset?.url})`,
                  }}
                />
              </div>

              {/* Desktop: First image (front/top) - z-index 3, leftmost position */}
              <div
                className="hidden md:block absolute h-full w-[213px] rounded-[8px] overflow-hidden left-0"
                style={{
                  zIndex: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${collection.previewImages[0]?.image?.asset?.url})`,
                  }}
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col md:justify-between flex-grow md:min-h-[428px] text-center md:text-left w-full gap-6 md:gap-0">
              <div className="flex flex-col" style={{ gap: '0px' }}>
                {collection.subtitle && (
                  <p className="font-serif text-[16px] md:text-[24px] text-white/60 leading-normal">
                    {collection.subtitle}
                  </p>
                )}
                <h2 className="font-serif text-[32px] md:text-[48px] text-white leading-normal">
                  {collection.title}
                </h2>
                <p className="font-serif text-[16px] md:text-[24px] text-white leading-normal">
                  {collection.description}
                </p>
              </div>

              <span className="font-serif text-[24px] md:text-[32px] text-white underline leading-normal text-center md:text-left w-full md:w-auto md:self-start">
                ver más
              </span>
            </div>
          </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
