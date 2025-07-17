'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, PenTool, X, ChevronDown } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  description?: string;
}

const navigationItems: NavItem[] = [
  { title: '功能', href: '/features', description: '探索 AI 写作功能' },
  { title: '模板', href: '/templates', description: '专业写作模板' },
  { title: '演示', href: '/demo', description: '体验产品功能' },
  { title: '定价', href: '/pricing', description: '选择合适方案' }
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <PenTool className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">ChUseA</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex flex-col p-4 space-y-4">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={onClose}
            >
              <div className="font-medium text-slate-900 dark:text-white">
                {item.title}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </div>
            </Link>
          ))}
          
          <div className="border-t pt-4 mt-4 space-y-3">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link href="/signup">免费开始</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <PenTool className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-slate-900 dark:text-white">ChUseA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">登录</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">免费开始</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
}