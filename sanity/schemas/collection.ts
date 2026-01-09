import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'collection',
  title: 'Featured Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Collection Title',
      type: 'string',
      description: 'The main title for the collection (e.g., "Mendoza 2025")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (click "Generate" to auto-create from title)',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Small text above the title (e.g., "NUEVA COLECCIÓN")',
      initialValue: 'NUEVA COLECCIÓN',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the collection',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'previewImages',
      title: 'Preview Images',
      type: 'array',
      description: 'Select 3 images from the collection for the stacked preview on homepage',
      of: [{
        type: 'reference',
        to: [{ type: 'galleryImage' }],
      }],
      validation: (Rule) => Rule.required().length(3),
    }),
    defineField({
      name: 'isActive',
      title: 'Show on Homepage',
      type: 'boolean',
      description: 'Toggle to show/hide this collection on the homepage',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      previewImage: 'previewImages.0.image',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, subtitle, previewImage, isActive } = selection;
      return {
        title: `${title} ${!isActive ? '(Hidden)' : ''}`,
        subtitle: subtitle,
        media: previewImage,
      };
    },
  },
});
