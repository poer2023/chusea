'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PenTool, BookOpen, MessageSquare, Sparkles } from 'lucide-react';

type WritingMode = 'academic' | 'blog' | 'social' | 'general';

interface WritingModeOption {
  id: WritingMode;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  prompt: string;
}

const writingModes: WritingModeOption[] = [
  {
    id: 'academic',
    name: '学术写作',
    description: '严谨的学术论文、研究报告写作',
    icon: BookOpen,
    color: 'bg-blue-500',
    prompt: '请以学术的语调帮我写作，使用正式的语言和严谨的逻辑结构。'
  },
  {
    id: 'blog',
    name: '博客写作',
    description: '轻松的博客文章、个人见解分享',
    icon: PenTool,
    color: 'bg-green-500',
    prompt: '请以博客的风格帮我写作，语言要轻松自然，富有个人色彩。'
  },
  {
    id: 'social',
    name: '社交媒体',
    description: '简洁有趣的社交媒体内容',
    icon: MessageSquare,
    color: 'bg-purple-500',
    prompt: '请以社交媒体的风格帮我写作，语言要简洁有趣，富有互动性。'
  },
  {
    id: 'general',
    name: '通用写作',
    description: '多用途的通用写作助手',
    icon: Sparkles,
    color: 'bg-orange-500',
    prompt: '请根据内容特点选择合适的写作风格帮我写作。'
  }
];

export default function WritingPage() {
  const [selectedMode, setSelectedMode] = useState<WritingMode>('general');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedModeData = writingModes.find(mode => mode.id === selectedMode);
      const mockOutput = `基于您选择的${selectedModeData?.name}模式，为您生成的内容：\n\n根据您的输入"${input}"，我为您创作了以下内容：\n\n这是一段示例生成内容，展示了${selectedModeData?.name}的写作风格。内容会根据您选择的模式进行相应的调整，以符合该模式的特点和要求。\n\n请注意，这只是一个演示，实际的AI写作助手会根据您的具体需求和选择的模式生成更加精准和个性化的内容。`;
      
      setOutput(mockOutput);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('生成失败:', error);
      }
      setOutput('生成失败，请重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            写作助手
          </h1>
          <p className="text-gray-600">
            选择写作模式，AI助手将根据您的需求生成高质量内容
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：写作模式选择 */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">选择写作模式</h2>
              <div className="space-y-3">
                {writingModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedMode === mode.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`p-2 rounded-lg ${mode.color} mr-3`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-medium text-gray-900">{mode.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* 右侧：写作界面 */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* 输入区域 */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">输入您的写作需求</h2>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请描述您想要写作的内容，例如：帮我写一篇关于人工智能发展的文章..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {input.length}/1000 字符
                  </span>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      disabled={!input && !output}
                    >
                      清除
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={!input.trim() || isGenerating}
                    >
                      {isGenerating ? '生成中...' : '生成内容'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 输出区域 */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">生成的内容</h2>
                  {output && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOutput}
                    >
                      复制内容
                    </Button>
                  )}
                </div>
                
                {isGenerating ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">正在生成内容...</span>
                  </div>
                ) : output ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {output}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>生成的内容将显示在这里</p>
                    <p className="text-sm mt-2">请输入您的写作需求并点击生成</p>
                  </div>
                )}
              </Card>

              {/* 写作建议 */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">写作建议</h2>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">提示技巧</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 提供详细的写作要求和背景信息</li>
                      <li>• 指定目标读者和写作目的</li>
                      <li>• 说明文章的长度和结构要求</li>
                      <li>• 提及特定的风格偏好或参考资料</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">当前模式：{writingModes.find(m => m.id === selectedMode)?.name}</h3>
                    <p className="text-sm text-green-800">
                      {writingModes.find(m => m.id === selectedMode)?.description}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}