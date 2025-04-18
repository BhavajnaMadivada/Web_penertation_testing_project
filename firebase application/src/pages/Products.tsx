
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllProducts, listenForProducts } from '../services/productService';

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home', name: 'Home Goods' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'bags', name: 'Bags' },
  { id: 'new', name: 'New Arrivals' },
  { id: 'sale', name: 'Sale' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([categoryParam]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset selected categories if URL param changes
    const categoryParam = searchParams.get('category') || 'all';
    setSelectedCategories([categoryParam]);
  }, [searchParams]);

  useEffect(() => {
    // Initialize and fetch products from Firebase
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };

    // Set up real-time listener for product updates
    const unsubscribe = listenForProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setIsLoading(false);
    });

    // Initial load
    fetchProducts();

    // Cleanup listener on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const filtered = products.filter(product => {
      // Filter by search term
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Filter by price range
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Filter by selected categories
      let matchesCategory = selectedCategories.includes('all');
      if (!matchesCategory && product.category) {
        const productCategories = product.category.split(',');
        matchesCategory = productCategories.some(cat => selectedCategories.includes(cat));
      }
      
      return matchesSearch && matchesPrice && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, priceRange, selectedCategories, products]);
  
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
      setSearchParams({});
    } else {
      setSelectedCategories(prev => 
        prev.includes('all') ? [categoryId] : 
        prev.includes(categoryId) ? 
          prev.filter(c => c !== categoryId) : 
          [...prev.filter(c => c !== 'all'), categoryId]
      );
      
      if (categoryId !== 'all') {
        setSearchParams({ category: categoryId });
      }
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 500]);
    setSelectedCategories(['all']);
    setSearchParams({});
  };
  
  // Product list skeletons for loading state
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <Skeleton className="w-full aspect-square" />
          <div className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif mb-4">
            {selectedCategories.includes('all') 
              ? 'All Products' 
              : categories.find(c => selectedCategories.includes(c.id))?.name}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="flex md:hidden">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal size={16} className="mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="py-6 h-full overflow-auto">
                    <h3 className="font-medium text-lg mb-4">Filters</h3>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Categories</h4>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-category-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => handleCategoryChange(category.id)}
                            />
                            <Label htmlFor={`mobile-category-${category.id}`}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Price Range: ${priceRange[0]} - ${priceRange[1]}</h4>
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={500}
                        step={10}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="mb-6"
                      />
                    </div>
                    
                    <Button onClick={clearFilters} variant="outline" className="w-full">
                      Clear Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium text-lg mb-4">Filters</h3>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryChange(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range: ${priceRange[0]} - ${priceRange[1]}</h4>
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={500}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-6"
                  />
                </div>
                
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              renderSkeletons()
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;