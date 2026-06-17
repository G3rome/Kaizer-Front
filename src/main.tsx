import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import App from './App';
import { AuthProvider } from './Services/AuthContext';
import { CartProvider } from './Services/CartContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);