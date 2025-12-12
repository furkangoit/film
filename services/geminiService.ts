/// <reference types="vite/client" />
import { Movie, RecommendationResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Fallback Movies Database - 10 FİLM
const FALLBACK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Esaretin Bedeli',
    overview: 'Andy Dufresne, karısını ve onun sevgilisini öldürmek suçundan ömür boyu hapse mahkum edilir.',
    year: 1994,
    rating: 9.3,
    genre: 'Dram',
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    duration: '142 min',
    userRating: 9.2,
    reviewCount: 1250
  },
  {
    id: '2',
    title: 'Başlangıç',
    overview: 'Dom Cobb, bilinçaltının derinliklerinden değerli sırları çalmak için rüyalara giriş yapan bir hırsız.',
    year: 2010,
    rating: 8.8,
    genre: 'Bilim Kurgu',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    duration: '148 min',
    userRating: 8.7,
    reviewCount: 980
  },
  {
    id: '3',
    title: 'Kara Şövalye',
    overview: 'Batman, Joker\'ın kaotik planından Gotham\'ı korumak için mücadele eder.',
    year: 2008,
    rating: 9.0,
    genre: 'Aksiyon',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    duration: '152 min',
    userRating: 9.1,
    reviewCount: 1500
  },
  {
    id: '4',
    title: 'Yüzüklerin Efendisi: Kralın Dönüşü',
    overview: 'Frodo ve arkadaşları Mordor\'a bir çelik yüzük yok etmek için yolculuk yapar.',
    year: 2003,
    rating: 9.0,
    genre: 'Fantastik',
    director: 'Peter Jackson',
    cast: ['Elijah Wood', 'Viggo Mortensen', 'Ian McKellen'],
    duration: '201 min',
    userRating: 9.0,
    reviewCount: 1100
  },
  {
    id: '5',
    title: 'Pulp Fiction',
    overview: 'Dört bağımsız hikaye, suç ve şiddetin iç içe geçmiş dünyasında gerçekleşir.',
    year: 1994,
    rating: 8.9,
    genre: 'Dram',
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    duration: '154 min',
    userRating: 8.8,
    reviewCount: 890
  },
  {
    id: '6',
    title: 'Forrest Gump',
    overview: 'Düşük IQ\'suna rağmen Forrest, Amerika\'nın tarihine önemli damgalar vurur.',
    year: 1994,
    rating: 8.8,
    genre: 'Dram',
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Gary Sinise', 'Sally Field'],
    duration: '142 min',
    userRating: 8.6,
    reviewCount: 760
  },
  {
    id: '7',
    title: 'İntikam Oyunu',
    overview: 'Bir kaza sonucu hayatı değişen bir adam, intikamın yolunda ilerler.',
    year: 2013,
    rating: 8.4,
    genre: 'Gerilim',
    director: 'Denis Villeneuve',
    cast: ['Jake Gyllenhaal', 'Christoph Waltz', 'Ryan Reynolds'],
    duration: '130 min',
    userRating: 8.3,
    reviewCount: 640
  },
  {
    id: '8',
    title: 'Interstellar',
    overview: 'Yok olma tehdidi altındaki Dünya\'yı kurtarmak için astronotlar uzay-zaman yolculuğu yapar.',
    year: 2014,
    rating: 8.6,
    genre: 'Bilim Kurgu',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    duration: '169 min',
    userRating: 8.5,
    reviewCount: 1050
  },
  {
    id: '9',
    title: 'Parasite',
    overview: 'Fakir bir aile, zengin bir ailenin evine sızmak için hileli plan yapar.',
    year: 2019,
    rating: 8.6,
    genre: 'Dram',
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    duration: '132 min',
    userRating: 8.7,
    reviewCount: 920
  },
  {
    id: '10',
    title: 'Gladyatör',
    overview: 'Maximus, Roma\'nın köle pazarında savaşmaya zorlanan komutan olur ve intikam alır.',
    year: 2000,
    rating: 8.5,
    genre: 'Aksiyon',
    director: 'Ridley Scott',
    cast: ['Russell Crowe', 'Joaquin Phoenix', 'Connie Nielsen'],
    duration: '155 min',
    userRating: 8.4,
    reviewCount: 750
  }
];

