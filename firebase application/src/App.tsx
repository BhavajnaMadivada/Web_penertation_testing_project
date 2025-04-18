
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import { ShoppingCartProvider } from "./context/ShoppingCartContext";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Initialize query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set default stale time to prevent excessive refetching
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Only retry failed queries once
    },
  },
});

// SECURITY REMINDER: This application contains intentional security vulnerabilities
// for educational purposes only, including:
// - Session fixation via token manipulation
// - XSS vulnerabilities
// - Insecure data storage

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipPrimitive.Provider>
      <AuthProvider>
        <ShoppingCartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ShoppingCartProvider>
      </AuthProvider>
    </TooltipPrimitive.Provider>
  </QueryClientProvider>
);

export default App;