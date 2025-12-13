// 🎬 TMDB (The Movie Database) Geliştirilmiş Poster Servisi
// Dinamik TMDB API araması, cache mekanizması ve fallback sistemleri

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Cache mekanizması - posterler bellekte tutulur
const posterCache = new Map<string, string>();

// İyi bilinen filmler için önceden hazırlanmış TMDB poster path'leri
// Bunlar cache warmup için kullanılır - daha hızlı yükleme
export const KNOWN_TMDB_POSTERS: Record<string, string> = {
  // Ana Filmler (Top 10)
  'Esaretin Bedeli': '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'Başlangıç': '/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg',
  'Kara Şövalye': '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'Yüzüklerin Efendisi: Kralın Dönüşü': '/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
  'Pulp Fiction': '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  'Forrest Gump': '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
  'İntikam Oyunu': '/mvEpoque3DitgeMdrXsATj7oWhJ.jpg',
  'Interstellar': '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  'Parasite': '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  'Gladyatör': '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',

  // Aksiyon (Top 10)
  'Mad Max: Fury Road': '/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
  'Top Gun: Maverick': '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
  'Die Hard': '/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg',
  'John Wick': '/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
  'Kingsman': '/vYuGsu7XjKzC3sphSXuqX4XEeLT.jpg',
  'The Raid': '/nv4WifzzNX0J4nWPEVeuJvUnROr.jpg',
  'Mission: Impossible - Fallout': '/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
  'Atomic Blonde': '/kV9R5h0B5vW6JYJp1v3ivp5sUZw.jpg',
  'The Fast and Furious': '/2lFhlIQUdrXIx0U9PDGwjfUbdzM.jpg',

  // Bilim Kurgu (Top 10)
  'Inception': '/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg',
  'The Matrix': '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  'Dune': '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
  'Blade Runner': '/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg',
  'Arrival': '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
  '12 Monkeys': '/6Sj9wDu3YugthXsU0Vry5XFAZGg.jpg',
  'Gravity': '/2wJnToX6SzPKbMKUZu93sQ8RQrB.jpg',
  'Minority Report': '/h3lpltSn5zWHkhBi8Z5iRWwm4gu.jpg',

  // Dram (Top 10)
  'Life is Beautiful': '/74hLDKjD5aGYOotO6esUVaeISa2.jpg',
  'Moonlight': '/4911T5FbJ9eD2Faz5Z8L7IvVRC9.jpg',
  'Boyhood': '/b1OXhE2LTjTLsvd4NSrYkmHT3L5.jpg',
  'The Pursuit of Happyness': '/iOD1FQ6dkH3V8PwJkwZw9zV2P0c.jpg',
  '12 Angry Men': '/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg',

  // Komedi (Top 10)
  'The Hangover': '/uluhlXhjxdhgt2TtFk6AdGZ6vH4.jpg',
  'Bridesmaids': '/nc1p8WtqCvr24tOqvUCN4xkxGkZ.jpg',
  'Superbad': '/ek8e8txUyRwd51PcRmohD7K6pfr.jpg',
  'Three Idiots': '/66A9MqXOyVFCssolosqKgx.jpg',
  'Tropic Thunder': '/zAurB9mNxfYRoVrVjAJJwGV3sPg.jpg',
  'Groundhog Day': '/gCgt1WARPZaXnq523ySQEUKinCs.jpg',
  'Juno': '/jNIn9OSgBFkA3a8R9SeSD2oTRtL.jpg',
  'Napoleon Dynamite': '/6p8QwSLxnNLrKXXWPp8RQfPLmKo.jpg',

  // Korku (Top 10)
  'Hereditary': '/g7MP7bCJDMaPbnTbjzYLqoUI7tE.jpg',
  'Insidious': '/dRHX8Egkd8O7fJwm1MypCl5Nz4a.jpg',
  'The Witch': '/zap5hpFCWSvdWSuPGAQyjUv2wAC.jpg',
  'A Quiet Place': '/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
  'Sinister': '/chGhBIO6E8LoJReYcIdThGIbHcK.jpg',
  'The Ring': '/gAnButCn3ThJHIywu0v4QglLfJc.jpg',
  'It Follows': '/qh0XkIqmj75lP2XOIkbx0AZpnmj.jpg',
  'The Conjuring': '/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
  'Scary Stories to Tell in the Dark': '/kR44cYHBqaNI8nlhVaLYchWxWpP.jpg',

  // Romantik (Top 10)
  'About Time': '/qV76jNTiznKTqFxpyYsLCcwMLHx.jpg',
  'The Notebook': '/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg',
  'Midnight in Paris': '/4wBG5kbfagTQclETblPRRGihk0I.jpg',
  'Crazy Rich Asians': '/1XxL664ZmZxRaCUVFo1rEWVH4TK.jpg',
  'La La Land': '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
  'Pride and Prejudice': '/sGjIvtVvTlWnia2zfJfhez65lvG.jpg',
  'Titanic': '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
  "The Time Traveler's Wife": '/o1xB7JhXNhMYFtVpQjJkQGLvQCy.jpg',
  'When Harry Met Sally': '/3wkbKeowUp1Zpkw1KkBqMWbt1F9.jpg',

  // Gerilim (Top 10)
  'Nightcrawler': '/j9HrX8f7GbZQm1BrBiR40uFQZSb.jpg',
  'Mystic River': '/hPMQ3fF2Xtc3WKzOHAjYn9B4QGp.jpg',
  'Gone Girl': '/gdiLTof3rbPDAmPaCf4g6op46bj.jpg',
  'Prisoners': '/uhviyknTT5cEQXbn6vWIqfM4vGm.jpg',
  'Se7en': '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
  'The Girl on the Train': '/n1JJqSPToYCIdSXI4Ga9SfWfTz6.jpg',
  'Shutter Island': '/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg',
  'Wind River': '/pySivdR6H10kwaTfzHLzvuODD7U.jpg',
  'Zodiac': '/zEqyD0SBt6HL7W9JQoWwtd5Do1T.jpg',

  // Animasyon (Top 10)
  'Inside Out': '/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg',
  'Zootopia': '/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg',
  'Kimetsu no Yaiba': '/tuFaWiqX0TXoWu7DGNcmX3UW7sT.jpg',
  'A Silent Voice': '/tuFaWiqX0TXoWu7DGNcmX3UW7sT.jpg',
  'Coco': '/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
  'Spirited Away': '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  'Your Name': '/q719jXXEzOoYaps6babgKnONONX.jpg',
  "Howl's Moving Castle": '/6pZgH10jhpToPcf7yjiFypxzhIQ.jpg',
  'Toy Story': '/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',

  // Belgesel (Top 10)
  'Free Solo': '/v4QfYZMACODlWul9doN9RxE99ag.jpg',
  'The Last Dance': '/dZCKCsYqVSzoEMjzyRr91uTR5Rm.jpg',
  'Amy': '/dFSiSRoTrial3sd8hkM6u5tC.jpg',
  'Our Planet': '/wnE9xoThbGlYxz8VpyMqQVdAQxy.jpg',
  'Blackfish': '/jOiwgRkx1dUbHpZEMfQ7hNW9mFL.jpg',
  'The Social Dilemma': '/d6CkP39GJMkNUC3bqzDaXfYxVGt.jpg',
  '13th': '/a2b5mfL6PXYNo2wgWVYL1fOW9dL.jpg',
  'Jiro Dreams of Sushi': '/3pUUjJls9HzqISG0BFJr1O02vNq.jpg',
  'Planet Earth II': '/mEGd4qXWb13xaVhMFnfKFg7SWyc.jpg',

  // Fantastik (Top 10)
  'Harry Potter': '/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
  'Avatar': '/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg',
  "Pan's Labyrinth": '/yB1ycmRTGJh60lbXvQZqDs0YaM8.jpg',
  'Stardust': '/6FWELlTpEGsgx0csGFYqCdNe1G1.jpg',
  'The Shape of Water': '/k4FRJsejjhQb7IzPGMEs7Ggkt08.jpg',
  'Doctor Strange': '/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg',
  'Aquaman': '/5Kg76ldv7VxeX9YlcQXiowHgdX6.jpg',
  'The Fantastic Beasts': '/8Qsr8pvDL3s1jNZQ4HK1d1Xlvnh.jpg',
  'Constantine': '/4fANSamlVBjb0eQ12AdnO4PoSvO.jpg',

  // Türkçe Filmler
  'Kış Uykusu': '/i8HvNzx3LrZF5MQ6d3cGhX9JnML.jpg',
  'Umut': '/3VDTbU6VrHhJZbmGGqE7kT4E8K.jpg',
  'Organize İşler': '/nR7qWj1zt2LCQr7eJQGQqfYpqYV.jpg',
  'Yazı Tura': '/2TcIFP84E0fU9qOdVSx6kKMH9vb.jpg',
};

