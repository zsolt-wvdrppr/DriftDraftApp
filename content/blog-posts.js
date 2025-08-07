// Auto-generated metadata for efficient listing
export const blogPostsMeta = blogPosts.map(post => ({
  id: post.id,
  title: post.title,
  publishDate: post.publishDate,
  categories: post.categories,
  tags: post.tags,
  featuredImage: post.featuredImage,
  excerpt: post.content ? post.content.substring(0, 200).replace(/[#*`]/g, '').trim() + '...' : ''
}));

export const blogPosts = [
{
    id: "blog-post-h9xw3ljbv4-283e4j56",
    tags: [
      {
        type: "SEO"
      }
    ],
    title: "Another post",
    pinned: false,
    content: "Will be another post",
    categories: [
      {
        type: ""
      }
    ],
    publishDate: "2025-08-07",
    featuredImage: "",
    publishSchedule: null
  },
{
    id: "blog-post-h9qitp8ztn-1p51263v",
    tags: [
      {
        type: "website planning"
      },
      {
        type: "business strategy"
      },
      {
        type: "conversion psychology"
      },
      {
        type: "cheap websites"
      },
      {
        type: "cheap websites"
      }
    ],
    title: "The \"Cheap and Minimal\" Website Trap: Why Smart Business Owners Think Differently",
    pinned: false,
    content: `You're a business owner who started your company to make real money, not to blend into the background with a website that screams "budget constraints."

Yet here's what happens: successful entrepreneurs walk into web design conversations saying "I want something cheap and minimal" – completely unaware they're about to sabotage their own success.

## The Dangerous Confusion

There's a world of difference between strategic minimalism and cutting corners. Most business owners don't realise they're confusing two completely different approaches:

**Strategic Minimalism** (what Apple does): Every element serves a specific psychological purpose. Clean lines guide attention to conversion points. Carefully chosen colours trigger the right emotions. White space builds trust through perceived professionalism.

**"Cheap and Minimal"** (what struggling businesses do): Removing essential elements to save money. Missing crucial trust signals. No consideration for user psychology. Confusing "less stuff" with "smart design."

## Why Your Website Needs to Work Like a Well-Oiled Cricket Bat

Your website is your 24/7 salesperson. Would you hire the cheapest salesperson available?

A cricket bat needs to perform flawlessly when it matters – that crucial moment when the ball comes flying. Your website faces the same pressure when prospects are deciding whether to trust you with their money.

Every element should serve a purpose:

* **Colour psychology** that guides emotions
* **Trust signals** that reduce anxiety
* **User flow** that feels natural, not confusing
* **Persuasion triggers** that address real concerns

## The Hidden Cost of "Minimal Investment"

While you're saving £500 on "unnecessary" features, your competitors with strategic websites are stealing customers.

That "minimal" contact form missing trust badges? It's costing you conversions. That stripped-back design without social proof? Visitors are clicking away to competitors who look more established.

The brutal truth: cheap websites signal to customers that you don't invest in your own business. If you won't back yourself, why should they?

## What Strategic Businesses Do Instead

Smart business owners understand that website investment isn't an expense – it's their most valuable marketing asset working around the clock.

They ask different questions:

* How do we guide visitors emotionally from interest to purchase?
* What psychological triggers does our audience respond to?
* Which trust signals eliminate buying hesitation?
* How do we position against competitors without looking desperate?

This is where **strategic planning** becomes crucial. You don't need to be a marketer to get this right – but you do need to think beyond budget constraints.

## The DriftDraft Difference

This is precisely why we built DriftDraft. Instead of guessing what your business needs, our strategic planner guides you through proven psychological frameworks:

* **Identity positioning** that makes visitors think "this is for me"
* **Emotional mapping** that guides feelings throughout the user journey
* **Authority establishment** that builds trust before the sale
* **Competitor analysis** that positions you strategically
* **Conversion psychology** that turns visits into customers

You don't need marketing expertise – DriftDraft translates your business knowledge into strategic website requirements that actually convert.

## The Bottom Line

Minimalism isn't the problem – minimal thinking is.

Strategic websites feel effortless because every element has been planned with psychological precision. Cheap websites feel cheap because corners were cut where they matter most.

Your business deserves a website that works as hard as you do. The question isn't whether you can afford strategic planning – it's whether you can afford not to have it.

***

**Ready to move beyond "cheap and minimal"?** Try DriftDraft's strategic  planner and discover what your website could achieve with proper psychological planning behind it.

***`,
    categories: [
      {
        type: "Website Strategy"
      },
      {
        type: "Business Growth"
      },
      {
        type: "Marketing Psychology"
      }
    ],
    publishDate: "2025-07-31",
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