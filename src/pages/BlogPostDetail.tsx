import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Newspaper,
  ChevronRight,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { initialBlogPosts } from '../data/blogData';
import type { BlogPost } from '../data/blogData';
import { BlogCard } from '../components/BlogCard';

interface BlogPostDetailProps {
  posts?: BlogPost[];
}

export const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ posts = initialBlogPosts }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Find post by ID
  const post = posts.find((p) => p.id.toString() === id);

  // Get related articles (excluding current article)
  const relatedPosts = posts
    .filter((p) => p.id.toString() !== id && (p.category === post?.category || true))
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 py-16 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0E1524] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Newspaper className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Article Not Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The blog article you are looking for does not exist or may have been moved.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="w-full py-3 px-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-purple-600/30 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog &amp; Press
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Navigation & Breadcrumbs ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Articles
          </Link>

          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300 font-medium truncate max-w-[160px] sm:max-w-xs">{post.title}</span>
          </nav>
        </div>

        {/* ── Article Header ── */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-600/90 text-white shadow-lg backdrop-blur-md border border-purple-400/30">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {post.date}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            {post.summary}
          </p>

          {/* Author Card & Social Share Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-b border-slate-800/80 py-4">
            {post.author ? (
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/40"
                />
                <div>
                  <div className="text-sm font-bold text-white">{post.author.name}</div>
                  <div className="text-xs text-slate-400">{post.author.role}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-purple-400">Vendora Team</div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0E1524] border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:border-purple-500 transition-all"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => setSaved(!saved)}
                className={`p-2 rounded-full border text-xs transition-all ${
                  saved
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                    : 'bg-[#0E1524] border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Save Article"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Featured Image ── */}
        <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* ── Article Content Body ── */}
        <article className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
          {post.content && post.content.length > 0 ? (
            post.content.map((paragraph, idx) => (
              <p key={idx} className="text-slate-300 leading-relaxed font-normal">
                {paragraph}
              </p>
            ))
          ) : (
            <p>{post.summary}</p>
          )}

          {/* Key Takeaways Highlight Box */}
          <div className="my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Key Takeaways
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs sm:text-sm">
              <li>Multi-vendor global commerce is expanding opportunities for independent creators worldwide.</li>
              <li>Streamlined logistics and real-time conversion analytics empower merchant growth.</li>
              <li>Vendora continues to invest in sustainable, cross-border e-commerce infrastructure.</li>
            </ul>
          </div>
        </article>

        {/* ── Footer Navigation & Related Articles ── */}
        <div className="pt-12 space-y-8 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-white">Related Articles</h3>
            <Link to="/blog" className="text-xs font-bold text-purple-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <BlogCard key={relPost.id} post={relPost} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
