import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '../../content/blogData';

export default function BlogIndex({ onBack }) {
    return (
        <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col font-sans selection:bg-brand-500/30">
            <Helmet>
                <title>Find A Day Blog | Tips for Better Group Scheduling</title>
                <meta name="description" content="Read our latest guides on planning group vacations, dinners, and choosing the right scheduling tools." />
                <link rel="canonical" href="https://findaday.app/blog" />
            </Helmet>

            {/* Navigation matching other inner pages */}
            <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center z-50 relative">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-dark-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Back Home
                    </button>
                </div>
                <div className="flex-1 text-center">
                    <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity inline-flex items-center gap-2 text-white">
                        <span className="text-brand-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M17 14h-6" /><path d="M13 18H7" /><path d="M7 14h.01" /><path d="M17 18h.01" /></svg>
                        </span>
                        <span>Find <span className="text-brand-500">A</span> Day</span>
                    </Link>
                </div>
                <div className="flex-1"></div>
            </nav>

            <main className="flex-1 w-full flex flex-col items-center">
                <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Group Planning <span className="text-brand-400">Guides</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Tips, guides, and strategies for getting everyone on the same page.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {blogPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="group flex flex-col bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300"
                            >
                                {/* Fallback pattern block for cover image since we don't have real media yet */}
                                <div className="h-48 w-full bg-dark-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 group-hover:scale-105 transition-transform duration-500"></div>
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-dark-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><path d="M8 9h.01" /><path d="m3 16 5-5 5 5" /><path d="m14 14 5-5 2 2" /></svg>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase mb-3">
                                        <span className="text-brand-500">
                                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-dark-700">•</span>
                                        <span className="text-gray-500">{post.readingTime} min read</span>
                                        {post.category && (
                                            <>
                                                <span className="text-dark-700">•</span>
                                                <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-full text-[10px]">
                                                    {post.category}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-50 mb-3 group-hover:text-brand-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-400 line-clamp-3 mb-6 flex-1">
                                        {post.description}
                                    </p>
                                    <div className="flex items-center text-sm font-semibold text-gray-300 group-hover:text-white transition-colors mt-auto">
                                        Read article
                                        <svg className="ml-2 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
