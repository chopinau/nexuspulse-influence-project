import React from 'react';
import { createRoot } from 'react-dom/client';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Premium from './components/Premium';
import EntityDetail from './components/EntityDetail';
import { AppProvider, useAppContext } from './components/AppProvider';

function AppLayout() {
  const { pathname } = useAppContext();

  let content;
  if (pathname === '/' || pathname === '/en' || pathname === '/zh') {
    content = <Home />;
  } else if (pathname.includes('/premium')) {
    content = <Premium />;
  } else if (pathname.includes('/person/') || pathname.includes('/category/')) {
    // Extract slug from path like /person/elon-musk
    const parts = pathname.split('/');
    const slug = parts[parts.length - 1];
    content = <EntityDetail slug={slug} />;
  } else {
    content = <Home />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,#020617)] -z-20" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 mix-blend-overlay" />
      
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        {content}
      </main>
    </>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <AppLayout />
    </AppProvider>
  </React.StrictMode>
);
