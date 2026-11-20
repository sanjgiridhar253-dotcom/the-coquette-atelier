import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollManager from './components/ScrollManager'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Order from './pages/Order'
import Pay from './pages/Pay'
import ThankYou from './pages/ThankYou'
import './App.css'
import './shop/shop.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen((value) => !value)

  return (
    <main className="atelier-page">
      <div className="paper-grain" aria-hidden="true" />
      <ScrollManager />

      <Header menuOpen={menuOpen} onMenuToggle={toggleMenu} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/order" element={<Order />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </main>
  )
}

export default App
