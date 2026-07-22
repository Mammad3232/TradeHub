import React from 'react';
import { Newspaper, Calendar, Clock, ArrowRight, Sparkles, Tag } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  image: string;
}

const postsList: BlogPost[] = [
  {
    id: 1,
    title: 'Vendora Crosses $10M in Merchant Volume Across 120 Countries',
    category: 'Company News',
    date: 'July 18, 2026',
    readTime: '3 min read',
    summary: 'Our platform reaches a major global milestone as thousands of new independent brands join the creator-first economy.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Introducing Next-Gen Analytics for Independent Sellers',
    category: 'Product Update',
    date: 'July 10, 2026',
    readTime: '5 min read',
    summary: 'Analyze conversion metrics, customer retention, and live storefront visitor traffic with our brand-new analytics dashboard.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'How Audio Brand "Aether" Scaled 400% via Multi-Vendor Marketplace',
    category: 'Merchant Story',
    date: 'June 28, 2026',
    readTime: '4 min read',
    summary: 'Discover how premium wireless headphones manufacturer Aether Audio Labs expanded its reach across Europe and North America.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
];

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-wider mx-auto">
            <Newspaper className="w-4 h-4" />
            <span>Vendora Blog &amp; Press</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Latest News, Insights &amp; Creator Stories
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Stay updated with product releases, merchant growth guides, and platform milestones.
          </p>
        </div>

        {/* ── Blog Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {postsList.map((post) => (
            <article
              key={post.id}
              className="bg-[#0E1524] border border-slate-800 rounded-3xl overflow-hidden flex flex-col hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-600/90 text-white shadow-lg">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col space-y-3">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 group-hover:underline inline-flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
