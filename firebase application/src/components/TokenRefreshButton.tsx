
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface TokenRefreshButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

const TokenRefreshButton = ({ 
  variant = "outline", 
  className = "" 
}: TokenRefreshButtonProps) => {
  const { refreshUserFromToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Get current token from localStorage
      const currentToken = localStorage.getItem('firebase_auth_token');
      
      if (!currentToken) {
        toast({
          title: 'No active session',
          description: 'There is no active session to refresh.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log("Starting token refresh with token:", currentToken.substring(0, 10) + "...");
      
      // Use the token to simulate session fixation
      await refreshUserFromToken();
      
      // After successful refresh, redirect to profile to see the changes
      navigate('/profile');
      
      toast({
        title: 'Session refreshed',
        description: 'Your session has been successfully refreshed with the provided token.',
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh your authentication session.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleRefresh} 
      className={`flex items-center gap-2 ${className}`}
      disabled={isRefreshing}
    >
      <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
      {isRefreshing ? "Refreshing..." : "Refresh Session"}
    </Button>
  );
};

export default TokenRefreshButton;