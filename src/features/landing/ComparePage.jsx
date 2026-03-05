import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, ArrowRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Header } from '../../shared/ui';
import { compareData } from './compareData';

export default function ComparePage({ competitorSlug }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [competitorSlug]);

    const data = compareData[competitorSlug];
    if (!data) return <Navigate to="/compare" replace />;

    return (
        <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col font-sans selection:bg-brand-500/30">
            <Helmet>
                <title>{data.metaTitle}</title>
                <meta name="description" content={data.metaDescription} />
                <link rel="canonical" href={`https://findaday.app/compare/${competitorSlug}`} />
            </Helmet>

            <Header />

            <main className="flex-1 w-full flex flex-col items-center">
                <section className="w-full max-w-4xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center relative">
                    <Link to="/compare" className="text-gray-500 hover:text-brand-400 inline-flex items-center gap-2 text-sm font-medium mb-12 transition-colors">
                        <ArrowLeft size={16} /> Back to Comparisons
                    </Link>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6"
                    >
                        {data.h1}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        {data.subtitle}
                    </motion.p>
                </section>

                <section className="w-full bg-dark-900 border-y border-dark-800 py-16">
                    <div className="max-w-4xl mx-auto px-6 overflow-x-auto pb-4">
                        <motion.table
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full min-w-[600px] text-left border-collapse"
                        >
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-dark-800 text-gray-400 font-medium">Feature</th>
                                    <th className="p-4 border-b-2 border-brand-500 text-white font-bold text-center bg-brand-500/5 rounded-t-xl w-1/4">
                                        Find A Day
                                    </th>
                                    <th className="p-4 border-b border-dark-800 text-center text-gray-400 font-medium w-1/4">
                                        {data.competitorLogoText}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-800">
                                {data.features.map((feat, i) => (
                                    <tr key={i} className="hover:bg-dark-800/30 transition-colors">
                                        <td className="p-5 font-medium text-gray-200">{feat.name}</td>
                                        <td className="p-5 text-center bg-brand-500/5">
                                            {feat.us ? (
                                                <Check className="text-brand-500 mx-auto" size={24} />
                                            ) : (
                                                <X className="text-gray-600 mx-auto" size={24} />
                                            )}
                                        </td>
                                        <td className="p-5 text-center flex flex-col items-center justify-center text-sm">
                                            {feat.them ? (
                                                <Check className="text-gray-500 mb-1" size={20} />
                                            ) : (
                                                <X className="text-red-900/50 mb-1" size={20} />
                                            )}
                                            {feat.noteThem && <span className="text-gray-500 text-xs">{feat.noteThem}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </motion.table>
                    </div>
                </section>

                <section className="w-full max-w-3xl mx-auto px-6 py-20">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {data.faq.map((item, i) => (
                            <div key={i} className="bg-dark-900 border border-dark-800 p-6 rounded-2xl">
                                <h3 className="font-bold text-gray-200 text-lg mb-3">{item.question}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="w-full py-20 text-center bg-gradient-to-t from-dark-900 to-dark-950 border-t border-dark-800">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to make the switch?</h2>
                    <Link to="/" className="px-8 py-4 inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-bold shadow-xl shadow-brand-500/20 hover:-translate-y-1 transition-transform">
                        Create an Event — Free <ArrowRight size={18} />
                    </Link>
                </section>
            </main>
        </div>
    );
}
