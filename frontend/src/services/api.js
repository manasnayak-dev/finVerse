import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Ensures cookies are sent if present
});

// Intercept requests to add token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatWithAI = async (message) => {
  try {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to connect to AI' };
  }
};

export const analyzePortfolio = async (stocks) => {
  try {
    // This endpoint wasn't mapped in our backend code, but it's okay we will map it if needed or mock it
    // Using demo response for now since the prompt just asked to build the UI for it
    const response = await api.post('/portfolio/analyze', { stocks });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to analyze portfolio' };
  }
};

export const getNewsSentiment = async () => {
  try {
    // Similarly, we will mock or call this endpoint
    const response = await api.get('/news/sentiment');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch news sentiment' };
  }
};

export const getQuote = async (symbol) => {
  try {
    const response = await api.get(`/trading/quote/${symbol}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch live quote' };
  }
};

export const buyStock = async (stockSymbol, quantity, price) => {
  try {
    const response = await api.post('/trading/buy', { stockSymbol, quantity, price });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to buy stock' };
  }
};

export const sellStock = async (stockSymbol, quantity, price) => {
  try {
    const response = await api.post('/trading/sell', { stockSymbol, quantity, price });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to sell stock' };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to login' };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to register' };
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get profile' };
  }
};

export const switchAccount = async (type) => {
  try {
    const response = await api.post('/account/switch', { type });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to switch account' };
  }
};

export const getCurrentAccount = async () => {
  try {
    const response = await api.get('/account/current');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch current account details' };
  }
};

export const createSIP = async (symbol, amount, dateOfMonth) => {
  try {
    const response = await api.post('/portfolio/sip', { symbol, amount, dateOfMonth });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create SIP' };
  }
};

export const getSIPs = async () => {
  try {
    const response = await api.get('/portfolio/sip');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch SIPs' };
  }
};

export const cancelSIP = async (sipId) => {
  try {
    const response = await api.delete(`/portfolio/sip/${sipId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to cancel SIP' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('finverse_token');
};

export const analyzePrediction = async (symbol, days = 10, headlines = []) => {
  try {
    const response = await api.post('/prediction/analyze', { symbol, days, headlines });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to run AI prediction' };
  }
};

export const getPredictionSymbols = async () => {
  try {
    const response = await api.get('/prediction/symbols');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch symbols' };
  }
};

// --- Advisor & Booking APIs ---

export const getAdvisors = async () => {
  try {
    const response = await api.get('/advisors');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch advisors' };
  }
};

export const getAdvisorById = async (id) => {
  try {
    const response = await api.get(`/advisors/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch advisor details' };
  }
};

export const bookAppointment = async (advisorId, date, timeSlot, notes) => {
  try {
    const response = await api.post('/appointments', { advisorId, date, timeSlot, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to book appointment' };
  }
};

export const getUserAppointments = async () => {
  try {
    const response = await api.get('/appointments');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch appointments' };
  }
};

// --- Advisor Chat APIs ---

export const getChatHistory = async (advisorId) => {
  try {
    const response = await api.get(`/chat/${advisorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch chat history' };
  }
};

// --- Crypto Wallet APIs ---

export const getCryptoWallet = async () => {
  try {
    const response = await api.get('/crypto/wallet');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch crypto wallet' };
  }
};

export const buyCrypto = async (symbol, amount) => {
  try {
    const response = await api.post('/crypto/buy', { symbol, amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to buy crypto' };
  }
};

export const sellCrypto = async (symbol, amount) => {
  try {
    const response = await api.post('/crypto/sell', { symbol, amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to sell crypto' };
  }
};

export default api;

