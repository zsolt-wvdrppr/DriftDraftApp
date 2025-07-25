export const blogPosts = [
{
    id: "blog-post-h9jx59pwxs-4e2j4p3u",
    tags: [],
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
    categories: [],
    publishDate: "",
    featuredImage: {
      id: "a6080fb6-5bf8-4506-9026-748ad6ca056a",
      alt: "",
      src: "https://wavedropper-cms.supabase.co/storage/v1/object/public/media/driftdraft.app/1753469728568-realistic-water-drop-with-ecosystem-world-water-day.webp",
      mediaId: "a6080fb6-5bf8-4506-9026-748ad6ca056a"
    },
    publishSchedule: null
  },
{
    id: "blog-post-h9jx7py5x8-263fh115",
    tags: [],
    title: "How AI is Transforming Web Development in 2025",
    content: `# How AI is Transforming Web Development in 2025

The web development landscape has changed dramatically over the past year. AI tools are no longer just helpful assistants—they're becoming integral parts of the development process, changing how we approach everything from planning to deployment.

## AI in the Planning Phase

One of the most exciting developments is AI-powered requirement gathering. Tools that can analyse business needs and generate comprehensive development specifications are becoming increasingly sophisticated.

**Benefits we're seeing:asfasefasdf**

\`\`\`javascript
code block
\`\`\`

sdfsdfsadf

\`\`\`javascript
code block
\`\`\`

* More thorough requirement documentationasdfasdf
* Reduced miscommunication between clients and developers
* Faster project kickoff times
* Better scope definition

## Code Generation and Assistance

Modern AI coding assistants have evolved beyond simple autocomplete:

### What's Working Well:

* **Component generation:** Creating reusable React components from descriptions
* **API integration:** Automatically generating client-side code for API endpoints
* **Testing assistance:** Writing comprehensive test suites
* **Documentation:** Keeping code documentation current and accurate

### What Still Needs Human Oversight:

* Architecture decisions
* Performance optimisation
* Security considerations
* Complex business logic

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
    categories: [],
    publishDate: "",
    featuredImage: {
      id: "fdb348bb-78ed-4c57-903e-dace1a386de0",
      alt: "",
      src: "https://wavedropper-cms.supabase.co/storage/v1/object/public/media/driftdraft.app/1753439250116-2150689404.webp",
      mediaId: "fdb348bb-78ed-4c57-903e-dace1a386de0"
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