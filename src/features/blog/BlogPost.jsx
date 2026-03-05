import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet-async';
import { getBlogPostBySlug, blogPosts } from '../../content/blogData';
import { LoadingSpinner } from '../../shared/ui';

export default function BlogPost({ onBack }) {
    const { slug } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const post = getBlogPostBySlug(slug);

    useEffect(() => {
        if (!post) {
            setError(true);
            setLoading(false);
            return;
        }

        // Dynamic import for the markdown file content based on slug
        import(`../../content/blog/${slug}.md`)
            .then(res => {
                fetch(res.default)
                    .then(r => r.text())
                    .then(text => {
                        setContent(text);
                        setLoading(false);
                    })
                    .catch(() => {
                        setError(true);
                        setLoading(false);
                    });
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [slug, post]);

    if (error || !post) {
        return (
            <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col items-center justify-center px-6">
                <Helmet>
                    <title>Article Not Found | Find A Day</title>
                    <meta name="robots" content="noindex" />
                </Helmet>
                <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
                <p className="text-gray-400 mb-8">The guide you are looking for does not exist or has been moved.</p>
                <Link to="/blog" className="px-6 py-3 bg-brand-500 rounded-lg text-white font-bold hover:bg-brand-400 transition-colors">
                    Browse Blog
                </Link>
            </div>
        );
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.description,
        "author": {
            "@type": "Organization",
            "name": post.author
        },
        "datePublished": post.date,
        "publisher": {
            "@type": "Organization",
            "name": "Find A Day",
            "logo": {
                "@type": "ImageObject",
                "url": "https://findaday.app/logo.png"
            }
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col font-sans selection:bg-brand-500/30">
            <Helmet>
                <title>{post.title} | Find A Day Blog</title>
                <meta name="description" content={post.description} />
                <link rel="canonical" href={`https://findaday.app/blog/${post.slug}`} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.description} />
                <meta property="article:published_time" content={post.date} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.description} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            {/* Navigation */}
            <nav className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between z-50 relative">
                <Link
                    to="/blog"
                    className="flex items-center gap-2 px-3 py-2 -ml-3 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Blog
                </Link>
                <Link to="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2 text-white">
                    <span className="text-brand-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                    </span>
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10 pb-24">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner label="Loading article..." />
                    </div>
                ) : (
                    <article className="prose prose-invert prose-brand max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8 prose-h1:leading-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-gray-100
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
            prose-a:text-brand-400 hover:prose-a:text-brand-300 prose-a:transition-colors
            prose-li:text-gray-300 prose-li:text-lg prose-ul:mb-6
            prose-strong:text-white prose-strong:font-bold"
                    >
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                )}
            </main>

            {/* Footer Banner */}
            {!loading && !error && (
                <div className="w-full bg-dark-900 border-t border-dark-800 py-16">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Stop guessing when everyone is free</h3>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            Ready to plan your next event? Create a fast, free availability poll in seconds. No ads, no signups required.
                        </p>
                        <Link to="/" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-brand-500/20 hover:scale-105 transition-all">
                            Create Event Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
