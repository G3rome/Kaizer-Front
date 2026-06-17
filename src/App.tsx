import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './Components/Header/Header'
import Navbar from './Components/Navbar/Navbar'
import Footer from './Components/Footer/Footer'
import ProductDetail from './Components/ProductDetail/ProductDetail'
import Cart from './Components/Cart/Cart'
import ProductList from './Components/ProductList/ProductList'
import About from './Components/About/About'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'

function AppContent() {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <>
      <div className="fixed-top-container">
        <Header />
        {!isAboutPage && <Navbar />}
      </div>

      <main className={`main-content ${isAboutPage ? 'only-header' : 'full-header'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;