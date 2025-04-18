
import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { debugLog } from '@/utils/debug';

const ShoppingCartDrawer = () => {
  const { 
    isOpen, 
    closeCart, 
    cartItems, 
    cartTotal, 
    increaseCartQuantity, 
    decreaseCartQuantity, 
    removeFromCart 
  } = useShoppingCart();
  const navigate = useNavigate();

  debugLog("ShoppingCartDrawer", "Rendering with isOpen:", isOpen);
  
  useEffect(() => {
    debugLog("ShoppingCartDrawer", "useEffect triggered, isOpen:", isOpen);
  }, [isOpen]);

  // if (!isOpen) return null;

  // Add the missing handleNavigate function
  const handleNavigate = (path: string) => {
    debugLog("ShoppingCartDrawer", "Navigation to:", path);
    closeCart(); // Close the cart before navigating
    setTimeout(() => {
      navigate(path);
    }, 100); // Small delay to ensure cart is closed first
  };

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
      debugLog("ShoppingCartDrawer", "Sheet onOpenChange:", open);
      if (!open) closeCart();
    }}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full" aria-label="Shopping Cart">
        <SheetHeader className="space-y-2.5 pb-4">
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-4">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button onClick={() => handleNavigate("/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div
                            className="font-medium line-clamp-1 hover:text-primary cursor-pointer"
                            onClick={() => handleNavigate(`/product/${item.id}`)}
                        >
                          {item.name}
                        </div>
                        <button 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex border border-gray-200 rounded">
                          <button 
                            className="px-2 py-1 hover:bg-gray-100" 
                            onClick={() => decreaseCartQuantity(item.id)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 border-l border-r border-gray-200">
                            {item.quantity}
                          </span>
                          <button 
                            className="px-2 py-1 hover:bg-gray-100" 
                            onClick={() => increaseCartQuantity({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image,
                            })}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleNavigate("/cart")}
                >
                  View Cart
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleNavigate("/products")}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartDrawer;