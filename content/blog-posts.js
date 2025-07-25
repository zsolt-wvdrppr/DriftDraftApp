export const blogPosts = [
{
    id: "blog-post-h9jx59pwxs-4e2j4p3u",
    title: "The Ultimate Guide to Strategic Website Planning",
    content: `# The Ultimate Guide to Strategic Website Planning

Creating a successful website isn't just about making something that looks good—it's about building a strategic tool that drives your business forward. After years of helping businesses transform their online presence, I've learnt that the most successful websites start with proper planning.

## Why Strategic Planning Matters

Think of your website like a physical shop. You wouldn't just throw products randomly on shelves and hope customers find what they need. Similarly, your website needs a clear structure that guides visitors towards your goals.

**Key benefits of strategic planning:**
- Improved user experience and navigation
- Higher conversion rates
- Better search engine rankings
- Reduced development costs and time
- Clear alignment with business objectives

## The Planning Process

### 1. Define Your Goals
Before touching any design software, ask yourself:
- What do you want visitors to do on your site?
- How does this website support your business objectives?
- What success looks like to you?

### 2. Understand Your Audience
Research your target users thoroughly:
- Demographics and preferences
- Pain points and challenges
- How they currently find solutions
- Their journey from awareness to purchase

### 3. Map User Journeys
Create clear paths for different user types:
- First-time visitors seeking information
- Returning customers looking for specific services
- Prospects ready to make a decision

## Common Planning Mistakes

**Dead ends:** Pages that don't guide users to the next logical step. Every page should have a clear purpose and next action.

**Information overload:** Trying to say everything at once rather than prioritising key messages.

**Technology-first thinking:** Choosing flashy features before understanding user needs.

## Getting Started

The best websites begin with asking the right questions. Whether you're planning a simple brochure site or a complex e-commerce platform, take time to map out your strategy before diving into design.

*Ready to plan your strategic website? Start by clearly defining what success looks like for your business online.*`,
    featuredImage: "",
    publishSchedule: null,
  },
{
    id: "blog-post-h9jx8mz0gg-556j4r6l",
    tags: [
      {
        type: "ai"
      },
      {
        type: "nextjs"
      }
    ],
    title: "Maximising Performance with Next.js 15 and React 19",
    content: `# Maximising Performance with Next.js 15 and React 19

The latest versions of Next.js and React bring significant performance improvements and developer experience enhancements. Having spent the last few months working with these technologies on production projects, here are the key insights for getting the most out of them.

## Server Components: The Game Changer

React 19's Server Components fundamentally change how we think about application architecture.

### Key Benefits:
- **Reduced bundle size:** Server-side rendering means less JavaScript shipped to clients
- **Improved SEO:** Content rendered on the server is immediately available to search engines
- **Better performance:** Especially noticeable on slower devices and connections

### Implementation Strategy:
Start by identifying components that don't need client-side interactivity. Forms, content displays, and data presentations are excellent candidates for Server Components.

\\`\\`\\`jsx
// Server Component example
export default async function ProductList() {
  const products = await fetchProducts();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\\`\\`\\`

## Form Handling with Actions

React 19's form Actions eliminate much of the complexity around form state management.

### Before (Complex state management):
Multiple useState hooks, loading states, error handling, and submission logic scattered throughout components.

### After (Using Actions):
Clean, declarative forms with built-in loading and error states.

\\`\\`\\`jsx
import { useActionState } from 'react';

function ContactForm() {
  const [state, submitAction, isPending] = useActionState(
    submitContactForm,
    { message: '', errors: {} }
  );
  
  return (
    <form action={submitAction}>
      <input name="email" type="email" required />
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state.errors.email && <span>{state.errors.email}</span>}
    </form>
  );
}
\\`\\`\\`

## Performance Optimisation Strategies

### 1. Strategic Component Splitting
Not everything needs to be a Server Component. Interactive elements like forms, modals, and dynamic content should remain client-side.

### 2. Effective Caching
Next.js 15's improved caching mechanisms work brilliantly with Server Components:
- API routes are cached by default
- Database queries can be cached at the component level
- Static generation for content that doesn't change frequently

### 3. Progressive Enhancement
Build your application to work without JavaScript first, then enhance with client-side functionality.

## Common Pitfalls to Avoid

**Over-optimisation:** Don't convert every component to a Server Component. Client-side rendering is still necessary for interactive features.

**Ignoring hydration:** Be mindful of the server-client boundary. Mismatched content can cause hydration errors.

**Neglecting error boundaries:** Server Components can fail differently than client components. Proper error handling is crucial.

## Real-World Results

In our recent projects, we've seen:
- 40% reduction in initial bundle size
- 25% improvement in Core Web Vitals scores
- Significantly simplified form handling code
- Better developer experience with less boilerplate

## Getting Started

If you're planning to upgrade, start small:
1. Convert static content components to Server Components
2. Implement one form using Actions
3. Gradually expand as you become comfortable with the patterns

The learning curve is manageable, and the performance benefits make it worthwhile for most applications.

*These technologies represent a significant step forward for React applications. The key is understanding when and how to use each feature effectively.*`,
    categories: [
      {
        type: "it"
      }
    ],
    publishDate: "2025-07-25",
    featuredImage: {
      id: "a6080fb6-5bf8-4506-9026-748ad6ca056a",
      alt: "",
      src: `https://wavedropper-cms.supabase.co/storage/v1/object/public/media/driftdraft.app/1753469728568-realistic-water-drop-with-ecosystem-world-water-day.webp`,
      mediaId: "a6080fb6-5bf8-4506-9026-748ad6ca056a"
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
