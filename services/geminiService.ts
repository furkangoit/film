import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Movie } from "../types";

// Extend ImportMeta interface to include env property
declare global {
  interface ImportMeta {
    env: {
      VITE_GEMINI_API_KEY: string;
    };
  }
}

// Initialize Gemini AI with API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Fallback data for offline/error scenarios
const FALLBACK_MOVIES: Movie[] = [
  {
    id: "fb1",
    title: "Esaretin Bedeli",
    overview: "Andy Dufresne, karısını ve onun sevgilisini öldürmek suçundan ömür boyu hapse mahkum edilir. Shawshank Hapishanesi'nde geçirdiği süre boyunca umudunu kaybetmeden hayata tutunur.",
    year: 1994,
    rating: 9.3,
    genre: "Dram",
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"]
  },
  {
    id: "fb2",
    title: "Başlangıç (Inception)",
    overview: "Dom Cobb, çok yetenekli bir hırsızdır. Uzmanlık alanı, zihnin en savunmasız olduğu rüya anında, bilinçaltının derinliklerinden değerli sırları çalmaktır.",
    year: 2010,
    rating: 8.8,
    genre: "Bilim Kurgu, Aksiyon",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]
  },
  {
    id: "fb3",
    title: "Kara Şövalye",
    overview: "Batman, Teğmen Jim Gordon ve Bölge Savcısı Harvey Dent ile bir araya gelerek Gotham Sokaklarını sarmış olan suç örgütlerini temizlemeye girişir.",
    year: 2008,
    rating: 9.0,
    genre: "Aksiyon, Suç",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"]
  },
  {
    id: "fb4",
    title: "Yüzüklerin Efendisi: Kralın Dönüşü",
    overview: "Sauron'un orduları, insan ırkını ortadan kaldırmak için Minas Tirith'e saldırırken, Gandalf ve Aragorn dünyayı kurtarmak için çabalar.",
    year: 2003,
    rating: 9.0,
    genre: "Fantastik, Macera",
    director: "Peter Jackson",
    cast: ["Elijah Wood", "Viggo Mortensen", "Ian McKellen"]
  }
];

const movieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    movies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID based on movie title hash or random" },
          title: { type: Type.STRING },
          overview: { type: Type.STRING, description: "Short summary in Turkish, 2-3 sentences" },
          year: { type: Type.INTEGER },
          rating: { type: Type.NUMBER, description: "IMDb score (1-10)" },
          genre: { type: Type.STRING, description: "Film genre in Turkish" },
          director: { type: Type.STRING },
          duration: { type: Type.STRING, description: "Duration format: 2s 15dk" },
          cast: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of main actors"
          }
        },
        required: ["title", "overview", "year", "rating", "genre", "director", "cast"]
      }
    },
    summary: { 
      type: Type.STRING, 
      description: "A friendly, engaging message in Turkish introducing the list" 
    }
  },
  required: ["movies", "summary"]
};

const actorSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bio: { type: Type.STRING, description: "Very short biography in Turkish (max 20 words)" },
    famousMovies: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Top 3-4 most famous movies of the actor"
    }
  },
  required: ["bio", "famousMovies"]
};

export const fetchMovies = async (prompt: string): Promise<{ movies: Movie[], summary: string }> => {
  try {
    // Check if API key is available
    if (!ai || !apiKey) {
      console.warn("Gemini API key not configured. Using fallback data.");
      return { 
        movies: FALLBACK_MOVIES, 
        summary: "AI servisi şu anda kullanılabilir değil. Çevrimdışı listeyi görüntülüyorsunuz." 
      };
    }

    const modelId = "gemini-2.5-flash"; // Fastest model, perfect for lists

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "Sen uzman bir film eleştirmenisin. Türkçe yanıt ver. Kullanıcı senden film önerileri veya belirli bir türde liste istediğinde, her zaman geçerli JSON formatında yanıt dön. JSON dışında hiçbir metin ekleme.",
        responseMimeType: "application/json",
        responseSchema: movieSchema,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from API");
    }

    const data = JSON.parse(text);
    
    // Validate response structure
    if (!data.movies || !Array.isArray(data.movies)) {
      throw new Error("Invalid response structure");
    }

    // Ensure all movies have required fields
    const validMovies = data.movies.filter((movie: any) => 
      movie.id && movie.title && movie.overview && movie.year && movie.rating && movie.genre && movie.director
    );

    return {
      movies: validMovies.length > 0 ? validMovies : FALLBACK_MOVIES,
      summary: data.summary || "Film listesi başarıyla yüklendi."
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      movies: FALLBACK_MOVIES, 
      summary: "Üzgünüm, şu anda AI servisine ulaşılamıyor. Lütfen API key'inizi kontrol edin veya daha sonra tekrar deneyin." 
    };
  }
};

