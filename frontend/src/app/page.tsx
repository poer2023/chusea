export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        
        {/* 多层次背景球体 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
        
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:60px_60px]" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24 z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-12">
              {/* Glassmorphism徽章 */}
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white font-medium mb-8 shadow-lg">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  欢迎使用 ChUseA v2.0
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="text-white">智能化的</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  学术写作助手
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                集成AI助手、文献管理、文档创作于一体的综合平台。
                <br />
                让学术写作变得更加智能、高效和协作。
              </p>
              
              {/* 现代化按钮组 */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <button className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/25 border-0 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 rounded-lg">
                  <span className="relative z-10">开始写作</span>
                </button>
                <button className="bg-white/10 backdrop-blur-lg border-2 border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 rounded-lg">
                  浏览文献
                </button>
              </div>
            </div>
            
            {/* 现代化统计信息 - Glassmorphism卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-gray-300 text-lg">活跃用户</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">50K+</div>
                <div className="text-gray-300 text-lg">文档创建</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">1M+</div>
                <div className="text-gray-300 text-lg">文献引用</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}