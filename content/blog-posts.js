export const blogPosts = [];

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