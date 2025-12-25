import React, { useState, useRef, useEffect } from 'react';
import { Message, UserProfile } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { IconSend, IconUser, IconSparkles, IconTrash, IconArrowLeft, IconCat, IconLeaf, IconHeartFilled } from './Icons';

interface ChatInterfaceProps {
  onBack: () => void;
  currentUser: UserProfile | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Chào ${currentUser ? currentUser.name : 'bạn'}, mình ở đây rồi nè 🤍\nHôm nay trong lòng ${currentUser ? currentUser.name : 'bạn'} có điều gì muốn kể không?`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const modelMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: modelMsgId,
          role: 'model',
          content: '',
          timestamp: new Date(),
        },
      ]);

      let fullContent = '';
      
      // Personalize prompt context slightly if user has a name
      const contextPrefix = currentUser ? `[Người dùng tên là: ${currentUser.name}] ` : '';

      await sendMessageToGemini(contextPrefix + userMsg.content, (chunk) => {
        fullContent += chunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === modelMsgId ? { ...msg, content: fullContent } : msg
          )
        );
      });
      
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          content: 'Mạng bên mình hơi chập chờn xíu 🥹 Bạn nói lại giúp mình nhen?',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Bạn muốn xóa cuộc trò chuyện để bắt đầu lại?")) {
        setMessages([ {
            id: 'welcome-reset',
            role: 'model',
            content: `Mình đã sẵn sàng lắng nghe câu chuyện mới của ${currentUser ? currentUser.name : 'bạn'} rồi đây 🌱`,
            timestamp: new Date(),
          }]);
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-2xl overflow-hidden relative sm:rounded-[32px] sm:my-4 sm:h-[calc(100dvh-2rem)] border border-white/40 dark:border-slate-700/50 transition-colors duration-500">
      
      {/* --- DOODLE BACKGROUND PATTERN --- */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
          <div className="w-full h-full flex flex-wrap gap-8 justify-center items-center content-center rotate-12 scale-110">
              {Array.from({ length: 40 }).map((_, i) => (
                  <React.Fragment key={i}>
                      <IconCat className="w-12 h-12" />
                      <IconLeaf className="w-10 h-10" />
                      <IconSparkles className="w-8 h-8" />
                      <IconHeartFilled className="w-8 h-8" />
                  </React.Fragment>
              ))}
          </div>
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/30 dark:border-slate-800/50 flex items-center justify-between sticky top-0 z-20 h-16 flex-shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
             {/* Mascot Avatar */}
             <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center ring-2 ring-sky-100 dark:ring-slate-700 shadow-sm relative">
                <IconCat className="text-orange-400 w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
             </div>
             <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">An Nhiên</h2>
                <div className="flex items-center gap-1.5 opacity-60">
                   <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Đang lắng nghe...</p>
                </div>
             </div>
          </div>
        </div>
        <button 
            onClick={handleClearChat}
            className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Làm mới cuộc trò chuyện"
        >
            <IconTrash className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth transition-colors duration-300 relative z-10">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isUser ? (
                   <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm mt-auto mb-1 border border-slate-100 dark:border-slate-700">
                      <IconCat className="w-5 h-5 text-orange-400" />
                   </div>
                ) : (
                   currentUser && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-sky-500 text-white shadow-sm mt-auto mb-1 font-bold text-xs border border-white/20">
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                   )
                )}

                {/* Bubble */}
                <div
                  className={`px-5 py-3.5 rounded-[24px] text-[15px] sm:text-[16px] leading-relaxed shadow-sm transition-all duration-300 ${
                    isUser
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-md shadow-sky-200/50 dark:shadow-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md border border-slate-100 dark:border-slate-700 shadow-sm'
                  } ${msg.isError ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300' : ''}`}
                >
                   {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {line || <br/>}
                        </p>
                   ))}
                   <p className={`text-[10px] mt-2 text-right opacity-60 ${isUser ? 'text-sky-100' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
           <div className="flex w-full justify-start animate-fade-in-up">
           <div className="flex max-w-[85%] gap-3 flex-row">
             <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex-shrink-0 flex items-center justify-center shadow-sm mt-auto mb-1 border border-slate-100 dark:border-slate-700">
                 <IconCat className="w-5 h-5 text-orange-400" />
             </div>
             <div className="bg-white dark:bg-slate-800 px-4 py-4 rounded-[24px] rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1.5 h-12">
               <div className="w-2 h-2 bg-sky-400 rounded-full typing-dot"></div>
               <div className="w-2 h-2 bg-sky-400 rounded-full typing-dot"></div>
               <div className="w-2 h-2 bg-sky-400 rounded-full typing-dot"></div>
             </div>
           </div>
         </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating */}
      <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-slate-900/90 dark:via-slate-900/80 pb-[max(1rem,env(safe-area-inset-bottom))] relative z-20">
        <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-[28px] shadow-lg border border-slate-100 dark:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-sky-200 dark:focus-within:ring-slate-600">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            }}
            placeholder={currentUser ? `Kể cho mình nghe đi, ${currentUser.name}...` : "Kể cho mình nghe đi..."}
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            className="flex-1 bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 focus:outline-none transition-all text-base resize-none overflow-y-auto custom-scrollbar"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`w-10 h-10 mb-1 mr-1 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${
              inputText.trim() && !isTyping
                ? 'bg-sky-500 text-white shadow-md hover:scale-105 active:scale-95'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <IconSend className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;