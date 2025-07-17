'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopNavProps {
  className?: string;
}

const navItems = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/documents', label: '文档', icon: '📄' },
  { href: '/literature', label: '文献', icon: '📚' },
  { href: '/tools', label: '工具', icon: '🛠️' },
  { href: '/auth/login', label: '登录', icon: '👤' },
];

export const TopNav: React.FC<TopNavProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav className={cn('flex items-center space-x-6', className)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'flex items-center space-x-2 h-9 px-3',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};

export default TopNav;