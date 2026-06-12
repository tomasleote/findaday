import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CalendarRange, Sparkles, Share2, CheckCircle2, ArrowRight, Palmtree, Utensils, Users, Gamepad2, Plane, Tv, CalendarDays, Zap, Clock, ThumbsUp, Gift, Sun, HeartHandshake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { landingPagesConfig } from './content';
import ComparisonTable from './ComparisonTable';
import RelatedPages from './RelatedPages';
import SchemaMarkup from './SchemaMarkup';
import { Header } from '../../shared/ui';
import { HeroSection } from './sections/HeroSection';
import { ProblemSection } from './sections/ProblemSection';
import { FAQSection } from './sections/FAQSection';

// Map textual emoji/icon keys to actual Lucide components to ensure NO EMOJIS are used
const ICON_MAP = {
    vacation: Palmtree,
    doodle: Sparkles,
    when2meet: Zap,
    dinner: Utensils,
    event: CalendarDays,
    team: Users,
    party: Tv,
    gamenight: Gamepad2,
    christmas: Gift,
    summer: Sun,
    family: HeartHandshake,
};

export default function LandingPage({ type }) {
    const content = landingPagesConfig[type];
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [type]);

    if (!content) return null;
    const SITE_URL = 'https://findaday.app';

    const PageIcon = ICON_MAP[type] || CalendarRange;

    return (
        <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col font-sans selection:bg-brand-500/30">
            <Helmet>
                <title>{content.title}</title>
                <meta name="description" content={content.metaDescription} />
                <link rel="canonical" href={`${SITE_URL}/${content.slug}`} />
                <meta property="og:title" content={content.title} />
                <meta property="og:description" content={content.metaDescription} />
                <meta property="og:url" content={`${SITE_URL}/${content.slug}`} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={`${SITE_URL}/logo.png`} />
                <meta property="og:site_name" content="Find A Day" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={content.title} />
                <meta name="twitter:description" content={content.metaDescription} />
                <meta name="twitter:image" content={`${SITE_URL}/logo.png`} />
            </Helmet>

            <SchemaMarkup type={type} content={content} />

            {/* Nav */}
            <Header />

            <main className="flex-1 w-full flex flex-col items-center">
                <HeroSection content={content} PageIcon={PageIcon} />

                <ProblemSection content={content} />

                {/* How It Works */}
                <section className="w-full max-w-6xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
                        <p className="text-xl text-gray-400">Dead simple coordination. Under 60 seconds.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: 1, title: 'Create Event', desc: 'Set your date range. Vacations, meetings, or dinners.', icon: <CalendarRange size={24} /> },
                            { step: 2, title: 'Share Link', desc: 'Send it in your group chat. No sign-ups or ads.', icon: <Share2 size={24} /> },
                            { step: 3, title: 'See Overlap', desc: 'Instantly view the heatmap of when everyone is free.', icon: <CheckCircle2 size={24} /> }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ y: -5 }}
                                className="bg-dark-900 border border-dark-800 p-8 rounded-3xl relative overflow-hidden group"
                            >
                                <div className="w-14 h-14 bg-dark-800 text-brand-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    <span className="text-brand-500 mr-2">{item.step}.</span>
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Comparison Table */}
                {content.showComparison && (
                    <section className="w-full bg-dark-900 border-y border-dark-800 py-24">
                        <div className="max-w-4xl mx-auto px-6">
                            <ComparisonTable type={type} />
                        </div>
                    </section>
                )}

                <FAQSection faqs={content.faqs} />

                {/* Bottom CTA */}
                <section className="w-full py-24 relative overflow-hidden flex items-center justify-center text-center px-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-orange-500 opacity-20" />
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to stop guessing?</h2>
                        <p className="text-xl text-gray-300 mb-10">Create your event link and let the algorithm do the work.</p>
                        <Link to="/" className="px-10 py-5 rounded-full bg-white text-brand-600 text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-3">
                            {content.ctaText || 'Start Planning'}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </section>

                {/* Internal Linking Widgets */}
                <section className="w-full bg-dark-950 py-16 border-t border-dark-800">
                    <RelatedPages currentType={type} relatedSlugs={content.relatedPages} />
                </section>
            </main>
        </div>
    );
}
