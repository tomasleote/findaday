import React, { useEffect, Suspense } from 'react';
import './index.css';
import { LoadingSpinner, ErrorBoundary, Footer, StorageConsent } from './shared/ui';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

const RootHandler = React.lazy(() => import('./features/root/RootHandler'));
const DocumentationPage = React.lazy(() => import('./features/docs/DocumentationPage'));
const PrivacyPolicy = React.lazy(() => import('./features/legal/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./features/legal/TermsOfService'));
const LandingPage = React.lazy(() => import('./features/landing/LandingPage'));
const BlogIndex = React.lazy(() => import('./features/blog/BlogIndex'));
const BlogPost = React.lazy(() => import('./features/blog/BlogPost'));
const CompareHub = React.lazy(() => import('./features/landing/CompareHub'));
const ComparePageWrapper = React.lazy(() => import('./features/landing/ComparePageWrapper'));

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Need to scroll to top on path change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-dark-950 text-gray-50 flex flex-col">
      <main className="flex-grow flex flex-col">
        <Suspense fallback={
          <div className="flex-grow flex items-center justify-center">
            <LoadingSpinner label="Loading page..." size="lg" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<RootHandler />} />
            <Route path="/vacation-planner" element={<LandingPage type="vacation" />} />
            <Route path="/doodle-alternative" element={<LandingPage type="doodle" />} />
            <Route path="/when2meet-alternative" element={<LandingPage type="when2meet" />} />
            <Route path="/find-a-date-for-dinner" element={<Navigate to="/find-a-day-for-dinner" replace />} />
            <Route path="/find-a-day-for-dinner" element={<LandingPage type="dinner" />} />
            <Route path="/group-event-planner" element={<LandingPage type="event" />} />
            <Route path="/team-scheduling" element={<LandingPage type="team" />} />
            <Route path="/party-planner" element={<LandingPage type="party" />} />
            <Route path="/game-night-planner" element={<LandingPage type="gamenight" />} />
            <Route path="/christmas-dinner-planner" element={<LandingPage type="christmas" />} />
            <Route path="/summer-vacation-planner" element={<LandingPage type="summer" />} />
            <Route path="/family-reunion-planner" element={<LandingPage type="family" />} />
            <Route path="/compare" element={<CompareHub />} />
            <Route path="/compare/:competitor" element={<ComparePageWrapper />} />
            <Route path="/docs" element={<DocumentationPage onBack={() => navigate('/')} />} />
            <Route path="/blog" element={<BlogIndex onBack={() => navigate('/')} />} />
            <Route path="/blog/:slug" element={<BlogPost onBack={() => navigate('/blog')} />} />
            <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate('/')} />} />
            <Route path="/terms" element={<TermsOfService onBack={() => navigate('/')} />} />
          </Routes>
        </Suspense>
      </main>
      <Footer
        onNavigateDocs={() => navigate('/docs')}
        onNavigatePrivacy={() => navigate('/privacy')}
        onNavigateTerms={() => navigate('/terms')}
      />
      <StorageConsent onNavigate={(path) => navigate(path)} />
    </div>
  );
}

function App() {
  return <MainLayout />;
}

export default App;
