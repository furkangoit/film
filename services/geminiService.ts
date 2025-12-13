import { Movie, RecommendationResponse } from '../types';

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
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
  ],
  'Komedi': [
    { id: 'komedi-1', title: 'Forrest Gump', year: 1994, rating: 8.8, genre: 'Komedi', director: 'Robert Zemeckis', overview: 'Komik ve duygulandıran.', cast: ['Tom Hanks'], userRating: 8.7, reviewCount: 420 },
    { id: 'komedi-2', title: 'The Hangover', year: 2009, rating: 7.7, genre: 'Komedi', director: 'Todd Phillips', overview: 'Vegas gecesinin ardından.', cast: ['Bradley Cooper', 'Ed Helms'], userRating: 7.6, reviewCount: 380 },
    { id: 'komedi-3', title: 'Bridesmaids', year: 2011, rating: 7.8, genre: 'Komedi', director: 'Paul Feig', overview: 'Gelin partisinin kaotik hazırlığı.', cast: ['Kristen Wiig', 'Maya Rudolph'], userRating: 7.7, reviewCount: 340 },
    { id: 'komedi-4', title: 'Superbad', year: 2007, rating: 7.6, genre: 'Komedi', director: 'Greg Mottola', overview: 'Lise öğrencilerinin macerası.', cast: ['Michael Cera', 'Jonah Hill'], userRating: 7.5, reviewCount: 310 },
    { id: 'komedi-5', title: 'Three Idiots', year: 2009, rating: 8.4, genre: 'Komedi', director: 'Rajkumar Hirani', overview: 'Hindistan eğitim sistemi.', cast: ['Aamir Khan'], userRating: 8.3, reviewCount: 450 },
    { id: 'komedi-6', title: 'Tropic Thunder', year: 2008, rating: 7.0, genre: 'Komedi', director: 'Ben Stiller', overview: 'Film çekimi kendi başına film haline gelir.', cast: ['Ben Stiller', 'Robert Downey Jr.'], userRating: 6.9, reviewCount: 320 },
    { id: 'komedi-7', title: 'Groundhog Day', year: 1993, rating: 8.0, genre: 'Komedi', director: 'Harold Ramis', overview: 'Aynı günü yaşamak.', cast: ['Bill Murray'], userRating: 7.9, reviewCount: 290 },
    { id: 'komedi-8', title: 'Juno', year: 2007, rating: 7.7, genre: 'Komedi', director: 'Jason Reitman', overview: 'Hamile bir kız.', cast: ['Ellen Page'], userRating: 7.6, reviewCount: 350 },
    { id: 'komedi-9', title: 'Napoleon Dynamite', year: 2004, rating: 7.0, genre: 'Komedi', director: 'Jared Hess', overview: 'Tuhaf bir lise öğrencisi.', cast: ['Jon Heder'], userRating: 6.9, reviewCount: 280 }
  ],
  'Korku': [
    { id: 'korku-1', title: 'Hereditary', year: 2018, rating: 7.3, genre: 'Korku', director: 'Ari Aster', overview: 'Ailede uğursuz sırlar.', cast: ['Toni Collette'], userRating: 7.2, reviewCount: 410 },
    { id: 'korku-2', title: 'Insidious', year: 2010, rating: 7.0, genre: 'Korku', director: 'James Wan', overview: 'Paralel dünyada kaybolan çocuk.', cast: ['Patrick Wilson', 'Rose Byrne'], userRating: 6.9, reviewCount: 370 },
    { id: 'korku-3', title: 'The Witch', year: 2015, rating: 6.9, genre: 'Korku', director: 'Robert Eggers', overview: '17. yüzyılda bir aile.', cast: ['Anya Taylor-Joy'], userRating: 6.8, reviewCount: 320 },
    { id: 'korku-4', title: 'A Quiet Place', year: 2018, rating: 7.5, genre: 'Korku', director: 'John Krasinski', overview: 'Sessiz olmak zorunda.', cast: ['Emily Blunt', 'John Krasinski'], userRating: 7.4, reviewCount: 450 },
    { id: 'korku-5', title: 'Sinister', year: 2012, rating: 6.8, genre: 'Korku', director: 'Scott Derrickson', overview: 'Korkunç filmler bulma.', cast: ['Ethan Hawke'], userRating: 6.7, reviewCount: 380 },
    { id: 'korku-6', title: 'The Ring', year: 2002, rating: 7.1, genre: 'Korku', director: 'Gore Verbinski', overview: 'Ölümcül video kaydı.', cast: ['Naomi Watts'], userRating: 7.0, reviewCount: 340 },
    { id: 'korku-7', title: 'It Follows', year: 2014, rating: 6.8, genre: 'Korku', director: 'David Robert Mitchell', overview: 'Takip edilen birisi.', cast: ['Maika Monroe'], userRating: 6.7, reviewCount: 300 },
    { id: 'korku-8', title: 'The Conjuring', year: 2013, rating: 7.5, genre: 'Korku', director: 'James Wan', overview: 'Poltergeist soruşturması.', cast: ['Vera Farmiga', 'Patrick Wilson'], userRating: 7.4, reviewCount: 420 },
    { id: 'korku-9', title: 'Scary Stories to Tell in the Dark', year: 2019, rating: 6.3, genre: 'Korku', director: 'André Øvredal', overview: 'Cadı kitabından çıkan canavarlar.', cast: ['Zoe Colletti'], userRating: 6.2, reviewCount: 290 }
  ],
  'Romantik': [
    { id: 'romantik-1', title: 'About Time', year: 2013, rating: 7.8, genre: 'Romantik', director: 'Richard Curtis', overview: 'Zaman ile aşk.', cast: ['Domhnall Gleeson', 'Rachel McAdams'], userRating: 7.7, reviewCount: 380 },
    { id: 'romantik-2', title: 'The Notebook', year: 2004, rating: 7.8, genre: 'Romantik', director: 'Nick Cassavetes', overview: 'Yaşlı çift aşkı hatırlar.', cast: ['Rachel McAdams', 'Ryan Gosling'], userRating: 7.7, reviewCount: 420 },
    { id: 'romantik-3', title: 'Midnight in Paris', year: 2011, rating: 7.7, genre: 'Romantik', director: 'Woody Allen', overview: 'Paris\'in sihirli geceleri.', cast: ['Owen Wilson', 'Marion Cotillard'], userRating: 7.6, reviewCount: 390 },
    { id: 'romantik-4', title: 'Crazy Rich Asians', year: 2018, rating: 7.0, genre: 'Romantik', director: 'Jon M. Chu', overview: 'Zengin Asyalı aile.', cast: ['Constance Wu', 'Henry Golding'], userRating: 6.9, reviewCount: 350 },
    { id: 'romantik-5', title: 'La La Land', year: 2016, rating: 8.0, genre: 'Romantik', director: 'Damien Chazelle', overview: 'Los Angeles\'te aşk ve rüyalar.', cast: ['Ryan Gosling', 'Emma Stone'], userRating: 7.9, reviewCount: 480 },
    { id: 'romantik-6', title: 'Pride and Prejudice', year: 2005, rating: 7.8, genre: 'Romantik', director: 'Joe Wright', overview: 'Jane Austen klasiği.', cast: ['Keira Knightley', 'Matthew Macfadyen'], userRating: 7.7, reviewCount: 310 },
    { id: 'romantik-7', title: 'Titanic', year: 1997, rating: 7.8, genre: 'Romantik', director: 'James Cameron', overview: 'Gemideki aşk.', cast: ['Leonardo DiCaprio', 'Kate Winslet'], userRating: 7.7, reviewCount: 510 },
    { id: 'romantik-8', title: 'The Time Traveler\'s Wife', year: 2009, rating: 7.0, genre: 'Romantik', director: 'Robert Schwentke', overview: 'Zaman sıçrayışları ve aşk.', cast: ['Eric Bana', 'Rachel McAdams'], userRating: 6.9, reviewCount: 320 },
    { id: 'romantik-9', title: 'When Harry Met Sally', year: 1989, rating: 7.7, genre: 'Romantik', director: 'Rob Reiner', overview: 'Arkadaşlık ve aşk.', cast: ['Billy Crystal', 'Meg Ryan'], userRating: 7.6, reviewCount: 280 }
  ],
  'Gerilim': [
    { id: 'gerilim-1', title: 'Nightcrawler', year: 2014, rating: 7.8, genre: 'Gerilim', director: 'Dan Gilroy', overview: 'Haberciliğin karanlık yüzü.', cast: ['Jake Gyllenhaal'], userRating: 7.7, reviewCount: 400 },
    { id: 'gerilim-2', title: 'Mystic River', year: 2003, rating: 8.2, genre: 'Gerilim', director: 'Clint Eastwood', overview: 'Üç arkadaş, bir cinayet.', cast: ['Sean Penn', 'Tim Robbins'], userRating: 8.1, reviewCount: 360 },
    { id: 'gerilim-3', title: 'Gone Girl', year: 2014, rating: 8.1, genre: 'Gerilim', director: 'David Fincher', overview: 'Kadının kaybolması.', cast: ['Ben Affleck', 'Rosamund Pike'], userRating: 8.0, reviewCount: 450 },
    { id: 'gerilim-4', title: 'Prisoners', year: 2013, rating: 8.1, genre: 'Gerilim', director: 'Denis Villeneuve', overview: 'Kız kaçırılması ve intikam.', cast: ['Hugh Jackman', 'Jake Gyllenhaal'], userRating: 8.0, reviewCount: 420 },
    { id: 'gerilim-5', title: 'Se7en', year: 1995, rating: 8.6, genre: 'Gerilim', director: 'David Fincher', overview: 'Seri katil avı.', cast: ['Brad Pitt', 'Morgan Freeman'], userRating: 8.5, reviewCount: 480 },
    { id: 'gerilim-6', title: 'The Girl on the Train', year: 2016, rating: 6.5, genre: 'Gerilim', director: 'Tate Taylor', overview: 'Bileşik kimlikle tanıklık.', cast: ['Emily Blunt'], userRating: 6.4, reviewCount: 320 },
    { id: 'gerilim-7', title: 'Shutter Island', year: 2010, rating: 8.2, genre: 'Gerilim', director: 'Martin Scorsese', overview: 'Adada gizemli olaylar.', cast: ['Leonardo DiCaprio', 'Mark Ruffalo'], userRating: 8.1, reviewCount: 410 },
    { id: 'gerilim-8', title: 'Wind River', year: 2017, rating: 7.5, genre: 'Gerilim', director: 'Taylor Sheridan', overview: 'Rezervatta kayıp kadın.', cast: ['Jeremy Renner', 'Gil Birmingham'], userRating: 7.4, reviewCount: 330 },
    { id: 'gerilim-9', title: 'Zodiac', year: 2007, rating: 7.8, genre: 'Gerilim', director: 'David Fincher', overview: 'Zodiac katiline av.', cast: ['Jake Gyllenhaal', 'Mark Ruffalo'], userRating: 7.7, reviewCount: 370 }
  ],
  'Animasyon': [
    { id: 'animasyon-1', title: 'Inside Out', year: 2015, rating: 8.2, genre: 'Animasyon', director: 'Pete Docter', overview: 'Kız\'ın duyguları.', cast: ['Amy Poehler', 'Phyllis Smith'], userRating: 8.1, reviewCount: 450 },
    { id: 'animasyon-2', title: 'Zootopia', year: 2016, rating: 8.0, genre: 'Animasyon', director: 'Byron Howard', overview: 'Hayvan şehirinde polis.', cast: ['Ginnifer Goodwin'], userRating: 7.9, reviewCount: 420 },
    { id: 'animasyon-3', title: 'Kimetsu no Yaiba', year: 2019, rating: 8.8, genre: 'Animasyon', director: 'Haruo Sotozaki', overview: 'Şeytanlarla savaş.', cast: [], userRating: 8.7, reviewCount: 520 },
    { id: 'animasyon-4', title: 'A Silent Voice', year: 2016, rating: 8.1, genre: 'Animasyon', director: 'Naoko Yamada', overview: 'Sağır kız ve çocuk.', cast: [], userRating: 8.0, reviewCount: 380 },
    { id: 'animasyon-5', title: 'Coco', year: 2017, rating: 8.4, genre: 'Animasyon', director: 'Lee Unkrich', overview: 'Ölülerin ülkesi.', cast: ['Anthony Gonzalez'], userRating: 8.3, reviewCount: 490 },
    { id: 'animasyon-6', title: 'Spirited Away', year: 2001, rating: 8.6, genre: 'Animasyon', director: 'Hayao Miyazaki', overview: 'Majik dünyaya giriş.', cast: [], userRating: 8.5, reviewCount: 440 },
    { id: 'animasyon-7', title: 'Your Name', year: 2016, rating: 8.4, genre: 'Animasyon', director: 'Makoto Shinkai', overview: 'Bedenleri değişen çocuklar.', cast: [], userRating: 8.3, reviewCount: 500 },
    { id: 'animasyon-8', title: 'Howl\'s Moving Castle', year: 2004, rating: 8.4, genre: 'Animasyon', director: 'Hayao Miyazaki', overview: 'Sihirli kale.', cast: [], userRating: 8.3, reviewCount: 360 },
    { id: 'animasyon-9', title: 'Toy Story', year: 1995, rating: 8.3, genre: 'Animasyon', director: 'John Lasseter', overview: 'Oyuncakların hayatı.', cast: ['Tom Hanks', 'Tim Allen'], userRating: 8.2, reviewCount: 480 }
  ],
  'Belgesel': [
    { id: 'belgesel-1', title: 'Free Solo', year: 2018, rating: 8.3, genre: 'Belgesel', director: 'Jimmy Chin', overview: 'Duvarcılık adam.', cast: [], userRating: 8.2, reviewCount: 390 },
    { id: 'belgesel-2', title: 'The Last Dance', year: 2020, rating: 8.9, genre: 'Belgesel', director: 'Jason Hehir', overview: 'Michael Jordan\'ın son sezon.', cast: [], userRating: 8.8, reviewCount: 510 },
    { id: 'belgesel-3', title: 'Amy', year: 2015, rating: 8.0, genre: 'Belgesel', director: 'Asif Kapadia', overview: 'Amy Winehouse hayatı.', cast: [], userRating: 7.9, reviewCount: 320 },
    { id: 'belgesel-4', title: 'Our Planet', year: 2019, rating: 9.1, genre: 'Belgesel', director: 'Alastair Fothergill', overview: 'Gezegenimizin güzellikleri.', cast: [], userRating: 9.0, reviewCount: 450 },
    { id: 'belgesel-5', title: 'Blackfish', year: 2013, rating: 8.4, genre: 'Belgesel', director: 'Gabriela Cowperthwaite', overview: 'Balina ve hapishane.', cast: [], userRating: 8.3, reviewCount: 380 },
    { id: 'belgesel-6', title: 'The Social Dilemma', year: 2020, rating: 7.6, genre: 'Belgesel', director: 'Jeff Orlowski', overview: 'Sosyal medyanın karanlık yüzü.', cast: [], userRating: 7.5, reviewCount: 420 },
    { id: 'belgesel-7', title: '13th', year: 2016, rating: 8.2, genre: 'Belgesel', director: 'Ava DuVernay', overview: 'Ceza sistemi ve ırk.', cast: [], userRating: 8.1, reviewCount: 350 },
    { id: 'belgesel-8', title: 'Jiro Dreams of Sushi', year: 2011, rating: 8.3, genre: 'Belgesel', director: 'David Gelb', overview: 'Sushi ustası\'nın hikayesi.', cast: [], userRating: 8.2, reviewCount: 310 },
    { id: 'belgesel-9', title: 'Planet Earth II', year: 2016, rating: 9.3, genre: 'Belgesel', director: 'David Attenborough', overview: 'Dünya\'nın doğası.', cast: [], userRating: 9.2, reviewCount: 480 }
  ],
  'Fantastik': [
    { id: 'fantastik-1', title: 'Harry Potter', year: 2001, rating: 7.6, genre: 'Fantastik', director: 'Chris Columbus', overview: 'Sihirli okul.', cast: ['Daniel Radcliffe', 'Emma Watson'], userRating: 7.5, reviewCount: 450 },
    { id: 'fantastik-2', title: 'Avatar', year: 2009, rating: 7.8, genre: 'Fantastik', director: 'James Cameron', overview: 'Mavi gezegen.', cast: ['Sam Worthington', 'Zoe Saldana'], userRating: 7.7, reviewCount: 520 },
    { id: 'fantastik-3', title: 'Pan\'s Labyrinth', year: 2006, rating: 8.2, genre: 'Fantastik', director: 'Guillermo del Toro', overview: 'Labirent ve yaratıklar.', cast: ['Ivana Baquero'], userRating: 8.1, reviewCount: 370 },
    { id: 'fantastik-4', title: 'Stardust', year: 2007, rating: 7.5, genre: 'Fantastik', director: 'Matthew Vaughn', overview: 'Paralel dünya\'da macera.', cast: ['Charlie Cox', 'Claire Danes'], userRating: 7.4, reviewCount: 340 },
    { id: 'fantastik-5', title: 'The Shape of Water', year: 2017, rating: 7.1, genre: 'Fantastik', director: 'Guillermo del Toro', overview: 'Sualtı yaratığı aşkı.', cast: ['Sally Hawkins', 'Michael Shannon'], userRating: 7.0, reviewCount: 380 },
    { id: 'fantastik-6', title: 'Doctor Strange', year: 2016, rating: 7.5, genre: 'Fantastik', director: 'Scott Derrickson', overview: 'Sihirli doktor.', cast: ['Benedict Cumberbatch'], userRating: 7.4, reviewCount: 410 },
    { id: 'fantastik-7', title: 'Aquaman', year: 2018, rating: 6.8, genre: 'Fantastik', director: 'James Wan', overview: 'Deniz ülkesinin kralı.', cast: ['Jason Momoa', 'Amber Heard'], userRating: 6.7, reviewCount: 390 },
    { id: 'fantastik-8', title: 'The Fantastic Beasts', year: 2016, rating: 7.2, genre: 'Fantastik', director: 'David Yates', overview: 'Sihirli yaratıklar.', cast: ['Eddie Redmayne'], userRating: 7.1, reviewCount: 350 },
    { id: 'fantastik-9', title: 'Constantine', year: 2005, rating: 6.9, genre: 'Fantastik', director: 'Francis Lawrence', overview: 'Şeytan mücadelesi.', cast: ['Keanu Reeves'], userRating: 6.8, reviewCount: 300 }
  ]
};

