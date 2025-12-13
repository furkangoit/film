import React, { useState } from 'react';
import { Star, Calendar, Play, Heart, Eye, Check } from 'lucide-react';
import { Movie } from '../types';
import { getTMDBPosterUrl } from '../services/tmdbService';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  index: number;
  isFavorite: boolean;
  isWatched: boolean;
  onToggleFavorite: (movie: Movie) => void;
  onToggleWatched: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onClick,
  index,
  isFavorite,
  isWatched,
  onToggleFavorite,
  onToggleWatched
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Film posterini al - önce TMDB, yoksa Pollinations AI fallback
  const getImageUrl = (): string => {
    // Önce movie nesnesindeki posterUrl'i kontrol et
    if (movie.posterUrl) {
      return movie.posterUrl;
    }

    // TMDB'den poster al
    const tmdbUrl = getTMDBPosterUrl(movie.title);
    if (tmdbUrl) {
      return tmdbUrl;
    }

    // Fallback: Pollinations AI ile poster oluştur
    const prompt = encodeURIComponent(
      `${movie.title} ${movie.year} film poster minimal cinematic high quality professional movie cover art`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=600&height=900&nologo=true`;
  };

  const imageUrl = getImageUrl();

  const handleCardClick = () => {
    if (isClicked) return;
    setIsClicked(true);
    setTimeout(() => {
      onClick(movie);
      setTimeout(() => setIsClicked(false), 500);
    }, 300);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavAnimating(true);
    onToggleFavorite(movie);
    setTimeout(() => setFavAnimating(false), 400);
  };

  return (
    <div 
      className={`group relative bg-secondary rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out 
        ${isClicked 
          ? 'scale-110 shadow-[0_0_50px_rgba(229,9,20,0.6)] z-50 ring-4 ring-primary' 
          : 'hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 hover:z-10 ring-0 hover:ring-2 hover:ring-primary/50'
        }`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="aspect-[2/3] w-full relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Poster Image */}
        <img 
          src={imageUrl} 
          alt={movie.title}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback: CineAI temalı gradient + film adı
            const title = movie.title.substring(0, 25);
            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 900'%3E%3Cdefs%3E%3ClinearGradient id='cinemaGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E50914;stop-opacity:0.2' /%3E%3Cstop offset='50%25' style='stop-color:%231a1a1a;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23000;stop-opacity:1' /%3E%3C/linearGradient%3E%3ClinearGradient id='shimmer' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' style='stop-color:%23333;stop-opacity:0' /%3E%3Cstop offset='50%25' style='stop-color:%23666;stop-opacity:0.3' /%3E%3Cstop offset='100%25' style='stop-color:%23333;stop-opacity:0' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='900' fill='url(%23cinemaGrad)'/%3E%3Crect width='600' height='900' fill='url(%23shimmer)' opacity='0.5'/%3E%3Crect x='30' y='30' width='540' height='840' rx='10' fill='none' stroke='%23E50914' stroke-width='2' opacity='0.3'/%3E%3Ctext x='300' y='400' text-anchor='middle' font-family='Arial, sans-serif' font-size='32' font-weight='bold' fill='%23E50914' opacity='0.8'%3ECineAI%3C/text%3E%3Ctext x='300' y='480' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%23ccc' opacity='0.6'%3E${title}%3C/text%3E%3Ctext x='300' y='550' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%23999'%3E${movie.year}%3C/text%3E%3C/svg%3E`;
            setImageLoaded(true);
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        
        {/* Watched Badge */}
        {isWatched && (
          <div className={`absolute top-2 left-2 z-10 bg-green-600/90 text-white text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-md flex items-center gap-1 border border-green-500 transition-opacity duration-300 pointer-events-none ${isClicked ? 'opacity-0' : 'group-hover:opacity-0'}`}>
            <Check className="w-3 h-3" />
            <span className="hidden sm:inline">İzlendi</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 border border-white/10 group-hover:border-primary/50 transition-colors z-20">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs font-bold text-white">{movie.rating.toFixed(1)}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className={`absolute top-2 left-2 z-20 flex flex-col gap-2 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0 ${isClicked ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={handleToggleFav}
            className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all border border-white/10 ${
              isFavorite 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-black/60 text-white hover:bg-white hover:text-red-600'
            }`}
            title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''} ${favAnimating ? 'animate-heart-burst' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatched(movie);
            }}
            className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all border border-white/10 ${
              isWatched 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-black/60 text-white hover:bg-white hover:text-green-600'
            }`}
            title={isWatched ? "İzlenmedi olarak işaretle" : "İzlendi olarak işaretle"}
          >
            {isWatched ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Play Button on Click */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 delay-100 pointer-events-none ${isClicked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-14 h-14 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 ${isClicked ? 'scale-110' : 'scale-50 group-hover:scale-100'}`}>
            <Play className="w-6 h-6 text-white ml-1 fill-current" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-3 text-gray-300 text-xs mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {movie.year}
          </span>
          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
          <span className="truncate max-w-[100px]">{movie.genre.split(',')[0]}</span>
        </div>

        {/* Overview - shown on hover */}
        <p className="text-gray-400 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto">
          {movie.overview}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;