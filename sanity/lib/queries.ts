export const FEATURED_IMAGES_QUERY = `*[_type == "featuredImage"] | order(orderRank) {
  _id,
  title,
  image {
    asset-> {
      url,
      metadata {
        dimensions,
        exif {
          ISO,
          ExposureTime,
          FNumber,
          FocalLength,
          LensModel,
          Make,
          Model,
          DateTimeOriginal
        }
      }
    }
  },
  caption,
  location,
  order
}`;

export const GALLERY_IMAGES_QUERY = `*[_type == "galleryImage" && category == $category] | order(orderRank) {
  _id,
  title,
  image {
    asset-> {
      url,
      metadata {
        dimensions,
        exif {
          ISO,
          ExposureTime,
          FNumber,
          FocalLength,
          LensModel,
          Make,
          Model,
          DateTimeOriginal
        }
      }
    }
  },
  caption,
  location,
  category,
  order
}`;

export const ALL_GALLERY_IMAGES_QUERY = `*[_type == "galleryImage"] | order(orderRank) {
  _id,
  title,
  image {
    asset-> {
      url,
      metadata {
        dimensions,
        exif {
          ISO,
          ExposureTime,
          FNumber,
          FocalLength,
          LensModel,
          Make,
          Model,
          DateTimeOriginal
        }
      }
    }
  },
  caption,
  location,
  category,
  order
}`;

export const FEATURED_COLLECTION_QUERY = `*[_type == "collection" && isActive == true][0] {
  _id,
  title,
  slug,
  subtitle,
  description,
  previewImages[]-> {
    image {
      asset-> {
        url
      }
    }
  }
}`;

export const COLLECTION_BY_SLUG_QUERY = `*[_type == "collection" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  subtitle,
  description,
  "allImages": *[_type == "galleryImage" && references(^._id)] | order(orderRank) {
    _id,
    title,
    image {
      asset-> {
        url,
        metadata {
          dimensions
        }
      }
    },
    caption,
    location
  }
}`;