// ============== TÜRKÇE FİLM KOLEKSİYONU ==============
const TURKISH_MOVIES: Movie[] = [
  {
    id: 'tr-1',
    title: 'Kış Uykusu',
    overview: 'Nuri Bilge Ceylan\'ın Palme d\'Or kazanan başyapıtı. Boş bir otel, sessiz bir kış.',
    year: 2014,
    rating: 8.4,
    genre: 'Dram',
    director: 'Nuri Bilge Ceylan',
    cast: ['Haluk Bilginer', 'Melih Selçuk'],
    duration: '196 min',
    userRating: 8.3,
    reviewCount: 450
  },
  {
    id: 'tr-2',
    title: 'Umut',
    overview: 'Yılmaz Güney\'in usta yapıtı. Fakir bir ailenin umut ve çaresizliği.',
    year: 1970,
    rating: 8.2,
    genre: 'Dram',
    director: 'Yılmaz Güney',
    cast: ['Yılmaz Güney', 'Melike Demirağ'],
    duration: '117 min',
    userRating: 8.1,
    reviewCount: 320
  },
  {
    id: 'tr-3',
    title: 'Organize İşler',
    overview: 'Türk mafyasının komik öyküsü. Şahan Gökbakar\'ın en iyi performansı.',
    year: 2005,
    rating: 8.5,
    genre: 'Komedi',
    director: 'Serdar Akar',
    cast: ['Şahan Gökbakar', 'Cem Davran'],
    duration: '109 min',
    userRating: 8.4,
    reviewCount: 580
  },
  {
    id: 'tr-4',
    title: 'Yazı Tura',
    overview: 'Atıf Yılmaz\'ın klasiği. 1980\'ler Türkiye\'sinin portresi.',
    year: 1994,
    rating: 8.0,
    genre: 'Dram',
    director: 'Atıf Yılmaz',
    cast: ['İmam Güney', 'Suzan Avcı'],
    duration: '110 min',
    userRating: 7.9,
    reviewCount: 280
  },
  {
    id: 'tr-5',
    title: 'Deli Dolu',
    overview: 'Akıl hastanesindeki eğlenceli ve dramatik olaylar.',
    year: 1998,
    rating: 7.9,
    genre: 'Komedi',
    director: 'Duran Kalkan',
    cast: ['Ozan Güven', 'Hakan Yılmaz'],
    duration: '95 min',
    userRating: 7.8,
    reviewCount: 350
  },
  {
    id: 'tr-6',
    title: 'Aile Arasında',
    overview: 'Modern ailenin sorunlarını ustalıkla işleyen dram.',
    year: 2015,
    rating: 7.8,
    genre: 'Dram',
    director: 'Serra Yılmaz',
    cast: ['Farah Zeynep Abdullah', 'Cengiz Bozkurt'],
    duration: '125 min',
    userRating: 7.7,
    reviewCount: 420
  },
  {
    id: 'tr-7',
    title: 'Kuru Fasulye',
    overview: 'Cağan Irmak\'ın komik ve dokunuşlu filmi.',
    year: 2009,
    rating: 7.4,
    genre: 'Komedi',
    director: 'Cağan Irmak',
    cast: ['Ufuk Bayraktar', 'Bahtiyar Engin'],
    duration: '102 min',
    userRating: 7.3,
    reviewCount: 310
  },
  {
    id: 'tr-8',
    title: 'Kayıp Gemi',
    overview: 'Türk gerilim sinemasının önemli bir filmi.',
    year: 2012,
    rating: 7.3,
    genre: 'Gerilim',
    director: 'Serhan Zengin',
    cast: ['Haluk Bilginer', 'Başak Köklükaya'],
    duration: '98 min',
    userRating: 7.2,
    reviewCount: 290
  },
  {
    id: 'tr-9',
    title: 'Aşkın Kürü',
    overview: 'Modern Türk romantik draması.',
    year: 2014,
    rating: 7.5,
    genre: 'Romantik',
    director: 'Serra Yılmaz',
    cast: ['Farah Zeynep Abdullah', 'Murat Yıldırım'],
    duration: '120 min',
    userRating: 7.4,
    reviewCount: 380
  },
  {
    id: 'tr-10',
    title: 'Şef\'in Mütercimi',
    overview: 'Türk komedi filminin modern örneği.',
    year: 2019,
    rating: 7.7,
    genre: 'Komedi',
    director: 'Omer Faruk Sorak',
    cast: ['Saç Dede', 'Zeynep Beşer'],
    duration: '108 min',
    userRating: 7.6,
    reviewCount: 470
  }
];

