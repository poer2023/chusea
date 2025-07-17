'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './navbar';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function AppLayout({ 
  children, 
  className = '', 
  showNavbar = true,
  showFooter = true 
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {showNavbar && <Navbar />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && (
        <footer className="border-t bg-white dark:bg-slate-900 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="font-bold text-xl text-slate-900 dark:text-white">ChUseA</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-md">
                  ChUseA 是一个 AI 驱动的写作平台，帮助用户创建高质量内容，
                  提升写作效率和创意表达。
                </p>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <span className="sr-only">GitHub</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">产品</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      功能特性
                    </a>
                  </li>
                  <li>
                    <a href="/templates" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      写作模板
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      价格方案
                    </a>
                  </li>
                  <li>
                    <a href="/api" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      API 文档
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Support */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">支持</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/help" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      帮助中心
                    </a>
                  </li>
                  <li>
                    <a href="/docs" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      使用文档
                    </a>
                  </li>
                  <li>
                    <a href="/community" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      社区论坛
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                      联系我们
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                © 2025 ChUseA. 保留所有权利。
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                  隐私政策
                </a>
                <a href="/terms" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                  服务条款
                </a>
                <a href="/cookies" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Cookie 政策
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}