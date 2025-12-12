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