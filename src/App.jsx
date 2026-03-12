import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/state';

function App() {
  const [toggleVisibility, setToggleVisibility] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(function () {
    if (!toggleVisibility) {
      setVisible(true);
      return;
    }
    const timer = setInterval(function () {
      setVisible(c => !c);
    }, 5000);
    return () => clearInterval(timer);
  }, [toggleVisibility]);

  return (
    <div className="app-container">
      <div className="top-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={toggleVisibility}
            onChange={() => setToggleVisibility(!toggleVisibility)}
          />
          Fluctuate Visibility (Reset every 5s)
        </label>
      </div>
      {visible && <Counter />}
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial state
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setCount(data.count || 0);
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch state:', err);
        setLoading(false);
      });
  }, []);

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

  useEffect(function () {
    if (paused || loading) return;

    const interval = setInterval(function () {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, step, loading]);

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

  const updateCountAndSync = (newVal) => {
    setCount(newVal);
    // Optional: sync immediately or wait for Mark/Reset
  };

  if (loading) return <div className="counter-card">Loading state...</div>;

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
        <button onClick={() => setPaused(!paused)} className="control-btn pause-play">
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

      <div className="status-text">{paused ? 'Paused' : 'Auto-Incrementing'}</div>
    </div>
  )
}

export default App