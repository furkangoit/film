export interface Movie {
  id: string;
  title: string;
  overview: string;
  year: number;
  rating: number;
  genre: string;
  director: string;
  duration?: string;
  cast?: string[];
  userRating?: number;        // ✨ Kullanıcı puanı
  reviewCount?: number;        // ✨ Kaç kişi puanladı
  posterUrl?: string;          // ✨ Film posteri URL'si
}

export interface Review {
  id: string;
  movieId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  FAVORITES = 'FAVORITES',
  PROFILE = 'PROFILE'
}

export interface CustomList {
  id: string;
  name: string;
  movies: Movie[];
  createdAt: string;
}

export interface RecommendationResponse {
  movies: Movie[];
  summary: string;
}

// ✨ YENİ TYPES
export interface UserMovieRating {
  movieId: string;
  rating: number;
  date: string;
}

export interface SortOption {
  type: 'rating' | 'year' | 'title';
  label: string;
  direction: 'asc' | 'desc';
}

export interface GenreCombination {
  genres: string[];
  label: string;
  description?: string;
}