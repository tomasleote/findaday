import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection({ content, PageIcon }) {
    return (
        <section className="w-full max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-brand-300/10"
            >
                <PageIcon size={32} />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
            >
                {content.h1}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
                {content.subtitle}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <Link to="/" className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-500 text-white text-lg font-bold shadow-xl shadow-brand-500/20 hover:-translate-y-1 hover:shadow-brand-500/40 active:translate-y-0 transition-all flex items-center justify-center gap-2 group">
                    {content.ctaText || 'Create an Event — Free'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-sm text-gray-500 font-medium"
            >
                No sign-up required. Free forever.
            </motion.p>
        </section>
    );
}
