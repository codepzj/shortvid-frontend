import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎来到 ShortVid
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            发现精彩的短视频内容
          </p>

          {user ? (
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">欢迎回来！</h2>
              <p className="text-gray-600">您已成功登录</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  用户信息：{user.email || user.displayName}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              <p>正在检查登录状态...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}