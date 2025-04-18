
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-accent relative overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6 leading-tight">
              Discover Your Perfect Style
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-md">
              Curated collections and premium quality products that enhance your everyday life. Shop the latest trends.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/products">
                  Shop Now
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link to="/products?category=new">
                  New Arrivals
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative h-[400px] md:h-[500px]">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl transform md:rotate-3 md:hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Hero product showcase" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 md:w-60 md:h-60 rounded-full bg-primary/20 z-[-1]"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 md:w-40 md:h-40 rounded-full bg-primary/10 z-[-1]"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/5 to-transparent h-24 absolute bottom-0 left-0 right-0 z-[-1]"></div>
    </section>
  );
};

export default Hero;
