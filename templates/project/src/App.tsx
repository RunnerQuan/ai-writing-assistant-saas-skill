import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Menu, X, ArrowRight, Star, Twitter, Linkedin, Copy, Check, LogIn, LogOut, MessageCircle, Send, Bot, User, LayoutDashboard, FileText, Zap, BarChart3 } from 'lucide-react';
import { api } from './lib/api';
import type { SitePayload, Feature, PricingPlan, Testimonial, StatsPayload, AuthUser, ChatMessage } from './types';

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        a: ({ children, href }) => (
          <a className="text-cyan-300 underline hover:text-cyan-200" href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className);
          return isBlock ? (
            <code className="block overflow-x-auto rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-slate-100">
              {children}
            </code>
          ) : (
            <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-xs text-cyan-200">{children}</code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthModal                                                         */
/* ------------------------------------------------------------------ */
function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (u: AuthUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = mode === 'login'
      ? await api.login(email, password)
      : await api.register(email, password, name);
    setLoading(false);
    if (res.error || !res.user) {
      setError(res.error ?? 'Something went wrong.');
    } else if (res.token) {
      localStorage.setItem('inkling_token', res.token);
      onLogin(res.user);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="glass-shell w-full max-w-md rounded-3xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* tabs */}
        <div className="flex gap-2 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                mode === m ? 'cta-primary' : 'glass-pill text-slate-300'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs text-slate-400">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 8 : 1}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50"
              />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="cta-primary w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button onClick={onClose} className="mt-4 block w-center mx-auto text-xs text-slate-500 hover:text-slate-300 transition">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                         */
/* ------------------------------------------------------------------ */
function Dashboard({ user, onClose, onLogout }: { user: AuthUser; onClose: () => void; onLogout: () => void }) {
  const stats = [
    { label: 'Drafts this month', value: 24, icon: FileText, color: 'text-cyan-400' },
    { label: 'Words generated', value: '18.2K', icon: Zap, color: 'text-amber-400' },
    { label: 'Avg. approval rate', value: '94%', icon: BarChart3, color: 'text-emerald-400' },
  ];

  const recentDrafts = [
    { title: 'Q2 Product Launch Blog', status: 'Published', date: '2 hours ago' },
    { title: 'Investor Update – May', status: 'In Review', date: 'Yesterday' },
    { title: 'Brand Voice Guidelines v3', status: 'Draft', date: '3 days ago' },
    { title: 'SEO Meta — Feature Page', status: 'Published', date: '1 week ago' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-ink-base/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Dashboard</h2>
            <p className="mt-1 text-sm text-slate-400">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="glass-pill rounded-full px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition flex items-center gap-2"
            >
              <LogOut size={14} /> Sign Out
            </button>
            <button
              onClick={onClose}
              className="glass-pill rounded-full p-2 text-slate-300 hover:bg-white/10 transition"
              aria-label="Close dashboard"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="glass-shell rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`font-sora text-2xl font-bold ${s.color}`}>{s.value}</span>
                <s.icon size={20} className={s.color} />
              </div>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* plan badge */}
        <div className="glass-shell rounded-2xl p-5 flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-slate-500 font-mono">CURRENT PLAN</p>
            <p className="font-sora text-xl font-semibold text-white capitalize mt-1">{user.plan || 'Free'}</p>
          </div>
          <button className="cta-primary rounded-full px-5 py-2 text-xs font-semibold">Upgrade Plan</button>
        </div>

        {/* recent drafts */}
        <h3 className="font-sora text-lg font-semibold text-white mb-4">Recent Drafts</h3>
        <div className="space-y-3">
          {recentDrafts.map((d, i) => (
            <div key={i} className="glass-pill rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{d.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{d.date}</p>
              </div>
              <span className={`chip text-xs ${
                d.status === 'Published' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                d.status === 'In Review' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                'border-slate-500/30 text-slate-400'
              }`}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChatWidget                                                        */
/* ------------------------------------------------------------------ */
function ChatWidget({ openSignal = 0 }: { openSignal?: number }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "你好，欢迎来到 **Inkling**！我是你的 AI 写作客服助手 👋\n\n我可以帮你：\n- 介绍功能与定价方案\n- 解决使用中的常见问题\n- 提供 AI 写作和提示词建议\n\n你可以直接告诉我你的目标，例如：`帮我写一段产品介绍`。",
      ts: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Date.now()}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (openSignal > 0) {
      setOpen(true);
    }
  }, [openSignal]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);

    const res = await api.chat(sessionId.current, text);
    const textOut =
      (res.reply && String(res.reply).trim()) ||
      (res.error && String(res.error).trim()) ||
      "I'm sorry, I couldn't process that. Please try again.";
    const reply: ChatMessage = {
      id: `a_${Date.now()}`,
      role: 'assistant',
      content: textOut,
      ts: Date.now()
    };
    setMessages((prev) => [...prev, reply]);
    setSending(false);
  };

  const layer = (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[95] cta-primary flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform"
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[95] flex h-[min(480px,calc(100vh-8rem))] w-[min(380px,calc(100vw-3rem))] max-h-[min(480px,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(11,16,32,0.92)] shadow-2xl shadow-black/40 backdrop-blur-xl sm:w-[380px]"
            role="dialog"
            aria-modal="false"
            aria-label="Inkling Assistant chat"
          >
            {/* header */}
            <div className="glass-pill px-5 py-3 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500">
                <Bot size={16} className="text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Inkling Assistant</p>
                <p className="text-xs text-emerald-400">Online</p>
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                      <Bot size={12} className="text-violet-400" />
                    </span>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-violet-600/40 text-white rounded-br-md'
                      : 'glass-pill text-slate-300 rounded-bl-md'
                  }`}>
                    {m.role === 'assistant' ? <ChatMarkdown content={m.content} /> : <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                  </div>
                  {m.role === 'user' && (
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                      <User size={12} className="text-cyan-400" />
                    </span>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-2">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                    <Bot size={12} className="text-violet-400" />
                  </span>
                  <div className="glass-pill rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="glass-pill px-3 py-2.5 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about Inkling…"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (!mounted) return null;
  return createPortal(layer, document.body);
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                            */
/* ------------------------------------------------------------------ */
function Navbar({ site, user, onAuthClick, onDashboardClick }: {
  site: SitePayload;
  user: AuthUser | null;
  onAuthClick: () => void;
  onDashboardClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="glass-shell mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-6 py-3">
        <a href="#" className="font-display text-2xl font-bold tracking-tight text-white">
          {site.brand.name}
        </a>
        <ul className="hidden gap-6 md:flex">
          {site.navigation.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-slate-300 transition hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <button
              onClick={onDashboardClick}
              className="cta-primary flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <LayoutDashboard size={15} /> Dashboard
            </button>
          ) : (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onAuthClick(); }}
              className="cta-primary flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <LogIn size={15} /> {site.navigation.cta.label}
            </a>
          )}
        </div>
        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-shell mx-auto mt-2 max-w-6xl rounded-2xl p-6 md:hidden"
          >
            <ul className="flex flex-col gap-4">
              {site.navigation.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-base text-slate-200" onClick={() => setOpen(false)}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                {user ? (
                  <button
                    onClick={() => { onDashboardClick(); setOpen(false); }}
                    className="cta-primary mt-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold w-full justify-center"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </button>
                ) : (
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onAuthClick(); setOpen(false); }}
                    className="cta-primary mt-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold w-full justify-center"
                  >
                    <LogIn size={15} /> {site.navigation.cta.label}
                  </a>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  HeroSection                                                       */
/* ------------------------------------------------------------------ */
function HeroSection({
  site,
  onStartFree,
  onTalkToSales
}: {
  site: SitePayload;
  onStartFree: () => void;
  onTalkToSales: () => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = sceneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
      setTilt({ x, y });
    },
    []
  );

  const onLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36">
      <div className="mx-auto max-w-5xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="chip inline-flex items-center gap-2 font-mono text-xs"
        >
          {site.hero.badge}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-display hero-sheen mt-8 text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl"
        >
          {site.hero.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
        >
          {site.hero.subtext}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={onStartFree}
            className="cta-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold"
          >
            {site.hero.primaryCta.label}
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={onTalkToSales}
            className="glass-pill inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-slate-200"
          >
            {site.hero.secondaryCta.label}
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500"
        >
          {site.hero.socialProof.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" /> {p}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div
        ref={sceneRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="hero-scene mx-auto mt-16 max-w-4xl"
        style={
          { '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties
        }
      >
        <div className="glass-editor rounded-3xl p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="glass-pill rounded-2xl p-5">
              <p className="font-mono text-xs text-cyan-400">01 · Draft</p>
              <p className="mt-3 text-sm text-slate-300">Start with a rough idea. Inkling shapes it into launch-ready copy.</p>
            </div>
            <div className="glass-pill rounded-2xl p-5">
              <p className="font-mono text-xs text-pink-400">02 · Refine</p>
              <p className="mt-3 text-sm text-slate-300">Tone, voice, and structure adapt in real time. Every edit preserves intent.</p>
            </div>
            <div className="glass-pill rounded-2xl p-5">
              <p className="font-mono text-xs text-amber-400">03 · Publish</p>
              <p className="mt-3 text-sm text-slate-300">One click to ship across every channel. Coherent, on-brand, on time.</p>
            </div>
          </div>
          <div className="glass-float bottom-4 right-4 mb-2 mr-2 rounded-xl px-4 py-2 text-xs text-slate-400">
            AI confidence <span className="font-semibold text-emerald-400">94 %</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ProofStrip                                                        */
/* ------------------------------------------------------------------ */
function ProofStrip({ stats }: { stats: StatsPayload }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-center font-mono text-xs text-slate-500">Trusted by teams who publish under pressure</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.metrics.map((m) => (
          <div key={m.label} className="glass-shell rounded-2xl p-6 text-center">
            <span className="font-display text-4xl font-bold text-white">
              {m.format === 'compact' ? fmt(useCountUp(m.value)) : useCountUp(m.value)}
              {m.suffix}
            </span>
            <p className="mt-2 text-sm text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  AutoDemoCarousel                                                  */
/* ------------------------------------------------------------------ */
function AutoDemoCarousel({ scenarios }: { scenarios: SitePayload['demoScenarios'] }) {
  const [idx, setIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const curText = scenarios[idx].output[lineIdx]?.slice(0, chars) ?? '';

  useEffect(() => {
    const iv = setInterval(() => {
      setIdx((p) => (p + 1) % scenarios.length);
      setLineIdx(0);
      setChars(0);
    }, 6000);
    return () => clearInterval(iv);
  }, [scenarios.length]);

  useEffect(() => { setLineIdx(0); setChars(0); }, [idx]);

  useEffect(() => {
    const max = scenarios[idx].output[lineIdx]?.length ?? 0;
    if (chars < max) {
      const t = setTimeout(() => setChars((c) => c + 1), 22);
      return () => clearTimeout(t);
    }
    if (lineIdx < scenarios[idx].output.length - 1) {
      const t = setTimeout(() => { setLineIdx((l) => l + 1); setChars(0); }, 280);
      return () => clearTimeout(t);
    }
  }, [chars, lineIdx, idx, scenarios]);

  const s = scenarios[idx];

  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 py-20">
      <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-sora text-center text-3xl font-bold text-white sm:text-4xl">
        A guided product tour
      </motion.h2>
      <p className="mt-4 text-center text-slate-400">Watch Inkling turn rough intent into polished output.</p>
      <div className="mt-12 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <div className="glass-shell rounded-2xl p-6">
            <p className="font-mono text-xs text-cyan-400">{s.useCase}</p>
            <p className="mt-3 text-sm text-slate-300">{s.prompt}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.tags.map((t) => (<span key={t} className="chip font-mono">{t}</span>))}
          </div>
        </div>
        <div className="flex-1">
          <div className="glass-editor rounded-2xl p-6">
            <p className="font-mono text-xs text-pink-400">Output</p>
            <div className="mt-3 space-y-2 font-mono text-sm text-slate-200 min-h-[180px]">
              {s.output.slice(0, lineIdx).map((line, i) => (<div key={i}>{line}</div>))}
              <div>{curText}<span className="typing-caret" /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-2">
        {scenarios.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); setLineIdx(0); setChars(0); }}
            className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-600'}`}
            aria-label={`Scenario ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ImageShowcase                                                     */
/* ------------------------------------------------------------------ */
function ImageShowcase({ images }: { images: SitePayload['showcaseImages'] }) {
  return (
    <section id="showcase" className="py-20">
      <div className="px-6">
        <h2 className="font-sora text-center text-3xl font-bold text-white sm:text-4xl">Scenes designed to travel</h2>
        <p className="mt-4 text-center text-slate-400">Every workspace is built for presentation.</p>
      </div>
      <div className="mt-12 overflow-hidden">
        <div className="showcase-track flex gap-5">
          {[...images, ...images].map((img, i) => (
            <div key={`${img.id}-${i}`} className="glass-shell w-[320px] shrink-0 rounded-2xl overflow-hidden sm:w-[380px]">
              <div className="aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-sora text-lg font-semibold text-white">{img.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FeatureGrid                                                       */
/* ------------------------------------------------------------------ */
function FeatureGrid({ features }: { features: Feature[] }) {
  const accents: Record<string, string> = { cyan: 'text-cyan-400', pink: 'text-pink-400', amber: 'text-amber-400', violet: 'text-violet-400' };
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-sora text-center text-3xl font-bold text-white sm:text-4xl">A writing system with real range</h2>
      <p className="mt-4 text-center text-slate-400">Six capabilities that cover the entire content lifecycle.</p>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="feature-card glass-shell group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(34,211,238,0.1)]"
          >
            <div className="feature-card-glow" />
            <p className={`font-mono text-xs ${accents[f.accent] ?? 'text-cyan-400'}`}>{f.eyebrow}</p>
            <h3 className="mt-3 font-sora text-xl font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.summary}</p>
            <ul className="mt-4 space-y-1.5">
              {f.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />{p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  WorkflowSection                                                   */
/* ------------------------------------------------------------------ */
function WorkflowSection() {
  const steps = [
    { n: '01', title: 'Ideate', desc: 'Capture rough notes, briefs, or raw prompts in one workspace.' },
    { n: '02', title: 'Generate', desc: 'AI drafts launch-ready copy with tone-matched precision.' },
    { n: '03', title: 'Review', desc: 'Collaborate with inline comments, version diffs, and approval states.' },
    { n: '04', title: 'Publish', desc: 'Ship directly to blogs, social, email, and docs in one click.' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-sora text-center text-3xl font-bold text-white sm:text-4xl">Built for every content sprint</h2>
      <p className="mt-4 text-center text-slate-400">From first idea to final output in four deliberate steps.</p>
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="glass-shell relative rounded-2xl p-6"
          >
            <span className="font-display text-4xl font-bold text-slate-700">{s.n}</span>
            <h3 className="mt-3 font-sora text-lg font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
            {i < steps.length - 1 && (
              <ArrowRight className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-slate-600 lg:block" size={18} />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PricingSection                                                    */
/* ------------------------------------------------------------------ */
function PricingSection({
  plans,
  onStartFree,
  onTalkToSales,
  onChooseMomentum
}: {
  plans: PricingPlan[];
  onStartFree: () => void;
  onTalkToSales: () => void;
  onChooseMomentum: () => void;
}) {
  const resolvePlanCta = (plan: PricingPlan) => {
    const text = plan.cta.trim().toLowerCase();
    if (text.includes('talk to sales')) return onTalkToSales;
    if (text.includes('choose momentum') || plan.featured) return onChooseMomentum;
    return onStartFree;
  };

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-sora text-center text-3xl font-bold text-white sm:text-4xl">Simple plans, polished operations</h2>
      <p className="mt-4 text-center text-slate-400">Scale as fast as your content needs.</p>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name}
            className={`glass-shell rounded-2xl p-7 transition-all duration-300 ${
              p.featured ? '-translate-y-2 border-cyan-500/30 shadow-[0_20px_60px_rgba(34,211,238,0.12)]' : ''
            }`}
          >
            {p.featured && <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">Most Popular</span>}
            <h3 className="font-sora text-xl font-semibold text-white">{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-white">{p.price}</span>
              <span className="text-sm text-slate-400">{p.cadence}</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{p.description}</p>
            <ul className="mt-5 space-y-2">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-slate-300"><Check size={14} className="text-cyan-400" />{b}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={resolvePlanCta(p)}
              className={`mt-7 w-full rounded-full py-3 text-sm font-semibold transition ${p.featured ? 'cta-primary' : 'glass-pill text-slate-200'}`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TestimonialsSection                                               */
/* ------------------------------------------------------------------ */
function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-sora text-center text-3xl font-bold text-white sm:text-4xl">What sharp teams notice first</h2>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-shell rounded-2xl p-7">
            <p className="text-sm leading-relaxed text-slate-300">"{t.quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-white">{t.name[0]}</span>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FinalCta                                                          */
/* ------------------------------------------------------------------ */
function FinalCta({ site, stats }: { site: SitePayload; stats: StatsPayload }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [waitlistTotal, setWaitlistTotal] = useState(stats.waitlistTotal);
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('saving');
    const res = await api.joinWaitlist(email);
    if (res.error) { setStatus('error'); setMsg(res.error); }
    else { setStatus('done'); setMsg(res.message ?? "You're in!"); if (res.waitlistTotal) setWaitlistTotal(res.waitlistTotal); }
  };

  const shareLink = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <section id="waitlist" className="mx-auto max-w-4xl px-6 py-24">
      <div className="glass-shell rounded-3xl p-10 text-center sm:p-14">
        <h2 className="font-sora text-3xl font-bold text-white sm:text-4xl">{site.sections.finalCta}</h2>
        <p className="mx-auto mt-4 max-w-lg text-slate-400">
          Join <span className="font-semibold text-white">{fmt(waitlistTotal)}</span> teams already on the waitlist.
        </p>
        <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50" />
          <button type="submit" disabled={status === 'saving'} className="cta-primary rounded-full px-7 py-3 text-sm font-semibold disabled:opacity-60">
            {status === 'saving' ? 'Joining…' : 'Join Waitlist'}
          </button>
        </form>
        <AnimatePresence>
          {status === 'done' && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-sm text-emerald-400">{msg}</motion.p>}
          {status === 'error' && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-sm text-red-400">{msg}</motion.p>}
        </AnimatePresence>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => api.share('twitter')} className="glass-pill rounded-full p-3 transition hover:bg-white/10" aria-label="Share on Twitter"><Twitter size={16} className="text-slate-400" /></button>
          <button onClick={() => api.share('linkedin')} className="glass-pill rounded-full p-3 transition hover:bg-white/10" aria-label="Share on LinkedIn"><Linkedin size={16} className="text-slate-400" /></button>
          <button onClick={copyLink} className="glass-pill rounded-full p-3 transition hover:bg-white/10" aria-label="Copy link">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-400" />}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */
function Footer({ site }: { site: SitePayload }) {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="font-display text-lg font-bold text-white">{site.brand.name}</span>
        <div className="flex gap-6">
          {site.footer.links.map((l) => (
            <a key={l.href} href={l.href} className="text-xs text-slate-500 transition hover:text-slate-300">{l.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
  const [site, setSite] = useState<SitePayload | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [chatOpenSignal, setChatOpenSignal] = useState(0);

  useEffect(() => {
    api.getSite().then(setSite);
    api.getFeatures().then(setFeatures);
    api.getPricing().then(setPricing);
    api.getTestimonials().then(setTestimonials);
    api.getStats().then(setStats);
    // check saved session
    const token = localStorage.getItem('inkling_token');
    if (token) api.getMe().then((u) => { if (u) setUser(u); });
  }, []);

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('inkling_token');
    setUser(null);
    setShowDashboard(false);
  };

  const handleStartFree = () => {
    if (user) {
      setShowDashboard(true);
      return;
    }
    setShowAuth(true);
  };

  const handleTalkToSales = () => {
    setChatOpenSignal((v) => v + 1);
  };

  const handleChooseMomentum = () => {
    if (user) {
      setShowDashboard(true);
      return;
    }
    setShowAuth(true);
  };

  if (!site || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-base text-white">
      <Navbar site={site} user={user} onAuthClick={() => setShowAuth(true)} onDashboardClick={() => setShowDashboard(true)} />
      <main>
        <HeroSection site={site} onStartFree={handleStartFree} onTalkToSales={handleTalkToSales} />
        <ProofStrip stats={stats} />
        <AutoDemoCarousel scenarios={site.demoScenarios} />
        <ImageShowcase images={site.showcaseImages} />
        <FeatureGrid features={features} />
        <WorkflowSection />
        <PricingSection
          plans={pricing}
          onStartFree={handleStartFree}
          onTalkToSales={handleTalkToSales}
          onChooseMomentum={handleChooseMomentum}
        />
        <TestimonialsSection testimonials={testimonials} />
        <FinalCta site={site} stats={stats} />
      </main>
      <Footer site={site} />

      {/* floating chat */}
      <ChatWidget openSignal={chatOpenSignal} />

      {/* auth modal */}
      <AnimatePresence>
        {showAuth && !user && (
          <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />
        )}
      </AnimatePresence>

      {/* dashboard overlay */}
      <AnimatePresence>
        {showDashboard && user && (
          <Dashboard user={user} onClose={() => setShowDashboard(false)} onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}
