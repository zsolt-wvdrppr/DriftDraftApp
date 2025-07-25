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
    id: "blog-post-h9jx7py5x8-263fh115",
    title: "How AI is Transforming Web Development in 2025",
    content: `# How AI is Transforming Web Development in 2025

The web development landscape has changed dramatically over the past year. AI tools are no longer just helpful assistants—they're becoming integral parts of the development process, changing how we approach everything from planning to deployment.

## AI in the Planning Phase

One of the most exciting developments is AI-powered requirement gathering. Tools that can analyse business needs and generate comprehensive development specifications are becoming increasingly sophisticated.

**Benefits we're seeing:**
- More thorough requirement documentation
- Reduced miscommunication between clients and developers
- Faster project kickoff times
- Better scope definition

## Code Generation and Assistance

Modern AI coding assistants have evolved beyond simple autocomplete:

### What's Working Well:
- **Component generation:** Creating reusable React components from descriptions
- **API integration:** Automatically generating client-side code for API endpoints
- **Testing assistance:** Writing comprehensive test suites
- **Documentation:** Keeping code documentation current and accurate

### What Still Needs Human Oversight:
- Architecture decisions
- Performance optimisation
- Security considerations
- Complex business logic

## The User Experience Revolution

AI is particularly powerful in UX/UI design:

**Personalisation at scale:** Websites that adapt content and layout based on user behaviour patterns.

**Accessibility improvements:** Automated alt-text generation, colour contrast checking, and screen reader optimisation.

**Content optimisation:** AI analysing user engagement to suggest content improvements.

## Real-World Implementation

Here's how we're integrating AI into our development workflow:

1. **Requirements gathering:** AI-powered forms that educate clients whilst collecting detailed specifications
2. **Prototyping:** Rapid wireframe and mockup generation
3. **Development:** Code assistance and automated testing
4. **Optimisation:** Performance monitoring and improvement suggestions

## Looking Ahead

The key is finding the right balance. AI excels at handling repetitive tasks and providing intelligent suggestions, but human creativity and strategic thinking remain irreplaceable.

*The most successful development teams in 2025 will be those that thoughtfully integrate AI tools whilst maintaining focus on user needs and business objectives.*`,
    featuredImage: "",
    publishSchedule: null,
  },
  {
    id: "blog-post-h9jx8mz0gg-556j4r6l",
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

\`\`\`jsx
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
\`\`\`

## Form Handling with Actions

React 19's form Actions eliminate much of the complexity around form state management.

### Before (Complex state management):
Multiple useState hooks, loading states, error handling, and submission logic scattered throughout components.

### After (Using Actions):
Clean, declarative forms with built-in loading and error states.

\`\`\`jsx
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
\`\`\`

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
    publishDate: "2025-07-25",
    featuredImage: "",
    publishSchedule: null,
  },
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