import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';

// Lazy-load the existing registration app entry to avoid loading on every page
const RegistrationApp = React.lazy(() => import('../registration/App').catch(() => ({ default: () => <div>Failed to load registration app</div> })));

const OllaverseRegistration = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/events" className="text-sm text-muted-foreground">← Back to Events</Link>
        </div>

        <Suspense fallback={<div className="py-20 text-center">Loading Ollaverse Registration...</div>}>
          <RegistrationApp />
        </Suspense>
      </div>
    </div>
  );
};

export default OllaverseRegistration;
