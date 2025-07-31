export const blogPosts = [
{
    id: "blog-post-h9qitp8ztn-1p51263v",
    tags: [],
    title: "The \"Cheap and Minimal\" Website Trap: Why Smart Business Owners Think Differently",
    pinned: false,
    content: "s",
    categories: [],
    publishDate: "",
    featuredImage: {
      id: "ab4a4c29-db42-496a-b757-f17bd24bd352",
      alt: "Well oiled cricket bat shoots into the digital world",
      src: "https://wavedropper-cms.supabase.co/storage/v1/object/public/media/driftdraft.app/1753989620980-cricketbatdigital.webp",
      mediaId: "ab4a4c29-db42-496a-b757-f17bd24bd352"
    },
    publishSchedule: null
  }
];

export const blogPostsSchema = {
  name: "Blog Post",
  fields: {
    id: {
      type: "string",
      required: true,
      maxLength: 50,
      disabled: true,
    },
    publishSchedule: {
      type: "scheduler",
      label: "Publication Schedule",
      description: "Schedule when this post should be automatically published",
      required: false,
      includeAuthor: true,
    },
    publishDate: {
      type: "date",
    },
    pinned: {
      type: "boolean",
      label: "Pinned Post",
    },
    featuredImage: {
      type: "image",
      description: "Post thumbnail and featured image",
    },
    title: {
      type: "string",
      required: true,
      maxLength: 100,
    },
    content: {
      type: "markdown",
      required: true,
    },
    tags: {
      type: "repeater",
      fields: { type: "string" },
      max_items: 5,
      label: "Tags",
    },
    categories: {
      type: "repeater",
      fields: { type: "string" },
      max_items: 5,
      label: "Categories",
    },
  },
};