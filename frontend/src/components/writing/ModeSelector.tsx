'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface WritingMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  parameters?: Record<string, any>;
}

export interface ModeSelectorProps {
  modes: WritingMode[];
  selectedMode: WritingMode;
  onModeChange: (mode: WritingMode) => void;
  className?: string;
  layout?: 'grid' | 'list';
}

export default function ModeSelector({
  modes,
  selectedMode,
  onModeChange,
  className = '',
  layout = 'grid',
}: ModeSelectorProps) {
  if (layout === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium mb-2">
          写作模式
        </label>
        {modes.map((mode) => (
          <Card
            key={mode.id}
            className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMode.id === mode.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(mode)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{mode.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{mode.name}</span>
                  {selectedMode.id === mode.id && (
                    <Badge variant="secondary" size="sm">
                      已选择
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {mode.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">
        写作模式
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {modes.map((mode) => (
          <Button
            key={mode.id}
            variant={selectedMode.id === mode.id ? "default" : "outline"}
            className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
              selectedMode.id === mode.id
                ? 'ring-2 ring-blue-500 ring-offset-2'
                : 'hover:shadow-md'
            }`}
            onClick={() => onModeChange(mode)}
          >
            <span className="text-2xl">{mode.icon}</span>
            <div className="text-center">
              <div className="font-medium text-sm">{mode.name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {mode.description}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}