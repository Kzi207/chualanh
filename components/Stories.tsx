import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment, UserProfile } from '../types';
import { getPosts, addPost, toggleLike, addComment } from '../services/storageService';
import { moderateContent } from '../services/geminiService';
import { IconArrowLeft, IconBook, IconSparkles, IconHeart, IconHeartFilled, IconMessage, IconSend, IconUser, IconClose } from './Icons';

interface StoriesProps {
  onBack: () => void;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
}

const CATEGORIES = [
    { id: 'tamsu', label: 'Tâm sự', icon: '🍃', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { id: 'loikhuyen', label: 'Xin lời khuyên', icon: '💡', color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { id: 'camxuc', label: 'Cảm xúc', icon: '💭', color: 'text-sky-500 bg-sky-50 border-sky-200' },
    { id: 'chualanh', label: 'Chữa lành', icon: '❤️‍🩹', color: 'text-rose-500 bg-rose-50 border-rose-200' },
];

const MAX_COMMENT_LENGTH = 300;

// --- HEALING AVATAR SYSTEM ---
// Danh sách các biểu tượng chữa lành: Nhẹ nhàng, thiên nhiên, bình yên
const HEALING_THEMES = [
    { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-500 dark:text-rose-300', icon: '🌸' }, // Hoa anh đào
    { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-500 dark:text-sky-300', icon: '☁️' },   // Mây trắng
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500 dark:text-emerald-300', icon: '🌿' }, // Lá cây
    { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-500 dark:text-amber-300', icon: '✨' },   // Lấp lánh
    { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-500 dark:text-violet-300', icon: '🌙' }, // Trăng khuyết
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-500 dark:text-orange-300', icon: '🐱' }, // Mèo con
    { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-500 dark:text-teal-300', icon: '🍵' },   // Trà xanh
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-500 dark:text-indigo-300', icon: '🦋' }, // Bướm
    { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-500 dark:text-pink-300', icon: '🧸' },   // Gấu bông
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-500 dark:text-cyan-300', icon: '🕊️' },   // Chim bồ câu
    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-300', icon: '🌻' }, // Hướng dương
    { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-300', icon: '🪨' },   // Đá cuội
];

// Hàm tạo Avatar cố định dựa trên tên user (không bị đổi khi reload)
const getHealingAvatar = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % HEALING_THEMES.length;
    return HEALING_THEMES[index];
};

const Stories: React.FC<StoriesProps> = ({ onBack, currentUser, onRequireAuth }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  
  // Reply State: Key is post.id, Value is the Comment being replied to
  const [replyingTo, setReplyingTo] = useState<{[key: string]: Comment | null}>({});

  // Create Post State
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState(CATEGORIES[0].label);
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Refs for scrolling
  const commentInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  useEffect(() => {
    fetchData();
    const storedLikes = localStorage.getItem('user_liked_posts');
    if (storedLikes) {
        setLikedPosts(new Set(JSON.parse(storedLikes)));
    }
  }, []);

  const fetchData = async () => {
      setIsLoading(true);
      const data = await getPosts();
      setPosts(data);
      setIsLoading(false);
  };

  const handleLike = async (post: Post) => {
    const isLiked = likedPosts.has(post.id);
    
    // Optimistic Update
    const newLikedPosts = new Set(likedPosts);
    if (isLiked) newLikedPosts.delete(post.id);
    else newLikedPosts.add(post.id);
    setLikedPosts(newLikedPosts);
    localStorage.setItem('user_liked_posts', JSON.stringify(Array.from(newLikedPosts)));

    const newLikeCount = isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikeCount } : p));

    await toggleLike(post.id, post.likes, !isLiked);
  };

  const toggleComments = (id: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedComments(newExpanded);
  };

  const initiateReply = (post: Post, comment: Comment) => {
      setReplyingTo(prev => ({ ...prev, [post.id]: comment }));
      // Focus input if possible
      if (commentInputRefs.current[post.id]) {
          commentInputRefs.current[post.id]?.focus();
      }
  };

  const cancelReply = (postId: string) => {
      setReplyingTo(prev => {
          const newState = { ...prev };
          delete newState[postId];
          return newState;
      });
  };

  const handleCreatePost = async () => {
      if (!newPostContent.trim()) return;
      
      if (!currentUser) {
          onRequireAuth();
          return;
      }

      setIsModerating(true);
      setModerationError(null);

      try {
          const check = await moderateContent(newPostContent);
          
          if (check.approved) {
              const tempId = `post_${Date.now()}`;
              const newPostObj: Post = {
                  id: tempId,
                  content: newPostContent,
                  author: currentUser.name,
                  category: newPostCategory,
                  createdAt: Date.now(),
                  likes: 0,
                  comments: []
              };
              
              setPosts([newPostObj, ...posts]);
              setNewPostContent('');
              setIsCreatingPost(false);

              await addPost({
                  content: newPostObj.content,
                  author: newPostObj.author,
                  category: newPostObj.category
              });
              
          } else {
              setModerationError(check.reason || "Nội dung chưa phù hợp với cộng đồng.");
          }
      } catch (e) {
          setModerationError("Có lỗi kết nối, vui lòng thử lại.");
      } finally {
          setIsModerating(false);
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent, post: Post) => {
      e.preventDefault();
      const content = commentInputs[post.id];
      if (!content || !content.trim()) return;
      
      if (content.length > MAX_COMMENT_LENGTH) {
          alert(`Bình luận quá dài. Vui lòng giới hạn dưới ${MAX_COMMENT_LENGTH} ký tự.`);
          return;
      }

      if (!currentUser) {
          onRequireAuth();
          return;
      }

      const replyContext = replyingTo[post.id];
      const tempInput = content;
      
      setCommentInputs(prev => ({...prev, [post.id]: 'Đang gửi...'}));

      try {
          const check = await moderateContent(tempInput);
          if (check.approved) {
               const safeComments = post.comments || []; 
               
               // Pass replyContext to service
               const updatedComments = await addComment(
                   post.id, 
                   safeComments, 
                   tempInput, 
                   currentUser.name,
                   replyContext
               );
               
               if (updatedComments) {
                   setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments: updatedComments } : p));
                   setCommentInputs(prev => ({...prev, [post.id]: ''}));
                   
                   if (replyContext) cancelReply(post.id);

                   if (!expandedComments.has(post.id)) {
                        setExpandedComments(prev => new Set(prev).add(post.id));
                   }
               } else {
                   setCommentInputs(prev => ({...prev, [post.id]: tempInput}));
                   alert("Không thể lưu bình luận.");
               }
          } else {
              alert(`Không thể đăng bình luận: ${check.reason}`);
              setCommentInputs(prev => ({...prev, [post.id]: tempInput}));
          }
      } catch (e) {
          alert("Lỗi kết nối khi duyệt bình luận.");
          setCommentInputs(prev => ({...prev, [post.id]: tempInput}));
      }
  };

  const formatTime = (timestamp: number) => {
      if (!timestamp) return 'Gần đây';
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const years = Math.floor(days / 365);

      if (years > 0) return `${years} năm`;
      if (days > 0) return `${days} ngày`;
      if (hours > 0) return `${hours} giờ`;
      if (minutes > 0) return `${minutes} phút`;
      return 'Vừa xong';
  };

  // Helper to Render nested comments
  const renderCommentTree = (comments: Comment[], post: Post) => {
      // 1. Separate roots and find children for each
      const rootComments = comments.filter(c => !c.replyToId);
      const getReplies = (parentId: string) => comments.filter(c => c.replyToId === parentId);

      return rootComments.map((root, index) => {
          const avatar = getHealingAvatar(root.author);
          
          return (
          <div key={root.id} className="relative group mb-5 animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
               
               {/* Root Comment Card */}
               <div className="flex gap-3 items-start z-10 relative">
                  {/* Healing Avatar */}
                  <div className={`w-9 h-9 rounded-full ${avatar.bg} ${avatar.text} flex-shrink-0 flex items-center justify-center text-lg shadow-sm ring-2 ring-white dark:ring-slate-800`}>
                      {avatar.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                      <div className="bg-white dark:bg-slate-800/80 rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-100 dark:border-slate-700/50">
                          <div className="flex justify-between items-baseline mb-1">
                              <span className="font-bold text-[13px] text-slate-800 dark:text-slate-100 truncate pr-2">
                                  {root.author}
                              </span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {formatTime(root.createdAt)}
                              </span>
                          </div>
                          <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 break-words font-medium">
                              {root.content}
                          </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-4 ml-3 mt-1.5 text-[11px] font-semibold text-slate-400 select-none">
                          <button className="hover:text-rose-500 transition-colors flex items-center gap-1 group/btn">
                              <IconHeart className="w-3 h-3 group-hover/btn:scale-110 transition-transform" /> Thích
                          </button>
                          <button 
                              onClick={() => initiateReply(post, root)}
                              className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                          >
                              Trả lời
                          </button>
                      </div>
                  </div>
               </div>

               {/* Replies Tree */}
               {getReplies(root.id).length > 0 && (
                   <div className="mt-2 pl-4 ml-4 relative">
                       {/* Main vertical connector line */}
                       <div className="absolute left-0 top-[-15px] bottom-5 w-[2px] bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                       
                       {getReplies(root.id).map(reply => {
                           const replyAvatar = getHealingAvatar(reply.author);
                           return (
                           <div key={reply.id} className="flex gap-3 items-start mt-3 relative group/reply">
                               {/* Curved connector */}
                               <div className="absolute -left-4 top-0 w-4 h-6 border-l-[2px] border-b-[2px] border-slate-200 dark:border-slate-700 rounded-bl-2xl"></div>
                               
                               <div className={`w-7 h-7 rounded-full ${replyAvatar.bg} ${replyAvatar.text} flex-shrink-0 flex items-center justify-center text-sm font-bold mt-1.5 z-10 ring-2 ring-white dark:ring-slate-800`}>
                                   {replyAvatar.icon}
                               </div>
                               <div className="flex-1 min-w-0">
                                    <div className="bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/60 transition-colors rounded-xl rounded-tl-none p-2.5 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-[12px] text-slate-700 dark:text-slate-200">
                                                {reply.author}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {formatTime(reply.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-[13px] leading-snug text-slate-600 dark:text-slate-400 break-words">
                                            {reply.content}
                                        </p>
                                    </div>
                               </div>
                           </div>
                       )})}
                   </div>
               )}
          </div>
      )});
  };

  return (
    <div className="min-h-[100dvh] bg-sky-50 dark:bg-slate-950 flex flex-col items-center relative overflow-x-hidden font-sans transition-colors duration-500">
        
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-200/20 to-purple-200/20 dark:from-pink-900/10 dark:to-purple-900/10 blur-[100px] opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-sky-200/20 to-teal-200/20 dark:from-sky-900/10 dark:to-teal-900/10 blur-[100px] opacity-70"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 px-4 py-3 border-b border-white/40 dark:border-slate-800 transition-colors duration-300 shadow-sm">
        <div className="w-full max-w-xl mx-auto flex items-center justify-between">
            <button 
                onClick={onBack}
                className="p-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700"
            >
                <IconArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                 <span className="font-serif font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 group-hover:from-sky-500 group-hover:to-blue-600 transition-all duration-300">
                     Góc Suy Ngẫm
                 </span>
            </div>
            
            <div className="w-10"></div>
        </div>
      </header>

      <main className="w-full max-w-xl mx-auto px-4 py-6 relative z-10 flex flex-col gap-6 pb-32">
        
        {/* CREATE POST BAR */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[24px] shadow-sm border border-white dark:border-slate-800 transition-all hover:shadow-md">
            {!isCreatingPost ? (
                <div 
                    onClick={() => setIsCreatingPost(true)}
                    className="flex items-center gap-3 p-3 cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 transition-all duration-300">
                        {currentUser ? (
                             (() => {
                                 const avatar = getHealingAvatar(currentUser.name);
                                 return (
                                     <div className={`w-full h-full rounded-full flex items-center justify-center text-xl shadow-inner ${avatar.bg}`}>
                                         {avatar.icon}
                                     </div>
                                 );
                             })()
                        ) : (
                             <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <IconUser className="w-6 h-6" />
                             </div>
                        )}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-3 text-slate-500 dark:text-slate-400 text-sm font-medium border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all">
                        {currentUser ? `Chào ${currentUser.name}, bạn đang nghĩ gì?` : "Hôm nay bạn thấy thế nào? Chia sẻ nhé..."}
                    </div>
                </div>
            ) : (
                <div className="p-5 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Bài viết mới</h3>
                        <button onClick={() => setIsCreatingPost(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
                            <IconClose className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Viết ra những điều trong lòng bạn..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-sky-100 dark:focus:ring-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none min-h-[150px] text-slate-700 dark:text-slate-200 placeholder-slate-400 resize-none text-base leading-relaxed transition-all"
                    />
                    
                    {moderationError && (
                        <div className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                             <span>⚠️ {moderationError}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-3">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-1 mask-linear-fade">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setNewPostCategory(cat.label)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                        newPostCategory === cat.label 
                                        ? `${cat.color} shadow-sm scale-105` 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 grayscale hover:grayscale-0'
                                    }`}
                                >
                                    <span>{cat.icon}</span> {cat.label}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || isModerating}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                !newPostContent.trim() || isModerating
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200/50 hover:scale-105 active:scale-95'
                            }`}
                        >
                            {isModerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <IconSend className="w-4 h-4"/>}
                            {isModerating ? 'Đang duyệt' : 'Đăng bài'}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* FEED LOADING */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                    </div>
                </div>
                <p className="text-sm text-slate-400 font-medium animate-pulse">Đang tải những câu chuyện...</p>
            </div>
        )}

        {/* FEED */}
        {!isLoading && posts.map((post, index) => {
            const isLiked = likedPosts.has(post.id);
            const isCommentsOpen = expandedComments.has(post.id);
            const replyingComment = replyingTo[post.id];

            // Get category color
            const catInfo = CATEGORIES.find(c => c.label === post.category);
            const catStyle = catInfo ? catInfo.color.replace('text-', 'bg-').replace('500', '100').split(' ')[1] : 'bg-slate-100';
            
            // Post Author Avatar
            const postAvatar = getHealingAvatar(post.author);

            // Calculate comment input length status
            const currentCommentInput = commentInputs[post.id] || '';
            const isOverLimit = currentCommentInput.length > MAX_COMMENT_LENGTH;

            return (
                <div 
                    key={post.id} 
                    className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in-up transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] duration-500"
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    {/* Header */}
                    <div className="p-5 flex items-center gap-4 relative">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent dark:from-slate-800/30 rounded-bl-full pointer-events-none"></div>

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-2xl ${postAvatar.bg} ${postAvatar.text}`}>
                            {postAvatar.icon}
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-1.5">
                                {post.author}
                                {post.author === 'Admin' && <IconSparkles className="w-3.5 h-3.5 text-yellow-400" />}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                                <span>{formatTime(post.createdAt)}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className={`px-2 py-0.5 rounded-full ${catStyle} dark:bg-slate-800 bg-opacity-50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700`}>
                                    {catInfo?.icon} {post.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-2">
                        <p className="text-[16px] sm:text-[17px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal tracking-wide">
                            {post.content}
                        </p>
                    </div>

                    {/* Stats & Actions */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                             <div className="flex gap-3">
                                <button 
                                    onClick={() => handleLike(post)}
                                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 border ${
                                        isLiked 
                                        ? 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30' 
                                        : 'text-slate-500 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <div className={`transition-transform duration-300 ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {isLiked ? <IconHeartFilled className="w-5 h-5" /> : <IconHeart className="w-5 h-5" />}
                                    </div>
                                    <span className="text-sm font-bold">{post.likes || 0}</span>
                                </button>
                                
                                <button 
                                    onClick={() => toggleComments(post.id)}
                                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 border ${
                                        isCommentsOpen 
                                        ? 'text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:border-sky-900/30' 
                                        : 'text-slate-500 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <IconMessage className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold">{post.comments ? post.comments.length : 0}</span>
                                </button>
                             </div>
                        </div>

                        {/* Comments Section */}
                        {isCommentsOpen && (
                            <div className="mt-4 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800 animate-fade-in-up">
                                {/* Comment List */}
                                <div className="space-y-1 mb-5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    {(!post.comments || post.comments.length === 0) ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                            <IconMessage className="w-8 h-8 text-slate-300 mb-2" />
                                            <p className="text-xs text-slate-400 font-medium">Chưa có bình luận. Hãy gửi lời động viên đầu tiên!</p>
                                        </div>
                                    ) : (
                                        renderCommentTree(post.comments, post)
                                    )}
                                </div>

                                {/* Comment Input */}
                                <div className="relative z-20 bg-white dark:bg-slate-900 p-1">
                                    {/* Reply Indicator (Floating) */}
                                    {replyingComment && (
                                        <div className="mb-2 bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-900 border border-sky-100 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between animate-fade-in-up shadow-sm">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-1 h-8 bg-sky-400 rounded-full"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wider">Đang trả lời</span>
                                                    <span className="text-xs text-slate-700 dark:text-slate-200 truncate font-medium">{replyingComment.author}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => cancelReply(post.id)} 
                                                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-100 dark:border-slate-600 transition"
                                            >
                                                <IconClose className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    <form 
                                        onSubmit={(e) => handleCommentSubmit(e, post)} 
                                        className="flex items-end gap-2 transition-all"
                                    >
                                        {currentUser && (
                                            (() => {
                                                const myAvatar = getHealingAvatar(currentUser.name);
                                                return (
                                                    <div className={`w-8 h-8 rounded-full ${myAvatar.bg} ${myAvatar.text} flex-shrink-0 flex items-center justify-center text-sm shadow-sm mb-6 ring-1 ring-white dark:ring-slate-700`}>
                                                        {myAvatar.icon}
                                                    </div>
                                                )
                                            })()
                                        )}
                                        
                                        <div className="flex-1 relative group">
                                            <div className="relative">
                                                <input
                                                    ref={(el) => { commentInputRefs.current[post.id] = el; }}
                                                    type="text"
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                                    placeholder={!currentUser ? "Đăng nhập để bình luận..." : (replyingComment ? `Nhập câu trả lời...` : "Viết bình luận...")}
                                                    disabled={commentInputs[post.id] === 'Đang gửi...'}
                                                    className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-4 pr-10 py-2.5 text-sm outline-none transition-all placeholder-slate-400
                                                        ${isOverLimit 
                                                            ? 'focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-300' 
                                                            : 'focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200'}`}
                                                    onFocus={() => { if(!currentUser) onRequireAuth(); }}
                                                />
                                                <button 
                                                    type="submit" 
                                                    disabled={!commentInputs[post.id]?.trim() || commentInputs[post.id] === 'Đang gửi...' || isOverLimit}
                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-sky-500 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-0 transition-all scale-100 disabled:scale-50"
                                                >
                                                    <IconSend className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* Character Counter */}
                                            <div className={`text-[10px] text-right mt-1 px-2 transition-all duration-300 ${isOverLimit ? 'text-red-500 font-bold opacity-100' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
                                                {currentCommentInput.length}/{MAX_COMMENT_LENGTH}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}

        {!isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-60">
                <IconBook className="w-16 h-16 mb-4 stroke-1" />
                <p>Chưa có bài viết nào.</p>
            </div>
        )}
      </main>

      <footer className="w-full text-center py-6 pointer-events-none mb-[env(safe-area-inset-bottom)]">
        <p className="text-[10px] text-slate-300 dark:text-slate-700 font-serif tracking-widest uppercase opacity-70">
            Cre: kzi
        </p>
      </footer>
    </div>
  );
};

export default Stories;