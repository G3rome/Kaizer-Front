import './App.css'

import { BrowserRouter, Routes, Route, useLocation} from 'react-router-dom'
import Header from './Components/Header/Header'
import Navbar from './Components/Navbar/Navbar'
import Home from './Components/Home/Home'
import Footer from './Components/Footer/Footer'
import ProductDetail from './Components/ProductDetail/ProductDetail'
import Cart from './Components/Cart/Cart'
import ProductList from './Components/ProductList/ProductList'
import About from './Components/About/About'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
//import SocialMedia from './Components/SocialMedia/SocialMedia'

function AppContent() {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <>
      <div className="fixed-top-container">
        {/* El Header SIEMPRE se muestra */}
        <Header />
        
        {/* Eliminamos la condición !isAboutPage para que el Navbar se vea siempre */}
        <Navbar />
      </div>

      {/* Si quieres que el margen superior sea siempre el mismo ahora que el Navbar 
          está en todas las páginas, puedes simplificar la clase del main 
      */}
      <main className="main-content full-header">
        <Routes>
          <Route path="/" element={<Home />} />
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
