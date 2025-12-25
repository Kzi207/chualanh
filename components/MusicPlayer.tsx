import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song } from '../types';
import { getSongs } from '../services/storageService';
import { IconArrowLeft, IconMusic, IconPlay, IconPause, IconNext, IconPrev, IconSearch, IconPlus, IconDisc, IconNote, IconSparkles, IconCat, IconCoffee, IconStar, IconList } from './Icons';
import RequestModal from './RequestModal';

interface MusicPlayerProps {
  onBack: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onBack }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
      setIsLoading(true);
      const data = await getSongs();
      setSongs(data);
      if (data.length > 0) {
          setCurrentSong(data[0]);
      }
      setIsLoading(false);
  };

  // Extract unique moods for categories
  const categories = useMemo(() => {
      const moods = new Set(songs.map(s => s.mood ? s.mood.trim() : 'Khác').filter(Boolean));
      return ['Tất cả', ...Array.from(moods)];
  }, [songs]);

  useEffect(() => {
      if (currentSong && audioRef.current) {
          if (isPlaying) {
              audioRef.current.play().catch(e => {
                  console.error("Autoplay prevented:", e);
                  setIsPlaying(false);
              });
          }
      }
  }, [currentSong]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
    } else {
        audioRef.current.play();
        setIsPlaying(true);
    }
  };

  const handleNext = () => {
      if (filteredSongs.length === 0) return;
      
      const currentIdxInFiltered = filteredSongs.findIndex(s => s.id === currentSong?.id);
      
      let nextSong;
      if (currentIdxInFiltered !== -1) {
          const nextIdx = (currentIdxInFiltered + 1) % filteredSongs.length;
          nextSong = filteredSongs[nextIdx];
      } else {
          nextSong = filteredSongs[0];
      }
      
      if (nextSong) {
          setCurrentSong(nextSong);
          setIsPlaying(true);
      }
  };

  const handlePrev = () => {
      if (filteredSongs.length === 0) return;

      const currentIdxInFiltered = filteredSongs.findIndex(s => s.id === currentSong?.id);
      
      let prevSong;
      if (currentIdxInFiltered !== -1) {
          const prevIdx = (currentIdxInFiltered - 1 + filteredSongs.length) % filteredSongs.length;
          prevSong = filteredSongs[prevIdx];
      } else {
          prevSong = filteredSongs[0];
      }

      if (prevSong) {
          setCurrentSong(prevSong);
          setIsPlaying(true);
      }
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
      }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
      }
  };

  const formatTime = (seconds: number) => {
      if (!seconds) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter Songs Logic
  const filteredSongs = songs.filter(s => {
      const matchesSearch = 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'Tất cả' || (s.mood && s.mood.trim() === activeCategory);

      return matchesSearch && matchesCategory;
  });

  // Small animated equalizer component
  const Equalizer = () => (
      <div className="flex items-end gap-[2px] h-3">
          <div className="w-1 bg-white animate-[bounce_1s_infinite] h-full" style={{ animationDelay: '0s' }}></div>
          <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-2/3" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-full" style={{ animationDelay: '0.4s' }}></div>
      </div>
  );

  // Floating Decoration Component
  const FloatingParticle = ({ children, delay, left, top, duration = '4s' }: any) => (
      <div 
        className={`absolute animate-float text-white/40 pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
        style={{ left, top, animationDuration: duration, animationDelay: delay }}
      >
          {children}
      </div>
  );

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 flex flex-col relative overflow-hidden font-sans transition-colors duration-500">
        
        {/* --- DYNAMIC BACKGROUND & PARTICLES --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Soft Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-200/40 dark:bg-purple-600/20 rounded-full blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-200/40 dark:bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
            
            {/* Noise Texture for Lo-fi feel */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Floating Music Notes & Stars (Only visible when playing) */}
            <FloatingParticle left="10%" top="60%" delay="0s"><IconNote className="w-6 h-6" /></FloatingParticle>
            <FloatingParticle left="80%" top="20%" delay="1.5s"><IconNote className="w-4 h-4 rotate-12" /></FloatingParticle>
            <FloatingParticle left="20%" top="30%" delay="2.5s"><IconSparkles className="w-5 h-5 text-yellow-300" /></FloatingParticle>
            <FloatingParticle left="70%" top="70%" delay="0.5s"><IconStar className="w-3 h-3 text-yellow-200" /></FloatingParticle>
            <FloatingParticle left="90%" top="40%" delay="3s"><IconNote className="w-5 h-5 -rotate-12" /></FloatingParticle>
        </div>

        {/* --- HEADER --- */}
        <header className="flex-shrink-0 w-full z-20 px-4 py-4 flex items-center justify-between bg-white/10 dark:bg-slate-900/10 backdrop-blur-md border-b border-white/20 dark:border-white/5">
            <button 
                onClick={onBack}
                className="p-2 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-white/10 rounded-full transition-all text-slate-700 dark:text-slate-200 backdrop-blur-sm"
            >
                <IconArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 drop-shadow-sm">
                <IconMusic className="w-5 h-5 text-orange-500" /> Tiệm Nhạc An Nhiên
            </span>
            <div className="w-9"></div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar w-full max-w-lg mx-auto relative z-10 pb-52">
            
            {/* 1. VINYL SECTION (CENTERPIECE) */}
            <div className="pt-8 pb-6 flex flex-col items-center justify-center relative">
                
                {/* Visualizer Aura / Pulse */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border-2 border-orange-300/30 dark:border-orange-500/20 transition-all duration-1000 ${isPlaying ? 'scale-125 opacity-100 animate-[ping_3s_linear_infinite]' : 'scale-75 opacity-0'}`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-400/30 dark:bg-orange-500/20 rounded-full blur-3xl transition-opacity duration-700 ${isPlaying ? 'opacity-100 scale-110' : 'opacity-0 scale-75'}`}></div>

                {/* Disc Container */}
                <div className={`relative w-48 h-48 flex-shrink-0 rounded-full bg-[#111] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-transform duration-[8s] ease-linear mb-5 ring-1 ring-white/10 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                         {/* Texture */}
                         <div className="absolute inset-0 rounded-full border-[8px] border-[#1a1a1a]"></div>
                         <div className="absolute inset-0 rounded-full border-[16px] border-transparent border-t-[#222] opacity-20"></div>
                         <div className="absolute inset-4 rounded-full border border-white/5 opacity-50"></div>
                         <div className="absolute inset-8 rounded-full border border-white/5 opacity-40"></div>
                         <div className="absolute inset-12 rounded-full border border-white/5 opacity-30"></div>
                         
                         {/* Gloss */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40 rounded-full pointer-events-none"></div>

                         {/* Label */}
                         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center relative z-10 shadow-inner ring-2 ring-[#111]">
                             <div className="w-2 h-2 bg-black rounded-full opacity-80"></div>
                         </div>
                </div>

                {/* Info Text */}
                <div className="text-center px-8 w-full animate-fade-in-up relative z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate drop-shadow-sm font-serif">
                        {currentSong ? currentSong.title : "Chọn một giai điệu..."}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                        {isPlaying && <IconMusic className="w-3 h-3 animate-bounce" />}
                        {currentSong ? currentSong.artist : "..."}
                    </p>
                    {currentSong && <span className="inline-block mt-3 px-3 py-1 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-orange-600 dark:text-orange-300 text-[10px] rounded-full font-bold uppercase tracking-wider shadow-sm">{currentSong.mood}</span>}
                </div>
            </div>

            {/* 2. CUTE STICKERS (Decorations) */}
            <div className="absolute top-24 left-4 rotate-[-12deg] pointer-events-none animate-float-delayed z-0 opacity-80">
                <div className="bg-white/80 dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-white/50">
                     <IconCat className="w-8 h-8 text-orange-400" />
                </div>
            </div>
            <div className="absolute top-40 right-6 rotate-[12deg] pointer-events-none animate-float z-0 opacity-80">
                 <div className="bg-white/80 dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-white/50">
                     <IconCoffee className="w-6 h-6 text-amber-700" />
                 </div>
            </div>

            {/* 3. SEARCH & CATEGORIES */}
            <div className="sticky top-0 z-20 bg-white/70 dark:bg-slate-900/80 backdrop-blur-lg pb-3 pt-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-y border-white/20 dark:border-white/5">
                 {/* Search Bar */}
                 <div className="px-4 mb-3">
                     <div className="relative group">
                         <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-pink-200 dark:from-orange-900/40 dark:to-pink-900/40 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                         <div className="relative bg-white/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center shadow-sm backdrop-blur-sm">
                             <IconSearch className="w-5 h-5 text-slate-400 ml-3" />
                             <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm giai điệu..."
                                className="w-full pl-2 pr-4 py-3 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
                             />
                         </div>
                     </div>
                 </div>

                 {/* Category Tabs */}
                 <div className="px-4 overflow-x-auto no-scrollbar flex gap-2 pb-1">
                     {categories.map(cat => (
                         <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                activeCategory === cat 
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 border-transparent text-white shadow-lg shadow-orange-500/30 scale-105' 
                                : 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                         >
                             {cat}
                         </button>
                     ))}
                 </div>
            </div>

            {/* 4. SONG LIST */}
            <div className="px-4 space-y-3 mt-4">
                {isLoading ? (
                    <div className="text-center py-8 text-slate-400">Đang tải danh sách...</div>
                ) : filteredSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-6 bg-white/40 dark:bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                            <IconDisc className="w-6 h-6" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm font-medium">Không tìm thấy bài hát nào.</p>
                        <button
                             onClick={() => setShowRequestModal(true)}
                             className="px-4 py-2 bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-md transition border border-orange-100 dark:border-slate-700"
                        >
                            <IconPlus className="w-3 h-3" /> Yêu cầu thêm bài
                        </button>
                    </div>
                ) : (
                    <>
                         <div className="flex items-center justify-between px-2 mb-1">
                             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><IconList className="w-3 h-3"/> Playlist</h4>
                             <span className="text-[10px] bg-white dark:bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">{filteredSongs.length} bài</span>
                         </div>
                        {filteredSongs.map((song, idx) => {
                            const isActive = currentSong?.id === song.id;
                            return (
                                <div 
                                    key={song.id}
                                    onClick={() => { setCurrentSong(song); setIsPlaying(true); }}
                                    className={`relative p-3 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group overflow-hidden border ${
                                        isActive
                                        ? 'bg-white/80 dark:bg-slate-800/80 shadow-md border-orange-200 dark:border-orange-900/50 scale-[1.01]' 
                                        : 'bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-800/60 border-white/50 dark:border-slate-700/50'
                                    }`}
                                >
                                    {/* Active background subtle gradient */}
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 opacity-50 z-0"></div>}

                                    <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                                        isActive
                                        ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-inner'
                                    }`}>
                                        {isActive && isPlaying ? <Equalizer /> : (isActive ? <IconMusic className="w-5 h-5"/> : (idx + 1))}
                                    </div>
                                    <div className="min-w-0 flex-1 relative z-10">
                                        <p className={`text-[15px] font-bold truncate ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{song.title}</p>
                                        <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-orange-600 dark:text-orange-300' : 'text-slate-500 dark:text-slate-500'}`}>{song.artist}</p>
                                    </div>
                                    {isActive && <div className="relative z-10 w-2 h-2 rounded-full bg-orange-500 mr-2 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse"></div>}
                                </div>
                            );
                        })}
                    </>
                )}
                
                {/* Request Footer */}
                 <div className="pt-8 pb-4 text-center">
                     <p className="text-xs text-slate-400 mb-3 font-serif italic">"Âm nhạc là cảm xúc..."</p>
                     <button
                        onClick={() => setShowRequestModal(true)}
                        className="inline-block px-5 py-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold text-slate-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all"
                     >
                         Gửi yêu cầu bài hát mới
                     </button>
                 </div>
            </div>
        </main>

        {/* 5. PLAYER CONTROLS (Glassmorphism) */}
        <div className="fixed bottom-0 w-full z-30 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-white/40 dark:border-white/5 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
             <div className="max-w-lg mx-auto px-6 py-4">
                 {/* Progress Bar */}
                 <div className="flex items-center gap-3 mb-5 text-[10px] text-slate-500 font-bold tracking-wide">
                     <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
                     <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative group cursor-pointer">
                         <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)] transition-all duration-100" 
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                         >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
                         </div>
                         <input 
                            type="range" 
                            min="0" 
                            max={duration || 100} 
                            value={currentTime} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                     </div>
                     <span className="w-8 tabular-nums">{formatTime(duration)}</span>
                 </div>

                 {/* Buttons */}
                 <div className="flex items-center justify-center gap-8">
                      <button onClick={handlePrev} className="p-3 text-slate-400 hover:text-slate-800 dark:hover:text-white transition active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                          <IconPrev className="w-6 h-6" />
                      </button>

                      <button 
                          onClick={handlePlayPause}
                          disabled={!currentSong}
                          className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale hover:scale-105 hover:shadow-orange-500/50 border-4 border-white/20 dark:border-slate-800/20"
                      >
                          {isPlaying ? <IconPause className="w-7 h-7" /> : <IconPlay className="w-7 h-7 ml-1" />}
                      </button>

                      <button onClick={handleNext} className="p-3 text-slate-400 hover:text-slate-800 dark:hover:text-white transition active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                          <IconNext className="w-6 h-6" />
                      </button>
                 </div>
            </div>
        </div>

        {/* Hidden Audio Element */}
        <audio 
            ref={audioRef}
            src={currentSong?.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleNext}
            onLoadedMetadata={handleTimeUpdate}
            onError={() => {
                console.error("Audio load error");
                handleNext();
            }}
        />

        {/* REQUEST MODAL */}
        <RequestModal 
            isOpen={showRequestModal} 
            onClose={() => setShowRequestModal(false)} 
            initialType="music"
        />

    </div>
  );
};

export default MusicPlayer;