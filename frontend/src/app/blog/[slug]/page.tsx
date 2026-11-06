"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await api.get<any>(`/public/blog/${slug}`);
        if (res.success && res.data) {
          setPost(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadPost();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Loading article...</div>;
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Article Not Found</h2>
        <Link href="/blog" className="text-blue-600 font-semibold text-sm hover:underline">
          &larr; Return to Insights Hub
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Insights
      </Link>

      <div className="space-y-4 border-b border-slate-200 pb-8">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{post.category}</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>By {post.authorName} ({post.authorRole})</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes} min read
          </span>
        </div>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </article>
  );
}
