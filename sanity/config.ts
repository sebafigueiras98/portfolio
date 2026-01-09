import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'default',
  title: 'Photography Portfolio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  basePath: '/admin',

  plugins: [
    structureTool({
      structure: (S, context) => {
        return S.list()
          .title('Content')
          .items([
            // Gallery Images - Drag & Drop (also shows order numbers)
            orderableDocumentListDeskItem({
              type: 'galleryImage',
              title: 'Gallery Images',
              icon: () => '🖼️',
              S,
              context,
            }),
            // Orderable Featured Images (Carousel)
            orderableDocumentListDeskItem({
              type: 'featuredImage',
              title: 'Featured Images (Carousel)',
              icon: () => '⭐',
              S,
              context,
            }),
            // Featured Collection
            S.listItem()
              .title('Featured Collection')
              .icon(() => '📁')
              .child(
                S.documentTypeList('collection')
                  .title('Featured Collection')
              ),
          ]);
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
