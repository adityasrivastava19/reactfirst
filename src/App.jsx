import { useState, useEffect } from 'react'
import './App.css'

function App() {
  let [visible, setVisible] = useState(true);
  useEffect(function () {
    const timer = setInterval(function () {
      setVisible(c => !c);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="app-container">
      {visible && <Counter />}
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(function () {
    const interval = setInterval(function () {
      setCount(function (count) {
        return count + 1;
      })
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="counter-card">
      <h1 className="count-display">{count}</h1>
      <div className="button-group">
        <button onClick={() => setCount(count - 1)}>−</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
      <div className="status-text">Counter Active</div>
    </div>
  )
}

export default App