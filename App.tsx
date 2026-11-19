import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import StickyFooterWrapper from './components/StickyFooterWrapper';
import CustomCursor from './components/CustomCursor';
import CookieBanner from './components/CookieBanner';
import AudioPlayer from './components/AudioPlayer';
import Preloader from './components/Preloader';

import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProjectDetail from './pages/ProjectDetail'; 
import ElementDetail from './pages/ElementDetail'; 
import ClientPortal from './pages/ClientPortal';
import PortalAdmin from './pages/PortalAdmin';
import { LanguageProvider } from './contexts/LanguageContext';
import { PROJECTS } from './constants';

// Scroll to top wrapper & Path Saver
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    // Save the path so embedded views can restore it if reloaded at the root.
    sessionStorage.setItem('last_path', pathname);
  }, [pathname]);

  return null;
};

// Animated Routes Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<ProjectDetail />} />
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/portal/admin" element={<PortalAdmin />} />
        <Route path="/journal/:id" element={<ElementDetail />} /> 
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </AnimatePresence>
  );
};

const RouteAppShell: React.FC<{ scrollLocked: boolean }> = ({ scrollLocked }) => {
  const { pathname } = useLocation();
  const isPortalRoute = pathname.startsWith('/portal');

  useEffect(() => {
    const metadata = resolvePageMetadata(pathname);
    document.title = metadata.title;
    setMetaContent('meta[name="description"]', metadata.description);
    setMetaContent('meta[name="robots"]', metadata.indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow');
    setMetaContent('meta[property="og:title"]', metadata.title);
    setMetaContent('meta[property="og:description"]', metadata.description);
    setMetaContent('meta[name="twitter:title"]', metadata.title);
    setMetaContent('meta[name="twitter:description"]', metadata.description);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(pathname, window.location.origin).toString();
    const openGraphUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (openGraphUrl) openGraphUrl.content = new URL(pathname, window.location.origin).toString();
  }, [pathname]);

  return (
    <>
      {!isPortalRoute && <CustomCursor />}
      {!isPortalRoute && <Navbar />}
      <div
        className={`
          text-neutral-900 dark:text-neutral-100
          selection:bg-bronze-500 selection:text-white
          transition-colors duration-500
          ${scrollLocked ? 'h-screen overflow-hidden' : ''}
        `}
      >
        <div className="flex flex-col min-h-screen relative z-10 bg-white dark:bg-neutral-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
      {!isPortalRoute && <StickyFooterWrapper />}
      <CookieBanner />
      {!isPortalRoute && <AudioPlayer />}
    </>
  );
};

function resolvePageMetadata(pathname: string): { title: string; description: string; indexable: boolean } {
  const path = pathname.replace(/\/+$/, '') || '/';
  const staticPages: Record<string, { title: string; description: string }> = {
    '/': {
      title: 'Linier Studio | Architecture & Contractor in Kendari',
      description: 'Linier Studio is an architecture, interior design, and construction studio based in Kendari, Indonesia. Explore design, build, renovation, and planning services.',
    },
    '/about': {
      title: 'About Linier Studio | Architecture Studio in Kendari',
      description: 'Learn about Linier Studio, a Kendari-based architecture, interior design, and construction company serving clients across Indonesia.',
    },
    '/portfolio': {
      title: 'Architecture & Interior Design Portfolio | Linier Studio',
      description: 'Explore architecture, interior design, and construction projects by Linier Studio, a design and build studio based in Kendari, Indonesia.',
    },
    '/services': {
      title: 'Architecture, Interior & Construction Services | Linier Studio',
      description: 'Architecture design, interior design, construction, renovation, and planning services from Linier Studio in Kendari, Indonesia.',
    },
    '/contact': {
      title: 'Contact Linier Studio | Kendari Architecture & Contractor',
      description: 'Contact Linier Studio in Kendari, Indonesia for architecture, interior design, construction, renovation, and project consultations.',
    },
    '/privacy': {
      title: 'Privacy Policy | Linier Studio',
      description: 'Read the Linier Studio privacy policy.',
    },
    '/terms': {
      title: 'Terms of Service | Linier Studio',
      description: 'Read the Linier Studio website terms of service.',
    },
  };
  const staticPage = staticPages[path];
  if (staticPage) return { ...staticPage, indexable: true };

  const portfolioMatch = path.match(/^\/portfolio\/([^/]+)$/);
  if (portfolioMatch) {
    const project = PROJECTS.find((item) => item.id === portfolioMatch[1]);
    if (project) {
      return {
        title: `${project.title} | Linier Studio Portfolio`,
        description: project.description,
        indexable: true,
      };
    }
  }

  if (path === '/portal' || path.startsWith('/portal/')) {
    return {
      title: 'Client Portal | Linier Studio',
      description: 'Linier Studio client project portal.',
      indexable: false,
    };
  }

  if (path.startsWith('/journal/')) {
    return {
      title: 'Design Journal | Linier Studio',
      description: 'Ideas and inspiration from Linier Studio.',
      indexable: true,
    };
  }

  return {
    title: 'Page Not Found | Linier Studio',
    description: 'The requested Linier Studio page could not be found.',
    indexable: false,
  };
}

function setMetaContent(selector: string, content: string): void {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = content;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scrollLocked, setScrollLocked] = useState(true);
  
  // Theme Initialization Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle Preloader Completion
  const handlePreloaderComplete = () => {
    setLoading(false);
    
    // DELAY UNLOCKING SCROLL
    // This prevents the scrollbar from appearing abruptly while the curtain is still opening.
    // The delay matches the Preloader exit transition duration (1.2s).
    setTimeout(() => {
      setScrollLocked(false);
    }, 1200);
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        
        {/* Preloader with Exit Animation (Curtain) */}
        <AnimatePresence mode="wait">
          {loading && <Preloader onComplete={handlePreloaderComplete} />}
        </AnimatePresence>

        {/* 
            RENDER STRATEGY FOR SMOOTHNESS:
            We render the main content ALWAYS, even when loading.
            It sits behind the Preloader (z-index lower).
            This ensures no "paint flash" or layout shift when Preloader vanishes.
        */}
        
        <RouteAppShell scrollLocked={scrollLocked} />
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
