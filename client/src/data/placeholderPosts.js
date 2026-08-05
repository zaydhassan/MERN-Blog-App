// ─────────────────────────────────────────────────────────────────────
//  Placeholder content for the homepage "Latest from the community" grid.
//
//  These are purely front-end presentation cards shown when no real blogs
//  exist yet, so the landing page never looks empty. They are NOT persisted
//  to the database and never reach the backend. When real posts arrive,
//  CommunitySection swaps them out automatically.
//
//  Data is randomized once per mount so every page load feels dynamic.
// ─────────────────────────────────────────────────────────────────────

// Premium Unsplash photography, one per topic. Direct CDN URLs with
// sizing params so they load fast and look crisp on retina screens.
const COVER_IMAGES = {
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  programming: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  ai: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
  design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
  startups: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
  productivity: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
  engineering: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  cybersecurity: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  cloud: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  ml: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
};

// Each entry pairs a topic with a pool of realistic, editorial titles +
// two-line descriptions. Mixing across pools is what makes the grid feel
// like a real, varied feed rather than six copies of the same idea.
const CONTENT = [
  {
    topic: "technology",
    category: "Technology",
    image: COVER_IMAGES.technology,
    titles: [
      "The quiet revolution of edge computing in 2026",
      "Why local-first software is winning developer hearts",
    ],
    descriptions: [
      "Latency is the new currency. How moving compute to the edge is reshaping the apps we use every day.",
      "Offline-first isn't a niche anymore — it's becoming the default for tools that respect your data.",
    ],
  },
  {
    topic: "programming",
    category: "Programming",
    image: COVER_IMAGES.programming,
    titles: [
      "Writing code that reads like good prose",
      "The art of the pull request: small, clear, kind",
    ],
    descriptions: [
      "Great code is written for humans first. A field guide to naming, structure, and clarity.",
      "How thoughtful PRs turn code review from a gatekeeper into a conversation.",
    ],
  },
  {
    topic: "ai",
    category: "AI",
    image: COVER_IMAGES.ai,
    titles: [
      "Prompting is composition: a writer's guide to LLMs",
      "Beyond the hype: where AI actually helps small teams",
    ],
    descriptions: [
      "Treating prompts like drafts — iterate, refine, and let the model surprise you.",
      "Three unglamorous workflows where AI quietly paid off for a five-person startup.",
    ],
  },
  {
    topic: "design",
    category: "Design",
    image: COVER_IMAGES.design,
    titles: [
      "Designing for calm: restraint as a feature",
      "The micro-interactions that make products feel alive",
    ],
    descriptions: [
      "Whitespace, motion, and hierarchy — how doing less can feel more premium.",
      "A tour of the tiny animated details that signal care and craft.",
    ],
  },
  {
    topic: "startups",
    category: "Startups",
    image: COVER_IMAGES.startups,
    titles: [
      "Launch smaller: the case for the tiniest viable product",
      "What I learned shipping one feature a week for a year",
    ],
    descriptions: [
      "Why the smallest possible launch beats the biggest planned one.",
      "A year of tiny, consistent releases — and what actually moved the needle.",
    ],
  },
  {
    topic: "productivity",
    category: "Productivity",
    image: COVER_IMAGES.productivity,
    titles: [
      "Deep work for people with noisy calendars",
      "The weekly review that actually sticks",
    ],
    descriptions: [
      "Practical focus tactics when your day is full of meetings and pings.",
      "A 20-minute ritual that compounds into a saner, sharper week.",
    ],
  },
  {
    topic: "engineering",
    category: "Engineering",
    image: COVER_IMAGES.engineering,
    titles: [
      "Refactors that pay for themselves",
      "How we cut our deploy time from 40 minutes to 4",
    ],
    descriptions: [
      "A framework for deciding when a rewrite is investment, not indulgence.",
      "The boring infrastructure wins that quietly compounded into velocity.",
    ],
  },
  {
    topic: "cybersecurity",
    category: "Security",
    image: COVER_IMAGES.cybersecurity,
    titles: [
      "Security as a habit, not a checkpoint",
      "The $0 audit: reviewing your own app like an attacker",
    ],
    descriptions: [
      "Building a culture where safe defaults are easier than risky ones.",
      "A practical self-audit checklist for small teams without a security org.",
    ],
  },
  {
    topic: "cloud",
    category: "Cloud",
    image: COVER_IMAGES.cloud,
    titles: [
      "Serverless, simplified: when to reach for it",
      "The cloud bill that shrank by 60%",
    ],
    descriptions: [
      "A clear-eyed look at where serverless shines and where it hurts.",
      "How tagging, scheduling, and right-sizing reclaimed a runaway budget.",
    ],
  },
  {
    topic: "ml",
    category: "Machine Learning",
    image: COVER_IMAGES.ml,
    titles: [
      "Feature stores, explained without the jargon",
      "From notebook to production without losing your mind",
    ],
    descriptions: [
      "What a feature store is, why it exists, and whether you need one yet.",
      "A pragmatic path for shipping your first ML model to real users.",
    ],
  },
];

// Avatar initials-only "authors" — no real people, just believable names.
const AUTHORS = [
  "Ava Mitchell", "Liam Chen", "Sofia Ramirez", "Noah Patel",
  "Maya Okafor", "Ethan Brooks", "Zara Khalil", "Leo Nakamura",
  "Isla Moreau", "Devon Park", "Nora Silva", "Kai Andersson",
];

// Rotating palette for avatar gradients so each face reads distinct.
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #C2410C 0%, #E8693A 100%)",
  "linear-gradient(135deg, #9A2E08 0%, #C2410C 100%)",
  "linear-gradient(135deg, #E8693A 0%, #F59E0B 100%)",
  "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
  "linear-gradient(135deg, #16A34A 0%, #0EA5E9 100%)",
  "linear-gradient(135deg, #7C3AED 0%, #C2410C 100%)",
];

// Deterministic-ish helpers (Math.random is fine here — this runs in the
// browser component tree, not in a constrained workflow sandbox).
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Days ago → a believable past date string (e.g. "Mar 18").
const daysAgoLabel = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Fisher–Yates shuffle so topic order varies per load.
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Build a single placeholder post from a content bucket + random metadata.
const buildPost = (bucket, index) => {
  const titleIdx = Math.floor(Math.random() * bucket.titles.length);
  const author = pick(AUTHORS);
  return {
    id: `placeholder-${index}`,
    placeholder: true,
    title: bucket.titles[titleIdx],
    description: bucket.descriptions[titleIdx],
    category: bucket.category,
    image: bucket.image,
    author,
    avatarGradient: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
    date: daysAgoLabel(randInt(1, 28)),
    readingTime: randInt(3, 12),
    likes: randInt(24, 480),
    comments: randInt(3, 64),
    trending: Math.random() > 0.55, // ~45% of cards get a trending badge
  };
};

// Generate `count` randomized placeholder posts. Picks distinct buckets so
// the grid shows a healthy mix of topics.
const generatePlaceholderPosts = (count = 6) =>
  shuffle(CONTENT)
    .slice(0, count)
    .map((bucket, i) => buildPost(bucket, i));

export default generatePlaceholderPosts;