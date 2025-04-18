
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Cart = () => {
  const { cartItems, cartTotal, increaseCartQuantity, decreaseCartQuantity, removeFromCart, clearCart } = useShoppingCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to your account to checkout",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Order placed!",
      description: "Thank you for your purchase.",
    });
    clearCart();
    navigate("/");
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-serif mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild>
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    {/* Product */}
                    <div className="md:col-span-6 flex items-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="ml-4">
                        <Link 
                          to={`/product/${item.id}`} 
                          className="font-medium text-gray-900 hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <div className="md:hidden mt-1 flex justify-between">
                          <span className="text-gray-500">${item.price.toFixed(2)}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="hidden md:block md:col-span-2 text-center">
                      ${item.price.toFixed(2)}
                    </div>
                    
                    {/* Quantity */}
                    <div className="md:col-span-2 md:text-center mt-4 md:mt-0">
                      <div className="flex items-center justify-center border border-gray-300 rounded-md max-w-[120px] mx-auto">
                        <button 
                          className="px-3 py-1 hover:bg-gray-100" 
                          onClick={() => decreaseCartQuantity(item.id)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-2 py-1 border-l border-r border-gray-300 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          className="px-3 py-1 hover:bg-gray-100" 
                          onClick={() => increaseCartQuantity({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                          })}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="md:col-span-2 md:text-right mt-2 md:mt-0 flex items-center justify-between">
                      <div className="md:hidden">
                        <button 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="hidden md:block">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="hidden md:block">
                        <button 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  size="sm"
                >
                  Clear Cart
                </Button>
                <Button 
                  variant="link" 
                  asChild 
                  className="text-primary"
                >
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
              >
                Checkout
                <ArrowRight size={16} className="ml-2" />
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Taxes calculated at checkout. Shipping calculated based on delivery address.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
