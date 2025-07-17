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
    <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
            ⚡ 强大功能
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            强大功能助力现代写作
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            创建精彩内容所需的一切功能，由前沿 AI 技术驱动。
            从构思到发布，全流程智能化解决方案。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:scale-[1.02] cursor-pointer bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm relative overflow-hidden h-full flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Link href={feature.href} className="block p-8 relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className={`h-7 w-7 ${colors.text}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 shadow-sm">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-lg flex-grow">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <span className={`${colors.text} font-semibold text-lg group-hover:underline transition-all duration-300`}>
                      了解更多
                    </span>
                    <ArrowRight className={`h-5 w-5 group-hover:translate-x-2 transition-transform duration-300 ${colors.text}`} />
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
        
        {/* CTA Section */}
        <div className="mt-20">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-blue-700/90"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                准备开始您的创作之旅？
              </h3>
              <p className="text-blue-100 mb-8 text-xl max-w-2xl mx-auto leading-relaxed">
                立即体验 ChUseA 的强大功能，让 AI 助力您的写作过程，
                开启智能创作新时代
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/chat">
                  <Button size="lg" className="px-10 py-4 bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-xl text-lg font-semibold">
                    <PenTool className="mr-3 h-6 w-6" />
                    免费开始写作
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="px-10 py-4 border-2 border-white/30 text-white hover:bg-white/10 text-lg font-semibold">
                    <FileText className="mr-3 h-6 w-6" />
                    观看演示
                  </Button>
                </Link>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}