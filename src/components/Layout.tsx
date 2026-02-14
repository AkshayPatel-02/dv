import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Hide navbar and footer for Frame2Reality page
  const hideHeaderFooter = location.pathname === '/frame2reality';

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