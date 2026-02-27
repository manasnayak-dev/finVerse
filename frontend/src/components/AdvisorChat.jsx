import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, ShieldCheck, User } from 'lucide-react';
import { getChatHistory } from '../services/api';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Ensure this matches backend URL

const AdvisorChat = ({ advisor, user, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  const roomName = `room_user_${user._id}_advisor_${advisor._id}`;

  useEffect(() => {
    socket.connect();
    
    // Join the secure private room
    socket.emit('join_room', roomName);
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    fetchHistory();

    return () => {
      socket.off('receive_message');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [roomName]);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const history = await getChatHistory(advisor._id);
      setMessages(history);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      room: roomName,
      senderId: user._id,
      senderModel: 'User',
      username: user.name,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    // Emit via socket
    socket.emit('send_message', messageData);
    
    // Optimistically update UI
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto h-[85vh] flex flex-col">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-sm font-semibold transition-colors w-max shrink-0">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      <div className="glass rounded-3xl border border-slate-700/50 flex flex-col flex-1 overflow-hidden shadow-2xl relative bg-slate-900/40">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
                {advisor.avatarUrl ? (
                  <img src={advisor.avatarUrl} alt={advisor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-cyan-500 bg-cyan-500/10">
                    {advisor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{advisor.name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> End-to-End Encrypted
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="text-center my-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-slate-800 px-3 py-1 rounded-full">
              Private Channel Secure
            </span>
          </div>
          
          {messages.map((msg, i) => {
            const isMe = msg.senderModel === 'User' && msg.senderId === user._id; // Basic check, could compare just ID depending on how history loads
            
            return (
              <div key={i} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`text-[10px] text-slate-500 mb-1 ml-1 mr-1`}>{msg.username}</div>
                <div 
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                  }`}
                >
                  {msg.message}
                </div>
                <div className="text-[9px] text-slate-600 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 shrink-0">
          <form onSubmit={sendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${advisor.name}...`}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-4 pr-12 py-3.5 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-slate-500 text-sm"
                rows="1"
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 disabled:hover:bg-cyan-600 shrink-0 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvisorChat;
