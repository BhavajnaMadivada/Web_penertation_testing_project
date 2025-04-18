import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Minus, Plus, Check, ShoppingCart } from 'lucide-react';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard, { Product } from '@/components/ProductCard';
import { getProductById, getProductsByCategory } from '../services/productService';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { increaseCartQuantity, getItemQuantity } = useShoppingCart();
  const [addedToCart, setAddedToCart] = useState(false);
  
  useEffect(() => {
    // Reset state when product ID changes
    setIsLoading(true);
    setProduct(null);
    setRelatedProducts([]);
    setQuantity(1);
    
    const fetchProductDetails = async () => {
      if (!id) return;
      
      try {
        // Get product details
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
          
          // Get related products
          if (productData.category) {
            const primaryCategory = productData.category.split(',')[0];
            const categoryProducts = await getProductsByCategory(primaryCategory);
            const related = categoryProducts
              .filter(p => p.id !== id)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  useEffect(() => {
    // Check if product is already in cart
    if (product) {
      setAddedToCart(getItemQuantity(product.id) > 0);
    }
  }, [product, getItemQuantity]);
  
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      increaseCartQuantity({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    
    setAddedToCart(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <Skeleton className="w-full aspect-square rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-3/4" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-medium mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/products">
              Continue Shopping
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mb-8">
          <ul className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-500 hover:text-primary">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li><Link to="/products" className="text-gray-500 hover:text-primary">Products</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-serif">{product.name}</h1>
            
            <div className="text-2xl font-medium text-primary">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-700">
              {product.description}
            </p>
            
            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  className="px-3 py-1 hover:bg-gray-100" 
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-1 border-l border-r border-gray-300 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button 
                  className="px-3 py-1 hover:bg-gray-100" 
                  onClick={handleIncreaseQuantity}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check size={18} className="mr-2" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            
            {/* Product tabs */}
            <div className="pt-8">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="returns">Returns</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Product Details</h4>
                    <p className="text-gray-600">
                      {product.description}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>High-quality materials</li>
                      <li>Durable construction</li>
                      <li>Premium finish</li>
                      <li>Designed for everyday use</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="pt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Shipping Information</h4>
                    <p className="text-gray-600">
                      We ship worldwide with various delivery options:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Standard Shipping: 5-7 business days</li>
                      <li>Express Shipping: 2-3 business days</li>
                      <li>Free shipping on orders over $100</li>
                      <li>International shipping available</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="returns" className="pt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Return Policy</h4>
                    <p className="text-gray-600">
                      We want you to be completely satisfied with your purchase:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>30-day return policy</li>
                      <li>Items must be unused and in original packaging</li>
                      <li>Return shipping covered for defective items</li>
                      <li>Exchanges available for wrong sizes</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-serif mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;