'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, PenTool, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Background decoration - Fixed positioning and opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-600/30 blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-400/30 to-pink-600/30 blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-blue-300/20 to-purple-300/20 blur-3xl opacity-40"></div>
        {/* Additional background mesh */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/30 to-purple-50/30 dark:from-transparent dark:via-slate-800/30 dark:to-slate-700/30"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-28 sm:px-6 sm:py-40 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-purple-50 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 text-sm font-semibold mb-8 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
            <Sparkles className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            ✨ AI 驱动的智能写作平台
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            将您的想法转化为
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
              精彩内容
            </span>
          </h1>
          
          {/* Description */}
          <p className="mt-8 text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
            体验 AI 写作的未来。我们的智能平台能在几秒钟内生成高质量内容、
            研究洞察和创意想法，<span className="text-blue-600 dark:text-blue-400 font-semibold">而不是几个小时</span>。
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/chat">
              <Button 
                size="lg" 
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 border-0"
              >
                <PenTool className="mr-3 h-6 w-6" />
                免费开始写作
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Zap className="mr-3 h-6 w-6" />
                观看演示
              </Button>
            </Link>
          </div>
          
          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <PenTool className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                智能写作
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                AI 驱动的建议和纠错功能
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                创意灵感
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                即时生成新鲜的内容创意
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                极速响应
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                秒级响应，而非分钟等待
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}