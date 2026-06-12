import React from 'react';
import { motion } from 'framer-motion';

export function ProblemSection({ content }) {
    return (
        <section className="w-full bg-dark-900 py-20 border-y border-dark-800">
            <div className="max-w-3xl mx-auto px-6">
                <div className="space-y-16">
                    <div className="space-y-6">
                        {content.problemSection.map((p, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`text-lg leading-relaxed ${i === 0 ? 'text-gray-200 font-medium text-xl border-l-4 border-brand-500 pl-6 py-2' : 'text-gray-400'}`}
                            >
                                {p}
                            </motion.p>
                        ))}
                    </div>

                    {content.whyToolsFail && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-dark-800/50 p-8 rounded-2xl border border-dark-700"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">Why Existing Tools Fail</h3>
                            <p className="text-lg text-gray-400 leading-relaxed">{content.whyToolsFail}</p>
                        </motion.div>
                    )}

                    {content.useCases && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">Use Case Scenarios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {content.useCases.map((uc, i) => (
                                    <div key={i} className="bg-dark-950 p-6 rounded-xl border border-dark-800 hover:border-dark-700 transition-colors">
                                        <strong className="block text-brand-400 text-lg mb-2">{uc.title}</strong>
                                        <span className="text-gray-400 leading-relaxed">{uc.description}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
