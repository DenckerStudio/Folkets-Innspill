'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Search, User, BarChart2, Info, LogIn, LogOut, MessageSquare, FileEdit, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    const { getBrowserSupabase } = await import('@/lib/supabase');
    await getBrowserSupabase().auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', icon: Home, label: 'Forside' },
    { href: '/utforsk', icon: Search, label: 'Utforsk' },
    { href: '/horinger', icon: FileEdit, label: 'Høringer' },
    { href: '/politiker-hub', icon: BarChart2, label: 'Politiker-hub' },
    { href: '/forum', icon: MessageSquare, label: 'Forum' },
    { href: '/om-oss', icon: Info, label: 'Om oss' },
  ];

  const isLoggedIn = !!user;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative hover:opacity-90 transition-opacity flex items-center gap-3">
                  <svg viewBox="0 0 200 250" className="w-12 h-14" xmlns="http://www.w3.org/2000/svg">
                    <clipPath id="bubble">
                      <path d="M 40 0 H 160 A 40 40 0 0 1 200 40 V 160 A 40 40 0 0 1 160 200 H 140 L 145 240 L 100 200 H 40 A 40 40 0 0 1 0 160 V 40 A 40 40 0 0 1 40 0 Z" />
                    </clipPath>
                    <g clipPath="url(#bubble)">
                      <rect width="200" height="250" fill="#ba0c2f" />
                      <rect x="60" y="0" width="30" height="250" fill="white" />
                      <rect x="0" y="80" width="200" height="30" fill="white" />
                      <rect x="70" y="0" width="10" height="250" fill="#00205b" />
                      <rect x="0" y="90" width="200" height="10" fill="#00205b" />
                      <path d="M 0 150 L 90 60 L 120 90 L 220 -10 L 220 250 L 0 250 Z" fill="#ba0c2f" />
                      <path d="M -10 160 L 90 60 L 120 90 L 230 -20" fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="120" cy="90" r="14" fill="#00205b" stroke="white" strokeWidth="6" />
                    </g>
                  </svg>
                  <div className="flex flex-col justify-center font-extrabold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <span className="text-[#00205b] text-xl leading-none mb-0.5">FOLKETS</span>
                    <span className="text-[#ba0c2f] text-xl leading-none mt-0.5">STEMME</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:ml-6 lg:flex lg:items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/min-side?tab=varsler" className="relative text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                  <span className="sr-only">Varsler</span>
                </Link>
                <Link href="/min-side" className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                    {displayName.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden xl:inline">{displayName}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logg ut
                </button>
              </>
            ) : (
              <>
                <Link href="/min-side" className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                  <User className="w-5 h-5" />
                  <span className="sr-only">Min side</span>
                </Link>
                <Link href="/auth/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  <LogIn className="w-4 h-4 mr-2" />
                  Logg inn
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Åpne hovedmeny</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 rounded-md text-base font-medium">
                  <link.icon className="w-5 h-5 mr-3 text-gray-500" />
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-4 border-t border-gray-200">
              <div className="flex items-center px-4 space-x-4">
                {isLoggedIn ? (
                  <>
                    <Link href="/min-side" onClick={() => setIsMobileMenuOpen(false)} className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-full">
                      <User className="h-6 w-6" />
                    </Link>
                    <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <LogOut className="w-5 h-5 mr-2" /> Logg ut
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <LogIn className="w-5 h-5 mr-2" /> Logg inn
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