// ============== GENRE KOMBİNASYONLARI ==============
const GENRE_COMBINATIONS: Record<string, Movie[]> = {
  'Aksiyon + Bilim Kurgu': [
    { id: 'kombi-1', title: 'The Matrix Reloaded', year: 2003, rating: 7.2, genre: 'Aksiyon + Bilim Kurgu', director: 'Wachowski Brothers', overview: 'Gerçekliğin sınırları yok ediliyor.', cast: ['Keanu Reeves', 'Laurence Fishburne'] },
    { id: 'kombi-2', title: 'Total Recall', year: 1990, rating: 7.5, genre: 'Aksiyon + Bilim Kurgu', director: 'Paul Verhoeven', overview: 'Bellek ve gerçeklik belirsiz hale gelir.', cast: ['Arnold Schwarzenegger', 'Rachel Ticotin'] },
    { id: 'kombi-3', title: 'Edge of Tomorrow', year: 2014, rating: 7.9, genre: 'Aksiyon + Bilim Kurgu', director: 'Doug Liman', overview: 'Asker her gün aynı savaşı yaşıyor.', cast: ['Tom Cruise', 'Emily Blunt'] }
  ],
  'Dram + Romantik': [
    { id: 'kombi-4', title: 'The Notebook', year: 2004, rating: 7.8, genre: 'Dram + Romantik', director: 'Nick Cassavetes', overview: 'Yaşlı bir çiftin aşk hikayesi.', cast: ['Rachel McAdams', 'Ryan Gosling'] },
    { id: 'kombi-5', title: 'About Time', year: 2013, rating: 7.8, genre: 'Dram + Romantik', director: 'Richard Curtis', overview: 'Zaman yolculuğu ile aşk bulma.', cast: ['Domhnall Gleeson', 'Rachel McAdams'] },
    { id: 'kombi-6', title: 'The Time Traveler\'s Wife', year: 2009, rating: 7.0, genre: 'Dram + Romantik', director: 'Robert Schwentke', overview: 'Zaman sıçrayışları sevgiyi sınar.', cast: ['Eric Bana', 'Rachel McAdams'] }
  ],
  'Gerilim + Korku': [
    { id: 'kombi-7', title: 'Psychological Thriller', year: 2020, rating: 7.8, genre: 'Gerilim + Korku', director: 'Various', overview: 'Zihnin hantalığı korkutur.', cast: [] },
    { id: 'kombi-8', title: 'The Ring', year: 2002, rating: 7.1, genre: 'Gerilim + Korku', director: 'Gore Verbinski', overview: 'Korkunç bir video kaydı.', cast: ['Naomi Watts', 'Martin Henderson'] }
  ]
};

