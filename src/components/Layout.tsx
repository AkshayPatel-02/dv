import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Hide navbar and footer for Frame2Reality, Feedback, FeedbackAdmin and registration app routes (if they provide their own chrome)
  const hideHeaderFooter = ['/frame2reality', '/feedback', '/feedback-admin'].some(p => location.pathname.startsWith(p)) || location.pathname.startsWith('/ollaverse/registration');

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Navbar />}
      <main className={`flex-1 ${!hideHeaderFooter ? 'pt-16 lg:pt-20' : ''}`}>
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default Layout;