"use client"
import { useContext , createContext, useState, useEffect} from "react";





const AuthContext = createContext({
user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkAuth: async () => {}
})


export function AuthProvider({children}){


    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
   

    // First we need to check if user have an active session

const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      
      if (res.ok && data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    checkAuth();
  
  }, [])
  
    


 const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return the error message to the page component layout
      return { success: false, error: data.message || "Failed to login" };
    }

    // 1. Save your user profile state to context here
    setUser(data.user); 

    // 2. CRITICAL: Return a success flag so page.js knows it worked!
    return data;

  } catch (error) {
    console.error("Login context network error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
};



  const signup = async (name, email, password) => {
  setLoading(true);
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await res.json();
    
    // 1. If the server says NO (e.g., email taken, DB down, validation failed)
    if (!res.ok) {
      // STOP everything right here. Return the error directly.
      return { success: false, error: data.message || "Signup failed" };
    }
    
    // 2. Double check that the database actually returned the user object
    if (!data.user) {
      return { success: false, error: "Account creation confirmed, but user profile could not be loaded." };
    }
    
    // 3. ONLY if everything above passed successfully do we log them in
    setUser(data.user);
    
    return { success: true, data };
    

  } catch (err) {
    console.error("Signup network error:", err);
    return { success: false, error: "Network error. Please try again." };
  } finally {
    setLoading(false);
  }
};

  // 4. Handle Logout Global Action
  const logout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
      
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );

}


// Custom hook for easy consumption inside client components
export const useAuth = () => useContext(AuthContext);