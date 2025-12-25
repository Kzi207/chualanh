import React from 'react';
import { IconSparkles, IconHeartFilled, IconBook, IconMoon, IconCloud, IconStar, IconLeaf, IconHeadphones, IconMusic, IconUser, IconEdit, IconLogout, IconCat, IconCoffee, IconRainbow, IconPlant } from './Icons';
import { UserProfile } from '../types';

interface WelcomeProps {
  onStart: () => void;
  onOpenStories: () => void;
  onOpenPodcasts: () => void;
  onOpenMusic: () => void;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onLogout: () => void;
}

// Sticker component to reduce repetition
const Sticker = ({ children, className, delay = '0s' }: { children: React.ReactNode, className?: string, delay?: string }) => (
    <div 
        className={`absolute pointer-events-none animate-float p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-[4px_6px_0px_rgba(0,0,0,0.1)] border-2 border-slate-100 dark:border-slate-700 ${className}`}
        style={{ animationDelay: delay }}
    >
        {children}
    </div>
);

const Welcome: React.FC<WelcomeProps> = ({ 
    onStart, 
    onOpenStories, 
    onOpenPodcasts, 
    onOpenMusic,
    currentUser,
    onRequireAuth,
    onLogout
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center animate-fade-in-up relative overflow-hidden transition-colors duration-500 bg-sky-50 dark:bg-slate-950">
        
      {/* --- Dynamic Background (Soft Blobs) --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-200/40 dark:bg-sky-900/20 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

      {/* --- DECORATIVE STICKERS (Floating Elements) --- */}
      {/* Top Left */}
      <Sticker className="top-10 left-6 sm:left-20 rotate-[-12deg]" delay="0s">
          <IconCat className="w-8 h-8 text-orange-400" />
      </Sticker>
      
      {/* Top Right */}
      <Sticker className="top-16 right-6 sm:right-24 rotate-[15deg]" delay="1.5s">
          <IconCloud className="w-10 h-10 text-sky-400" />
      </Sticker>

      {/* Mid Left */}
      <Sticker className="top-[40%] left-[-10px] sm:left-10 rotate-[6deg]" delay="3s">
          <IconCoffee className="w-7 h-7 text-amber-600" />
      </Sticker>

      {/* Bottom Right */}
      <Sticker className="bottom-24 right-4 sm:right-20 rotate-[-8deg]" delay="2s">
          <IconPlant className="w-9 h-9 text-emerald-500" />
      </Sticker>

      {/* Bottom Left */}
      <Sticker className="bottom-10 left-8 sm:left-32 rotate-[20deg]" delay="4s">
          <IconRainbow className="w-8 h-8 text-indigo-400" />
      </Sticker>
      
      {/* Tiny Stars/Sparkles scattered */}
      <div className="absolute top-1/4 left-1/4 animate-pulse text-yellow-400"><IconSparkles className="w-5 h-5"/></div>
      <div className="absolute bottom-1/3 right-1/4 animate-pulse text-yellow-400 animation-delay-2000"><IconStar className="w-4 h-4"/></div>
      <div className="absolute top-1/3 right-10 animate-float-delayed text-pink-300"><IconHeartFilled className="w-6 h-6"/></div>


      {/* --- Main Content Card --- */}
      <div className="glass-card relative p-8 sm:p-14 rounded-[32px] max-w-sm sm:max-w-md w-full z-10 transition-all duration-300 group hover:shadow-glow border-2 border-white/60 dark:border-white/5">
        
        {/* Logo Area */}
        <div className="flex justify-center mb-8 relative">
           <div className="absolute inset-0 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-2xl animate-pulse"></div>
           <div className="relative w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl rotate-3 flex items-center justify-center shadow-[0_8px_0_rgba(0,0,0,0.05)] border-2 border-slate-100 dark:border-slate-700 transition-transform duration-500 hover:rotate-6 hover:scale-105">
               <IconSparkles className="text-sky-500 dark:text-sky-400 w-12 h-12 drop-shadow-sm" />
               {/* Cute lil Leaf on logo */}
               <div className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                   <IconLeaf className="w-5 h-5 text-green-500" />
               </div>
           </div>
        </div>
        
        {/* Text */}
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
            An Nhiên
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium mb-8 tracking-wide uppercase opacity-80">
            — Nơi bình yên tìm về —
        </p>

        {/* User Identity Section */}
        <div className="mb-8 p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-slate-700 flex items-center justify-center text-sky-600 dark:text-sky-300 ring-2 ring-white dark:ring-slate-600">
                    <IconUser className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Đang là</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate max-w-[120px]">
                        {currentUser ? currentUser.name : "Khách ẩn danh"}
                    </p>
                </div>
            </div>
            {currentUser ? (
                <button 
                    type="button"
                    onClick={onLogout} 
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1.5 shadow-sm"
                    title="Đăng xuất khỏi thiết bị này"
                >
                    <IconLogout className="w-3.5 h-3.5" />
                    <span>Thoát</span>
                </button>
            ) : (
                <button 
                    type="button"
                    onClick={onRequireAuth}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold text-sky-600 dark:text-sky-400 shadow-sm hover:scale-105 transition border border-slate-100 dark:border-slate-600"
                >
                    Định danh
                </button>
            )}
        </div>
        
        {/* Buttons */}
        <div className="space-y-3.5 mb-8 w-full">
          <button
            onClick={onStart}
            className="btn-shine group w-full py-3.5 px-6 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-base font-bold rounded-2xl shadow-[0_6px_20px_-5px_rgba(14,165,233,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-b-4 border-sky-600 active:border-b-0 active:translate-y-1"
          >
             <IconHeartFilled className="w-5 h-5 text-white/90 animate-pulse" />
             <span>Tâm sự cùng AI</span>
          </button>

          <button
            onClick={onOpenStories}
            className="group w-full py-3.5 px-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-base font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-b-4 active:border-b-2 active:translate-y-[2px]"
          >
              <IconBook className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
              <span>Góc suy ngẫm</span>
          </button>

          <div className="flex gap-3">
            <button
                onClick={onOpenPodcasts}
                className="group flex-1 py-3.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-b-4 active:border-b-2 active:translate-y-[2px]"
            >
                <IconHeadphones className="w-5 h-5 text-teal-500 group-hover:scale-110 transition-transform" />
                <span>Podcast</span>
            </button>

            <button
                onClick={onOpenMusic}
                className="group flex-1 py-3.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-b-4 active:border-b-2 active:translate-y-[2px]"
            >
                <IconMusic className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span>Nghe nhạc</span>
            </button>
          </div>
        </div>
        
        {/* Footer Quote in Card */}
        <div className="mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-700">
             <p className="text-xs text-slate-400 dark:text-slate-500 font-serif italic text-center">
              "Mong bạn những ngày sau này,<br/>bão giông dừng lại sau cánh cửa."
            </p>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2 pb-[env(safe-area-inset-bottom)] z-10 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex gap-4 text-slate-400 text-[10px] tracking-widest uppercase font-semibold">
            <span>Bảo mật</span> • <span>Ẩn danh</span> • <span>Riêng tư</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;