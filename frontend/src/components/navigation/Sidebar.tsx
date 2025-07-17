'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

const sidebarItems = [
  {
    group: '主要功能',
    items: [
      { href: '/', label: '首页', icon: '🏠' },
      { href: '/documents', label: '文档管理', icon: '📄' },
      { href: '/literature', label: '文献研究', icon: '📚' },
      { href: '/tools', label: '写作工具', icon: '🛠️' },
    ],
  },
  {
    group: '快捷操作',
    items: [
      { href: '/documents/new', label: '新建文档', icon: '📝' },
      { href: '/documents/recent', label: '最近文档', icon: '🕐' },
      { href: '/documents/starred', label: '收藏文档', icon: '⭐' },
    ],
  },
  {
    group: '账户',
    items: [
      { href: '/auth/login', label: '登录', icon: '👤' },
      { href: '/settings', label: '设置', icon: '⚙️' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  isCollapsed: controlledCollapsed, 
  onToggle 
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    if (onToggle) {
      onToggle(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">导航</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {sidebarItems.map((group, groupIndex) => (
            <div key={groupIndex}>
              {!isCollapsed && (
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'w-full justify-start h-10',
                          isCollapsed && 'justify-center px-0',
                          isActive && 'bg-blue-50 text-blue-700 font-medium'
                        )}
                      >
                        <span className="text-base">{item.icon}</span>
                        {!isCollapsed && (
                          <span className="ml-3 text-sm">{item.label}</span>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed && (
          <div className="text-xs text-gray-500">
            <p>ChUseA v1.0</p>
            <p>AI助手平台</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;