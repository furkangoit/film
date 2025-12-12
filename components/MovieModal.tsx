import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Clock, User, Film, Heart, MessageSquare, Send, Play, ImageDown, ExternalLink, Eye, ListPlus, Check, Sparkles, Loader2, Info } from 'lucide-react';
import { Movie, Review, CustomList } from '../types';
import { getDetailedMovieOverview, getActorDetails } from '../services/geminiService';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onToggleFavorite: (movie: Movie) => void;
  isFavorite: boolean;
  onToggleWatched: (movie: Movie) => void;
  isWatched: boolean;
  customLists: CustomList[];
  onAddToList: (listId: string, movie: Movie) => void;
}

// Internal component for individual actor to handle hover state separately
const ActorItem: React.FC<{ name: string }> = ({ name }) => {
  const [details, setDetails] = useState<{ bio: string, famousMovies: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = async () => {
    setHovered(true);
    if (!details && !loading) {
      setLoading(true);
      const data = await getActorDetails(name);
      setDetails(data);
      setLoading(false);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  // Get initials
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3 bg-white/5 pl-1 pr-4 py-1.5 rounded-full border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-help">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 border border-white/10 group-hover:border-primary/50 transition-colors shadow-inner">
          {initials}
        </div>
        <span className="text-sm text-gray-200 group-hover:text-white transition-colors">{name}</span>
      </div>

      {/* Tooltip / Popover */}
      {hovered && (
        <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#252525] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#252525] border-b border-r border-white/10 transform rotate-45"></div>
          
          <h4 className="font-bold text-white mb-1 flex items-center gap-2">
            {name}
            {loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </h4>
          
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-2 bg-white/10 rounded w-full"></div>
              <div className="h-2 bg-white/10 rounded w-3/4"></div>
              <div className="h-2 bg-white/10 rounded w-1/2 mt-2"></div>
            </div>
          ) : details ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 leading-relaxed border-b border-white/5 pb-2">
                {details.bio}
              </p>
              <div>
                <p className="text-[10px] uppercase font-bold text-primary mb-1">Bilinen Yapımları</p>
                <div className="flex flex-wrap gap-1">
                  {details.famousMovies.map((m, i) => (
                    <span key={i} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">Bilgi bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
};

const MovieModal: React.FC<MovieModalProps> = ({ 
  movie, 
  onClose, 
  onToggleFavorite, 
  isFavorite,
  onToggleWatched,
  isWatched,
  customLists,
  onAddToList
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [detailedOverview, setDetailedOverview] = useState<string | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);

  // Load reviews when movie changes
  useEffect(() => {
    if (movie) {
      const storedReviews = localStorage.getItem(`reviews_${movie.id}`);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      } else {
        setReviews([]);
      }
      setNewComment('');
      setNewRating(5);
      setShowListDropdown(false);
      
      // Reset animations and data
      setIsVisible(false);
      setDetailedOverview(null);
      setLoadingOverview(true);
      
      // Trigger entrance animation
      const animTimer = setTimeout(() => setIsVisible(true), 150);

      // Fetch AI overview
      const fetchOverview = async () => {
        const text = await getDetailedMovieOverview(movie.title);
        if (text) {
          setDetailedOverview(text);
        }
        setLoadingOverview(false);
      };
      
      fetchOverview();

      return () => clearTimeout(animTimer);
    }
  }, [movie]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie || !newComment.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      movieId: movie.id,
      userName: 'Misafir Kullanıcı', // Simplified for this demo
      text: newComment,
      rating: newRating,
      date: new Date().toLocaleDateString('tr-TR')
    };

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${movie.id}`, JSON.stringify(updatedReviews));
    setNewComment('');
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handlePlayTrailer = () => {
    if (!movie) return;
    const query = encodeURIComponent(`${movie.title} trailer fragman`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const handleViewWallpaper = () => {
    if (movie) {
      const encodedBackdrop = encodeURIComponent(`${movie.title} cinematic movie scene wide shot 8k`);
      const url = `https://image.pollinations.ai/prompt/${encodedBackdrop}?width=1920&height=1080&nologo=true`;
      window.open(url, '_blank');
    }
  };

  const handleToggleFav = () => {
    if (!movie) return;
    setFavAnimating(true);
    onToggleFavorite(movie);
    setTimeout(() => setFavAnimating(false), 400);
  };

  if (!movie) return null;

  const encodedPoster = encodeURIComponent(`${movie.title} cinematic movie poster minimal high quality`);
  const encodedBackdrop = encodeURIComponent(`${movie.title} cinematic movie scene wide shot 8k dramatic lighting`);
  
  const posterUrl = `https://image.pollinations.ai/prompt/${encodedPoster}?width=600&height=900&nologo=true`;
  const backdropUrl = `https://image.pollinations.ai/prompt/${encodedBackdrop}?width=1280&height=720&nologo=true`;
  
  const userAverage = calculateAverageRating();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-[#181818] w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10 max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Backdrop */}
        <div className="relative h-72 md:h-96 w-full shrink-0 group bg-gray-900 overflow-hidden">
          <img 
            src={backdropUrl} 
            alt="Backdrop" 
            className="w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
            <h2 className="text-3xl md:text-6xl font-bold text-white mb-3 drop-shadow-lg">{movie.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200 mb-6 font-medium">
               <span className="flex items-center gap-1 text-green-400 font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm" title="IMDb Puanı">
                 <Star className="w-4 h-4 fill-current" /> {movie.rating}/10
               </span>
               
               <span className="flex items-center gap-1">
                 <Calendar className="w-4 h-4" /> {movie.year}
               </span>
               {movie.duration && (
                 <span className="flex items-center gap-1">
                   <Clock className="w-4 h-4" /> {movie.duration}
                 </span>
               )}
               <span className="px-2 py-0.5 border border-gray-400/50 rounded text-xs uppercase tracking-wide bg-white/5 backdrop-blur-sm">{movie.genre}</span>
            </div>

            {/* Hero Actions */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handlePlayTrailer}
                className="px-6 py-2.5 bg-primary hover:bg-red-700 text-white font-bold rounded flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
              >
                <Play className="w-5 h-5 fill-current" />
                Fragman Oynat
              </button>
              
              <button 
                onClick={handleViewWallpaper}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded backdrop-blur-md flex items-center gap-2 transition-all border border-white/10"
              >
                <ImageDown className="w-5 h-5" />
                Duvar Kağıdı
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-10 grid md:grid-cols-3 gap-10">
          
          {/* Left Column (Poster & Actions) - Desktop */}
          <div className="hidden md:block col-span-1 -mt-32 relative z-10 space-y-4">
             <div className="rounded-lg shadow-2xl border-2 border-white/10 overflow-hidden transform transition-transform hover:rotate-1 bg-gray-800">
                <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
             </div>
             
             {/* Action Buttons Group */}
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleToggleFav}
                  className={`col-span-2 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isFavorite ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-800 text-white hover:bg-gray-700 border border-white/5'}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''} ${favAnimating ? 'animate-heart-burst' : ''}`} />
                  {isFavorite ? 'Favori' : 'Favoriye Ekle'}
                </button>
                
                <button 
                  onClick={() => onToggleWatched(movie)}
                  className={`py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isWatched ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700 border border-white/5'}`}
                  title={isWatched ? "İzlenmedi olarak işaretle" : "İzlendi olarak işaretle"}
                >
                  <Eye className={`w-4 h-4 ${isWatched ? 'fill-white' : ''}`} />
                  {isWatched ? 'İzlendi' : 'İzledim'}
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className="w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg bg-gray-800 text-white hover:bg-gray-700 border border-white/5"
                  >
                    <ListPlus className="w-4 h-4" />
                    Liste
                  </button>
                  {showListDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#202020] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                       <div className="p-2 text-xs text-gray-400 font-semibold uppercase">Listeye Ekle</div>
                       {customLists.length === 0 ? (
                         <div className="p-3 text-sm text-gray-500 text-center">Henüz listeniz yok. Profil sayfasından oluşturun.</div>
                       ) : (
                         <div className="max-h-40 overflow-y-auto">
                            {customLists.map(list => (
                              <button
                                key={list.id}
                                onClick={() => {
                                  onAddToList(list.id, movie);
                                  setShowListDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm text-white flex items-center justify-between"
                              >
                                <span>{list.name}</span>
                                {list.movies.some(m => m.id === movie.id) && <Check className="w-3 h-3 text-green-500" />}
                              </button>
                            ))}
                         </div>
                       )}
                    </div>
                  )}
                </div>
             </div>

             {/* Review Stat Summary */}
             {reviews.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/5 text-center">
                   <div className="text-3xl font-bold text-yellow-400 mb-1">{userAverage}</div>
                   <div className="flex justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(Number(userAverage)) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                      ))}
                   </div>
                   <div className="text-xs text-gray-400">{reviews.length} kullanıcı oyu</div>
                </div>
             )}
          </div>

          {/* Right Column (Details + Reviews) */}
          <div className={`md:col-span-2 space-y-8 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
            
            {/* Movie Details Section */}
            <div className="space-y-8">
               {/* Mobile Poster & Actions */}
                <div className="md:hidden flex flex-col gap-4">
                  <div className="w-48 mx-auto shadow-2xl rounded-lg overflow-hidden border border-white/10 rotate-1 bg-gray-800">
                    <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={handleToggleFav}
                      className={`p-3 rounded-full border ${isFavorite ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20'}`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''} ${favAnimating ? 'animate-heart-burst' : ''}`} />
                    </button>
                    <button 
                      onClick={() => onToggleWatched(movie)}
                      className={`p-3 rounded-full border ${isWatched ? 'bg-green-600 text-white border-green-600' : 'bg-transparent text-white border-white/20'}`}
                    >
                      <Eye className={`w-5 h-5`} />
                    </button>
                    <button 
                      onClick={() => setShowListDropdown(!showListDropdown)}
                      className="p-3 rounded-full border bg-transparent text-white border-white/20 relative"
                    >
                      <ListPlus className="w-5 h-5" />
                       {showListDropdown && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#202020] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden text-left">
                           {customLists.map(list => (
                              <button
                                key={list.id}
                                onClick={() => {
                                  onAddToList(list.id, movie);
                                  setShowListDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm text-white flex items-center justify-between"
                              >
                                <span>{list.name}</span>
                                {list.movies.some(m => m.id === movie.id) && <Check className="w-3 h-3 text-green-500" />}
                              </button>
                            ))}
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" /> 
                    Film Özeti
                    {detailedOverview && (
                      <span className="text-xs font-normal text-purple-400 flex items-center gap-1 border border-purple-400/30 px-2 py-0.5 rounded-full bg-purple-400/10">
                        <Sparkles className="w-3 h-3" /> AI Detaylandırdı
                      </span>
                    )}
                  </h3>
                  
                  <div className="relative min-h-[100px]">
                    <p className={`text-gray-300 leading-relaxed text-lg font-light transition-opacity duration-500 ${loadingOverview ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                       {detailedOverview || movie.overview}
                    </p>
                    {loadingOverview && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-sm text-primary">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Yapay zeka detaylandırıyor...</span>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="bg-gray-800 p-2 rounded-full">
                       <User className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Yönetmen</h3>
                      <p className="text-white font-medium text-lg">{movie.director}</p>
                    </div>
                  </div>
                  
                  {movie.cast && movie.cast.length > 0 && (
                    <div>
                       <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" /> Oyuncu Kadrosu
                        <span className="text-xs normal-case font-normal text-gray-500">(Detaylar için ismin üzerine geliniz)</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {movie.cast.map((actor, idx) => (
                          <ActorItem key={idx} name={actor} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

            {/* Reviews Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Yorumlar ve Puanlar
              </h3>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-[#202020] p-5 rounded-xl border border-white/5 shadow-inner">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Puan Ver:</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transform hover:scale-110 transition-transform"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(star)}
                        >
                          <Star 
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoverRating || newRating) 
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' 
                                : 'text-gray-600'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Bu film hakkında düşüncelerin neler? Spoiler vermemeye dikkat et :)"
                    className="w-full bg-black/30 text-white border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none text-sm min-h-[80px]"
                  />
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Yorum Yap
                    </button>
                  </div>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-[#202020] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-red-900 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block">{review.userName}</span>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 bg-black/20 px-2 py-1 rounded-full">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed pl-12">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-600 italic">
               <p>* Bu içerik yapay zeka tarafından oluşturulmuştur.</p>
               <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>IMDb'de İncele</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;