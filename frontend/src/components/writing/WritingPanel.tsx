'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  PenTool, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Download,
  Settings,
  Lightbulb,
  Target
} from 'lucide-react';
import ModeSelector from './ModeSelector';
import ResultDisplay from './ResultDisplay';

export interface WritingMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  parameters?: Record<string, any>;
}

export interface WritingRequest {
  mode: WritingMode;
  prompt: string;
  context?: string;
  parameters?: Record<string, any>;
}

export interface WritingResult {
  id: string;
  content: string;
  mode: WritingMode;
  timestamp: Date;
  tokens?: number;
  duration?: number;
}

export interface WritingPanelProps {
  onGenerate?: (request: WritingRequest) => Promise<WritingResult>;
  onCopy?: (content: string) => void;
  onDownload?: (content: string, filename: string) => void;
  className?: string;
  maxHistory?: number;
}

const DEFAULT_MODES: WritingMode[] = [
  {
    id: 'continue',
    name: '续写',
    description: '根据现有内容继续写作',
    icon: '✍️',
  },
  {
    id: 'expand',
    name: '扩展',
    description: '扩展和丰富现有内容',
    icon: '🔄',
  },
  {
    id: 'summarize',
    name: '总结',
    description: '总结和概括内容要点',
    icon: '📝',
  },
  {
    id: 'improve',
    name: '改进',
    description: '改进文本质量和表达',
    icon: '✨',
  },
  {
    id: 'translate',
    name: '翻译',
    description: '翻译为其他语言',
    icon: '🌐',
  },
  {
    id: 'creative',
    name: '创意写作',
    description: '创意内容生成',
    icon: '🎨',
  },
];

export default function WritingPanel({
  onGenerate,
  onCopy,
  onDownload,
  className = '',
  maxHistory = 10,
}: WritingPanelProps) {
  const [selectedMode, setSelectedMode] = useState<WritingMode>(DEFAULT_MODES[0]);
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<WritingResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !onGenerate) return;

    const request: WritingRequest = {
      mode: selectedMode,
      prompt: prompt.trim(),
      context: context.trim() || undefined,
      parameters: selectedMode.parameters,
    };

    try {
      setIsGenerating(true);
      setError(null);
      
      const result = await onGenerate(request);
      
      setResults(prev => {
        const newResults = [result, ...prev];
        return newResults.slice(0, maxHistory);
      });
      
      // 清空输入
      setPrompt('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedMode, prompt, context, onGenerate, maxHistory]);

  const handleCopy = useCallback((content: string) => {
    if (onCopy) {
      onCopy(content);
    } else {
      navigator.clipboard.writeText(content);
    }
  }, [onCopy]);

  const handleDownload = useCallback((content: string) => {
    if (onDownload) {
      const filename = `writing_${Date.now()}.txt`;
      onDownload(content, filename);
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `writing_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [onDownload]);

  const handleClearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主面板 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">AI写作助手</h2>
          <Badge variant="outline" className="ml-auto">
            {selectedMode.name}
          </Badge>
        </div>

        {/* 模式选择器 */}
        <ModeSelector
          modes={DEFAULT_MODES}
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          className="mb-4"
        />

        {/* 输入区域 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Target className="inline h-4 w-4 mr-1" />
              写作要求
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`请输入${selectedMode.name}的具体要求...`}
              className="min-h-[100px]"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Lightbulb className="inline h-4 w-4 mr-1" />
              上下文内容 (可选)
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="提供相关的背景信息或现有内容..."
              className="min-h-[80px]"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  生成内容
                </>
              )}
            </Button>
            
            {results.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearResults}
                disabled={isGenerating}
              >
                清空历史
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 结果展示 */}
      {results.length > 0 && (
        <ResultDisplay
          results={results}
          onCopy={handleCopy}
          onDownload={handleDownload}
          className="mt-4"
        />
      )}
    </div>
  );
}