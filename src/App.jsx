import { useState,useEffect } from 'react'
import './App.css'

function App() {
  return (
    <div>
      <Counter />
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(function()
{
  setInterval(function(){
    setCount(function(count){
      return count+1;
    })
  },1000)
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