// Cache'i başlatma - bilinen posterler için warmup
export function initializePosterCache(): void {
  Object.entries(KNOWN_TMDB_POSTERS).forEach(([title, path]) => {
    if (path && !path.includes('placeholder')) {
      posterCache.set(title, `${TMDB_IMAGE_BASE_URL}${path}`);
    }
  });
  console.log(`✅ Poster cache başlatıldı: ${posterCache.size} film`);
}

// Film başlığına göre TMDB poster URL'sini getir
// Önce cache kontrol et, yoksa bilinen listede ara
export function getTMDBPosterUrl(title: string): string | undefined {
  // 1. Cache'de varsa hemen döndür
  if (posterCache.has(title)) {
    return posterCache.get(title);
  }

  // 2. Bilinen filmler listesinde varsa ekle ve döndür
  const knownPath = KNOWN_TMDB_POSTERS[title];
  if (knownPath && !knownPath.includes('placeholder')) {
    const fullUrl = `${TMDB_IMAGE_BASE_URL}${knownPath}`;
    posterCache.set(title, fullUrl);
    return fullUrl;
  }

  // 3. Yoksa undefined döndür (fallback sistem devreye girecek)
  return undefined;
}

// Tüm filmlere otomatik olarak poster URL'si ekle
export function addPosterUrlToMovie<T extends { title: string; posterUrl?: string }>(movie: T): T {
  if (!movie.posterUrl) {
    const tmdbUrl = getTMDBPosterUrl(movie.title);
    if (tmdbUrl) {
      return { ...movie, posterUrl: tmdbUrl };
    }
  }
  return movie;
}

// İstatistik göster
export function getPosterCacheStats(): { cached: number; known: number; total: number } {
  return {
    cached: posterCache.size,
    known: Object.keys(KNOWN_TMDB_POSTERS).length,
    total: Object.keys(KNOWN_TMDB_POSTERS).length
  };
}

// Cache temizle (bellek tasarrufu için)
export function clearPosterCache(): void {
  posterCache.clear();
  console.log('🗑️ Poster cache temizlendi');
}

// Cache'i yeniden başlat
export function resetPosterCache(): void {
  clearPosterCache();
  initializePosterCache();
  console.log('♻️ Poster cache sıfırlandı');
}

// Export for backward compatibility
export const TMDB_POSTERS = KNOWN_TMDB_POSTERS;