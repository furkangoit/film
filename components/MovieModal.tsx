import React, { useState } from 'react';
import { X, Star, Calendar, Clock, User, Heart, Eye, Film, MessageSquare, Play, Send, ListPlus, Check } from 'lucide-react';
import { Movie, CustomList } from '../types';

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

const MovieModal: React.FC<MovieModalProps> = ({
  movie,
  onClose,
  onToggleFavorite,
  isFavorite,
  onToggleWatched,
  isWatched,
  customLists,
  onAddToList,
}) => {
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviews, setReviews] = useState<any[]>([]);

  if (!movie) return null;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const review = {
      id: Date.now().toString(),
      userName: 'Misafir Kullanıcı',
      rating: newRating,
      text: newComment,
      date: new Date().toLocaleDateString('tr-TR')
    };

    setReviews([review, ...reviews]);
    setNewComment('');
  };

  const posterUrl = `https://source.unsplash.com/600x900/?${encodeURIComponent(movie.title)},cinema`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#181818] w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* HERO SECTION - Backdrop Image */}
        <div className="relative h-72 md:h-96 w-full bg-gray-900 overflow-hidden">
          <img 
            src={posterUrl}
            alt="Backdrop" 
            className="w-full h-full object-cover opacity-70"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=400&fit=crop';
            }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent"></div>
          
          {/* Title & Info - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{movie.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200 mb-6 font-medium">
              {movie.rating && (
                <span className="flex items-center gap-1 text-green-400 font-bold bg-black/40 px-3 py-1 rounded">
                  <Star className="w-4 h-4 fill-current" /> {movie.rating}/10
                </span>
              )}
              {movie.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {movie.year}
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {movie.duration}
                </span>
              )}
              {movie.genre && (
                <span className="px-3 py-1 border border-gray-400/50 rounded text-xs uppercase bg-white/5">{movie.genre}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => onToggleFavorite(movie)}
                className={`px-6 py-2.5 rounded font-bold flex items-center gap-2 transition-all ${
                  isFavorite 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-primary hover:bg-red-700 text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                {isFavorite ? 'Favori' : 'Favoriye Ekle'}
              </button>
              
              <button 
                onClick={() => onToggleWatched(movie)}
                className={`px-6 py-2.5 rounded font-bold flex items-center gap-2 transition-all ${
                  isWatched 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <Eye className="w-5 h-5" />
                {isWatched ? 'İzlendi' : 'İzledim'}
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* Movie Overview */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> 
              Film Özeti
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {movie.overview}
            </p>
          </div>

          {/* Director & Cast */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="bg-gray-800 p-2 rounded-full">
                <User className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-1">Yönetmen</h4>
                <p className="text-white font-medium text-lg">{movie.director}</p>
              </div>
            </div>
            
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Oyuncu Kadrosu</h4>
                <div className="flex flex-wrap gap-3">
                  {movie.cast.map((actor, idx) => (
                    <span key={idx} className="bg-white/5 text-gray-200 px-3 py-1.5 rounded-full text-sm border border-white/10">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Reviews Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Yorumlar
            </h3>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="bg-[#202020] p-5 rounded-xl border border-white/5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Puan Ver (1-5):</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-6 h-6 transition-colors ${
                          star <= newRating 
                            ? 'fill-yellow-400 text-yellow-400' 
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
                placeholder="Yorum yaz..."
                className="w-full bg-black/30 text-white border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary text-sm min-h-[80px] resize-none"
              />
              
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="w-full px-4 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Yorum Yap
              </button>
            </form>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz yorum yapılmamış.
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#202020] p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white">{review.userName}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{review.text}</p>
                    <p className="text-gray-500 text-xs mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Lists */}
          <div className="relative">
            <button 
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ListPlus className="w-5 h-5" />
              Listeye Ekle
            </button>
            
            {showListDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#202020] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                {customLists.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Henüz liste yok
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    {customLists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => {
                          onAddToList(list.id, movie);
                          setShowListDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 text-white text-sm flex items-center justify-between border-b border-white/5 last:border-0"
                      >
                        <span>{list.name}</span>
                        {list.movies.some(m => m.id === movie.id) && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;