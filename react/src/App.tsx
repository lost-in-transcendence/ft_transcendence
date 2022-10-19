import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import process from 'dotenv'


// async function getSuperFetch(): Promise<string>
// {
//   const resp = await fetch('https://localhost:3000', {method: 'GET'});
//   const data = await resp.json();
//   return data;
// }

 function App() {
   const [count, setCount] = useState(0);
//   // const [amazingFetch, setAmazingFetch] = useState("ta Grosse Grand Mere");

//   function superFetch() : string
//   {
//     const resp = getSuperFetch().then();
//     return resp;
//   }

  // let data : string;
  const [data, setData] = useState<string>("ta grand mere");
  fetch('https://localhost:3000', {method: 'GET'}).then(resp => resp.json()).then(lol => {setData(lol)});
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <p>
        Ta grosse reum elle sent le poisson.
      </p>
      <p>
        {data}
      </p>
    </div>
  )
}

export default App
