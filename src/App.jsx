import { useState, useEffect } from 'react'
import './App.css'

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

  useEffect(function () {
    if (paused) return;

    const interval = setInterval(function () {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, step]);

  const handleReset = () => {
    setHistory([count, ...history].slice(0, 5));
    setCount(0);
  };

  const saveMark = () => {
    setHistory([count, ...history].slice(0, 5));
  };

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
        <button onClick={() => setCount(count - step)} className="control-btn minus">−</button>
        <button onClick={() => setPaused(!paused)} className="control-btn pause-play">
          {paused ? '▶' : 'II'}
        </button>
        <button onClick={() => setCount(count + step)} className="control-btn plus">+</button>
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