export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: string | number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content?: string[];
  author?: BlogAuthor;
  image: string;
  link: string;
  isExternal?: boolean;
}

export const initialBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Vendora Crosses $10M in Merchant Volume Across 120 Countries',
    category: 'Company News',
    date: 'July 18, 2026',
    readTime: '3 min read',
    summary: 'Our platform reaches a major global milestone as thousands of new independent brands join the creator-first economy.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    link: '/blog/1',
    author: {
      name: 'Elena Rostova',
      role: 'Head of Global Communications',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: [
      'We are thrilled to announce that Vendora has officially surpassed $10 million in cumulative Gross Merchandise Volume (GMV). This monumental achievement represents the dedication and passion of over 4,000 independent brands, creators, and artisan sellers operating across 120 countries.',
      'When we launched Vendora, our goal was simple: lower the barrier to entry for cross-border commerce and empower creators to build direct relationships with their global audience. Today’s milestone validates that creator-first commerce is not just a trend—it is the future of global retail.',
      'Looking ahead to the remainder of 2026, we are doubling down on international fulfillment infrastructure, instant multi-currency settlement, and AI-driven storefront personalization tools to help our sellers reach their next $100M.',
    ],
  },
  {
    id: 2,
    title: 'Introducing Next-Gen Analytics for Independent Sellers',
    category: 'Product Update',
    date: 'July 10, 2026',
    readTime: '5 min read',
    summary: 'Analyze conversion metrics, customer retention, and live storefront visitor traffic with our brand-new analytics dashboard.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    link: '/blog/2',
    author: {
      name: 'Marcus Chen',
      role: 'VP of Product Architecture',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    content: [
      'Understanding customer behavior is essential for any growing brand. Today, we are excited to roll out our completely redesigned Merchant Analytics Dashboard—engineered from the ground up to deliver real-time data clarity without the complexity of traditional enterprise suites.',
      'Key highlights of the new dashboard include live active visitor tracking, multi-channel attribution breakdown, automated funnel conversion mapping, and intelligent cohort retention metrics.',
      'All Vendora merchants can access the new analytics panel starting today directly from their vendor portal under the Analytics tab.',
    ],
  },
  {
    id: 3,
    title: 'How Audio Brand "Aether" Scaled 400% via Multi-Vendor Marketplace',
    category: 'Merchant Story',
    date: 'June 28, 2026',
    readTime: '4 min read',
    summary: 'Discover how premium wireless headphones manufacturer Aether Audio Labs expanded its reach across Europe and North America.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    link: '/blog/3',
    author: {
      name: 'Sophia Al-Mansoor',
      role: 'Creator Community Lead',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    content: [
      'Founded in Berlin in 2024, Aether Audio Labs started as a boutique design studio making handcrafted studio-grade headphones. But like many independent manufacturers, scaling international distribution while maintaining brand integrity proved challenging.',
      'By joining Vendora’s multi-vendor ecosystem, Aether gained instant access to localized checkout in 30+ currencies, integrated customs compliance, and streamlined fulfillment routing.',
      'Within just 12 months, Aether’s quarterly revenue skyrocketed by 400%, expanding their customer base to over 45 countries while relying on Vendora to handle payment processing and vendor payouts.',
    ],
  },
  {
    id: 4,
    title: '5 E-Commerce Conversion Strategies for Modern Brands in 2026',
    category: 'Growth Guide',
    date: 'June 15, 2026',
    readTime: '6 min read',
    summary: 'Learn actionable checkout optimization tips and AI-assisted personalized recommendations to lift average order value.',
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80',
    link: '/blog/4',
    author: {
      name: 'David Vance',
      role: 'Growth Marketing Director',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    content: [
      'Optimizing conversion rates in 2026 requires more than just fast loading times. Modern consumers expect frictionless checkout experiences, intelligent product discovery, and transparent shipping policies.',
      '1. Leverage Instant One-Click Checkout: Reducing friction at checkout increases conversion by up to 28%.',
      '2. Display Real-Time Social Proof: Highlighting verified purchase reviews and active stock counters builds buyer confidence.',
      '3. Personalize Related Product Recommendations: Dynamic cross-sell modules consistently increase Average Order Value (AOV).',
    ],
  },
  {
    id: 5,
    title: 'Vendora Partner Ecosystem Expands with Global Logistics Partners',
    category: 'Press Release',
    date: 'May 30, 2026',
    readTime: '4 min read',
    summary: 'Sellers can now access instant shipping rate calculations and automated international customs handling directly from their dashboard.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    link: '/blog/5',
    author: {
      name: 'Elena Rostova',
      role: 'Head of Global Communications',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: [
      'Vendora today announced strategic partnerships with leading global logistics providers to streamline cross-border fulfillment for all platform merchants.',
      'Through these integrations, sellers can generate automated customs documentation, print discounted shipping labels, and provide real-time end-to-end tracking to buyers globally.',
    ],
  },
  {
    id: 6,
    title: 'Building a Sustainable Marketplace: Our 2026 Climate Commitment',
    category: 'Sustainability',
    date: 'May 12, 2026',
    readTime: '5 min read',
    summary: 'Read about our net-zero shipping carbon offset program and eco-certified packaging standard for all participating vendors.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    link: '/blog/6',
    author: {
      name: 'Marcus Chen',
      role: 'VP of Product Architecture',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    content: [
      'Environmental responsibility is at the heart of our mission. Today we are pledging to achieve net-zero operational carbon emissions across all Vendora-managed operations by the end of 2026.',
      'Our initiatives include 100% carbon-neutral shipping offsets for all platform orders and eco-friendly packaging standards for participating sellers.',
    ],
  },
];
