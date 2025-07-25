export const blogPosts = [
{
    id: "blog-post-h9jx59pwxs-4e2j4p3u",
    title: "The Ultimate Guide to Strategic Website Planning",
    content: "asdf",
    featuredImage: "",
    publishSchedule: null
  },
{
    id: "blog-post-h9jx7py5x8-263fh115",
    title: "How AI is Transforming Web Development in 2025",
    content: "fdsa",
    featuredImage: "",
    publishSchedule: null
  },
{
    id: "blog-post-h9jx8mz0gg-556j4r6l",
    title: "Maximising Performance with Next.js 15 and React 19",
    content: "turd",
    featuredImage: "",
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
  },
};
