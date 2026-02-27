import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, ShieldCheck, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

// Floating animated particles
const Particle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: 'radial-gradient(circle, rgba(0,212,255,0.6), rgba(124,58,237,0.3))',
      filter: 'blur(1px)',
    }}
    animate={{
      y: [0, -40, 0],
      x: [0, 15, 0],
      opacity: [0.2, 0.8, 0.2],
      scale: [1, 1.3, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const PARTICLES = [
  { x: 10, y: 20, size: 6, duration: 4, delay: 0 },
  { x: 80, y: 15, size: 4, duration: 5, delay: 0.5 },
  { x: 60, y: 70, size: 8, duration: 6, delay: 1 },
  { x: 30, y: 80, size: 5, duration: 4.5, delay: 1.5 },
  { x: 90, y: 60, size: 3, duration: 5.5, delay: 0.8 },
  { x: 20, y: 50, size: 7, duration: 3.5, delay: 2 },
  { x: 70, y: 30, size: 4, duration: 6.5, delay: 0.3 },
  { x: 45, y: 10, size: 5, duration: 4, delay: 1.2 },
  { x: 5,  y: 90, size: 6, duration: 5, delay: 0.7 },
  { x: 95, y: 80, size: 4, duration: 4.5, delay: 2.5 },
];

// Stats that float around the auth card
const STAT_BADGES = [
  { icon: TrendingUp, label: '95% Win Rate', color: '#22c55e', x: -80, y: 20 },
  { icon: Zap,        label: 'Real-Time',    color: '#00d4ff', x: 260, y: 60 },
  { icon: Sparkles,   label: 'AI Powered',   color: '#a78bfa', x: -70, y: 220 },
];

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse for parallax glow effect
  useEffect(() => {
    const handle = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (isLogin) {
        data = await loginUser(formData.email, formData.password);
      } else {
        data = await registerUser(formData.name, formData.email, formData.password);
      }
      onLogin(data);
    } catch (err) {
      setError(err.message || err.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#060a18' }}
    >
      {/* ── Animated Background Orbs ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,212,255,0.07), transparent 50%)`,
        }}
      />
      <div
        className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,100,255,0.18), transparent 70%)', filter: 'blur(60px)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)', filter: 'blur(60px)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[40%] left-[-200px] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)', filter: 'blur(50px)' }}
      />

      {/* Floating Particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Floating grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating stat badges */}
      {STAT_BADGES.map((badge, i) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={i}
            className="absolute hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{
              left: `calc(50% + ${badge.x}px + 200px)`,
              top: `calc(50% + ${badge.y}px - 150px)`,
              background: 'rgba(8,14,40,0.7)',
              border: `1px solid ${badge.color}40`,
              backdropFilter: 'blur(12px)',
              boxShadow: `0 0 20px ${badge.color}20`,
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >
            <Icon size={14} style={{ color: badge.color }} />
            <span style={{ color: badge.color }}>{badge.label}</span>
          </motion.div>
        );
      })}

      {/* ── Auth Card — Fully Transparent Glass ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="rounded-3xl p-8 relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, #7c3aed, transparent)' }}
          />
          {/* Inner light leak top-left */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)' }}
          />

          {/* Logo */}
          <div className="flex justify-center mb-6 mt-2">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(0,212,255,0.3)',
                  '0 0 40px rgba(0,212,255,0.6)',
                  '0 0 20px rgba(0,212,255,0.3)',
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="p-4 rounded-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
                border: '1px solid rgba(0,212,255,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
              <Activity className="w-10 h-10 text-cyan-400 relative z-10" style={{ filter: 'drop-shadow(0 0 12px #00d4ff)' }} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h2
            className="text-3xl font-extrabold text-center mb-1"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Welcome to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00d4ff, #a78bfa, #22c55e)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              FinVerse
            </span>
          </motion.h2>
          <motion.p
            className="text-slate-400 text-center mb-8 text-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            {isLogin ? 'Sign in to manage your portfolio' : 'Create an account to start your journey'}
          </motion.p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl text-red-400 text-sm text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/60" />
                  <input
                    type="text" placeholder="Full Name" required={!isLogin}
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 text-sm transition-all shadow-inner"
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                      outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.background = 'rgba(0,212,255,0.05)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {[
              { type: 'email', placeholder: 'Email Address', key: 'email', Icon: Mail },
              { type: 'password', placeholder: 'Password', key: 'password', Icon: Lock },
            ].map(({ type, placeholder, key, Icon }) => (
              <div key={key} className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/60" />
                <input
                  type={type} placeholder={placeholder} required
                  value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 text-sm transition-all shadow-inner"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.background = 'rgba(0,212,255,0.05)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                />
              </div>
            ))}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1.07 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-60 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.8), rgba(124,58,237,0.8))',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0,212,255,0.3)',
              }}
            >
              {/* Shimmer sweep on button */}
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
              {isLoading ? <LoadingSpinner size="sm" /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle & disclaimer */}
          <div className="mt-7 text-center flex flex-col gap-4">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 1.13 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="ml-2 font-bold inline-block"
                style={{ color: '#00d4ff' }}
              >
                {isLogin ? 'Register now' : 'Sign in'}
              </motion.button>
            </p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2.5 px-4 rounded-xl"
              style={{ background: 'rgba(6,10,30,0.4)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Registration includes $100,000 demo paper account.</span>
            </motion.div>
          </div>

          {/* Bottom gradient bar */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
