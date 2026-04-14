import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return; }
    setCartLoading(true);
    try {
      const { data } = await axios.get(`${API}/cart`, { withCredentials: true });
      setCartItems(data);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const addToCart = async (productId) => {
    await axios.post(`${API}/cart`, { product_id: productId, quantity: 1 }, { withCredentials: true });
    await fetchCart();
  };

  const removeFromCart = async (productId) => {
    await axios.delete(`${API}/cart/${productId}`, { withCredentials: true });
    await fetchCart();
  };

  const clearCart = async () => {
    await axios.delete(`${API}/cart`, { withCredentials: true });
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, cartLoading, fetchCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
