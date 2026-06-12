import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const id = React.useId();
    return (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden hover:border-dark-700 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 rounded-xl"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${id}`}
            >
                <span className="font-bold text-gray-200 text-lg">{question}</span>
                <ChevronDown className={`text-brand-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
            </button>
            <motion.div
                id={`faq-answer-${id}`}
                role="region"
                aria-hidden={!isOpen}
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                className="overflow-hidden bg-dark-800/50"
            >
                <p className="p-6 pt-2 text-gray-400 leading-relaxed font-medium text-sm md:text-base">
                    {answer}
                </p>
            </motion.div>
        </div>
    );
}

export function FAQSection({ faqs }) {
    return (
        <section className="w-full max-w-3xl mx-auto px-6 py-24">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <FAQItem key={i} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        </section>
    );
}
