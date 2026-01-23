import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export default defineType({
  name: 'featuredImage',
  title: 'Featured Images (Carousel)',
  type: 'document',
  fields: [
    orderRankField({ type: 'featuredImage' }),
    defineField({
      name: 'galleryImage',
      title: 'Gallery Image',
      type: 'reference',
      to: [{ type: 'galleryImage' }],
      description: 'Select an image from your gallery to feature in the carousel',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the carousel (lower numbers appear first)',
      hidden: true, // Hidden - use drag & drop to reorder instead
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'galleryImage.title',
      media: 'galleryImage.image',
      category: 'galleryImage.category',
    },
    prepare(selection) {
      const { title, media, category } = selection;
      const categoryLabels: Record<string, string> = {
        color: 'Color',
        blancoYNegro: 'B&W',
        series: 'Series',
      };
      return {
        title: title || 'Untitled',
        subtitle: category ? `From ${categoryLabels[category] || category} gallery` : '',
        media,
      };
    },
  },
});
