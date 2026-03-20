import { useState, useEffect, useCallback } from 'react'
import './App.css'

const BASE_URL = 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/state`;

function App() {
  const [user, setUser] = useState(null);
  const [toggleVisibility, setToggleVisibility] = useState(false);
  const [visible, setVisible] = useState(true);

  // Lifted state to persist when component unmounts
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial state on mount
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        setCount(data.count || 0);
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch state:', err);
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [user]);

  // Function to sync with backend
  const syncWithBackend = useCallback((newCount, newHistory) => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: newCount, history: newHistory })
    })
      .then(res => res.json())
      .catch(err => console.error('Failed to sync state:', err));
  }, []);

  // Auto-increment logic runs regardless of visibility
  useEffect(() => {
    if (paused || loading || !user) return;

    const interval = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, step, loading, user]);

  // Visibility toggle logic
  useEffect(() => {
    if (!toggleVisibility) {
      setVisible(true);
    } else {
      const timer = setInterval(() => {
        setVisible(v => !v);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [toggleVisibility]);

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <div className="app-container">
      <div className="top-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '800px', padding: '1rem 2rem' }}>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={toggleVisibility}
            onChange={() => setToggleVisibility(!toggleVisibility)}
          />
          Fluctuate Visibility (Reset every 5s)
        </label>
        <button className="logout-btn action-btn reset-btn" onClick={() => setUser(null)} style={{ height: '35px', padding: '0 1rem', flex: 'none' }}>
          Logout <span style={{ marginLeft: '5px', opacity: 0.8, fontWeight: 'normal' }}>({user})</span>
        </button>
      </div>
      {visible && (
        <div className="widgets-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <Counter 
            count={count}
            setCount={setCount}
            paused={paused}
            setPaused={setPaused}
            step={step}
            setStep={setStep}
            history={history}
            setHistory={setHistory}
            loading={loading}
            syncWithBackend={syncWithBackend}
          />
          <Timer />
        </div>
      )}
    </div>
  )
}

function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/login' : '/signup';
    
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        onLogin(data.username);
      } else {
        setIsLogin(true);
        setUsername('');
        setPassword('');
        alert('Signup successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card counter-card">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="action-btn save-btn auth-submit" disabled={loading}>
            {loading ? 'Wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
}

function Counter({ 
  count, 
  setCount, 
  paused, 
  setPaused, 
  step, 
  setStep, 
  history, 
  setHistory, 
  loading, 
  syncWithBackend 
}) {
  
  const handleReset = () => {
    const newHistory = [count, ...history].slice(0, 5);
    setHistory(newHistory);
    setCount(0);
    syncWithBackend(0, newHistory);
  };

  const saveMark = () => {
    const newHistory = [count, ...history].slice(0, 5);
    setHistory(newHistory);
    syncWithBackend(count, newHistory);
  };

  if (loading) return <div className="counter-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px', fontSize: '1.2rem', color: '#a0aec0' }}>Loading state...</div>;

  return (
    <div className="counter-card">
      <div className="step-picker">
        <span className="step-label">Step:</span>
        <div className="step-buttons">
          {[1, 5, 10].map(val => (
            <button
              key={val}
              className={`step-btn ${step === val ? 'active' : ''}`}
              onClick={() => setStep(val)}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <h1 className="count-display">{count}</h1>

      <div className="button-group main-controls">
        <button onClick={() => {
          const next = count - step;
          setCount(next);
          syncWithBackend(next, history);
        }} className="control-btn minus">−</button>
        <button onClick={() => setPaused(!paused)} className={`control-btn pause-play ${!paused ? 'active' : ''}`}>
          {paused ? '▶' : 'II'}
        </button>
        <button onClick={() => {
          const next = count + step;
          setCount(next);
          syncWithBackend(next, history);
        }} className="control-btn plus">+</button>
      </div>

      <div className="button-group secondary-controls">
        <button onClick={handleReset} className="action-btn reset-btn">Reset</button>
        <button onClick={saveMark} className="action-btn save-btn">Mark</button>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <h3>Recent Marks</h3>
          <div className="history-list">
            {history.map((h, i) => (
              <span key={i} className="history-item">{h}</span>
            ))}
          </div>
        </div>
      )}

      <div className={`status-text ${!paused ? 'active' : ''}`}>{paused ? 'Paused' : 'Auto-Incrementing'}</div>
    </div>
  )
}

function Timer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const addTime = (seconds) => {
    setTimeLeft(t => t + seconds);
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="counter-card timer-card">
      <div className="step-picker">
        <span className="step-label">Add Time:</span>
        <div className="step-buttons">
          <button className="step-btn" onClick={() => addTime(60)} style={{width: '50px'}}>+1m</button>
          <button className="step-btn" onClick={() => addTime(300)} style={{width: '50px'}}>+5m</button>
        </div>
      </div>

      <h1 className="count-display">{formatTime(timeLeft)}</h1>

      <div className="button-group main-controls">
        <button 
          onClick={() => setIsRunning(!isRunning)} 
          className={`control-btn pause-play ${isRunning ? 'active' : ''}`}
          disabled={timeLeft === 0 && !isRunning}
          style={{ opacity: (timeLeft === 0 && !isRunning) ? 0.5 : 1 }}
        >
          {isRunning ? 'II' : '▶'}
        </button>
      </div>

      <div className="button-group secondary-controls">
        <button onClick={() => { setIsRunning(false); setTimeLeft(0); }} className="action-btn reset-btn">Reset</button>
      </div>

      <div className={`status-text ${isRunning ? 'active' : ''}`}>{isRunning ? 'Running' : 'Idle'}</div>
    </div>
  );
}

export default App