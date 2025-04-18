
import { readFromDatabase, listenToDatabase, pushToDatabase, updateInDatabase, removeFromDatabase, initializeProducts } from './firebase';
import { Product } from '@/components/ProductCard';

// Sample product data for initialization
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Modern Minimalist Watch',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=3180&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'accessories,new',
    description: 'Elegant timepiece with a clean, minimalist design perfect for any occasion. Features Japanese movement, sapphire crystal face, and a genuine leather strap. Water-resistant up to 30 meters.'
  },
  {
    id: '2',
    name: 'Premium Leather Backpack',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'bags,new',
    description: 'Handcrafted from genuine leather, this spacious backpack offers both style and functionality. Features multiple compartments, padded laptop sleeve, and adjustable shoulder straps for all-day comfort.'
  },
  {
    id: '3',
    name: 'Wireless Noise-Canceling Headphones',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'electronics,new',
    description: 'Immerse yourself in your favorite music with these premium wireless headphones featuring active noise cancellation. Enjoy up to 30 hours of battery life, intuitive touch controls, and exceptional sound quality.'
  },
  {
    id: '4',
    name: 'Handcrafted Ceramic Mug Set',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'home,sale',
    description: 'Set of four unique, handcrafted ceramic mugs, each with its own distinctive glaze pattern. Microwave and dishwasher safe, these 12oz mugs are perfect for your morning coffee or evening tea.'
  },
  {
    id: '5',
    name: 'Organic Cotton T-Shirt',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=3280&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'fashion,sale',
    description: 'Soft, sustainable organic cotton t-shirt with a comfortable fit and casual style. Ethically made with eco-friendly dyes and fair labor practices. Available in multiple colors and sizes.'
  },
  {
    id: '6',
    name: 'Smart Home Speaker',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1589894404892-7310b92ea7a2?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'electronics',
    description: 'Voice-controlled smart speaker with premium sound quality and intelligent assistant features. Control your smart home, play music, check the weather, and more with simple voice commands.'
  },
  {
    id: '7',
    name: 'Minimalist Wall Clock',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'home',
    description: 'Simple, elegant wall clock with a clean design that complements any interior style. Features silent quartz movement and is crafted from sustainable bamboo material.'
  },
  {
    id: '8',
    name: 'Leather Card Holder',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1607435097405-db48f377bff6?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.0.3',
    category: 'accessories',
    description: 'Slim, elegant card holder crafted from premium leather with multiple card slots. Perfect for minimalist everyday carry and available in various colors to match your style.'
  },
];

// Initialize products in database with better error handling and forceful write
export const initializeProductsInDB = async () => {
  try {
    console.log("Initializing products in database...");
    const snapshot = await readFromDatabase('products');
    
    // Log whether products exist already
    const productsExist = snapshot.exists() && Object.keys(snapshot.val() || {}).length > 0;
    console.log("Products already exist in database:", productsExist);
    
    // Always write sample products for testing purposes
    console.log("Adding sample products to database...");
    // Add each product with its ID as the key
    const updates: Record<string, any> = {};
    sampleProducts.forEach(product => {
      updates[`products/${product.id}`] = product;
    });
    
    await updateInDatabase('', updates);
    console.log("Sample products added successfully");
    
    return true;
  } catch (error) {
    console.error("Error initializing products:", error);
    // Check for permission denied error
    if (error instanceof Error && error.message.includes('permission_denied')) {
      console.error("Firebase permission denied. Please check your database rules.");
    }
    return false;
  }
};

// Convert Firebase snapshot to array of products with better error handling
const snapshotToArray = (snapshot: any): Product[] => {
  try {
    if (!snapshot.exists()) {
      console.log("No data exists in snapshot");
      return [];
    }
    const data = snapshot.val();
    console.log("Raw data from Firebase:", data);
    
    if (!data) {
      console.log("Data is null or undefined");
      return [];
    }
    
    return Object.keys(data).map(key => ({
      ...data[key],
      id: key
    }));
  } catch (error) {
    console.error("Error converting snapshot to array:", error);
    return [];
  }
};

// Get all products with improved initialization and error handling
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    console.log("Getting all products...");
    
    // Always try to initialize first - now this will forcefully write products
    await initializeProductsInDB();
    
    const snapshot = await readFromDatabase('products');
    console.log("Products snapshot received, exists:", snapshot.exists());
    
    const products = snapshotToArray(snapshot);
    console.log(`Converted ${products.length} products from database`);
    
    // If still no products, force sample products
    if (products.length === 0) {
      console.log("No products found after checking database, returning sample products directly");
      return sampleProducts;
    }
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    // Check for permission denied error
    if (error instanceof Error && error.message.includes('permission_denied')) {
      console.error("Firebase permission denied. Please check your database rules.");
    }
    console.log("Returning sample products due to error");
    return sampleProducts; // Return sample products as fallback
  }
};

// Listen for product changes with improved logging
export const listenForProducts = (callback: (products: Product[]) => void) => {
  console.log("Setting up products listener...");
  return listenToDatabase('products', (data) => {
    console.log("Products update received from database");
    
    if (!data) {
      console.log("No data in products update, returning empty array");
      callback([]);
      return;
    }
    
    try {
      // Convert to array format
      const productsArray = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
      
      console.log(`Passing ${productsArray.length} products to callback`);
      callback(productsArray);
    } catch (error) {
      console.error("Error processing products update:", error);
      if (error instanceof Error && error.message.includes('permission_denied')) {
        console.error("Firebase permission denied. Please check your database rules.");
      }
      callback([]);
    }
  });
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const snapshot = await readFromDatabase(`products/${id}`);
    if (!snapshot.exists()) return null;
    return { ...snapshot.val(), id };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    if (category === 'all') return products;
    
    // Filter products by category
    return products.filter(product => 
      product.category && product.category.split(',').includes(category)
    );
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
};

// Add a new product
export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  try {
    const newProductRef = await pushToDatabase('products', product);
    return newProductRef.key || '';
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    await updateInDatabase(`products/${id}`, updates);
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await removeFromDatabase(`products/${id}`);
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

// Get featured products (first 4 products)
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products.slice(0, 4);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};