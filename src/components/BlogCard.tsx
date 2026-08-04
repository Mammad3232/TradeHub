import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ExternalLink, Newspaper } from 'lucide-react';
import type { BlogPost } from '../data/blogData';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';

export const BlogCard: React.FC<BlogCardProps> = ({ post, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const isExternal = post.isExternal || post.link.startsWith('http://') || post.link.startsWith('https://');

  const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (isExternal) {
      return (
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative bg-[#0E1524] border border-slate-800 rounded-3xl overflow-hidden flex flex-col hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${className}`}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        to={post.link}
        className={`group relative bg-[#0E1524] border border-slate-800 rounded-3xl overflow-hidden flex flex-col hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <CardWrapper>
      {/* ── Image & Category Badge Container (Fixed Height & Fallback) ── */}
      <div className="relative h-48 sm:h-52 w-full shrink-0 overflow-hidden bg-slate-900 flex items-center justify-center">
        {!imageError && post.image ? (
          <img
            src={post.image}
            alt={post.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <img
              src={DEFAULT_FALLBACK_IMAGE}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-40 mix-blend-overlay absolute inset-0"
            />
            <div className="relative z-10 w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Newspaper className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Category Badge (Positioned absolutely over top-left) */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-600/90 text-white shadow-lg backdrop-blur-md border border-purple-400/30">
            {post.category}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6 flex-1 flex flex-col space-y-3.5">
        {/* Meta info: Date & Read Time */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {/* Summary / Description */}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
          {post.summary}
        </p>

        {/* Action Link Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-purple-400 group-hover:text-purple-300 inline-flex items-center gap-1.5 transition-colors">
            Read Article
            {isExternal ? (
              <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            ) : (
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            )}
          </span>
        </div>
      </div>
    </CardWrapper>
  );
};
