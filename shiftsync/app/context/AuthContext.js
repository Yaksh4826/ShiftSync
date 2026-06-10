"use client"
import { useContext , createContext, useState, useEffect} from "react";
import { useRouter } from "next/navigation";




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
    const router = useRouter();

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
  
    


  const login = async ({email, password})=>{
    setLoading(true);
    try{

        const res = await fetch("/api/auth/login", {
            method:POST,
            body:JSON.stringify({email, password})
        })

        const data = await res.json()
           
        if (res.success===false) throw new Error(data.message || "Login failed");
        if(data.success===true){
            setUser(data.user);
            router.push("/dashboard")
            return {sucess:true}

        }
    }
    catch(e){
return { success: false, error: err.message };
    }
    finally{
     setLoading(false)   
    }
  }




  // signup
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (res.success===false) throw new Error(data.message || "Signup failed");
      
      setUser(data.user);
      router.push("/dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
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
        router.push("/login");
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