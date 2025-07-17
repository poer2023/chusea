'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatInterfaceProps {
  className?: string;
  onSendMessage?: (message: string) => void;
}

export function AIChatInterface({ className, onSendMessage }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是您的 AI 写作助手。今天我可以为您做些什么？',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 调用外部回调
    if (onSendMessage) {
      onSendMessage(input);
    }

    // 模拟 AI 响应
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `我很乐意帮助您！基于您的问题"${input}"，我为您提供以下建议...`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={`flex h-[600px] w-full flex-col ${className || ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">AI 写作助手</h3>
            <p className="text-blue-100 text-sm">智能创作，无限可能</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-100">在线</span>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </Avatar>
            )}
            
            <div
              className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <span className={`mt-2 block text-xs ${
                message.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {message.timestamp.toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-10 w-10 bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </Avatar>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-4">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </Avatar>
            <div className="flex items-center space-x-2 rounded-2xl bg-white dark:bg-slate-800 px-6 py-4 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0s' }}></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-purple-500" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.4s' }}></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400 text-sm">正在思考...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-900">
        <div className="flex gap-4">
          <Input
            placeholder="输入您的问题，让 AI 助手帮助您..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 h-14 text-base px-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="lg"
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Send className="h-5 w-5 mr-2" />
            发送
          </Button>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            按 Enter 发送消息，Shift + Enter 换行
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>AI 助手已就绪</span>
          </div>
        </div>
      </div>
    </Card>
  );
}