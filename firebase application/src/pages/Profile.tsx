
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { listenToDatabase } from '../services/firebase';

interface ExtendedUserProfile {
  displayName?: string;
  phone?: string;
}

const Profile = () => {
  const { currentUser, userProfile, logout, updateProfile, refreshUserFromToken } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState((userProfile?.displayName?.split(' ')[0]) || '');
  const [lastName, setLastName] = useState((userProfile?.displayName?.split(' ')[1]) || '');
  const [phone, setPhone] = useState((userProfile as ExtendedUserProfile)?.phone || '');
  const [ordersData, setOrdersData] = useState<any[]>([]);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  React.useEffect(() => {
    if (currentUser) {
      const unsubscribe = listenToDatabase(`orders/${currentUser.uid}`, (data) => {
        if (data) {
          const orderArray = Object.entries(data).map(([id, details]) => ({
            id,
            ...details as object
          }));
          setOrdersData(orderArray);
        } else {
          setOrdersData([]);
        }
      });
      
      return unsubscribe;
    }
  }, [currentUser]);

  if (!currentUser) {
    return null; // Redirecting, don't render anything
  }
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        displayName: `${firstName} ${lastName}`.trim(),
        phone: phone
      } as ExtendedUserProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Feature not implemented",
      description: "Password update functionality is not implemented in this demo.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleRefreshSession = async () => {
    try {
      await refreshUserFromToken();
      toast({
        title: "Session refreshed",
        description: "Your session has been refreshed from localStorage token.",
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: "Session refresh failed",
        description: "Could not refresh your session. Please try logging in again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif mb-8">My Account</h1>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium mb-2">Session Information</h3>
          <p className="text-gray-600 mb-3">User ID: {currentUser.uid}</p>
          <Button onClick={handleRefreshSession} variant="outline" className="mr-2">
            Refresh Session from Token
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={currentUser.email || ''} 
                    readOnly 
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Your email address is also your username
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      type="text" 
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      type="text" 
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track your past orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersData.length > 0 ? (
                  <div className="space-y-4">
                    {ordersData.map((order) => (
                      <div key={order.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Status: {order.status || 'Processing'}
                        </div>
                        <div className="mt-2 font-medium">
                          Total: ${order.total?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-primary/10 p-6 mb-4">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-10 w-10 text-primary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-500 text-center mb-6">
                      You haven't placed any orders yet. Start shopping to see your orders here!
                    </p>
                    <Button asChild>
                      <a href="/products">Start Shopping</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleUpdatePassword}>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;