export const getTrendingMovies = async (): Promise<{ movies: Movie[], summary: string }> => {
  const result = await fetchMovies(
    `Bana şu an popüler olan, farklı türlerden 8 adet yüksek puanlı film öner. 
     Klasikler ve modern filmler karışık olsun. Her birinin özeti ilgi çekici ve kısa olmalı.
     Oyuncu listesi ekle. JSON formatında cevap ver.`
  );
  
  // Return fallback content if API fails for main page
  if (result.movies.length === 0) {
    return {
      movies: FALLBACK_MOVIES,
      summary: "AI servisine ulaşılamadığı için çevrimdışı popüler listeyi görüntülüyorsunuz."
    };
  }
  
  return result;
};

export const searchMoviesAI = async (query: string): Promise<{ movies: Movie[], summary: string }> => {
  return fetchMovies(
    `Kullanıcının isteğine göre film önerileri yap. İstek: "${query}"
     En az 6 ila 10 film öner. Çeşitli türlerden seç.
     Her film için oyuncu listesi ekle. JSON formatında cevap ver.`
  );
};

export const fetchMoviesByGenre = async (genre: string): Promise<{ movies: Movie[], summary: string }> => {
  return fetchMovies(
    `Bana en iyi, en popüler ve eleştirmenlerce beğenilen "${genre}" türündeki filmleri listele. 
     En az 8 film olsun. Özütleri ilgi çekici yaz. Oyuncu listesi ekle.
     JSON formatında cevap ver.`
  );
};

export const getPersonalizedRecommendations = async (
  watchedMovies: string[], 
  favoriteMovies: string[]
): Promise<{ movies: Movie[], summary: string }> => {
  const watchedStr = watchedMovies.slice(0, 5).join(", ") || "Belirtilmemiş";
  const favStr = favoriteMovies.slice(0, 5).join(", ") || "Belirtilmemiş";
  
  const prompt = `
    Kullanıcının film zevkine göre 8-10 adet kişiselleştirilmiş film önerisi yap.
    
    Kullanıcının İzlediği Filmler: ${watchedStr}
    Kullanıcının Favori Filmleri: ${favStr}
    
    Analiz et ve bu tarza uygun, henüz keşfetmemiş olabileceği yüksek kaliteli filmler öner. 
    Eğer liste çok kısaysa genel popüler kült ve kaliteli yapımlardan karma yap.
    Her film için oyuncu listesi ekle.
    Özet kısmında neden bu filmleri seçtiğini samimi bir dille açıkla.
    JSON formatında cevap ver.
  `;
  
  const result = await fetchMovies(prompt);
  
  // Return fallback if personalized recommendation fails
  if (result.movies.length === 0) {
    return {
      movies: FALLBACK_MOVIES,
      summary: "Kişiselleştirilmiş öneriler alınamadı. İşte her zaman izlenebilecek klasikler:"
    };
  }
  
  return result;
};

export const getDetailedMovieOverview = async (title: string): Promise<string | null> => {
  try {
    if (!ai || !apiKey) return null;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `"${title}" filmi için detaylı, sürükleyici ve atmosferi yansıtan bir özet yaz. 
                 Spoiler vermeden hikayenin derinliğini, temasını ve karakter motivasyonlarını anlat. 
                 Türkçe olsun. En fazla 3-4 cümle. Sadece özeti döndür, başka metin ekleme.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || null;
  } catch (error) {
    console.error("Detailed Overview Error:", error);
    return null;
  }
};

export const getActorDetails = async (actorName: string): Promise<{ bio: string, famousMovies: string[] } | null> => {
  try {
    if (!ai || !apiKey) return null;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${actorName} hakkında bilgi. Türkçe cevap ver. JSON formatında: bio (kısa biyografi) ve famousMovies (ünlü 3 filmi).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: actorSchema,
        temperature: 0.7,
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Actor Details Error:", error);
    return null;
  }
};
