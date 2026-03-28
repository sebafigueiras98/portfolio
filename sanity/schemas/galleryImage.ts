import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export default defineType({
  name: 'galleryImage',
  title: 'Gallery Images',
  type: 'document',
  fields: [
    orderRankField({ type: 'galleryImage' }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal name for this image',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Color', value: 'color' },
          { title: 'Blanco y Negro', value: 'blancoYNegro' },
          { title: 'Series', value: 'series' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Position in the gallery (lower numbers appear first)',
      hidden: true, // Hidden - use drag & drop to reorder instead
      initialValue: 0,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      description: 'Optional caption or description for this image',
      rows: 3,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Where was this photo taken?',
    }),
    defineField({
      name: 'collections',
      title: 'Collections',
      type: 'array',
      description: 'Add this image to one or more collections (optional)',
      of: [{
        type: 'reference',
        to: [{ type: 'collection' }],
        weak: true, // Prevents errors if collection is deleted
      }],
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Category, then Order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      category: 'category',
      collections: 'collections',
    },
    prepare(selection) {
      const { title, media, category, collections } = selection;
      const categoryLabels: Record<string, string> = {
        color: 'Color',
        blancoYNegro: 'B&W',
        series: 'Series',
      };
      const collectionCount = collections?.length || 0;
      const collectionInfo = collectionCount > 0 ? ` • ${collectionCount} collection${collectionCount > 1 ? 's' : ''}` : '';
      return {
        title: title,
        subtitle: `${categoryLabels[category] || category}${collectionInfo}`,
        media,
      };
    },
  },
});
