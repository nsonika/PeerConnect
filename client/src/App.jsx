import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { SocketProvider } from './context/SocketProvider'
// import './App.css'
import { Lobby } from './screens/Lobby'
import { Room } from './screens/Room'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SocketProvider>
        <Router>
          <Routes>

            <Route path="/" element={<Lobby />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </Router>
      </SocketProvider>
    </>
  )
}

export default App
