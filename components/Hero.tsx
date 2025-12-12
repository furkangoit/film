import React from 'react';
import { Play, Info } from 'lucide-react';

interface HeroProps {
  onSearchClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSearchClick }) => {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://picsum.photos/seed/cinema/1920/1080" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 flex flex-col items-start gap-6 z-10">
        <div className="max-w-2xl space-y-4">
          <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-bold tracking-wider uppercase">
            Yapay Zeka Destekli
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Sinemanın <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Geleceğini Keşfet</span>
          </h1>
          <p className="text-lg text-gray-300 line-clamp-3 md:line-clamp-none">
            CineAI ile film arama alışkanlıklarını değiştir. Mood'una, sevdiğin türlere veya sadece o anki hissiyatına göre kişiselleştirilmiş film önerileri al.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={onSearchClick}
              className="px-8 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded flex items-center gap-2 transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Keşfetmeye Başla
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded flex items-center gap-2 transition-colors">
              <Info className="w-5 h-5" />
              Daha Fazla Bilgi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;