import React, { useState } from 'react';
import { IconUser, IconSparkles, IconClose, IconLock } from './Icons';
import { registerUser, loginUser } from '../services/storageService';

interface AuthModalProps {
    onLogin: (name: string, isGuest: boolean) => void;
    onClose: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [nickname, setNickname] = useState(''); // Tên hiển thị (VD: Kzii)
    const [username, setUsername] = useState(''); // Tên đăng nhập (VD: kzi207)
    const [password, setPassword] = useState(''); // Mật khẩu (VD: kzi207)
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleGuest = () => {
        onLogin('Người ẩn danh', true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        
        // Validate inputs based on mode
        if (mode === 'register') {
            if (!nickname.trim() || !username.trim() || !password.trim()) {
                setErrorMsg('Vui lòng nhập đầy đủ thông tin.');
                return;
            }
        } else {
            if (!username.trim() || !password.trim()) {
                setErrorMsg('Vui lòng nhập tên đăng nhập và mật khẩu.');
                return;
            }
        }

        setIsLoading(true);

        if (mode === 'register') {
            const result = await registerUser(nickname.trim(), username.trim(), password.trim());
            if (result.success) {
                // Đăng ký thành công, dùng nickname để hiển thị
                onLogin(nickname.trim(), false);
            } else {
                setErrorMsg(result.message);
            }
        } else {
            const result = await loginUser(username.trim(), password.trim());
            if (result.success) {
                // Đăng nhập thành công, dùng tên (name) trả về từ DB
                onLogin(result.name || username.trim(), false);
            } else {
                setErrorMsg(result.message || 'Đăng nhập thất bại.');
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border border-white/20 dark:border-slate-800 relative">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                    <IconClose className="w-5 h-5" />
                </button>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <button 
                        onClick={() => { setMode('login'); setErrorMsg(''); }}
                        className={`pb-2 text-sm font-bold transition-colors border-b-2 ${mode === 'login' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Đăng Nhập
                    </button>
                    <button 
                        onClick={() => { setMode('register'); setErrorMsg(''); }}
                        className={`pb-2 text-sm font-bold transition-colors border-b-2 ${mode === 'register' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Đăng Ký
                    </button>
                </div>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-sky-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <IconUser className="w-8 h-8 text-sky-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {mode === 'login' ? 'Chào mừng bạn trở lại' : 'Tạo hồ sơ mới'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {mode === 'login' 
                            ? 'Nhập tài khoản để tìm lại "An Nhiên" của bạn.' 
                            : 'Tạo một biệt danh đáng yêu và một tài khoản để ghi nhớ nhé.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Trường Biệt danh (Chỉ hiển thị khi Đăng ký) */}
                    {mode === 'register' && (
                        <div className="relative animate-fade-in-up">
                            <input 
                                type="text" 
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Biệt danh hiển thị (VD: Kzii)"
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition text-slate-800 dark:text-slate-200"
                                autoFocus={mode === 'register'}
                            />
                            <IconSparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400 opacity-50" />
                        </div>
                    )}

                    <div className="relative">
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={mode === 'register' ? "Tên đăng nhập (VD: kzi207)" : "Tên đăng nhập"}
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition text-slate-800 dark:text-slate-200"
                            autoFocus={mode === 'login'}
                        />
                        <IconUser className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 opacity-50" />
                    </div>

                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mật khẩu"
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition text-slate-800 dark:text-slate-200"
                        />
                        <IconLock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 opacity-50" />
                    </div>

                    {mode === 'login' && (
                        <div className="flex justify-end -mt-1">
                            <a 
                                href="https://zalo.me/0939042183" 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>
                    )}

                    {errorMsg && (
                        <p className="text-xs text-red-500 text-center font-medium bg-red-50 dark:bg-red-900/20 py-1 rounded">
                            {errorMsg}
                        </p>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200/50 dark:shadow-none hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            mode === 'login' ? 'Đăng Nhập' : 'Lưu Hồ Sơ'
                        )}
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={handleGuest}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        Chỉ dùng lần này (Ẩn danh)
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-3">
                        Hồ sơ của bạn sẽ được lưu trữ an toàn.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;