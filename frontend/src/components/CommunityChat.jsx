import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageCircle, Wifi, WifiOff, Hash } from 'lucide-react';
import { io } from 'socket.io-client';

const ROOMS = [
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'stocks', label: 'Stocks', icon: '📈' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
  { id: 'beginner', label: 'Beginners', icon: '🌱' },
];

const CommunityChat = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [activeRoom, setActiveRoom] = useState('general');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const username = user?.name || 'Anonymous';

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join_room', 'general');
    });

    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { ...data, isOwn: false }]);
    });

    setSocket(newSocket);

    // Seed welcome message
    setMessages([{
      id: 'welcome',
      username: 'FinVerse Bot',
      message: '👋 Welcome to the FinVerse Community! This is a live chat — messages are shared with everyone in this room in real time.',
      timestamp: new Date().toISOString(),
      isBot: true,
      isOwn: false,
      room: 'general',
    }]);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', activeRoom);
      setMessages(prev => [...prev.filter(m => m.isBot), {
        id: `room-change-${Date.now()}`,
        username: 'FinVerse Bot',
        message: `📍 Joined #${activeRoom}. Say hello!`,
        timestamp: new Date().toISOString(),
        isBot: true,
        isOwn: false,
        room: activeRoom,
      }]);
    }
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !socket) return;

    const msgData = {
      room: activeRoom,
      username,
      message: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit('send_message', msgData);

    // Add own message locally
    setMessages(prev => [...prev, { ...msgData, id: Date.now(), isOwn: true }]);
    setInputText('');
    inputRef.current?.focus();
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-4">
      
      {/* Sidebar: Rooms */}
      <div className="w-48 flex-none flex flex-col gap-2">
        <div className="glass rounded-2xl p-4 border border-slate-700/60 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rooms</p>
          </div>
          <div className="space-y-1">
            {ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeRoom === room.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
              >
                <span>{room.icon}</span>
                #{room.label}
              </button>
            ))}
          </div>

          {/* Online status */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Users className="w-3 h-3" /> {username}
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass rounded-2xl border border-slate-700/60 overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30 flex-none">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">#{activeRoom}</span>
            <span className="text-slate-500 text-sm">· FinVerse Community</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${connected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-none shadow-sm ${
                  msg.isBot ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  : msg.isOwn ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200'
                }`}>
                  {msg.isBot ? '🤖' : msg.username?.[0]?.toUpperCase() || '?'}
                </div>

                <div className={`max-w-[75%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!msg.isOwn && (
                    <p className={`text-xs font-semibold ${msg.isBot ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {msg.username}
                    </p>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isBot ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200'
                    : msg.isOwn ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-800/70 text-slate-200 border border-slate-700/40 rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                  <p className="text-xs text-slate-600">{formatTime(msg.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50 flex-none">
          <form onSubmit={sendMessage} className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder={connected ? `Message #${activeRoom}...` : 'Connecting to chat server...'}
              disabled={!connected}
              className="flex-1 bg-slate-800/60 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !connected}
              className="w-11 h-11 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
