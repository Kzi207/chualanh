export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export enum AppState {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT',
  STORIES = 'STORIES',
  PODCASTS = 'PODCASTS',
  MUSIC = 'MUSIC',
  ADMIN = 'ADMIN',
}

export interface ChatSession {
  id: string;
  startTime: Date;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: number;
  replyToId?: string;     // ID của comment được trả lời
  replyToAuthor?: string; // Tên tác giả được trả lời
}

export interface Post {
  id: string;
  content: string;
  author: string; // Ca sĩ, nghệ sĩ, hoặc người nổi tiếng
  category: string;
  createdAt: number;
  likes: number;
  comments: Comment[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string; // Link MP3 direct
  mood: string;     // Chill, Buồn, Vui...
  createdAt: number;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  author: string;
  audioUrl: string; // Link mp3 from 3rd party
  createdAt: number;
  duration?: string; // e.g. "10:30"
}

export interface UserProfile {
  name: string;
  isGuest: boolean; // True nếu chọn chế độ ẩn danh hoàn toàn (không lưu tên lâu dài)
}

export interface UserRequest {
    id: string;
    type: 'podcast' | 'music' | 'other';
    content: string; // Nội dung yêu cầu (tên bài hát, link, câu chuyện...)
    contact: string; // Zalo hoặc SĐT để admin liên hệ lại (tùy chọn)
    createdAt: number;
}