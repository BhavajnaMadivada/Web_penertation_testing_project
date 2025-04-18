
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';
import { readFromDatabase } from '../services/firebase';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView: 'login' | 'register';
}

const AuthModal = ({ open, onOpenChange, initialView }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, register } = useAuth();

  // VULNERABLE: Store form data in localStorage
  useEffect(() => {
    // This is insecure - storing credentials in localStorage
    if (email) localStorage.setItem('last_email', email);
    if (password) localStorage.setItem('last_password', password);
    
    // Load the last used email
    const savedEmail = localStorage.getItem('last_email');
    if (savedEmail && !email) {
      setEmail(savedEmail);
    }
  }, [email, password]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleViewChange = (newView: 'login' | 'register') => {
    setView(newView);
    setError(null);
  };

  // VULNERABLE: Function for XSS demonstration
  const processCredentials = (email: string, password: string) => {
    // This is vulnerable to reflected XSS if email contains script tags
    document.getElementById('credentials-container')?.insertAdjacentHTML(
      'beforeend',
      `<div style="display:none">Processing: ${email}</div>`
    );
    
    return { email, password };
  };

  // HIGHLY VULNERABLE: Execute stored XSS on successful login - improved version
  const executeStoredXSS = async () => {
    try {
      console.log("Executing stored XSS after login...");
      
      // Fetch all comments from database
      const snapshot = await readFromDatabase('comments');
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Create a hidden div to execute any scripts in comments
        const xssContainer = document.createElement('div');
        xssContainer.style.display = 'none';
        xssContainer.id = 'xss-payload-container';
        document.body.appendChild(xssContainer);
        
        // Process each comment to extract and execute scripts
        Object.values(data).forEach((comment: any) => {
          if (comment.text) {
            try {
              // 1. Add the raw HTML to the container
              const wrapper = document.createElement('div');
              wrapper.innerHTML = comment.text;
              xssContainer.appendChild(wrapper);
              
              // 2. Extract script content and create executable script elements
              const scriptContent = comment.text.match(/<script>([\s\S]*?)<\/script>/i);
              if (scriptContent && scriptContent[1]) {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptContent[1];
                xssContainer.appendChild(scriptElement);
                console.log("Injected script from comment:", scriptContent[1]);
              }
            } catch (e) {
              console.error("Error processing comment for XSS:", e);
            }
          }
        });
        
        // Container will remain in DOM longer, allowing scripts to run
        setTimeout(() => {
          if (document.body.contains(xssContainer)) {
            document.body.removeChild(xssContainer);
          }
        }, 5000);
        
        console.log("Stored XSS payloads executed");
      }
    } catch (error) {
      console.error("Error executing stored XSS:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // VULNERABLE: Process credentials in an unsafe way
      const credentials = processCredentials(email, password);
      
      if (view === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        await register(credentials.email, credentials.password);
      } else {
        await login(credentials.email, credentials.password);
        
        // VULNERABLE: Execute stored XSS on successful login
        console.log("Login successful, executing stored XSS...");
        setTimeout(() => {
          executeStoredXSS();
        }, 1000); // Delay execution to ensure auth state is fully updated
      }
      resetForm();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif">
            {view === 'login' ? 'Welcome Back' : 'Create an Account'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={view} onValueChange={handleViewChange as (value: string) => void} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm mb-4">
                {/* VULNERABLE: Directly rendering error message without sanitization */}
                <div dangerouslySetInnerHTML={{ __html: error }} />
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden div for XSS vulnerability demonstration */}
              <div id="credentials-container"></div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {view === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : view === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;