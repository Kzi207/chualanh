import React, { useState, useEffect, useRef } from 'react';
import { Podcast } from '../types';
import { getPodcasts } from '../services/storageService';
import { IconArrowLeft, IconHeadphones, IconPlay, IconPause, IconMic, IconDisc } from './Icons';
import RequestModal from './RequestModal';

interface PodcastsProps {
  onBack: () => void;
}

const Podcasts: React.FC<PodcastsProps> = ({ onBack }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const loadPodcasts = async () => {
        setIsLoading(true);
        const data = await getPodcasts();
        setPodcasts(data);
        setIsLoading(false);
    };
    loadPodcasts();
  }, []);

  useEffect(() => {
    if (currentPodcast && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Auto play failed", e));
    }
  }, [currentPodcast]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentPodcast) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleSelectPodcast = (podcast: Podcast) => {
    if (currentPodcast?.id === podcast.id) {
        handlePlayPause();
    } else {
        setCurrentPodcast(podcast);
        setIsPlaying(true);
    }
  };

  return (
    <div className="h-[100dvh] bg-sky-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
        
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/40 dark:bg-slate-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-100/40 dark:bg-slate-800/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Header */}
      <header className="flex-shrink-0 z-20 px-4 py-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/20 dark:border-slate-800">
        <button 
            onClick={onBack}
            className="p-2 bg-white/60 dark:bg-slate-800/60 rounded-full hover:bg-white dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-300 shadow-sm"
        >
            <IconArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconHeadphones className="w-5 h-5 text-teal-500" /> Radio An Nhiên
        </span>
        <div className="w-9"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 z-10 custom-scrollbar pb-32">
        <div className="max-w-lg mx-auto space-y-4">
            
            {/* Intro Card */}
            <div className="bg-gradient-to-r from-teal-500 to-sky-500 rounded-2xl p-6 text-white shadow-lg mb-4 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="font-serif text-2xl font-bold mb-2">Thính phòng chữa lành</h2>
                    <p className="text-teal-50 text-sm opacity-90 leading-relaxed">
                        Lắng nghe những câu chuyện, những thanh âm dịu dàng để vỗ về tâm hồn bạn sau những ngày bão giông.
                    </p>
                </div>
                <IconHeadphones className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
            </div>

            {/* Contribution Info - WITH MODAL TRIGGER */}
            <div 
                onClick={() => setShowRequestModal(true)}
                className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-teal-300 dark:border-slate-700 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-teal-400 transition-colors cursor-pointer"
            >
                 <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                     <IconMic className="w-6 h-6" />
                 </div>
                 <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Bạn muốn chia sẻ câu chuyện?</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-1 truncate">
                         Gửi bản thu âm giọng nói của bạn cho chúng mình nhé.
                     </p>
                     <span className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1">
                         Gửi yêu cầu ngay
                     </span>
                 </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400 animate-pulse">Đang tải Podcast...</p>
                </div>
            ) : podcasts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                    Chưa có tập podcast nào.
                </div>
            ) : (
                podcasts.map(podcast => (
                    <div 
                        key={podcast.id}
                        onClick={() => handleSelectPodcast(podcast)}
                        className={`group bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border transition-all cursor-pointer flex items-center gap-4 ${
                            currentPodcast?.id === podcast.id 
                            ? 'border-teal-400 ring-1 ring-teal-200 dark:ring-teal-900' 
                            : 'border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-md'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            currentPodcast?.id === podcast.id && isPlaying
                            ? 'bg-teal-500 text-white animate-pulse'
                            : 'bg-teal-50 dark:bg-slate-800 text-teal-500 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-slate-700'
                        }`}>
                             {currentPodcast?.id === podcast.id && isPlaying ? <IconPause className="w-5 h-5"/> : <IconPlay className="w-5 h-5 ml-1"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-base truncate ${
                                currentPodcast?.id === podcast.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'
                            }`}>{podcast.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{podcast.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                <span>{podcast.author}</span>
                                <span>•</span>
                                <span>{podcast.duration}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>

      {/* Player Bar (Fixed Bottom) */}
      {currentPodcast && (
        <div className="absolute bottom-0 w-full z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 pb-8 sm:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all animate-fade-in-up">
             <div className="max-w-lg mx-auto flex items-center gap-4">
                 {/* Spinning Disc Effect */}
                 <div className={`w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-slate-700 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-teal-400 to-sky-400"></div>
                 </div>
                 
                 <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{currentPodcast.title}</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentPodcast.author}</p>
                     
                     {/* Progress Bar */}
                     <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                         <div 
                            className="h-full bg-gradient-to-r from-teal-400 to-sky-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                         ></div>
                     </div>
                 </div>

                 <button 
                    onClick={handlePlayPause}
                    className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg hover:bg-teal-600 active:scale-95 transition-all flex-shrink-0"
                 >
                     {isPlaying ? <IconPause className="w-5 h-5" /> : <IconPlay className="w-5 h-5 ml-1" />}
                 </button>
             </div>
             
             <audio 
                ref={audioRef}
                src={currentPodcast.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
             />
        </div>
      )}

      {/* REQUEST MODAL */}
      <RequestModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
        initialType="podcast"
      />

    </div>
  );
};

export default Podcasts;