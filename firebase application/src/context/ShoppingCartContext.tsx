
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { debugLog } from '@/utils/debug';
import { useAuth } from './AuthContext';
import { pushToDatabase, listenToDatabase, updateInDatabase, removeFromDatabase } from '../services/firebase';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShoppingCartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: string) => number;
  increaseCartQuantity: (item: Omit<CartItem, 'quantity'>) => void;
  decreaseCartQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartItems: CartItem[];
  cartQuantity: number;
  cartTotal: number;
}

// Create a default context value to avoid the "must be used within Provider" error
// This also helps with testing and SSR scenarios
const defaultContextValue: ShoppingCartContextType = {
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  getItemQuantity: () => 0,
  increaseCartQuantity: () => {},
  decreaseCartQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartItems: [],
  cartQuantity: 0,
  cartTotal: 0
};

const ShoppingCartContext = createContext<ShoppingCartContextType>(defaultContextValue);

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    debugLog("ShoppingCartContext", "Context used outside provider!", new Error().stack);
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

export const ShoppingCartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentUser } = useAuth();

  // Log component mounting
  useEffect(() => {
    debugLog("ShoppingCartContext", "Provider mounted");
    // Mark context as initialized
    setIsInitialized(true);
    return () => {
      debugLog("ShoppingCartContext", "Provider unmounting");
    };
  }, []);

  // Subscribe to cart data from Firebase Realtime Database when user is authenticated
  useEffect(() => {
    if (currentUser) {
      debugLog("ShoppingCartContext", "Subscribing to cart in Firebase DB", { userId: currentUser.uid });
      
      const unsubscribe = listenToDatabase(`carts/${currentUser.uid}/items`, (data) => {
        if (data) {
          const cartArray = Object.entries(data).map(([key, item]) => ({
            ...(item as CartItem),
            // Ensure we have the Firebase key for later updates
            firebaseKey: key
          }));
          setCartItems(cartArray as CartItem[]);
          debugLog("ShoppingCartContext", "Cart loaded from Firebase", { itemCount: cartArray.length });
        } else {
          setCartItems([]);
        }
      });
      
      return unsubscribe;
    } else {
      // Load from localStorage when not authenticated
      debugLog("ShoppingCartContext", "Loading cart from localStorage");
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
          debugLog("ShoppingCartContext", "Cart loaded successfully", { itemCount: parsedCart.length });
        } catch (e) {
          debugLog("ShoppingCartContext", "Error parsing cart data from localStorage", e);
        }
      }
    }
  }, [currentUser]);

  // Save cart to localStorage when not authenticated
  useEffect(() => {
    if (isInitialized && !currentUser) {
      debugLog("ShoppingCartContext", "Saving cart to localStorage", { itemCount: cartItems.length });
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized, currentUser]);

  const cartQuantity = cartItems.reduce((quantity, item) => item.quantity + quantity, 0);
  
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const openCart = () => {
    debugLog("ShoppingCartContext", "Opening cart...");
    // Use requestAnimationFrame for more reliable state updates
    window.requestAnimationFrame(() => {
      setIsOpen(true);
      debugLog("ShoppingCartContext", "Cart opened, isOpen:", true);
    });
  };
  
  const closeCart = () => {
    debugLog("ShoppingCartContext", "Closing cart...");
    setIsOpen(false);
    debugLog("ShoppingCartContext", "Cart closed, isOpen:", false);
  };

  function getItemQuantity(id: string) {
    return cartItems.find(item => item.id === id)?.quantity || 0;
  }
  
  function increaseCartQuantity(item: Omit<CartItem, 'quantity'>) {
    debugLog("ShoppingCartContext", "Increasing quantity", item);
    
    const existingItem = cartItems.find(i => i.id === item.id);
    const existingItemWithKey = existingItem as CartItem & { firebaseKey?: string };
    
    if (currentUser) {
      // Use Firebase for authenticated users
      if (!existingItem) {
        // Add new item
        pushToDatabase(`carts/${currentUser.uid}/items`, { ...item, quantity: 1 });
        toast({
          title: 'Added to cart',
          description: `${item.name} has been added to your cart.`
        });
      } else if (existingItemWithKey.firebaseKey) {
        // Update existing item
        updateInDatabase(`carts/${currentUser.uid}/items/${existingItemWithKey.firebaseKey}`, {
          ...existingItem,
          quantity: existingItem.quantity + 1
        });
        toast({
          description: `${item.name} quantity updated.`
        });
      }
    } else {
      // Use local state for non-authenticated users
      setCartItems(currItems => {
        if (!existingItem) {
          toast({
            title: 'Added to cart',
            description: `${item.name} has been added to your cart.`
          });
          return [...currItems, { ...item, quantity: 1 }];
        } else {
          toast({
            description: `${item.name} quantity updated.`
          });
          return currItems.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
      });
    }
  }
  
  function decreaseCartQuantity(id: string) {
    debugLog("ShoppingCartContext", "Decreasing quantity", { id });
    
    const existingItem = cartItems.find(i => i.id === id);
    const existingItemWithKey = existingItem as CartItem & { firebaseKey?: string };
    
    if (!existingItem) return;
    
    if (currentUser && existingItemWithKey.firebaseKey) {
      // Use Firebase for authenticated users
      if (existingItem.quantity === 1) {
        // Remove item
        removeFromDatabase(`carts/${currentUser.uid}/items/${existingItemWithKey.firebaseKey}`);
      } else {
        // Update quantity
        updateInDatabase(`carts/${currentUser.uid}/items/${existingItemWithKey.firebaseKey}`, {
          ...existingItem,
          quantity: existingItem.quantity - 1
        });
      }
    } else {
      // Use local state for non-authenticated users
      setCartItems(currItems => {
        if (existingItem.quantity === 1) {
          return currItems.filter(i => i.id !== id);
        } else {
          return currItems.map(i => 
            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
          );
        }
      });
    }
  }
  
  function removeFromCart(id: string) {
    debugLog("ShoppingCartContext", "Removing from cart", { id });
    
    const existingItem = cartItems.find(i => i.id === id);
    const existingItemWithKey = existingItem as CartItem & { firebaseKey?: string };
    
    if (!existingItem) return;
    
    if (currentUser && existingItemWithKey.firebaseKey) {
      // Use Firebase for authenticated users
      removeFromDatabase(`carts/${currentUser.uid}/items/${existingItemWithKey.firebaseKey}`);
      toast({
        description: `${existingItem.name} removed from your cart.`
      });
    } else {
      // Use local state for non-authenticated users
      setCartItems(currItems => {
        const item = currItems.find(i => i.id === id);
        if (item) {
          toast({
            description: `${item.name} removed from your cart.`
          });
        }
        return currItems.filter(i => i.id !== id);
      });
    }
  }
  
  function clearCart() {
    debugLog("ShoppingCartContext", "Clearing cart");
    
    if (currentUser) {
      // Clear cart in Firebase for authenticated users
      removeFromDatabase(`carts/${currentUser.uid}/items`);
    } else {
      // Clear local state for non-authenticated users
      setCartItems([]);
    }
    
    toast({
      description: 'Your cart has been cleared.'
    });
  }

  const contextValue: ShoppingCartContextType = {
    isOpen,
    openCart,
    closeCart,
    getItemQuantity,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeFromCart,
    clearCart,
    cartItems,
    cartQuantity,
    cartTotal
  };

  debugLog("ShoppingCartContext", "Rendering provider", { cartItems: cartItems.length, isOpen });

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
};