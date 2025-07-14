'use client';

import React from 'react';
import { AppLayout } from '@/components/app-layout';
import { HeroSection } from '@/components/hero-section';
import { FeatureCards } from '@/components/feature-cards';
import { AIChatInterface } from '@/components/ai-chat-interface';

export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Cards Section */}
      <FeatureCards />
      
      {/* AI Chat Preview Section */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              体验 AI 写作助手
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              立即与我们的 AI 助手开始对话，体验智能写作的强大功能
            </p>
          </div>
          
          <div className="flex justify-center">
            <AIChatInterface className="shadow-2xl" />
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-slate-600 dark:text-slate-300 text-lg">活跃用户</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">持续增长中</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-slate-600 dark:text-slate-300 text-lg">生成文档</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">高质量内容</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600 dark:text-slate-300 text-lg">正常运行时间</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">可靠稳定</div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
