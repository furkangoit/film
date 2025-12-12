# Copilot Instructions for CineAI Film Recommendation App

## Project Overview

**CineAI** is a React + TypeScript + Vite application that provides AI-powered movie recommendations using Google's Gemini API. The app is built as a Turkish-language film guide with personalization based on user watch history and favorites.

**Key Tech Stack:** React 19, TypeScript 5.8, Vite 6, Gemini 2.5 Flash API, lucide-react icons

## Architecture & Data Flow

### Core App Structure (`App.tsx`)

- **Single-file state management**: All state (movies, favorites, watched, custom lists) lives in App.tsx root component
- **LocalStorage persistence**: User data automatically syncs to localStorage in separate useEffect hooks for `favorites`, `watched`, and `customLists`
- **View state enum**: Uses `ViewState` (HOME, SEARCH_RESULTS, FAVORITES, PROFILE) to control UI rendering
- **Two recommendation modes**:
  - **Personalized** (if user has watch history/favorites): Uses `getPersonalizedRecommendations()` to analyze user taste
  - **Trending** (first visit): Uses `getTrendingMovies()` to show popular films

### Service Layer (`services/geminiService.ts`)

- **Single entry point**: `fetchMovies()` wraps all Gemini API calls with JSON schema validation
- **Schema-first design**: Uses Google GenAI `Schema` objects to enforce strict response structure (movieSchema, actorSchema)
- **Graceful degradation**: All functions return fallback data (`FALLBACK_MOVIES`) if API fails, ensuring app remains functional offline
- **System instruction pattern**: Uses Turkish film critic persona in system instruction; all API responses are in Turkish
- **Temperature control**: Set to 0.7 for creative but consistent recommendations
- **Model selection**: `gemini-2.5-flash` for speed (not gemini-2.5-pro)

### Movie Data Type (`types.ts`)

```typescript
export interface Movie {
  id: string; // Hash-based or random ID
  title: string; // Movie title (Turkish)
  overview: string; // Synopsis in Turkish (no spoilers)
  year: number; // Release year
  rating: number; // IMDb score out of 10
  genre: string; // Single or comma-separated (Turkish)
  director: string; // Director name
  duration?: string; // Optional, format: "2s 15dk"
  cast?: string[]; // Optional cast list
}
```

## Critical Patterns & Conventions

### 1. Component Patterns

- **Props drilling**: Components receive handlers via props (e.g., `onToggleFavorite`, `onClick`)
- **Icon library**: Use lucide-react imports; avoid custom SVGs
- **Styling**: Tailwind CSS with custom shadow effects (e.g., `shadow-primary/30` with `shadow-[0_0_50px_rgba(229,9,20,0.6)]`)
- **Animation states**: Track hover/click states locally (e.g., `isClicked`, `favAnimating` in MovieCard) to trigger CSS transitions

### 2. Image Management

- **Poster images**: Use Unsplash and Google Images as reliable sources for movie posters
- **Fallback strategy**: SVG gradient with movie title fallback when images fail to load
- **Error handling**: `onError` handler in img tag generates SVG placeholder with movie title
- **Image lazy loading**: `loading="lazy"` for performance optimization
- Implementation in [MovieCard.tsx](../components/MovieCard.tsx)

### 3. User Data Management

- **Dual-source pattern**: When computing personalized recommendations, read directly from localStorage (line 68-69 in [../App.tsx](../App.tsx)) rather than relying on React state, because state updates may not complete before async operations
- **List preservation**: All list operations maintain immutability using spread operators
- **Custom lists structure**: Each list is a `CustomList` with id, name, movies array, createdAt timestamp

### 4. Turkish Language Context

- **UI text**: All user-facing strings are in Turkish
- **API prompts**: All Gemini prompts are in Turkish; system instruction requires Turkish responses
- **Error messages**: Turkish ("Bir hata oluştu.", "İzlenmedi olarak işaretle")
- **Genre list**: Pre-defined Turkish genres in GENRES constant (Aksiyon, Komedi, Dram, etc.)

### 5. Environment & Build

- **API key setup**: `GEMINI_API_KEY` must be set in `.env.local`; Vite config exposes it via `define` (see vite.config.ts)
- **Development server**: Runs on port 3000 with `npm run dev`
- **Build output**: `npm run build` → Vite optimized production build
- **No Node.js APIs**: Code runs entirely in browser; `process.env` access only through Vite's define

## Integration Points

### Gemini API Integration

- **Request pattern**: All requests use `ai.models.generateContent()` with config object
- **Schema validation**: Response validated against schema before parsing JSON
- **Error handling**: Catch block logs to console and returns empty array with error message
- **Response format**: API always returns `{ movies: Movie[], summary: string }`
- **Fallback summary**: "Bir hata oluştu." (generic error) or context-specific (offline mode)

### LocalStorage Keys

- `favorites` - Array<Movie>
- `watched` - Array<Movie>
- `customLists` - Array<CustomList>
- No encryption; stores serialized JSON directly

## Development Workflows

### Adding a New Feature

1. **Data type first**: Add interface to [../types.ts](../types.ts) if needed
2. **Service method**: Add function to [../services/geminiService.ts](../services/geminiService.ts) using `fetchMovies()` pattern
3. **UI/state**: Wire in [../App.tsx](../App.tsx), add handlers, update relevant state/localStorage sync
4. **Component**: Create/modify component in [../components/](../components/) folder

### Common Tasks

- **New movie prompt**: Add function to [../services/geminiService.ts](../services/geminiService.ts) following `getTrendingMovies()` pattern
- **New view state**: Add to `ViewState` enum in [../types.ts](../types.ts), handle in [../App.tsx](../App.tsx) rendering
- **New component**: Follow [../components/MovieCard.tsx](../components/MovieCard.tsx) pattern (React.FC, prop destructuring, local animation state)

## Known Constraints & Gotchas

1. **API timeout**: Gemini calls can take 3-5 seconds; show loading state (`isLoading`) to users
2. **Fallback movies**: Used when network unavailable; if main page fails, app still functional
3. **Seed-based images**: Pollinations AI URLs are deterministic per movie/seed; refreshing same page gets same poster
4. **No build-time type checking for env**: Vite exposes env at runtime; typos in env var names will be `undefined` at runtime
5. **Component re-renders**: App.tsx has multiple useEffect hooks for data persistence; avoid adding expensive operations to render phase

## Example: Adding a New Recommendation Feature

```typescript
// In services/geminiService.ts
export const getMoodBasedRecommendations = async (
  mood: string
): Promise<{ movies: Movie[]; summary: string }> => {
  return fetchMovies(
    `Kullanıcının ruh haline göre film öner. Ruh hali: "${mood}". 6 film öner.`
  );
};

// In App.tsx handleSearch or new handler
const result = await getMoodBasedRecommendations(userMood);
setMovies(result.movies);
setSummary(result.summary);
```

**Remember**: Always use fetchMovies() for API calls and trust the schema validation. Maintain Turkish language throughout user-facing features.