// API'ye istek gönder
async function callGeminiAPI(prompt: string): Promise<{ movies: Movie[], summary: string }> {
  if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY === '') {
    console.warn('⚠️ Gemini API Key tanımlanmamış!');
    console.warn('Fallback veri kullanılıyor. Lütfen .env dosyasında VITE_GEMINI_API_KEY tanımla.');
    return {
      movies: FALLBACK_MOVIES,
      summary: '⚠️ API servisi kullanılamıyor. Populer filmler gösteriliyor.'
    };
  }

  try {
    console.log('🔄 Gemini API çağrılıyor...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
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
      const errorText = await response.text();
      console.error('❌ API Status Error:', response.status, response.statusText);
      console.error('API Yanıt:', errorText);
      
      // Hata koduna göre mesaj
      if (response.status === 401 || response.status === 403) {
        console.error('❌ API Key Hatası - Geçersiz veya süresi dolmuş!');
      } else if (response.status === 400) {
        console.error('❌ İstek Formatı Hatası');
      }
      
      return { 
        movies: FALLBACK_MOVIES, 
        summary: `⚠️ API hatası (${response.status}). Fallback veri kullanılıyor.` 
      };
    }

    const data = await response.json();
    console.log('✅ API Yanıt Alındı');
    
    if (data.error) {
      console.error('❌ API Hata Mesajı:', data.error);
      return { 
        movies: FALLBACK_MOVIES, 
        summary: '⚠️ API hatası: ' + (data.error.message || 'Bilinmeyen hata') 
      };
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('✅ API Metni Alındı, JSON aranıyor...');
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON Parse Başarılı, filmler:', parsed.movies?.length);
          
          if (parsed.movies && Array.isArray(parsed.movies)) {
            return {
              movies: parsed.movies.slice(0, 10),
              summary: parsed.summary || '✅ Yapay zeka tarafından seçilen filmler'
            };
          }
        }
      } catch (e) {
        console.error('❌ JSON Parse Error:', e);
      }
    }

    console.warn('⚠️ Beklenmedik API Yapısı');
    return { 
      movies: FALLBACK_MOVIES, 
      summary: '⚠️ API veri yapısı beklenenden farklı. Fallback veri gösteriliyor.' 
    };
  } catch (error) {
    console.error('❌ Gemini API Network Error:', error);
    return { 
      movies: FALLBACK_MOVIES, 
      summary: '⚠️ Ağ hatası. Fallback veri kullanılıyor.' 
    };
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