import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Header } from '../../shared/ui';
import { IntroductionSection } from './sections/IntroductionSection';
import { CoreConceptsSection } from './sections/CoreConceptsSection';
import { WorkflowSection } from './sections/WorkflowSection';
import { HeatmapSection } from './sections/HeatmapSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { FaqSection } from './sections/FaqSection';
import { TechnicalSection } from './sections/TechnicalSection';

export default function DocumentationPage({ onBack }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-dark-950 text-gray-300">
            <Header />
            <div className="max-w-4xl mx-auto p-4 md:p-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={(e) => {
                            if (onBack) {
                                e.preventDefault();
                                onBack();
                            } else {
                                window.location.href = '/';
                            }
                        }}
                        className="text-gray-400 hover:text-white transition-colors bg-dark-800 p-2 rounded-lg"
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-50 flex items-center gap-3">
                        <BookOpen className="text-brand-500" />
                        Documentation
                    </h1>
                </div>

                <article className="space-y-16 pb-20">
                    <IntroductionSection />
                    <CoreConceptsSection />
                    <WorkflowSection />
                    <HeatmapSection />
                    <FeaturesSection />
                    <FaqSection />
                    <TechnicalSection />
                </article>
            </div>
        </div>
    );
}
