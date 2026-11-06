"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, User } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await api.get<any[]>("/public/blog");
        if (res.success && res.data) {
          setPosts(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Research & Thought Leadership</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Franchise Growth Insights</h1>
        <p className="text-slate-600 text-sm">
          Expert guides on SOP codification, legal disclosure structuring, and multi-unit investment trends.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{post.category}</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes} min read
                  </span>
                </div>
                <h3 className="text-xl font-bold text-navy-900 hover:text-blue-600 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{post.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">By {post.authorName}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Read Article &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
