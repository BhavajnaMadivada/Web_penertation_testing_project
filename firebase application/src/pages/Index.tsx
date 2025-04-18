
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { initializeProductsInDB } from '../services/productService';

// Sample categories data
const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=3271&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: 'home',
    name: 'Home Goods',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f36?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
];

const Index = () => {
  useEffect(() => {
    // Initialize products in Firebase when the app starts
    // This will only add products if the database is empty
    initializeProductsInDB().catch(error => {
      console.error("Error initializing products:", error);
    });
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <FeaturedProducts />
        
        {/* Categories Section */}
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif mb-10 text-center">Shop by Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(category => (
                <Link to={`/products?category=${category.id}`} key={category.id} className="group">
                  <div className="relative h-80 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="text-center">
                        <h3 className="text-white text-2xl font-serif mb-2">{category.name}</h3>
                        <Button variant="secondary" size="sm" className="bg-white hover:bg-white/90">
                          Shop Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Promo Section */}
        <section className="py-16 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="bg-primary/10 rounded-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif mb-4">Join Our Community</h2>
                  <p className="text-gray-700 mb-6">
                    Sign up now and get 10% off your first order, plus early access to exclusive sales and new arrivals.
                  </p>
                  <Button asChild size="lg">
                    <Link to="/signup">
                      Create an Account
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:block rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3" 
                    alt="Happy customers" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;