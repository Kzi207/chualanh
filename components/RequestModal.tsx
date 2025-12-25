import React, { useState } from 'react';
import { IconClose, IconSend, IconSparkles } from './Icons';
import { addRequest } from '../services/storageService';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'podcast' | 'music' | 'other';
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, initialType = 'other' }) => {
    const [type, setType] = useState(initialType);
    const [content, setContent] = useState('');
    const [contact, setContact] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsLoading(true);
        const success = await addRequest({
            type,
            content: content.trim(),
            contact: contact.trim()
        });
        setIsLoading(false);

        if (success) {
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setContent('');
                setContact('');
                onClose();
            }, 2000);
        } else {
            alert("Lỗi kết nối. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/20 dark:border-slate-800 relative">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                    <IconClose className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-4">
                            <IconSparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Đã gửi yêu cầu!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Cảm ơn bạn đã đóng góp cho An Nhiên.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Gửi Yêu Cầu</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Bạn muốn chia sẻ câu chuyện hay đề xuất bài hát?</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type Selection */}
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType('podcast')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'podcast' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Podcast
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('music')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'music' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Nhạc
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('other')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'other' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Khác
                                </button>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nội dung</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={type === 'music' ? "Tên bài hát, ca sĩ, link nhạc..." : type === 'podcast' ? "Chủ đề bạn muốn nghe, hoặc link file ghi âm..." : "Góp ý của bạn..."}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-slate-600 text-slate-800 dark:text-slate-200 text-sm min-h-[100px]"
                                />
                            </div>

                            {/* Contact (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Liên hệ (Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="Link Zalo hoặc SĐT để Admin liên hệ lại"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-slate-600 text-slate-800 dark:text-slate-200 text-sm"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || !content.trim()}
                                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <IconSend className="w-4 h-4" /> Gửi Ngay
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestModal;