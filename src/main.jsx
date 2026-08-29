import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowUpRight, Bell, Bot, Check, ChevronRight, CloudRain, Compass, Crown,
  Flame, Home, LocateFixed, LockKeyhole, MapPin, Menu, Mic, MoreHorizontal,
  Navigation, Pause, Play, Plus, Route, Send, Settings, ShieldCheck, Sparkles,
  Target, UserRound, X, Zap
} from 'lucide-react'
import { auth, googleProvider, isConfigured } from './firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import './styles.css'

const navItems = [
  { label: 'Overview', icon: Home },
  { label: 'My Twin', icon: Bot },
  { label: 'Journey', icon: Route },
  { label: 'Safety', icon: ShieldCheck },
  { label: 'Insights', icon: Sparkles },
]

const messages = [
  { from: 'twin', text: 'Good morning, Maya. You have a clear window for your walk before the rain arrives at 11:30.' },
  { from: 'user', text: 'Should I walk or take the metro today?' },
  { from: 'twin', text: 'Walk if you leave by 10:45. It matches your movement goal and the route is calm. I’ll remind you about your umbrella.' },
]

function LoginPage() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!auth || !isConfigured) {
      setError('Firebase is not configured. Add your Firebase values to .env and restart the app.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password)
      else await signInWithEmailAndPassword(auth, email, password)
    } catch (firebaseError) {
      const errors = { 'auth/invalid-credential': 'Email or password is incorrect.', 'auth/email-already-in-use': 'An account already exists with this email.', 'auth/weak-password': 'Use a password with at least 6 characters.', 'auth/invalid-email': 'Enter a valid email address.' }
      setError(errors[firebaseError.code] || 'Authentication failed. Please try again.')
    } finally { setLoading(false) }
  }

  const googleLogin = async () => {
    setError('')
    if (!auth || !isConfigured) { setError('Firebase is not configured. Add your Firebase values to .env and restart the app.'); return }
    try { await signInWithPopup(auth, googleProvider) } catch (firebaseError) { setError(firebaseError.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled.' : 'Google sign-in failed. Please try again.') }
  }

  return <div className="login-page"><div className="login-atmosphere" /><div className="login-layout"><div className="login-intro"><div className="brand login-brand"><div className="brand-mark"><Sparkles size={18} /></div><span>lyra</span><small>beta</small></div><div className="intro-copy"><span className="status-pill"><span className="pulse" /> Private by design</span><h1>A calmer way to move through your day.</h1><p>Your personal AI companion learns what matters to you, then helps you act on it with clarity.</p></div><div className="intro-footer"><LockKeyhole size={15} /> Your conversations and safety data belong to you.</div></div><div className="login-card"><div className="login-card-header"><div className="login-twin-mark"><Sparkles size={23} /></div><span className="eyebrow">Welcome to Lyra</span><h2>{mode === 'signin' ? 'Sign in to your space' : 'Create your space'}</h2><p>{mode === 'signin' ? 'Pick up where your Twin left off.' : 'Start building a companion that knows you.'}</p></div><button className="google-btn" onClick={googleLogin}><span className="google-g">G</span> Continue with Google</button><div className="divider"><span>or continue with email</span></div><form onSubmit={submit}>{mode === 'signup' && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength="6" required /></label>{error && <div className="auth-error">{error}</div>}<button className="login-submit" disabled={loading}>{loading ? 'Connecting...' : mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowUpRight size={16} /></button></form><p className="mode-switch">{mode === 'signin' ? 'New to Lyra?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p><p className="login-legal">By continuing, you agree to use location and safety features only with your explicit permission.</p></div></div></div>
}

function AuthGate() {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    if (!auth) { setUser(null); return undefined }
    return onAuthStateChanged(auth, setUser)
  }, [])
  if (user === undefined) return <div className="auth-loading"><div className="brand-mark"><Sparkles size={18} /></div><span>Loading your private space...</span></div>
  return user ? <App user={user} /> : <LoginPage />
}

function App({ user }) {
  const [active, setActive] = useState('Overview')
  const [journeyActive, setJourneyActive] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)
  const [locationOn, setLocationOn] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [chatMessages, setChatMessages] = useState(messages)
  const [toast, setToast] = useState('')

  const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2800) }
  const sendMessage = () => {
    if (!draft.trim()) return
    setChatMessages([...chatMessages, { from: 'user', text: draft }, { from: 'twin', text: 'I’m factoring that into your day. I’ll keep your preferences and current context in mind.' }])
    setDraft('')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>lyra</span><small>beta</small></div>
        <div className="profile-mini"><div className="avatar">{(user.displayName || user.email || 'U').slice(0, 2).toUpperCase()}</div><div><strong>{user.displayName || user.email?.split('@')[0] || 'Your space'}</strong><span>Personal space</span></div><MoreHorizontal size={18} /></div>
        <nav className="side-nav">
          <p className="eyebrow">Workspace</p>
          {navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={18} /><span>{label}</span>{label === 'Safety' && <i className="status-dot" />}</button>)}
        </nav>
        <div className="side-bottom"><button className="nav-item"><Settings size={18} /><span>Settings</span></button><div className="privacy-note"><LockKeyhole size={15} /><span>Your data stays yours</span></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu"><Menu size={21} /></button><div><p className="eyebrow">Saturday, August 29, 2026</p><h1>{active === 'Overview' ? `Good morning, ${user.displayName?.split(' ')[0] || 'there'}` : active}</h1></div><div className="top-actions"><button className="icon-btn" onClick={() => notify('You are all caught up')}><Bell size={19} /><span className="notification-dot" /></button><button className="avatar top-avatar" title="Sign out" onClick={() => signOut(auth)}>{(user.displayName || user.email || 'U').slice(0, 2).toUpperCase()}</button></div></header>

        <div className="content-wrap">
          {!isConfigured && <div className="firebase-banner"><div><strong>Demo mode</strong><span>Connect Firebase to sync your private twin across devices.</span></div><button onClick={() => notify('Add VITE_FIREBASE_* keys to your .env file')}>Connect Firebase <ArrowUpRight size={15} /></button></div>}
          <section className="welcome-row"><div><span className="status-pill"><span className="pulse" /> Twin is learning</span><h2>Your day, in tune.</h2><p>One calm view of what matters now.</p></div><button className="date-btn">Today <ChevronRight size={16} /></button></section>

          <div className="metric-grid">
            <article className="metric-card weather-card"><div className="card-top"><div><span className="label">Weather now</span><strong className="temp">18°</strong></div><div className="weather-icon"><CloudRain size={25} /></div></div><div className="weather-meta"><span>Light rain · 72% humidity</span><span>↗ 12 km/h</span></div><div className="forecast"><span>10 AM <b>18°</b></span><span>12 PM <b>19°</b></span><span>2 PM <b>17°</b></span><span>4 PM <b>16°</b></span></div></article>
            <article className="metric-card location-card"><div className="card-top"><span className="label">Current location</span><button className={locationOn ? 'switch on' : 'switch'} onClick={() => setLocationOn(!locationOn)}><span /></button></div><div className="map-preview"><div className="map-grid" /><div className="route-line" /><div className="map-pin"><MapPin size={16} /></div><span className="map-label">{locationOn ? 'SoMa, San Francisco' : 'Location paused'}</span></div><div className="location-foot"><span><LocateFixed size={13} /> {locationOn ? 'Live location on' : 'Permission paused'}</span><button onClick={() => notify('Opening location details')}>Details <ArrowUpRight size={13} /></button></div></article>
          </div>

          <div className="section-heading"><div><span className="eyebrow">Your companion</span><h3>AI Digital Twin</h3></div><button className="text-btn" onClick={() => setChatOpen(true)}>Open conversation <ArrowUpRight size={15} /></button></div>
          <section className="twin-panel"><div className="twin-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="twin-avatar"><Sparkles size={28} /></div><span className="twin-online"><span /> Online</span></div><div className="twin-copy"><span className="label">A note from Lyra</span><p>“You tend to feel most focused after movement. A short walk before lunch could make your afternoon easier.”</p><div className="twin-tags"><span><Flame size={13} /> 6 day streak</span><span><Target size={13} /> 72% goal pace</span></div></div><button className="circle-arrow" onClick={() => setChatOpen(true)}><ArrowUpRight size={18} /></button></section>

          <div className="lower-grid"><section className="journey-card"><div className="section-heading compact"><div><span className="eyebrow">Move with confidence</span><h3>Safe Journey</h3></div><span className={journeyActive ? 'active-badge' : 'soft-badge'}>{journeyActive ? 'Active' : 'Ready'}</span></div><div className="journey-inner"><div className="journey-icon"><Navigation size={24} /></div><div><strong>{journeyActive ? 'Walking to Mission Bay' : 'No journey planned'}</strong><p>{journeyActive ? '12 min remaining · Monitoring on' : 'Start a route with safety check-ins.'}</p></div></div><button className={journeyActive ? 'journey-btn pause' : 'journey-btn'} onClick={() => { setJourneyActive(!journeyActive); notify(journeyActive ? 'Journey paused' : 'Safe Journey started') }}>{journeyActive ? <><Pause size={16} /> Pause journey</> : <><Play size={16} /> Start Safe Journey</>}</button></section><section className="safety-card"><div className="section-heading compact"><div><span className="eyebrow">Protection layer</span><h3>Safety Center</h3></div><ShieldCheck size={20} className="shield-icon" /></div><div className="safety-status"><div className="check-circle"><Check size={17} /></div><div><strong>All clear</strong><p>Trusted contacts are ready</p></div></div><button className="sos-btn" onClick={() => setSosOpen(true)}><Zap size={16} fill="currentColor" /> Hold to activate SOS</button></section></div>

          <div className="section-heading insights-heading"><div><span className="eyebrow">Small steps, visible change</span><h3>Today’s rhythm</h3></div><button className="more-btn"><MoreHorizontal size={19} /></button></div><section className="rhythm-card"><div className="ring-wrap"><div className="progress-ring"><strong>68<span>%</span></strong><small>on track</small></div></div><div className="rhythm-list"><div className="rhythm-row"><span className="rhythm-dot green" /><div><strong>Morning movement</strong><p>Completed at 8:42 AM</p></div><Check size={16} /></div><div className="rhythm-row"><span className="rhythm-dot blue" /><div><strong>Drink 6 glasses of water</strong><p>4 of 6 complete</p></div><span className="fraction">4/6</span></div><div className="rhythm-row"><span className="rhythm-dot yellow" /><div><strong>Call Mom</strong><p>Due by 6:00 PM</p></div><ChevronRight size={16} /></div></div><div className="insight-callout"><Sparkles size={16} /><span><strong>Pattern spotted</strong> You finish goals more often when they’re planned before noon.</span></div></section>
        </div>
      </main>

      <button className="floating-chat" onClick={() => setChatOpen(true)}><Bot size={22} /><span>Ask Lyra</span></button>
      {chatOpen && <div className="chat-drawer"><div className="drawer-header"><div><span className="eyebrow">Your companion</span><h3>Chat with Lyra</h3></div><button className="icon-btn" onClick={() => setChatOpen(false)}><X size={19} /></button></div><div className="drawer-messages">{chatMessages.map((message, index) => <div key={index} className={message.from === 'user' ? 'chat-message user' : 'chat-message'}>{message.from === 'twin' && <div className="tiny-twin"><Sparkles size={13} /></div>}<span>{message.text}</span></div>)}</div><div className="quick-prompts"><button onClick={() => setDraft('What should I focus on today?')}>Focus today</button><button onClick={() => setDraft("What's the weather?")}>Weather</button></div><div className="chat-input"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask your Twin anything" /><button title="Voice input" onClick={() => notify('Voice input is ready for Firebase setup')}><Mic size={17} /></button><button onClick={sendMessage}><Send size={17} /></button></div></div>}
      {sosOpen && <div className="modal-backdrop"><div className="sos-modal"><button className="modal-close" onClick={() => setSosOpen(false)}><X size={18} /></button><div className="modal-symbol"><Zap size={25} fill="currentColor" /></div><span className="eyebrow">Emergency support</span><h2>Ready to activate SOS?</h2><p>Lyra will share your current location with your selected trusted contacts. You can cancel before sending.</p><div className="modal-actions"><button className="cancel-btn" onClick={() => setSosOpen(false)}>Cancel</button><button className="activate-btn" onClick={() => { setSosOpen(false); notify('SOS simulation complete. No message was sent.') }}>Activate SOS</button></div></div></div>}
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<AuthGate />)
