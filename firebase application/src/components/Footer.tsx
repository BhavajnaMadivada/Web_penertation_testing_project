
import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif font-bold text-2xl text-primary">Sparkle<span className="text-gray-800">Shop</span></span>
            </Link>
            <p className="text-gray-600 mb-6">
              Discover unique treasures and everyday essentials at Sparkle Shop - your new favorite online shopping destination.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-gray-600 hover:text-primary">All Products</Link></li>
              <li><Link to="/products?category=new" className="text-gray-600 hover:text-primary">New Arrivals</Link></li>
              <li><Link to="/products?category=sale" className="text-gray-600 hover:text-primary">Sale</Link></li>
              <li><Link to="/products?category=accessories" className="text-gray-600 hover:text-primary">Accessories</Link></li>
              <li><Link to="/products?category=home" className="text-gray-600 hover:text-primary">Home Goods</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Help</h3>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-gray-600 hover:text-primary">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-primary">FAQs</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-primary">Shipping Information</Link></li>
              <li><Link to="/returns" className="text-gray-600 hover:text-primary">Returns & Exchanges</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Newsletter</h3>
            <p className="text-gray-600 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-50" 
                required 
              />
              <Button type="submit" className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Sparkle Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
