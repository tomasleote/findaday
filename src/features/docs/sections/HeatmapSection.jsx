import React from 'react';
import { TrendingUp } from 'lucide-react';

const HEATMAP_DATA = [0, 1, 3, 5, 5, 5, 4, 2, 5, 3, 2, 5, 5, 4];
const COLORS = [
    'bg-dark-800',
    'bg-brand-900/60',
    'bg-amber-500',
    'bg-brand-600',
    'bg-brand-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
];

function colorIndex(availability) {
    if (availability === 5) return 4;
    if (availability === 4) return 3;
    if (availability >= 3) return 2;
    if (availability >= 1) return 1;
    return 0;
}

export function HeatmapSection() {
    return (
        <section id="visual-example" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                <TrendingUp className="text-brand-400" size={20} /> Understanding the Heatmap
            </h2>
            <p className="text-sm leading-relaxed">
                The Availability Heatmap (shown in the Admin Panel and Result view) uses color intensity to represent how many people are free on a given day. Here is a mocked visualization of how it looks with 5 participants:
            </p>

            <div className="bg-dark-900 border border-dark-700 p-6 rounded-2xl max-w-sm mx-auto">
                <div className="grid grid-cols-7 gap-2">
                    {HEATMAP_DATA.map((availability, i) => {
                        const idx = colorIndex(availability);
                        return (
                            <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold ${COLORS[idx]} ${availability >= 4 ? 'text-white' : 'text-brand-300'}`}>
                                <span>{i + 1}</span>
                                <span className="opacity-70">{availability}/5</span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                    <span>Low Availability</span>
                    <span>High Availability</span>
                </div>
            </div>
        </section>
    );
}
