import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, User, BarChart2, Info, LogIn, MessageSquare, FileEdit, Bell } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-[150px] h-10 hover:opacity-80 transition-opacity">
                  <Image 
                    src="/logo.png" 
                    alt="Folkets Stemme Logo" 
                    fill 
                    className="object-contain object-left"
                    priority
                  />
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