// ============== KATEGORILERE GÖRE FİLMLER - GENIŞLETILMIŞ ==============
const MOVIES_BY_GENRE: Record<string, Movie[]> = {
  'Aksiyon': [
    { id: 'aksiyon-1', title: 'Mad Max: Fury Road', year: 2015, rating: 8.1, genre: 'Aksiyon', director: 'George Miller', overview: 'Çorak dünyada kaçış.', cast: ['Tom Hardy', 'Charlize Theron'], userRating: 8.0, reviewCount: 420 },
    { id: 'aksiyon-2', title: 'Top Gun: Maverick', year: 2022, rating: 8.3, genre: 'Aksiyon', director: 'Joseph Kosinski', overview: 'Usta pilot yeni nesli eğitiyor.', cast: ['Tom Cruise', 'Miles Teller'], userRating: 8.2, reviewCount: 580 },
    { id: 'aksiyon-3', title: 'Die Hard', year: 1988, rating: 8.3, genre: 'Aksiyon', director: 'John McTiernan', overview: 'Gökdelende rehine operasyonu.', cast: ['Bruce Willis', 'Alan Rickman'], userRating: 8.1, reviewCount: 350 },
    { id: 'aksiyon-4', title: 'John Wick', year: 2014, rating: 7.4, genre: 'Aksiyon', director: 'Chad Stahelski', overview: 'Emekli katil döndü.', cast: ['Keanu Reeves', 'Michael Nyqvist'], userRating: 7.3, reviewCount: 380 },
    { id: 'aksiyon-5', title: 'Kingsman', year: 2014, rating: 7.3, genre: 'Aksiyon', director: 'Matthew Vaughn', overview: 'Gizli casus örgütü.', cast: ['Taron Egerton', 'Colin Firth'], userRating: 7.2, reviewCount: 410 },
    { id: 'aksiyon-6', title: 'The Raid', year: 2011, rating: 7.6, genre: 'Aksiyon', director: 'Gareth Evans', overview: 'En şiddetli aksiyon.', cast: ['Iko Uwais', 'Joe Taslim'], userRating: 7.5, reviewCount: 290 },
    { id: 'aksiyon-7', title: 'Mission: Impossible - Fallout', year: 2018, rating: 7.7, genre: 'Aksiyon', director: 'Christopher McQuarrie', overview: 'Ethan Hunt\'ın en zor görevi.', cast: ['Tom Cruise', 'Henry Cavill'], userRating: 7.6, reviewCount: 450 },
    { id: 'aksiyon-8', title: 'Atomic Blonde', year: 2017, rating: 6.7, genre: 'Aksiyon', director: 'David Leitch', overview: 'Soğuk Savaş casus aksiyon.', cast: ['Charlize Theron', 'James McAvoy'], userRating: 6.6, reviewCount: 320 },
    { id: 'aksiyon-9', title: 'The Fast and Furious', year: 2009, rating: 6.8, genre: 'Aksiyon', director: 'Justin Lin', overview: 'Hızlı arabalar.', cast: ['Vin Diesel', 'Paul Walker'], userRating: 6.7, reviewCount: 360 }
  ],
  'Bilim Kurgu': [
    { id: 'bilimkurgu-1', title: 'Inception', year: 2010, rating: 8.8, genre: 'Bilim Kurgu', director: 'Christopher Nolan', overview: 'Rüyaların içinde savaş.', cast: ['Leonardo DiCaprio'], userRating: 8.7, reviewCount: 520 },
    { id: 'bilimkurgu-2', title: 'The Matrix', year: 1999, rating: 8.7, genre: 'Bilim Kurgu', director: 'Wachowski Brothers', overview: 'Gerçek mi simülasyon mu?', cast: ['Keanu Reeves', 'Laurence Fishburne'], userRating: 8.6, reviewCount: 480 },
    { id: 'bilimkurgu-3', title: 'Dune', year: 2021, rating: 8.0, genre: 'Bilim Kurgu', director: 'Denis Villeneuve', overview: 'Çöl gezegenin kontrol savaşı.', cast: ['Timothée Chalamet', 'Zendaya'], userRating: 7.9, reviewCount: 410 },
    { id: 'bilimkurgu-4', title: 'Blade Runner', year: 1982, rating: 8.1, genre: 'Bilim Kurgu', director: 'Ridley Scott', overview: 'Androidden ayırt edilemez.', cast: ['Harrison Ford', 'Sean Young'], userRating: 8.0, reviewCount: 350 },
    { id: 'bilimkurgu-5', title: 'Arrival', year: 2016, rating: 7.9, genre: 'Bilim Kurgu', director: 'Denis Villeneuve', overview: 'Dışarıdan gelenlerin dili.', cast: ['Amy Adams', 'Jeremy Renner'], userRating: 7.8, reviewCount: 390 },
    { id: 'bilimkurgu-6', title: '12 Monkeys', year: 1995, rating: 8.0, genre: 'Bilim Kurgu', director: 'Terry Gilliam', overview: 'Zaman döngüsü.', cast: ['Bruce Willis', 'Brad Pitt'], userRating: 7.9, reviewCount: 320 },
    { id: 'bilimkurgu-7', title: 'Interstellar', year: 2014, rating: 8.6, genre: 'Bilim Kurgu', director: 'Christopher Nolan', overview: 'Dünyayı kurtaran yolculuk.', cast: ['Matthew McConaughey'], userRating: 8.5, reviewCount: 510 },
    { id: 'bilimkurgu-8', title: 'Gravity', year: 2013, rating: 7.7, genre: 'Bilim Kurgu', director: 'Alfonso Cuarón', overview: 'Uzayda hayatta kalma.', cast: ['Sandra Bullock', 'George Clooney'], userRating: 7.6, reviewCount: 380 },
    { id: 'bilimkurgu-9', title: 'Minority Report', year: 2002, rating: 7.6, genre: 'Bilim Kurgu', director: 'Steven Spielberg', overview: 'Suçları önceden görebilmek.', cast: ['Tom Cruise', 'Colin Farrell'], userRating: 7.5, reviewCount: 340 }
  ],
  'Dram': [
    { id: 'dram-1', title: 'Esaretin Bedeli', year: 1994, rating: 9.3, genre: 'Dram', director: 'Frank Darabont', overview: 'Hapishanede umut ve arkadaşlık.', cast: ['Tim Robbins', 'Morgan Freeman'], userRating: 9.2, reviewCount: 600 },
    { id: 'dram-2', title: 'Pulp Fiction', year: 1994, rating: 8.9, genre: 'Dram', director: 'Quentin Tarantino', overview: 'Dört hikaye, bir şef.', cast: ['John Travolta', 'Uma Thurman'], userRating: 8.8, reviewCount: 450 },
    { id: 'dram-3', title: 'Life is Beautiful', year: 1997, rating: 8.6, genre: 'Dram', director: 'Roberto Benigni', overview: 'Holokost\'taki babanın mizahı.', cast: ['Roberto Benigni'], userRating: 8.5, reviewCount: 320 },
    { id: 'dram-4', title: 'Parasite', year: 2019, rating: 8.6, genre: 'Dram', director: 'Bong Joon-ho', overview: 'Sınıf ayrımının dehşeti.', cast: ['Song Kang-ho'], userRating: 8.7, reviewCount: 520 },
    { id: 'dram-5', title: 'Forrest Gump', year: 1994, rating: 8.8, genre: 'Dram', director: 'Robert Zemeckis', overview: 'Basit ama dış etkili bir hayat.', cast: ['Tom Hanks'], userRating: 8.6, reviewCount: 420 },
    { id: 'dram-6', title: 'Moonlight', year: 2016, rating: 8.4, genre: 'Dram', director: 'Barry Jenkins', overview: 'Kimlik bulma yolculuğu.', cast: ['Mahershala Ali'], userRating: 8.3, reviewCount: 380 },
    { id: 'dram-7', title: 'Boyhood', year: 2014, rating: 7.9, genre: 'Dram', director: 'Richard Linklater', overview: '12 yılda büyüme.', cast: ['Ellar Coltrane'], userRating: 7.8, reviewCount: 350 },
    { id: 'dram-8', title: 'The Pursuit of Happyness', year: 2006, rating: 8.0, genre: 'Dram', director: 'Gabriele Muccino', overview: 'Baba oğul birlikteliği.', cast: ['Will Smith', 'Jaden Smith'], userRating: 7.9, reviewCount: 410 },
    { id: 'dram-9', title: '12 Angry Men', year: 1957, rating: 9.0, genre: 'Dram', director: 'Sidney Lumet', overview: 'Mahkemede oy değişimi.', cast: ['Henry Fonda'], userRating: 8.9, reviewCount: 290 }
  ]
};

