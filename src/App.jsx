import { useState,useEffect } from 'react'
import './App.css'

function App() {
  let [visible, setVisible] = useState(true);
  useEffect(function(){
    const timer = setTimeout(function(){
      setVisible(c=>!c);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      {visible && <Counter />}
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(function() {
    const interval = setInterval(function(){
      setCount(function(count){
        return count+1;
      })
    },1000);
    return () => clearInterval(interval);
  },[]);
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  )
}

export default App