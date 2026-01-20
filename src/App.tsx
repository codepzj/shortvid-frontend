import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import LoginModal from "./components/LoginModal";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('检查认证状态时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // 如果正在检查认证状态，显示加载界面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        ) : (
          <LoginModal
            open={true}
            onOpenChange={() => {}}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
