import Link from 'next/link';
import { Home, Search, User, BarChart2, Info, LogIn, MessageSquare, FileEdit, Bell } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative hover:opacity-90 transition-opacity flex items-center gap-3">
                  <svg viewBox="0 0 200 250" className="w-12 h-14" xmlns="http://www.w3.org/2000/svg">
                    <clipPath id="bubble">
                      <path d="M 40 0 
                               H 160 
                               A 40 40 0 0 1 200 40 
                               V 160 
                               A 40 40 0 0 1 160 200 
                               H 140 
                               L 145 240 
                               L 100 200 
                               H 40 
                               A 40 40 0 0 1 0 160 
                               V 40 
                               A 40 40 0 0 1 40 0 Z" />
                    </clipPath>
                    <g clipPath="url(#bubble)">
                      {/* Background Red */}
                      <rect width="200" height="250" fill="#ba0c2f" />
                      
                      {/* White Cross */}
                      <rect x="60" y="0" width="30" height="250" fill="white" />
                      <rect x="0" y="80" width="200" height="30" fill="white" />
                      
                      {/* Blue Cross */}
                      <rect x="70" y="0" width="10" height="250" fill="#00205b" />
                      <rect x="0" y="90" width="200" height="10" fill="#00205b" />
                
                      {/* Red section below chart line */}
                      <path d="M 0 150 L 90 60 L 120 90 L 220 -10 L 220 250 L 0 250 Z" fill="#ba0c2f" />
                      
                      {/* White chart line */}
                      <path d="M -10 160 L 90 60 L 120 90 L 230 -20" fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Chart node */}
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
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Home className="w-4 h-4 mr-2" />
                Forside
              </Link>
              <Link href="/utforsk" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Search className="w-4 h-4 mr-2" />
                Utforsk
              </Link>
              <Link href="/horinger" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <FileEdit className="w-4 h-4 mr-2" />
                Høringer
              </Link>
              <Link href="/politiker-hub" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <BarChart2 className="w-4 h-4 mr-2" />
                Politiker-hub
              </Link>
              <Link href="/forum" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4 mr-2" />
                Forum
              </Link>
              <Link href="/om-oss" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Info className="w-4 h-4 mr-2" />
                Om oss
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <Link href="/min-side?tab=varsler" className="relative text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                <span className="sr-only">Varsler</span>
              </Link>
              <Link href="/min-side" className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                <User className="w-5 h-5" />
                <span className="sr-only">Min side</span>
              </Link>
            <Link href="/auth/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <LogIn className="w-4 h-4 mr-2" />
              Logg inn
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
