import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MessageSquare, Calendar, ChevronRight, UserCheck, Loader2 } from 'lucide-react';
import { getAdvisors } from '../services/api';
import AdvisorProfile from './AdvisorProfile';
import AdvisorChat from './AdvisorChat';

const Advisors = ({ user }) => {
  const [view, setView] = useState('directory'); // 'directory', 'profile', 'chat'
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setIsLoading(true);
      const data = await getAdvisors();
      setAdvisors(data);
    } catch (err) {
      console.error('Failed to load advisors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = (advisor) => {
    setSelectedAdvisor(advisor);
    setView('profile');
  };

  const handleChat = (advisor) => {
    setSelectedAdvisor(advisor);
    setView('chat');
  };

  const filteredAdvisors = advisors.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (view === 'profile' && selectedAdvisor) {
    return <AdvisorProfile advisor={selectedAdvisor} user={user} onBack={() => setView('directory')} />;
  }

  if (view === 'chat' && selectedAdvisor) {
    return <AdvisorChat advisor={selectedAdvisor} user={user} onBack={() => setView('directory')} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-cyan-400" />
            Verified Advisors
          </h1>
          <p className="text-slate-400 text-sm">Book 1-on-1 sessions or chat privately with premium financial experts.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvisors.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-500">No verified advisors found matching your search.</div>
          ) : (
            filteredAdvisors.map((advisor) => (
              <motion.div 
                key={advisor._id}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shrink-0">
                      {advisor.avatarUrl ? (
                        <img src={advisor.avatarUrl} alt={advisor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-cyan-500 bg-cyan-500/10">
                          {advisor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{advisor.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{advisor.rating.toFixed(1)}</span>
                        <span className="text-slate-500 font-normal">({advisor.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{advisor.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {advisor.expertise.map(exp => (
                      <span key={exp} className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-700">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="font-mono font-bold text-white">${advisor.hourlyRate}</span>
                    <span className="text-slate-500 text-xs">/hr</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleChat(advisor)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Private Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleBook(advisor)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-bold text-sm transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Advisors;
