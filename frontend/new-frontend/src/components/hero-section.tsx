'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, PenTool, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            AI 驱动的写作助手
          </Badge>
          
          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            将您的想法转化为
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              精彩内容
            </span>
          </h1>
          
          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            体验 AI 写作的未来。我们的智能平台能在几秒钟内生成高质量内容、
            研究洞察和创意想法，而不是几个小时。
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/chat">
              <Button size="lg" className="px-8 py-3">
                <PenTool className="mr-2 h-5 w-5" />
                免费开始写作
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Zap className="mr-2 h-5 w-5" />
                查看演示
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