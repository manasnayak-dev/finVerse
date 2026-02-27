import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Search, BookOpen } from 'lucide-react';

const FAQ_DATA = [
  {
    category: '🚀 Getting Started',
    items: [
      {
        q: 'What is FinVerse?',
        a: 'FinVerse is an AI-powered investment simulation platform. You can practice buying and selling stocks, set up SIPs, analyze your portfolio with AI, and learn about the markets — all without risking real money.',
      },
      {
        q: 'What is Demo Mode vs Real Mode?',
        a: 'Demo Mode gives you ₹1,00,000 in virtual money to practice with. Real Mode simulates live market conditions using actual real-time stock prices. Neither mode executes real broker transactions — both are for education and simulation only.',
      },
      {
        q: 'How do I switch between Demo and Real accounts?',
        a: 'Click the account switcher in the sidebar on the main Dashboard page. You can toggle between Demo and Real mode at any time. Your balances and portfolios are kept separate for each mode.',
      },
    ],
  },
  {
    category: '📈 Trading',
    items: [
      {
        q: 'How do I buy a stock?',
        a: 'Go to the "Trade Markets" tab. A default quote for AAPL will load automatically. Type any stock ticker (e.g., TSLA, MSFT, INFY) in the search bar and press Search. Once the price loads, enter the number of shares, ensure "BUY" is selected, and click the big green "BUY" button.',
      },
      {
        q: 'What is Delivery vs Intraday?',
        a: 'Delivery means you hold the stock for more than one day — it goes into your portfolio. Intraday means you intend to buy and sell within the same trading day. In this simulation, both work the same way, but the distinction helps you practice real broker terminology.',
      },
      {
        q: 'Why is the price shown a simulated price?',
        a: 'In Demo Mode, prices are randomly generated. In Real Mode, we attempt to fetch live prices from market APIs. If the API is rate-limited (free tier), we fall back to realistic simulated prices so you can still practice trading uninterrupted.',
      },
      {
        q: 'Can I sell stocks I do not own?',
        a: 'No. Short-selling is not currently supported. You can only sell stocks that are already in your active portfolio. Check the Holdings tab to see what you own.',
      },
    ],
  },
  {
    category: '📅 SIP (Systematic Investment Plans)',
    items: [
      {
        q: 'What is a SIP?',
        a: 'A Systematic Investment Plan (SIP) lets you invest a fixed amount of money into a stock every month automatically — just like mutual fund SIPs on Groww or Zerodha. This is ideal for long-term wealth building through rupee cost averaging.',
      },
      {
        q: 'How do I start a SIP?',
        a: 'Go to Trade Markets → Search for a stock → In the order box, switch the top tab to "SIP" → Enter your monthly amount and choose a date (1-28). Click "Start Monthly SIP". You can manage all your active SIPs from the Holdings & SIP tab.',
      },
      {
        q: 'How do I cancel a SIP?',
        a: 'Go to the "Holdings & SIP" tab in the sidebar. Scroll down to "Active SIPs" and click the red "Cancel" button next to the SIP you want to stop.',
      },
    ],
  },
  {
    category: '🤖 AI Features',
    items: [
      {
        q: 'What can the FinVerse AI Advisor do?',
        a: 'The AI Advisor is powered by Google Gemini. You can chat with it to: analyze specific stocks, get market outlooks, understand financial concepts, build trading strategies, or ask any financial question.',
      },
      {
        q: 'What does the AI Chart Analyst do?',
        a: 'On the Trade Markets page, after loading a stock, the TradingView chart has an "AI Analyst" overlay. Click "Analyze with AI" to get a quick AI-generated technical + sentiment analysis for that specific ticker.',
      },
      {
        q: 'Why does the AI say "Rate Limit Reached"?',
        a: 'The Gemini AI API on the free tier has usage quotas. If you hit this error, simply wait 1-2 minutes before trying again. Your demo balance and portfolio data are not affected.',
      },
      {
        q: 'How does the Portfolio AI Analyzer work?',
        a: 'Go to the "AI Analyzer" tab. It reads your current holdings and sends them to Gemini AI, which returns a Risk Level, Diversification Score, and specific suggestions to strengthen your portfolio.',
      },
    ],
  },
  {
    category: '🔐 Account & Security',
    items: [
      {
        q: 'Is my data safe?',
        a: 'Yes. Passwords are hashed with bcrypt before being stored in MongoDB. Authentication uses industry-standard JWT tokens. No real financial data or payment information is ever collected.',
      },
      {
        q: 'Does FinVerse execute real trades?',
        a: 'No. FinVerse is a simulation and education platform. It does not connect to any real broker (Zerodha, Groww, Upstox etc.) and does not execute any real financial transactions.',
      },
    ],
  },
];

const FAQItem = ({ item, index, categoryIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = `faq-${categoryIndex}-${index}`;

  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <span className="font-medium text-slate-200 pr-4">{item.q}</span>
        {isOpen
          ? <ChevronUp className="w-5 h-5 text-purple-400 shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
        }
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700/30 pt-3 bg-slate-800/20">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
          <HelpCircle className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Help & FAQ</h1>
          <p className="text-slate-400 mt-1">Everything you need to know about FinVerse.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search questions..."
          className="w-full bg-slate-800/60 border border-slate-600 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQ Categories */}
      {filteredData.length > 0 ? (
        <div className="space-y-8">
          {filteredData.map((cat, catIndex) => (
            <div key={cat.category}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h2 className="text-lg font-bold text-slate-200">{cat.category}</h2>
              </div>
              <div className="space-y-2">
                {cat.items.map((item, itemIndex) => (
                  <FAQItem key={item.q} item={item} index={itemIndex} categoryIndex={catIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No results for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 p-5 glass rounded-2xl border border-slate-700/50 text-center">
        <p className="text-slate-400 text-sm">
          Still have questions? Chat with the{' '}
          <span className="text-purple-400 font-semibold">FinVerse AI Advisor</span>{' '}
          or ask in the{' '}
          <span className="text-purple-400 font-semibold">Community Chat</span>.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
