'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const features = [
    {
      title: '文档管理',
      description: '创建、编辑和管理您的文档，支持协作和版本控制',
      icon: '📄',
      href: '/documents',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      title: '文献研究',
      description: '搜索和管理学术文献，构建知识库',
      icon: '📚',
      href: '/literature',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
    {
      title: 'AI写作工作台',
      description: '集成AI助手的现代化写作环境，支持实时协作和智能建议',
      icon: '✍️',
      href: '/workspace',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      title: '用户认证',
      description: '登录或注册账户，管理个人信息',
      icon: '👤',
      href: '/auth/login',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">ChUseA</h1>
              <span className="ml-2 text-sm text-gray-500">AI助手平台</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/documents" className="text-gray-600 hover:text-gray-900">
                文档
              </Link>
              <Link href="/literature" className="text-gray-600 hover:text-gray-900">
                文献
              </Link>
              <Link href="/tools" className="text-gray-600 hover:text-gray-900">
                工具
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                登录
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎使用 ChUseA
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            集成AI助手、文档管理、文献研究和写作工具的综合平台
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className={`p-6 transition-all duration-200 ${feature.color}`}>
              <div className="flex items-start">
                <div className="text-3xl mr-4">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <Link href={feature.href}>
                    <Button className="w-full">
                      访问 {feature.title}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/documents/new">
              <Button variant="outline" className="w-full">
                📝 新建文档
              </Button>
            </Link>
            <Link href="/literature">
              <Button variant="outline" className="w-full">
                🔍 搜索文献
              </Button>
            </Link>
            <Link href="/tools">
              <Button variant="outline" className="w-full">
                🛠️ 写作工具
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ChUseA. 所有权利保留.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
