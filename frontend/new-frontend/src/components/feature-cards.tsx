'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PenTool, 
  FileText, 
  Lightbulb, 
  BarChart, 
  ArrowRight, 
  MessageSquare,
  Workflow,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI 智能对话',
    description: '与 AI 助手进行自然对话，获得写作建议、内容优化和创意灵感。',
    badge: '最受欢迎',
    color: 'blue',
    href: '/chat'
  },
  {
    icon: FileText,
    title: '富文本编辑器',
    description: '功能强大的编辑器，支持 Markdown、格式化和实时预览。',
    badge: '新功能',
    color: 'green',
    href: '/demo'
  },
  {
    icon: Workflow,
    title: '工作流管理',
    description: '自定义写作工作流，自动化内容生成和编辑流程。',
    badge: '特色功能',
    color: 'purple',
    href: '/workflow'
  },
  {
    icon: Lightbulb,
    title: '创意生成器',
    description: '永远不会缺乏内容创意，AI 驱动的头脑风暴工具。',
    badge: '热门',
    color: 'yellow',
    href: '/chat'
  },
  {
    icon: BarChart,
    title: '数据分析',
    description: '跟踪您的写作表现，获得洞察以改进内容质量。',
    badge: '专业版',
    color: 'orange',
    href: '/analytics'
  },
  {
    icon: Zap,
    title: '极速部署',
    description: '一键发布到多个平台，支持 SEO 优化和社交分享。',
    badge: '即将推出',
    color: 'red',
    href: '/deploy'
  }
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-600',
    hover: 'hover:bg-green-50 dark:hover:bg-green-900/10'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/10'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-600',
    hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/10'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-600',
    hover: 'hover:bg-red-50 dark:hover:bg-red-900/10'
  }
};

export function FeatureCards() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-slate-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            强大功能助力现代写作
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            创建精彩内容所需的一切功能，由前沿 AI 技术驱动。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-105 cursor-pointer"
              >
                <Link href={feature.href} className="block p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-between group-hover:bg-slate-100 dark:group-hover:bg-slate-800 ${colors.hover}`}
                  >
                    <span className={colors.text}>了解更多</span>
                    <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${colors.text}`} />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              准备开始您的创作之旅？
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              立即体验 ChUseA 的强大功能，让 AI 助力您的写作过程
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" className="px-8 py-3">
                  <PenTool className="mr-2 h-5 w-5" />
                  免费开始
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  <FileText className="mr-2 h-5 w-5" />
                  查看演示
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}