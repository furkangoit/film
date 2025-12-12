import React from 'react';
import { Film, Search, Heart, Home, UserCircle } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onSearch, isSearching }) => {
  const [searchInput, setSearchInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate(ViewState.HOME)}
        >
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Film className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">
            Cine<span className="text-primary">AI</span>
          </span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Ne izlemek istersin? (örn. 90'lar bilim kurgu...)"
            className="w-full bg-secondary/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          {isSearching && (
             <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </form>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => onNavigate(ViewState.HOME)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === ViewState.HOME ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Ana Sayfa</span>
          </button>
          
          <button 
            onClick={() => onNavigate(ViewState.FAVORITES)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === ViewState.FAVORITES ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Favorilerim</span>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.PROFILE)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === ViewState.PROFILE ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Profilim</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;