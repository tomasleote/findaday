import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Scale, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../shared/ui';
import { compareData } from './compareData';

export default function CompareHub() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const competitors = Object.values(compareData);

    return (
        <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col font-sans selection:bg-brand-500/30">
            <Helmet>
                <title>Compare Find A Day vs Competitors | Alternative to Doodle & When2Meet</title>
                <meta name="description" content="Compare Find A Day against legacy group scheduling tools like Doodle, When2Meet, and Rally. See why thousands are switching to a faster, ad-free calendar." />
                <link rel="canonical" href="https://findaday.app/compare" />
            </Helmet>

            <Header />

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-20">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-8 relative z-10"
                    >
                        <Scale size={32} />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold text-white mb-6 relative z-10"
                    >
                        Compare Find A Day
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto relative z-10"
                    >
                        Legacy scheduling tools are holding your group chat back with heavy ads, mandatory accounts, and outdated, mobile-unfriendly interfaces. See how we stack up against the competition.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {competitors.map((comp, idx) => (
                        <motion.div
                            key={comp.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                        >
                            <Link
                                to={`/compare/${comp.slug}`}
                                className="block h-full bg-dark-900 border border-dark-800 p-8 rounded-3xl hover:border-brand-500/50 hover:bg-dark-800/80 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                                            F
                                        </div>
                                        <span className="text-gray-500 font-bold italic">vs</span>
                                        <div className="w-12 h-12 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center font-bold text-gray-300">
                                            {comp.name.charAt(0)}
                                        </div>
                                    </div>
                                    <ArrowRight className="text-dark-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" size={24} />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-3">Find A Day vs {comp.name}</h2>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {comp.metaDescription.substring(0, 100)}...
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 text-center border-t border-dark-800 pt-16"
                >
                    <h3 className="text-2xl font-bold text-white mb-6">Experience the difference today.</h3>
                    <Link to="/" className="px-8 py-4 rounded-full bg-brand-500 text-white font-bold inline-flex items-center gap-2 hover:-translate-y-1 transition-transform shadow-xl shadow-brand-500/20">
                        Create an Event — Free
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
