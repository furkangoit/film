import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import { getTrendingMovies, searchMoviesAI, fetchMoviesByGenre, getPersonalizedRecommendations } from './services/geminiService';
import { Movie, ViewState, CustomList } from './types';
import { Film, Loader2, RefreshCw, User, Eye, List, Plus, Trash2, FolderOpen, Sparkles, AlertCircle, WifiOff } from 'lucide-react';

const GENRES = [
  "Aksiyon", "Komedi", "Dram", "Bilim Kurgu", "Korku", "Romantik", "Gerilim", "Animasyon", "Belgesel", "Fantastik"
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watched, setWatched] = useState<Movie[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("Sizin için seçilen filmler.");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isPersonalized, setIsPersonalized] = useState<boolean>(false);
  
  // Profile state
  const [profileTab, setProfileTab] = useState<'watched' | 'lists'>('watched');
  const [newListName, setNewListName] = useState('');

  // Load data from local storage
  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites');
    const storedWatched = localStorage.getItem('watched');
    const storedLists = localStorage.getItem('customLists');

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedWatched) setWatched(JSON.parse(storedWatched));
    if (storedLists) setCustomLists(JSON.parse(storedLists));
  }, []);

  // Save data to local storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  useEffect(() => {
    localStorage.setItem('customLists', JSON.stringify(customLists));
  }, [customLists]);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setSelectedGenre(null);
    
    // We need to read from localStorage directly for the initial load to ensure we have data 
    // before the state update cycle completes in the first render.
    const localWatched = JSON.parse(localStorage.getItem('watched') || '[]');
    const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    const hasHistory = localWatched.length > 0 || localFavs.length > 0;

    try {
      if (hasHistory) {
        setSummary("Film zevkine göre yapay zeka analizi yapılıyor...");
        setIsPersonalized(true);
        const watchedTitles = localWatched.map((m: Movie) => m.title);
        const favTitles = localFavs.map((m: Movie) => m.title);
        
        const data = await getPersonalizedRecommendations(watchedTitles, favTitles);
        setMovies(data.movies);
        setSummary(data.summary);
      } else {
        setSummary("Popüler filmler yükleniyor...");
        setIsPersonalized(false);
        const data = await getTrendingMovies();
        setMovies(data.movies);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
      setSummary("Film listesi alınırken bir hata oluştu.");
      setMovies([]);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (!isInitialized) {
      loadContent();
    }
  }, [isInitialized, loadContent]);

  const handleSearch = async (query: string) => {
    setView(ViewState.SEARCH_RESULTS);
    setSelectedGenre(null);
    setIsPersonalized(false);
    setIsLoading(true);
    setSummary("Yapay zeka önerileri hazırlanıyor...");
    try {
      const data = await searchMoviesAI(query);
      setMovies(data.movies);
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      setSummary("Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreSelect = async (genre: string) => {
    if (selectedGenre === genre) {
      setView(ViewState.HOME);
      loadContent();
      return;
    }
    
    setSelectedGenre(genre);
    setIsPersonalized(false);
    setView(ViewState.HOME);
    setIsLoading(true);
    setSummary(`"${genre}" türündeki filmler getiriliyor...`);
    
    try {
      const data = await fetchMoviesByGenre(genre);
      setMovies(data.movies);
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      setSummary("Kategori yüklenirken bir hata oluştu.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (movie: Movie) => {
    setFavorites(prev => {
      const isFav = prev.some(m => m.id === movie.id);
      if (isFav) {
        return prev.filter(m => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleToggleWatched = (movie: Movie) => {
    setWatched(prev => {
      const isWatched = prev.some(m => m.id === movie.id);
      if (isWatched) {
        return prev.filter(m => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList: CustomList = {
      id: Date.now().toString(),
      name: newListName,
      movies: [],
      createdAt: new Date().toLocaleDateString('tr-TR')
    };

    setCustomLists([...customLists, newList]);
    setNewListName('');
  };

  const handleDeleteList = (listId: string) => {
    setCustomLists(prev => prev.filter(l => l.id !== listId));
  };

  const handleAddMovieToList = (listId: string, movie: Movie) => {
    setCustomLists(prev => prev.map(list => {
      if (list.id === listId) {
        if (list.movies.some(m => m.id === movie.id)) {
          return list;
        }
        return { ...list, movies: [...list.movies, movie] };
      }
      return list;
    }));
  };

  const handleRemoveMovieFromList = (listId: string, movieId: string) => {
    setCustomLists(prev => prev.map(list => {
      if (list.id === listId) {
        return { ...list, movies: list.movies.filter(m => m.id !== movieId) };
      }
      return list;
    }));
  };

  const renderProfile = () => {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#181818] p-6 rounded-xl border border-white/10 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-900 rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-[#141414] shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Misafir Kullanıcı</h2>
              <p className="text-gray-400 text-sm">Sinema Tutkunu</p>
              
              <div className="mt-6 flex justify-around border-t border-white/10 pt-4">
                 <div className="text-center">
                   <div className="text-xl font-bold text-primary">{watched.length}</div>
                   <div className="text-xs text-gray-400">İzlenen</div>
                 </div>
                 <div className="text-center">
                   <div className="text-xl font-bold text-primary">{favorites.length}</div>
                   <div className="text-xs text-gray-400">Favori</div>
                 </div>
                 <div className="text-center">
                   <div className="text-xl font-bold text-primary">{customLists.length}</div>
                   <div className="text-xs text-gray-400">Liste</div>
                 </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
               <button 
                 onClick={() => setProfileTab('watched')}
                 className={`p-4 rounded-lg flex items-center gap-3 transition-colors text-left ${profileTab === 'watched' ? 'bg-white/10 text-white font-medium border border-white/10' : 'text-gray-400 hover:bg-white/5'}`}
               >
                 <Eye className="w-5 h-5" />
                 İzleme Geçmişi
               </button>
               <button 
                 onClick={() => setProfileTab('lists')}
                 className={`p-4 rounded-lg flex items-center gap-3 transition-colors text-left ${profileTab === 'lists' ? 'bg-white/10 text-white font-medium border border-white/10' : 'text-gray-400 hover:bg-white/5'}`}
               >
                 <List className="w-5 h-5" />
                 Özel Listelerim
               </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
             {profileTab === 'watched' && (
               <div>
                 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                   <Eye className="w-6 h-6 text-primary" />
                   İzlediğim Filmler
                 </h2>
                 {watched.length === 0 ? (
                   <div className="bg-[#181818] rounded-xl p-10 text-center border border-white/5 border-dashed">
                      <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400">Henüz hiçbir filmi izlendi olarak işaretlemedin.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {watched.map((movie, index) => (
                        <MovieCard 
                          key={movie.id} 
                          movie={movie} 
                          index={index}
                          onClick={setSelectedMovie}
                          isFavorite={favorites.some(f => f.id === movie.id)}
                          isWatched={true}
                          onToggleFavorite={handleToggleFavorite}
                          onToggleWatched={handleToggleWatched}
                        />
                      ))}
                   </div>
                 )}
               </div>
             )}

             {profileTab === 'lists' && (
               <div className="space-y-8">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <List className="w-6 h-6 text-primary" />
                     Özel Listelerim
                   </h2>
                   <form onSubmit={handleCreateList} className="flex gap-2 w-full sm:w-auto">
                     <input 
                       type="text" 
                       placeholder="Yeni Liste Adı..."
                       value={newListName}
                       onChange={(e) => setNewListName(e.target.value)}
                       className="bg-[#181818] border border-white/10 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full"
                     />
                     <button type="submit" className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                       <Plus className="w-4 h-4" /> Oluştur
                     </button>
                   </form>
                 </div>

                 {customLists.length === 0 ? (
                    <div className="bg-[#181818] rounded-xl p-10 text-center border border-white/5 border-dashed">
                      <FolderOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400">Henüz özel bir liste oluşturmadın.</p>
                   </div>
                 ) : (
                   <div className="grid gap-6">
                      {customLists.map(list => (
                        <div key={list.id} className="bg-[#181818] rounded-xl border border-white/10 overflow-hidden">
                          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                              <h3 className="font-bold text-white text-lg">{list.name}</h3>
                              <span className="text-xs text-gray-500">{list.movies.length} Film • {list.createdAt}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteList(list.id)}
                              className="p-2 hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded transition-colors"
                              title="Listeyi Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {list.movies.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm italic">
                              Bu listede henüz film yok. Filmleri incelerken listeye ekleyebilirsin.
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {list.movies.map((movie, idx) => (
                                  <div key={`${list.id}-${movie.id}`} className="relative group">
                                     <MovieCard 
                                        movie={movie} 
                                        index={idx}
                                        onClick={setSelectedMovie}
                                        isFavorite={favorites.some(f => f.id === movie.id)}
                                        isWatched={watched.some(w => w.id === movie.id)}
                                        onToggleFavorite={handleToggleFavorite}
                                        onToggleWatched={handleToggleWatched} 
                                      />
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveMovieFromList(list.id, movie.id);
                                        }}
                                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                        title="Listeden Çıkar"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (view === ViewState.PROFILE) {
      return renderProfile();
    }

    if (view === ViewState.HOME && !isLoading && movies.length === 0) {
       // This handles the error/empty state for the Home view
       return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
               <WifiOff className="w-10 h-10 text-gray-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Film Verilerine Ulaşılamadı</h3>
             <p className="text-gray-400 max-w-md mb-8">{summary}</p>
             <button 
               onClick={loadContent}
               className="px-8 py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
             >
               <RefreshCw className="w-5 h-5" />
               Tekrar Dene
             </button>
          </div>
       );
    }
    
    if (view === ViewState.SEARCH_RESULTS && !isLoading && movies.length === 0) {
      // Empty Search Result
       return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
               <AlertCircle className="w-10 h-10 text-gray-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
             <p className="text-gray-400 max-w-md mb-8">Aradığınız kriterlere uygun film bulamadık. Lütfen farklı anahtar kelimelerle tekrar deneyin.</p>
          </div>
       );
    }

    if (view === ViewState.FAVORITES) {
      if (favorites.length === 0) {
        return (
           <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
             <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
               <Film className="w-10 h-10 text-gray-600" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Listeniz Henüz Boş</h2>
             <p className="text-gray-400 max-w-md">
               Henüz favori filminiz yok. Ana sayfaya dönüp keşfetmeye başlayın veya yapay zekadan öneri isteyin.
             </p>
             <button 
               onClick={() => {
                 setView(ViewState.HOME);
                 if (movies.length === 0) loadContent();
               }}
               className="mt-6 px-6 py-2 bg-primary hover:bg-red-700 text-white rounded transition-colors"
             >
               Film Keşfet
             </button>
           </div>
        );
      }
      return (
        <div className="container mx-auto px-4 py-8">
           <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-primary pl-4">Favorilerim</h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index}
                onClick={setSelectedMovie}
                isFavorite={true}
                isWatched={watched.some(w => w.id === movie.id)}
                onToggleFavorite={handleToggleFavorite}
                onToggleWatched={handleToggleWatched}
              />
            ))}
          </div>
        </div>
      );
    }

    // Home & Search Results with Content
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Genre Filter Bar - Only show on Home or Search Results */}
        <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
             <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
               <div className="absolute inset-4 border-t-4 border-white/50 rounded-full animate-spin reverse"></div>
             </div>
             <p className="mt-6 text-xl text-gray-300 font-light animate-pulse">{summary}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  {view === ViewState.SEARCH_RESULTS 
                    ? 'Arama Sonuçları' 
                    : selectedGenre 
                      ? `${selectedGenre} Filmleri` 
                      : isPersonalized 
                        ? <><Sparkles className="w-6 h-6 text-primary animate-pulse" /> Yapay Zeka Senin İçin Seçti</>
                        : 'Trend Filmler'}
                </h2>
                <p className="text-gray-400 text-sm md:text-base">{summary}</p>
              </div>
              {view === ViewState.HOME && !selectedGenre && (
                 <button 
                   onClick={loadContent}
                   className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
                   title="Listeyi Yenile"
                 >
                   <RefreshCw className="w-5 h-5" />
                 </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
              {movies.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  index={index}
                  onClick={setSelectedMovie} 
                  isFavorite={favorites.some(f => f.id === movie.id)}
                  isWatched={watched.some(w => w.id === movie.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleWatched={handleToggleWatched}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-primary selection:text-white">
      <Navbar 
        currentView={view} 
        onNavigate={setView} 
        onSearch={handleSearch}
        isSearching={isLoading}
      />
      
      {view === ViewState.HOME && !selectedGenre && !isLoading && (
        <Hero onSearchClick={() => document.querySelector('input')?.focus()} />
      )}

      {renderContent()}

      <MovieModal 
        movie={selectedMovie} 
        onClose={() => setSelectedMovie(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedMovie ? favorites.some(f => f.id === selectedMovie.id) : false}
        onToggleWatched={handleToggleWatched}
        isWatched={selectedMovie ? watched.some(m => m.id === selectedMovie.id) : false}
        customLists={customLists}
        onAddToList={handleAddMovieToList}
      />
      
      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Film className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">CineAI</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CineAI. Google Gemini API tarafından desteklenmektedir.
            <br />
            Tasarlanmış modern film deneyimi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;