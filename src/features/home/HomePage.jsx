import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Modal, Button, Header } from '../../shared/ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import RecoverAdminForm from '../recovery/RecoverAdminForm';
import CreateGroupForm from './CreateGroupForm';
import JoinGroupForm from './JoinGroupForm';
import { HowItWorksSection, HomePageSeoSections } from './sections/HomeContentSections';

const USE_CASE_PILLS = ['Vacation', 'Dinner', 'Birthday', 'Game Night', 'Team Offsite'];

function HomePage({ onCreateGroup, onJoinGroup, onRecoverAdmin }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showRecover, setShowRecover] = useState(false);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') { setShowCreate(true); setShowJoin(false); setShowRecover(false); }
    else if (action === 'join') { setShowJoin(true); setShowCreate(false); setShowRecover(false); }
    else if (action === 'recover') { setShowRecover(true); setShowCreate(false); setShowJoin(false); }
    else { setShowCreate(false); setShowJoin(false); setShowRecover(false); }

    if (action) {
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const closeAll = () => { setShowCreate(false); setShowJoin(false); setShowRecover(false); };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Find A Day — Find the Best Day for Any Group Event</title>
        <meta name="description" content="Everyone marks their availability. The algorithm finds the overlap. Free, no sign-up required." />
        <link rel="canonical" href="https://findaday.app/" />
        <meta property="og:title" content="Find A Day — Find the Best Day for Any Group Event" />
        <meta property="og:description" content="Everyone marks their availability. The algorithm finds the overlap. Free, no sign-up required." />
        <meta property="og:url" content="https://findaday.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://findaday.app/logo.png" />
        <meta property="og:site_name" content="Find A Day" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find A Day — Find the Best Day for Any Group Event" />
        <meta name="twitter:description" content="Stop texting. Start planning. Free group date finder." />
        <meta name="twitter:image" content="https://findaday.app/logo.png" />
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Find A Day",
              "url": "https://findaday.app/",
              "logo": "https://findaday.app/logo.png"
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Find A Day",
              "url": "https://findaday.app/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://findaday.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ])}
        </script>
      </Helmet>

      <Header
        onCreate={() => { setShowCreate(true); setShowJoin(false); setShowRecover(false); }}
        onJoin={() => { setShowJoin(true); setShowCreate(false); setShowRecover(false); }}
        onRecover={() => { setShowRecover(true); setShowCreate(false); setShowJoin(false); }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-50 mb-4 leading-tight">
            Find the Best Day For Your <span className="text-brand-400">Group Event.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            The easiest group date finder. Everyone marks when they're free, and we show you the overlap. No sign-up, no ads.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {USE_CASE_PILLS.map((label) => (
              <span key={label} className="px-3 py-1.5 rounded-full text-sm font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              rounding="lg"
              onClick={() => { setShowCreate(true); setShowJoin(false); setShowRecover(false); }}
              className="flex items-center gap-2"
            >
              Start Planning Now <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              rounding="lg"
              onClick={() => { setShowJoin(true); setShowCreate(false); setShowRecover(false); }}
            >
              Join Event
            </Button>
          </div>
        </motion.div>

        <HowItWorksSection />
        <HomePageSeoSections />
      </div>

      <Modal
        open={showCreate || showJoin || showRecover}
        onClose={closeAll}
        title={showCreate ? 'Create Event' : showJoin ? 'Join Event' : 'Recover Admin Access'}
        maxWidth={showCreate ? 'lg' : 'md'}
        animated
      >
        {showCreate && (
          <CreateGroupForm onSuccess={onCreateGroup} onCancel={closeAll} />
        )}
        {showJoin && (
          <JoinGroupForm onSuccess={onJoinGroup} onCancel={closeAll} />
        )}
        {showRecover && (
          <RecoverAdminForm
            onSuccess={(gId, token) => { closeAll(); onRecoverAdmin(gId, token); }}
            onCancel={closeAll}
          />
        )}
      </Modal>
    </div>
  );
}

export default HomePage;
