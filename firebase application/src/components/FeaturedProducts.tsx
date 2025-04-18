import React, { useState, useEffect } from 'react';
import ProductCard, { Product } from './ProductCard';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { pushToDatabase, readFromDatabase } from '../services/firebase';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../context/AuthContext';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await pushToDatabase('comments', {
        text: newComment,
        createdAt: new Date().toISOString()
      });
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      
      setNewComment('');
      
      const products = await getFeaturedProducts();
      setFeaturedProducts(products);
    } catch (error) {
      console.error("Error submitting comment:", error);
      
      toast({
        title: "Error",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif">Featured Products</h2>
          <Link to="/products" className="text-primary hover:underline">
            View all
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="mt-16 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-serif mb-6">Customer Reviews</h3>
              
              <CommentsSection />
              
              <div className="mt-8 border-t pt-6">
                <h4 className="font-medium mb-2">Add Your Comment</h4>
                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Share your thoughts... HTML allowed for formatting"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs">
                      HTML formatting allowed for styling your comment.
                    </p>
                    <Button onClick={submitComment}>Post</Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const CommentsSection = () => {
  const [comments, setComments] = useState<{ id: string; text: string; createdAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const snapshot = await readFromDatabase('comments');
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const commentsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          commentsArray.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setComments(commentsArray);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [currentUser]);
  
  useEffect(() => {
    console.log("Comments effect triggered, currentUser:", currentUser, "comments:", comments.length);
    
    if (currentUser && comments.length > 0) {
      console.log("Executing stored XSS payloads...");
      
      const xssContainer = document.createElement('div');
      xssContainer.style.display = 'none';
      xssContainer.id = 'xss-payload-execution';
      document.body.appendChild(xssContainer);
      
      comments.forEach(comment => {
        try {
          const scriptElement = document.createElement('script');
          scriptElement.textContent = comment.text
            .replace(/<script>(.*?)<\/script>/gs, '$1');
          
          xssContainer.appendChild(scriptElement);
          
          const wrapper = document.createElement('div');
          wrapper.innerHTML = comment.text;
          xssContainer.appendChild(wrapper);
          
          console.log("Injected XSS payload:", comment.text);
        } catch (e) {
          console.error("Error executing payload:", e);
        }
      });
      
      setTimeout(() => {
        if (document.body.contains(xssContainer)) {
          document.body.removeChild(xssContainer);
        }
      }, 3000);
    }
  }, [comments, currentUser]);
  
  if (isLoading) {
    return <div className="flex justify-center py-8"><Skeleton className="h-32 w-full" /></div>;
  }
  
  if (comments.length === 0) {
    return <p className="text-gray-500 italic">Be the first to leave a comment!</p>;
  }
  
  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className="bg-white p-4 rounded shadow-sm">
          <div dangerouslySetInnerHTML={{ __html: comment.text }} />
          <div className="text-gray-400 text-xs mt-2">
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedProducts;