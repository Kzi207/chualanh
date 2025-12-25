import React, { useState, useEffect } from 'react';
import { Post, Podcast, Song, UserRequest } from '../types';
import { getPosts, addPost, deletePost, getPodcasts, addPodcast, deletePodcast, getSongs, addSong, deleteSong, getRequests, deleteRequest } from '../services/storageService';
import { IconPlus, IconTrash, IconArrowLeft, IconBook, IconHeadphones, IconMusic, IconMessage, IconSparkles } from './Icons';

interface AdminDashboardProps {
  onBack: () => void;
}

type Tab = 'posts' | 'podcasts' | 'songs' | 'requests';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [isLoading, setIsLoading] = useState(false);

  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Podcasts State
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [podTitle, setPodTitle] = useState('');
  const [podDesc, setPodDesc] = useState('');
  const [podAuthor, setPodAuthor] = useState('');
  const [podUrl, setPodUrl] = useState('');
  const [podDuration, setPodDuration] = useState('');

  // Songs State
  const [songs, setSongs] = useState<Song[]>([]);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songMood, setSongMood] = useState('');

  // Requests State
  const [requests, setRequests] = useState<UserRequest[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      setIsLoading(true);
      const p = await getPosts();
      setPosts(p);
      const pods = await getPodcasts();
      setPodcasts(pods);
      const s = await getSongs();
      setSongs(s);
      const r = await getRequests();
      setRequests(r);
      setIsLoading(false);
  }

  // --- POST HANDLERS ---
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent || !newAuthor) return;
    setIsLoading(true);
    const added = await addPost({ content: newContent, author: newAuthor, category: newCategory || 'Khác' });
    if(added) {
        setPosts([added, ...posts]);
        setNewContent(''); setNewAuthor(''); setNewCategory('');
    } else {
        alert("Lỗi: Không thể thêm bài viết. Vui lòng kiểm tra kết nối hoặc tab 'posts' trong Sheet.");
    }
    setIsLoading(false);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Xóa bài viết này?')) {
      setIsLoading(true);
      await deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
      setIsLoading(false);
    }
  };

  // --- PODCAST HANDLERS ---
  const handleAddPodcast = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!podTitle || !podUrl) return;
      setIsLoading(true);
      const added = await addPodcast({
          title: podTitle,
          description: podDesc,
          author: podAuthor || 'Admin',
          audioUrl: podUrl,
          duration: podDuration || '??:??'
      });
      if(added) {
          setPodcasts([added, ...podcasts]);
          setPodTitle(''); setPodDesc(''); setPodUrl(''); setPodDuration('');
      } else {
           alert("Lỗi: Không thể thêm podcast. Vui lòng kiểm tra tab 'podcasts' trong Sheet.");
      }
      setIsLoading(false);
  };

  const handleDeletePodcast = async (id: string) => {
      if (window.confirm('Xóa podcast này?')) {
          setIsLoading(true);
          await deletePodcast(id);
          setPodcasts(podcasts.filter(p => p.id !== id));
          setIsLoading(false);
      }
  };

  // --- SONG HANDLERS ---
  const handleAddSong = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!songTitle || !songUrl) return;
      setIsLoading(true);
      const added = await addSong({
          title: songTitle,
          artist: songArtist || 'Unknown',
          audioUrl: songUrl,
          mood: songMood || 'Chill'
      });
      if(added) {
          setSongs([added, ...songs]);
          setSongTitle(''); setSongArtist(''); setSongUrl(''); setSongMood('');
      } else {
          alert("Lỗi: Không thể thêm nhạc. \n\nHãy chắc chắn bạn đã tạo tab 'songs' trong Google Sheet với dòng đầu tiên là: id, title, artist, audioUrl, mood, createdAt");
      }
      setIsLoading(false);
  };

  const handleDeleteSong = async (id: string) => {
      if (window.confirm('Xóa bài hát này?')) {
          setIsLoading(true);
          await deleteSong(id);
          setSongs(songs.filter(s => s.id !== id));
          setIsLoading(false);
      }
  };

  // --- REQUEST HANDLERS ---
  const handleDeleteRequest = async (id: string) => {
      if (window.confirm('Xóa yêu cầu này (Đánh dấu đã xử lý)?')) {
          setIsLoading(true);
          await deleteRequest(id);
          setRequests(requests.filter(r => r.id !== id));
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-950 p-6 animate-fade-in-up transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <IconArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
             </button>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản Trị Nội Dung</h1>
          </div>
          <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border dark:border-slate-800 overflow-x-auto">
             <button 
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'posts' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
             >
                 Bài Viết
             </button>
             <button 
                onClick={() => setActiveTab('podcasts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'podcasts' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
             >
                 Podcast
             </button>
             <button 
                onClick={() => setActiveTab('songs')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'songs' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
             >
                 Nhạc
             </button>
             <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'requests' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
             >
                 Yêu Cầu {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{requests.length}</span>}
             </button>
          </div>
        </div>

        {isLoading && <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg mb-4">Đang đồng bộ dữ liệu với Database...</div>}

        {/* --- CONTENT AREA --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: FORM */}
            <div className={`md:col-span-1 ${activeTab === 'requests' ? 'hidden' : 'block'}`}>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 sticky top-6">
                    {activeTab === 'posts' && (
                        <>
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <IconBook className="w-5 h-5 text-sky-500" /> Thêm Bài Viết
                            </h2>
                            <form onSubmit={handleAddPost} className="space-y-4">
                                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" rows={4} placeholder="Nội dung..." required />
                                <input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Tác giả" required />
                                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Thể loại" />
                                <button type="submit" disabled={isLoading} className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition disabled:opacity-50">Đăng Bài</button>
                            </form>
                        </>
                    )}

                    {activeTab === 'podcasts' && (
                        <>
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <IconHeadphones className="w-5 h-5 text-teal-500" /> Thêm Podcast
                            </h2>
                            <form onSubmit={handleAddPodcast} className="space-y-4">
                                <input value={podTitle} onChange={e => setPodTitle(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Tiêu đề Podcast" required />
                                <textarea value={podDesc} onChange={e => setPodDesc(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" rows={2} placeholder="Mô tả ngắn..." />
                                <input value={podUrl} onChange={e => setPodUrl(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Link MP3 (URL)" required />
                                <div className="flex gap-2">
                                    <input value={podAuthor} onChange={e => setPodAuthor(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Tác giả" />
                                    <input value={podDuration} onChange={e => setPodDuration(e.target.value)} className="w-1/3 p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Time" />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50">Thêm Podcast</button>
                            </form>
                        </>
                    )}

                    {activeTab === 'songs' && (
                        <>
                             <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <IconMusic className="w-5 h-5 text-orange-500" /> Thêm Nhạc
                            </h2>
                            <form onSubmit={handleAddSong} className="space-y-4">
                                <input value={songTitle} onChange={e => setSongTitle(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Tên bài hát" required />
                                <input value={songArtist} onChange={e => setSongArtist(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Nghệ sĩ" />
                                <input value={songUrl} onChange={e => setSongUrl(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Link MP3 (URL)" required />
                                <input value={songMood} onChange={e => setSongMood(e.target.value)} className="w-full p-3 border dark:border-slate-700 dark:bg-slate-800 rounded-xl outline-none text-sm dark:text-white" placeholder="Mood (Chill, Buồn...)" />
                                <button type="submit" disabled={isLoading} className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50">Thêm Bài Hát</button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: LIST */}
            <div className={`space-y-4 ${activeTab === 'requests' ? 'md:col-span-3' : 'md:col-span-2'}`}>
                
                {/* REQUESTS LIST (Only visible when activeTab is requests) */}
                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-6">
                            <h3 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                                <IconSparkles className="w-5 h-5" /> Danh Sách Yêu Cầu Từ Người Dùng
                            </h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                                Hãy đảm bảo bạn đã tạo tab <b>'requests'</b> trong Google Sheet (Header: id, type, content, contact, createdAt)
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {requests.map(req => (
                                <div key={req.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            req.type === 'podcast' ? 'bg-teal-100 text-teal-600' :
                                            req.type === 'music' ? 'bg-orange-100 text-orange-600' :
                                            'bg-sky-100 text-sky-600'
                                        }`}>
                                            {req.type}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className="text-slate-800 dark:text-slate-200 font-medium mb-3 min-h-[60px]">
                                        {req.content}
                                    </p>
                                    
                                    {req.contact && (
                                        <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mb-3">
                                            <b>Liên hệ:</b> {req.contact}
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => handleDeleteRequest(req.id)}
                                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
                                    >
                                        <IconSparkles className="w-3 h-3" /> Đánh dấu đã xử lý
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* OTHER LISTS */}
                {activeTab === 'posts' && posts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-slate-800 px-2 py-1 rounded-md mb-2 inline-block">{post.category}</span>
                            <p className="text-slate-800 dark:text-slate-200 text-lg mb-2">"{post.content}"</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">— {post.author}</p>
                        </div>
                        <button onClick={() => handleDeletePost(post.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-full transition opacity-0 group-hover:opacity-100"><IconTrash className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}

                {activeTab === 'podcasts' && podcasts.map(pod => (
                    <div key={pod.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-800 dark:text-slate-100 font-bold">{pod.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{pod.description}</p>
                            <a href={pod.audioUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-500 hover:underline mt-1 block truncate max-w-xs">{pod.audioUrl}</a>
                        </div>
                        <button onClick={() => handleDeletePodcast(pod.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-full transition opacity-0 group-hover:opacity-100"><IconTrash className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}

                {activeTab === 'songs' && songs.map(song => (
                     <div key={song.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-slate-800 flex items-center justify-center text-orange-500">
                                    <IconMusic className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-slate-800 dark:text-slate-100 font-bold">{song.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{song.artist}</p>
                                    <span className="text-xs text-orange-500 bg-orange-50 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1 inline-block">{song.mood}</span>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteSong(song.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-full transition opacity-0 group-hover:opacity-100"><IconTrash className="w-5 h-5" /></button>
                        </div>
                        <a href={song.audioUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:underline mt-2 block truncate ml-14">{song.audioUrl}</a>
                    </div>
                ))}

                {!isLoading && ((activeTab === 'posts' && posts.length === 0) || (activeTab === 'podcasts' && podcasts.length === 0) || (activeTab === 'songs' && songs.length === 0) || (activeTab === 'requests' && requests.length === 0)) && (
                    <div className="text-center text-slate-400 py-10">Chưa có dữ liệu.</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;