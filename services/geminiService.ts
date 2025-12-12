import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Movie } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
          overview: { type: Type.STRING, description: "Short summary in Turkish" },
          year: { type: Type.INTEGER },
          rating: { type: Type.NUMBER, description: "IMDb score usually out of 10" },
          genre: { type: Type.STRING },
          director: { type: Type.STRING },
          duration: { type: Type.STRING, description: "Example: 2s 15dk" },
          cast: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "overview", "year", "rating", "genre", "director", "cast"]
      }
    },
    summary: { type: Type.STRING, description: "A friendly, short message in Turkish introducing the list." }
  },
  required: ["movies", "summary"]
};

const actorSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bio: { type: Type.STRING, description: "Very short biography (max 20 words) in Turkish" },
    famousMovies: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Top 3 most famous movies of the actor" 
    }
  },
  required: ["bio", "famousMovies"]
};

export const fetchMovies = async (prompt: string): Promise<{ movies: Movie[], summary: string }> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast and good for lists

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "Sen uzman bir film eleştirmenisin. Türkçe yanıt ver. Kullanıcı senden film önerileri veya belirli bir türde liste istediğinde, her zaman JSON formatında yanıt dön.",
        responseMimeType: "application/json",
        responseSchema: movieSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return { movies: [], summary: "Bir hata oluştu." };

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      movies: [], 
      summary: "Üzgünüm, şu anda AI servisine ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin." 
    };
  }
};

export const getTrendingMovies = async (): Promise<{ movies: Movie[], summary: string }> => {
  const result = await fetchMovies("Bana şu an popüler olan, farklı türlerden 8 adet yüksek puanlı film öner. Klasikler ve modern filmler karışık olsun.");
  
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
  return fetchMovies(`Kullanıcının isteğine göre film önerileri yap. İstek: "${query}". En az 5 film öner.`);
};

export const fetchMoviesByGenre = async (genre: string): Promise<{ movies: Movie[], summary: string }> => {
  return fetchMovies(`Bana en iyi, en popüler ve eleştirmenlerce beğenilen "${genre}" türündeki filmleri listele. En az 6 film olsun. Özetleri ilgi çekici yaz.`);
};

export const getPersonalizedRecommendations = async (watchedMovies: string[], favoriteMovies: string[]): Promise<{ movies: Movie[], summary: string }> => {
  const watchedStr = watchedMovies.length > 0 ? watchedMovies.join(", ") : "Belirtilmemiş";
  const favStr = favoriteMovies.length > 0 ? favoriteMovies.join(", ") : "Belirtilmemiş";
  
  const prompt = `
    Kullanıcının film zevkine göre 8 adet kişiselleştirilmiş film önerisi yap.
    Kullanıcının İzlediği Filmler: ${watchedStr}
    Kullanıcının Favori Filmleri: ${favStr}
    
    Analiz et ve bu tarza uygun, henüz keşfetmemiş olabileceği yüksek kaliteli filmler öner. 
    Eğer liste çok kısaysa genel popüler kült ve kaliteli yapımlardan karma yap.
    Özet kısmında neden bu filmleri seçtiğini "Senin için seçtik çünkü..." gibi samimi bir dille kısaca açıkla.
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `"${title}" filmi için detaylı, sürükleyici ve atmosferi yansıtan bir özet yaz. Spoiler vermeden hikayenin derinliğini, temasını ve karakter motivasyonlarını anlat. Türkçe olsun. Sadece özeti döndür.`,
    });
    return response.text || null;
  } catch (error) {
    console.error("Detailed Overview Error:", error);
    return null;
  }
};

export const getActorDetails = async (actorName: string): Promise<{ bio: string, famousMovies: string[] } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Information about actor "${actorName}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: actorSchema,
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