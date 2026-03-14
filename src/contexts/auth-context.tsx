import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem("user");
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("检查认证状态时出错:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = () => setIsAuthenticated(true);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.warn("useAuth called outside AuthProvider, using fallback value.");
    return {
      isAuthenticated: false,
      isLoading: true,
      login: () => {},
    };
  }
  return ctx;
}
