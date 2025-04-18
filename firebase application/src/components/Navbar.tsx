
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, Search, Menu, X, RefreshCcw } from 'lucide-react';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthModal from './AuthModal';
import ShoppingCartDrawer from './ShoppingCartDrawer';
import { debugLog } from '@/utils/debug';

const Navbar = () => {
  const { cartQuantity, openCart } = useShoppingCart();
  const { currentUser, logout, refreshUserFromToken } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Add a useEffect to log cart quantity changes
  useEffect(() => {
    debugLog("Navbar", `Cart quantity changed: ${cartQuantity}`);
  }, [cartQuantity]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    debugLog("Navbar", "Cart button clicked, calling openCart()");
    
    // Force the function to run outside the current event loop
    window.requestAnimationFrame(() => {
      try {
        openCart();
        debugLog("Navbar", "openCart() called through requestAnimationFrame");
      } catch (error) {
        debugLog("Navbar", "Error calling openCart()", error);
      }
    });
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefreshAuth = async () => {
    try {
      await refreshUserFromToken();
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50 w-full animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-serif font-bold text-2xl text-primary">Sparkle<span className="text-gray-800">Shop</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">Shop</Link>
            <Link to="/products?category=new" className="text-gray-700 hover:text-primary transition-colors">New Arrivals</Link>
            <Link to="/products?category=sale" className="text-gray-700 hover:text-primary transition-colors">Sale</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              className="text-gray-700 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            {currentUser ? (
              <div className="relative">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:text-primary transition-colors"
                      aria-label="User menu"
                    >
                      <User size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <div className="flex flex-col space-y-4 mt-8">
                      <h3 className="font-medium text-lg">Hello, {currentUser.email}</h3>
                      <Link 
                        to="/profile"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link 
                        to="/orders"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Button 
                        variant="outline"
                        onClick={handleRefreshAuth} 
                        className="w-full justify-start mt-2 flex items-center gap-2"
                      >
                        <RefreshCcw size={16} />
                        Refresh Session
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleLogout} 
                        className="w-full justify-start"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              <div className="space-x-2 flex items-center">
                <Button 
                  variant="ghost" 
                  className="text-sm"
                  onClick={() => handleAuthClick('login')}
                >
                  Log in
                </Button>
                <Button 
                  variant="default"
                  className="text-sm"
                  onClick={() => handleAuthClick('register')}
                >
                  Sign up
                </Button>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              className="relative" 
              size="icon"
              onClick={handleCartClick}
              type="button" 
              aria-label="Shopping cart"
              id="cart-button"
            >
              <ShoppingBag size={20} />
              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <Button 
              variant="ghost" 
              className="relative" 
              size="icon"
              onClick={handleCartClick}
              type="button"
              aria-label="Shopping cart"
              id="mobile-cart-button"
            >
              <ShoppingBag size={20} />
              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-2 animate-fade-in">
            <nav className="flex flex-col space-y-3 py-3">
              <Link to="/" className="text-gray-700 py-2" onClick={toggleMenu}>Home</Link>
              <Link to="/products" className="text-gray-700 py-2" onClick={toggleMenu}>Shop</Link>
              <Link to="/products?category=new" className="text-gray-700 py-2" onClick={toggleMenu}>New Arrivals</Link>
              <Link to="/products?category=sale" className="text-gray-700 py-2" onClick={toggleMenu}>Sale</Link>
              
              <div className="border-t border-gray-200 my-2"></div>
              
              {currentUser ? (
                <>
                  <Link to="/profile" className="text-gray-700 py-2" onClick={toggleMenu}>My Profile</Link>
                  <Link to="/orders" className="text-gray-700 py-2" onClick={toggleMenu}>My Orders</Link>
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshAuth}
                    className="flex items-center gap-2 justify-center"
                  >
                    <RefreshCcw size={16} />
                    Refresh Session
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      handleAuthClick('login');
                      toggleMenu();
                    }}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      handleAuthClick('register');
                      toggleMenu();
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
        
        <AuthModal 
          open={isAuthModalOpen} 
          onOpenChange={setIsAuthModalOpen} 
          initialView={authMode} 
        />
      </header>
      
      {/* ShoppingCartDrawer is rendered within Navbar to access Router context */}
      <ShoppingCartDrawer />
    </>
  );
};

export default Navbar;