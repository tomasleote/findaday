import React from 'react';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TechnicalSection() {
    return (
        <section id="technical" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                <Code className="text-rose-400" size={20} /> Technical Transparency
            </h2>
            <div className="bg-dark-950 border border-dark-800 rounded-xl p-5 text-sm leading-relaxed space-y-3 font-mono text-gray-300">
                <p><strong>Architecture:</strong> Single Page Application (SPA) driven by React 18.</p>
                <p><strong>Data Persistence:</strong> Firebase Realtime Database utilizing transactional writes to prevent concurrency race conditions.</p>
                <p><strong>Serverless APIs:</strong> Node.js serverless functions process outbound emails and handle sensitive crypto actions (passphrase validations).</p>
                <p><strong>Resilience:</strong> Top-level React Error Boundaries prevent visual crashes. Explicit `navigator.onLine` checks ensure degraded stability without network connections.</p>
                <div className="pt-2 border-t border-dark-800 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>v1.0.0 Stable</span>
                    <Link
                        to="/privacy"
                        className="text-brand-500 hover:text-brand-400 font-bold"
                    >
                        Privacy Policy &gt;
                    </Link>
                </div>
            </div>
        </section>
    );
}
