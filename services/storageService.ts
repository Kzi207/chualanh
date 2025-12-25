import { Post, Comment, Podcast, Song, UserRequest } from "../types";

// --- CẤU HÌNH SHEETDB ---
// BẠN HÃY THAY MÃ API BÊN DƯỚI BẰNG API CỦA BẠN TỪ SHEETDB.IO
// Google Sheet cần có 5 tabs: 'posts', 'podcasts', 'songs', 'users', 'requests'
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/jjh3tylohv707';

// --- USER SERVICE (AUTH) ---

export const registerUser = async (name: string, username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
        const searchResponse = await fetch(`${SHEETDB_API_URL}/search?username=${encodeURIComponent(username)}&sheet=users`);
        const existingUsers = await searchResponse.json();

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return { success: false, message: 'Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác.' };
        }

        const newUser = {
            username: username,
            password: password, 
            name: name,
            createdAt: Date.now()
        };

        const response = await fetch(`${SHEETDB_API_URL}?sheet=users`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: newUser })
        });

        if (!response.ok) return { success: false, message: 'Lỗi server khi tạo tài khoản.' };
        return { success: true, message: 'Đăng ký thành công!' };

    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại.' };
    }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message?: string; name?: string }> => {
    try {
        const response = await fetch(`${SHEETDB_API_URL}/search?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&sheet=users`);
        if (!response.ok) return { success: false, message: 'Lỗi kết nối server.' };

        const users = await response.json();

        if (Array.isArray(users) && users.length > 0) {
            return { success: true, name: users[0].name || users[0].username };
        } else {
            return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: 'Lỗi kết nối.' };
    }
};


// --- POSTS SERVICE ---

export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${SHEETDB_API_URL}?sheet=posts&t=${Date.now()}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
        let parsedComments: Comment[] = [];
        try {
            if (item.comments && item.comments !== 'null' && item.comments !== 'undefined' && item.comments.trim() !== '') {
                const parsed = JSON.parse(item.comments);
                parsedComments = Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) { parsedComments = []; }

        return {
            ...item,
            createdAt: Number(item.createdAt),
            likes: Number(item.likes) || 0,
            comments: parsedComments
        };
    }).sort((a: Post, b: Post) => b.createdAt - a.createdAt);

  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const addPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<Post | null> => {
  const newPost: Post = {
    ...post,
    id: `post_${Date.now()}`,
    createdAt: Date.now(),
    likes: 0,
    comments: []
  };

  try {
      const payload = { ...newPost, comments: JSON.stringify(newPost.comments) };
      const response = await fetch(`${SHEETDB_API_URL}?sheet=posts`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload })
      });
      
      if (!response.ok) return null;
      return newPost;
  } catch (error) {
      console.error("Error adding post:", error);
      return null;
  }
};

export const deletePost = async (id: string): Promise<boolean> => {
    try {
        await fetch(`${SHEETDB_API_URL}/id/${id}?sheet=posts`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        return true;
    } catch (error) { return false; }
};

export const toggleLike = async (postId: string, currentLikes: number, increment: boolean): Promise<boolean> => {
    const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    try {
        await fetch(`${SHEETDB_API_URL}/id/${postId}?sheet=posts`, {
            method: 'PATCH',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { likes: newLikes } })
        });
        return true;
    } catch (error) { return false; }
};

export const addComment = async (
    postId: string, 
    currentComments: Comment[], 
    newContent: string, 
    authorName: string = 'Người ẩn danh',
    replyTo: Comment | null = null
): Promise<Comment[] | null> => {
    const safeComments = Array.isArray(currentComments) ? currentComments : [];
    
    const newComment: Comment = {
        id: `cmt_${Date.now()}`,
        author: authorName,
        content: newContent,
        createdAt: Date.now(),
        replyToId: replyTo?.id,
        replyToAuthor: replyTo?.author
    };
    
    const updatedComments = [...safeComments, newComment];

    try {
        const response = await fetch(`${SHEETDB_API_URL}/id/${postId}?sheet=posts`, {
            method: 'PATCH',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { comments: JSON.stringify(updatedComments) } })
        });

        if (!response.ok) return null;
        const resData = await response.json();
        if (resData.updated === 0) return null;

        return updatedComments;
    } catch (error) { return null; }
}

