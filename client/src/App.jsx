import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import MockTest from './pages/MockTest'
import Exam from './pages/Exam'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />}/>
        <Route path="/sign-in" element={<Login />}/>
        <Route path="/sign-up" element={<Register />}/>
        <Route path="/mocks" element={<MockTest />}/>
        <Route path="/exam" element={<Exam />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
