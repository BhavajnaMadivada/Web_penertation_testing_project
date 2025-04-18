
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { ShoppingCart } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const { increaseCartQuantity } = useShoppingCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    increaseCartQuantity({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div 
      className={`group bg-white rounded-lg overflow-hidden shadow-sm product-card-hover 
        ${featured ? 'p-4' : 'border border-gray-100'}`}
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="object-cover w-full h-full scale-animation group-hover:scale-105 transition-transform duration-300"
          />
          {!featured && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full bg-white hover:bg-gray-100 text-gray-800"
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to cart
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
          <p className="font-medium text-primary">${product.price.toFixed(2)}</p>
          
          {featured && (
            <Button 
              className="w-full mt-4"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to cart
            </Button>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