// API'ye istek gönder
async function callGeminiAPI(prompt: string): Promise<{ movies: Movie[], summary: string }> {
  if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY === '') {
    console.warn('Gemini API Key tanımlanmamış. Fallback veri kullanılacak.');
    return {
      movies: FALLBACK_MOVIES,
      summary: 'API servisi kullanılamıyor, populer filmler gösteriliyor.'
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\nJSON formatında şu yapıda cevap ver:\n{\n  "movies": [\n    {"id": "unique", "title": "Film Adı", "overview": "Özet", "year": 2024, "rating": 8.5, "genre": "Tür", "director": "Yönetmen", "cast": ["Oyuncu1"]}\n  ],\n  "summary": "Tanıtım metni"\n}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.statusText);
      return { movies: FALLBACK_MOVIES, summary: 'API hatası, fallback veri kullanılıyor.' };
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          if (parsed.movies && Array.isArray(parsed.movies)) {
            return {
              movies: parsed.movies.slice(0, 10),
              summary: parsed.summary || 'Yapay zeka tarafından seçilen filmler'
            };
          }
        }
      } catch (e) {
        console.error('JSON parse error:', e);
      }
    }

    return { movies: FALLBACK_MOVIES, summary: 'Veriler işlenirken sorun oluştu.' };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { movies: FALLBACK_MOVIES, summary: 'Ağ hatası, fallback veri kullanılıyor.' };
  }
}

// ============== PUBLIC API FUNCTIONS ==============
export async function getTrendingMovies(): Promise<{ movies: Movie[], summary: string }> {
  const prompt = `Şu anda en popüler olan 8-10 adet yüksek puanlı film öner.`;
  
  const result = await callGeminiAPI(prompt);
  if (result.movies.length === 0) {
    return { movies: FALLBACK_MOVIES, summary: 'Popüler filmler yükleniyor...' };
  }
  return result;
}