// --- PODCASTS SERVICE ---

export const getPodcasts = async (): Promise<Podcast[]> => {
    try {
        const response = await fetch(`${SHEETDB_API_URL}?sheet=podcasts&t=${Date.now()}`);
        if (!response.ok) return [];
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        return data.map((item: any) => ({ ...item, createdAt: Number(item.createdAt) })).sort((a: Podcast, b: Podcast) => b.createdAt - a.createdAt);
    } catch (error) { return []; }
};

export const addPodcast = async (podcast: Omit<Podcast, 'id' | 'createdAt'>): Promise<Podcast | null> => {
    const newPodcast: Podcast = { ...podcast, id: `pod_${Date.now()}`, createdAt: Date.now() };
    try {
        const response = await fetch(`${SHEETDB_API_URL}?sheet=podcasts`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: newPodcast })
        });
        if (!response.ok) return null;
        return newPodcast;
    } catch (error) { return null; }
};

export const deletePodcast = async (id: string): Promise<boolean> => {
    try {
        await fetch(`${SHEETDB_API_URL}/id/${id}?sheet=podcasts`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        return true;
    } catch (error) { return false; }
};

// --- SONGS SERVICE ---

export const getSongs = async (): Promise<Song[]> => {
    try {
        const response = await fetch(`${SHEETDB_API_URL}?sheet=songs&t=${Date.now()}`);
        if (!response.ok) return [];
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        return data.map((item: any) => ({ ...item, createdAt: Number(item.createdAt) })).sort((a: Song, b: Song) => b.createdAt - a.createdAt);
    } catch (error) { return []; }
};

export const addSong = async (song: Omit<Song, 'id' | 'createdAt'>): Promise<Song | null> => {
    const newSong: Song = { ...song, id: `song_${Date.now()}`, createdAt: Date.now() };
    try {
        const response = await fetch(`${SHEETDB_API_URL}?sheet=songs`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: newSong })
        });
        if (!response.ok) return null;
        return newSong;
    } catch (error) { return null; }
};

export const deleteSong = async (id: string): Promise<boolean> => {
    try {
        await fetch(`${SHEETDB_API_URL}/id/${id}?sheet=songs`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        return true;
    } catch (error) { return false; }
};

// --- USER REQUESTS SERVICE (NEW) ---

export const getRequests = async (): Promise<UserRequest[]> => {
    try {
        const response = await fetch(`${SHEETDB_API_URL}?sheet=requests&t=${Date.now()}`);
        if (!response.ok) return [];
        const data = await response.json();
        if (!Array.isArray(data)) return []; // Return empty if sheet doesn't exist or is empty
        return data.map((item: any) => ({ ...item, createdAt: Number(item.createdAt) })).sort((a: UserRequest, b: UserRequest) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching requests:", error);
        return [];
    }
};

export const addRequest = async (req: Omit<UserRequest, 'id' | 'createdAt'>): Promise<boolean> => {
    const newRequest: UserRequest = {
        ...req,
        id: `req_${Date.now()}`,
        createdAt: Date.now()
    };
    try {
        const response = await fetch(`${SHEETDB_API_URL}?sheet=requests`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: newRequest })
        });
        return response.ok;
    } catch (error) {
        console.error("Error adding request:", error);
        return false;
    }
};

export const deleteRequest = async (id: string): Promise<boolean> => {
    try {
        await fetch(`${SHEETDB_API_URL}/id/${id}?sheet=requests`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        return true;
    } catch (error) { return false; }
};