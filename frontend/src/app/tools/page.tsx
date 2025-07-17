import React from 'react';

export default function ToolsPage() {
  const tools = [
    {
      id: 1,
      name: '文本分析工具',
      description: '分析文本内容，提取关键信息和统计数据',
      icon: '📝',
      category: '文本处理',
      status: '可用'
    },
    {
      id: 2,
      name: '数据可视化',
      description: '将数据转换为图表和可视化展示',
      icon: '📊',
      category: '数据分析',
      status: '开发中'
    },
    {
      id: 3,
      name: '文件转换器',
      description: '支持多种文件格式之间的转换',
      icon: '🔄',
      category: '文件处理',
      status: '可用'
    },
    {
      id: 4,
      name: '代码生成器',
      description: '根据需求自动生成代码模板',
      icon: '💻',
      category: '开发工具',
      status: '即将推出'
    },
    {
      id: 5,
      name: '文献引用生成',
      description: '自动生成各种格式的文献引用',
      icon: '📚',
      category: '学术工具',
      status: '可用'
    },
    {
      id: 6,
      name: '翻译助手',
      description: '多语言翻译和本地化工具',
      icon: '🌐',
      category: '语言工具',
      status: '开发中'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '可用':
        return 'bg-green-100 text-green-800';
      case '开发中':
        return 'bg-yellow-100 text-yellow-800';
      case '即将推出':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              工具箱
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              探索和使用各种实用工具来提高您的工作效率
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              建议新工具
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* 侧边栏 */}
            <div className="lg:w-1/4">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">工具分类</h3>
                
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    全部工具
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    文本处理
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    数据分析
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    文件处理
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    开发工具
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    学术工具
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100">
                    语言工具
                  </button>
                </div>
              </div>
            </div>

            {/* 主内容区 */}
            <div className="lg:w-3/4 mt-8 lg:mt-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                            {tool.icon}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-gray-500">{tool.category}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            tool.status
                          )}`}
                        >
                          {tool.status}
                        </span>
                        <button
                          disabled={tool.status !== '可用'}
                          className={`text-sm font-medium ${
                            tool.status === '可用'
                              ? 'text-indigo-600 hover:text-indigo-500'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {tool.status === '可用' ? '使用工具' : '敬请期待'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}