export async function searchMoviesAI(query: string): Promise<{ movies: Movie[], summary: string }> {
  const prompt = `Kullanıcının şu isteğine göre film öner: "${query}"`;
  
  const result = await callGeminiAPI(prompt);
  if (result.movies.length === 0) {
    return { movies: FALLBACK_MOVIES, summary: `"${query}" için filmler yükleniyor...` };
  }
  return result;
}

export async function fetchMoviesByGenre(genre: string): Promise<{ movies: Movie[], summary: string }> {
  // Türkçe film koleksiyonunu aç
  if (genre === 'Türkçe') {
    return {
      movies: TURKISH_MOVIES,
      summary: 'Türk sinemasının en iyileri'
    };
  }

  // Genre kombinasyonlarını aç
  if (GENRE_COMBINATIONS[genre]) {
    return {
      movies: GENRE_COMBINATIONS[genre],
      summary: `${genre} kategorisinde filmler`
    };
  }

  // Standart kategorileri aç
  if (MOVIES_BY_GENRE[genre]) {
    return {
      movies: MOVIES_BY_GENRE[genre],
      summary: `${genre} kategorisinde en iyi filmler`
    };
  }

  const prompt = `${genre} türündeki en iyi filmler.`;
  const result = await callGeminiAPI(prompt);
  if (result.movies.length === 0) {
    return { 
      movies: FALLBACK_MOVIES.filter(m => m.genre.includes(genre)), 
      summary: `${genre} kategorisinde filmler` 
    };
  }
  return result;
}

export async function getPersonalizedRecommendations(
  watchedMovies: string[],
  favoriteMovies: string[]
): Promise<{ movies: Movie[], summary: string }> {
  const watchedStr = watchedMovies.slice(0, 5).join(', ') || 'Belirtilmemiş';
  const favStr = favoriteMovies.slice(0, 5).join(', ') || 'Belirtilmemiş';
  
  const prompt = `Kullanıcının film zevkine göre kişiselleştirilmiş 8-10 film öner. İzlediği: ${watchedStr}. Favori: ${favStr}`;
  
  const result = await callGeminiAPI(prompt);
  if (result.movies.length === 0) {
    return { movies: FALLBACK_MOVIES, summary: 'Sizin için özel seçilmiş filmler' };
  }
  return result;
}

export async function getDetailedMovieOverview(title: string): Promise<string | null> {
  try {
    if (!API_KEY) return null;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `"${title}" filmi hakkında detaylı özet. Max 3-4 cümle.`
          }]
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (error) {
    console.error('Overview Error:', error);
  }
  return null;
}

export async function getActorDetails(actorName: string): Promise<{ bio: string, famousMovies: string[] } | null> {
  try {
    if (!API_KEY) return null;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${actorName} hakkında JSON format'da: bio (kısa biyografi) ve famousMovies (3 filmi).`
          }]
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Actor Error:', error);
  }
  return null;
}

export function fetchMovies(prompt: string): Promise<{ movies: Movie[], summary: string }> {
  return callGeminiAPI(prompt);
}

// ============== YENİ ÖZELLIKLER ==============

// User Ratings Sistemi
export function rateMovie(movieId: string, userRating: number): void {
  localStorage.setItem(`movie-rating-${movieId}`, JSON.stringify({ rating: userRating, date: new Date().toISOString() }));
}

export function getMovieRating(movieId: string): number | null {
  const stored = localStorage.getItem(`movie-rating-${movieId}`);
  return stored ? JSON.parse(stored).rating : null;
}

// Watch List Sıralama
export function sortWatchList(watchList: Movie[], sortBy: 'rating' | 'year' | 'title'): Movie[] {
  const sorted = [...watchList];
  
  if (sortBy === 'rating') {
    return sorted.sort((a, b) => (b.userRating || b.rating) - (a.userRating || a.rating));
  } else if (sortBy === 'year') {
    return sorted.sort((a, b) => b.year - a.year);
  } else if (sortBy === 'title') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  return sorted;
}

// Genre Kombinasyonları
export function getGenreCombinations(): string[] {
  return Object.keys(GENRE_COMBINATIONS);
}

// Türkçe Film Koleksiyonu
export function getTurkishMovies(): Movie[] {
  return TURKISH_MOVIES;
}