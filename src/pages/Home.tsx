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
      {/* Navigation Header - YouTube Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left Section - Logo and Menu */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-6 bg-red-600 rounded-sm flex items-center justify-center">
                  <svg className="w-4 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="text-xl font-medium text-gray-900">ShortVid</div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex">
                <div className="flex-1 flex">
                  <input
                    type="text"
                    placeholder="搜索视频..."
                    className="flex-1 px-4 py-2 border border-gray-300 border-r-0 rounded-l-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-6 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - User */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="头像"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ) : (
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-medium">
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - YouTube Style */}
      <main className="flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-200 min-h-screen">
          <nav className="py-4">
            <div className="px-3">
              <div className="space-y-1">
                <a href="#" className="flex items-center space-x-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">首页</span>
                </a>

                <a href="#" className="flex items-center space-x-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>订阅</span>
                </a>

                <a href="#" className="flex items-center space-x-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>您的视频</span>
                </a>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <div className="space-y-1">
                <div className="px-3 py-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">浏览</h3>
                </div>

                <a href="#" className="flex items-center space-x-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>热门</span>
                </a>

                <a href="#" className="flex items-center space-x-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>音乐</span>
                </a>

                <a href="#" className="flex items-center space-x-6 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>游戏</span>
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {user ? (
            <div className="p-6">
              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Sample Video Cards */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-video bg-gray-200 relative">
                      <div className="absolute inset-0 bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                        3:24
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                        精彩短视频标题 {i}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">创作者名称</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>12K 次观看</span>
                        <span className="mx-1">•</span>
                        <span>2 天前</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center max-w-md mx-auto px-4">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">开始您的ShortVid之旅</h2>
                <p className="text-gray-600 mb-6">登录后即可观看精彩的短视频内容，与全球创作者互动</p>
                <button className="bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors">
                  立即登录
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Stats Section */}
      {user && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">1.2M+</div>
                <div className="text-slate-600">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">500K+</div>
                <div className="text-slate-600">视频作品</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">50M+</div>
                <div className="text-slate-600">观看次数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">24/7</div>
                <div className="text-slate-600">在线服务</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}