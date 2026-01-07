export const FEATURED_IMAGES_QUERY = `*[_type == "featuredImage"] | order(order asc) {
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

export const GALLERY_IMAGES_QUERY = `*[_type == "galleryImage" && category == $category] | order(order asc) {
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

export const ALL_GALLERY_IMAGES_QUERY = `*[_type == "galleryImage"] | order(order asc) {
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
