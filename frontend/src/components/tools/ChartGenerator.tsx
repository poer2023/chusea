'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Download,
  Copy,
  Edit,
  Settings,
  RefreshCw,
  Plus,
  X,
  Upload,
  FileText
} from 'lucide-react';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'area';
  title: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}

export interface ChartGeneratorProps {
  onGenerate?: (data: ChartData, config: ChartConfig) => Promise<string>;
  onSave?: (chartUrl: string, config: ChartConfig) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  className?: string;
}

const CHART_TYPES = [
  { id: 'bar', name: '柱状图', icon: BarChart, description: '比较不同类别的数据' },
  { id: 'line', name: '折线图', icon: LineChart, description: '显示趋势变化' },
  { id: 'pie', name: '饼图', icon: PieChart, description: '显示占比关系' },
  { id: 'doughnut', name: '环形图', icon: PieChart, description: '显示占比关系(环形)' },
  { id: 'area', name: '面积图', icon: TrendingUp, description: '显示趋势和累积' },
  { id: 'scatter', name: '散点图', icon: TrendingUp, description: '显示相关性' },
];

const DEFAULT_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
];

const SAMPLE_DATA = {
  labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
  datasets: [{
    label: '销售数据',
    data: [65, 59, 80, 81, 56, 55],
    backgroundColor: DEFAULT_COLORS,
    borderColor: '#36A2EB',
    borderWidth: 2,
  }]
};

export default function ChartGenerator({
  onGenerate,
  onSave,
  onExport,
  className = '',
}: ChartGeneratorProps) {
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartData, setChartData] = useState<ChartData>(SAMPLE_DATA);
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    title: '',
    width: 600,
    height: 400,
    backgroundColor: '#ffffff',
    showLegend: true,
    showGrid: true,
    colors: DEFAULT_COLORS,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChartUrl, setGeneratedChartUrl] = useState<string | null>(null);
  const [editingData, setEditingData] = useState(false);
  const [dataInput, setDataInput] = useState(JSON.stringify(SAMPLE_DATA, null, 2));
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = useCallback((type: ChartConfig['type']) => {
    setChartType(type);
    setConfig(prev => ({ ...prev, type }));
  }, []);

  const handleConfigChange = useCallback((key: keyof ChartConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDataChange = useCallback((newData: string) => {
    setDataInput(newData);
    try {
      const parsed = JSON.parse(newData);
      setChartData(parsed);
      setError(null);
    } catch (error) {
      setError('数据格式不正确');
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!onGenerate) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const chartUrl = await onGenerate(chartData, {
        ...config,
        title: chartTitle,
        type: chartType,
      });
      
      setGeneratedChartUrl(chartUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [chartData, config, chartTitle, chartType, onGenerate]);

  const handleSave = useCallback(() => {
    if (!generatedChartUrl || !onSave) return;
    onSave(generatedChartUrl, { ...config, title: chartTitle, type: chartType });
  }, [generatedChartUrl, config, chartTitle, chartType, onSave]);

  const handleCopy = useCallback(() => {
    if (!generatedChartUrl) return;
    navigator.clipboard.writeText(generatedChartUrl);
  }, [generatedChartUrl]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          setChartData(parsed);
          setDataInput(JSON.stringify(parsed, null, 2));
        } else if (file.name.endsWith('.csv')) {
          // 简单的 CSV 解析
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => line.split(','));
          
          const labels = data.map(row => row[0]);
          const values = data.map(row => parseFloat(row[1]) || 0);
          
          const newData = {
            labels,
            datasets: [{
              label: headers[1] || '数据',
              data: values,
              backgroundColor: DEFAULT_COLORS,
              borderColor: '#36A2EB',
              borderWidth: 2,
            }]
          };
          
          setChartData(newData);
          setDataInput(JSON.stringify(newData, null, 2));
        }
        setError(null);
      } catch (error) {
        setError('文件格式不正确');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleAddDataset = useCallback(() => {
    const newDataset = {
      label: `数据集 ${chartData.datasets.length + 1}`,
      data: new Array(chartData.labels.length).fill(0),
      backgroundColor: DEFAULT_COLORS,
      borderColor: DEFAULT_COLORS[chartData.datasets.length % DEFAULT_COLORS.length],
      borderWidth: 2,
    };
    
    const newData = {
      ...chartData,
      datasets: [...chartData.datasets, newDataset],
    };
    
    setChartData(newData);
    setDataInput(JSON.stringify(newData, null, 2));
  }, [chartData]);

  const handleRemoveDataset = useCallback((index: number) => {
    const newData = {
      ...chartData,
      datasets: chartData.datasets.filter((_, i) => i !== index),
    };
    
    setChartData(newData);
    setDataInput(JSON.stringify(newData, null, 2));
  }, [chartData]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">图表生成器</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              导入数据
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* 图表类型选择 */}
        <div>
          <label className="block text-sm font-medium mb-3">图表类型</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CHART_TYPES.map(({ id, name, icon: Icon, description }) => (
              <Button
                key={id}
                variant={chartType === id ? "default" : "outline"}
                onClick={() => handleTypeChange(id as ChartConfig['type'])}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-gray-500 mt-1">{description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* 配置选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">图表标题</label>
            <Input
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="请输入图表标题"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">背景颜色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <Input
                value={config.backgroundColor}
                onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">宽度</label>
            <Input
              type="number"
              value={config.width}
              onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
              placeholder="600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">高度</label>
            <Input
              type="number"
              value={config.height}
              onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
              placeholder="400"
            />
          </div>
        </div>

        {/* 显示选项 */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showLegend}
              onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
            />
            <span className="text-sm">显示图例</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showGrid}
              onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
            />
            <span className="text-sm">显示网格</span>
          </label>
        </div>

        {/* 数据编辑 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">数据设置</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDataset}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加数据集
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingData(!editingData)}
              >
                <Edit className="h-4 w-4 mr-1" />
                {editingData ? '预览' : '编辑'}
              </Button>
            </div>
          </div>

          {editingData ? (
            <div>
              <Textarea
                value={dataInput}
                onChange={(e) => handleDataChange(e.target.value)}
                placeholder="请输入 JSON 格式的数据"
                className="font-mono text-sm min-h-[200px]"
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* 数据集管理 */}
              {chartData.datasets.map((dataset, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Input
                      value={dataset.label}
                      onChange={(e) => {
                        const newData = { ...chartData };
                        newData.datasets[index].label = e.target.value;
                        setChartData(newData);
                        setDataInput(JSON.stringify(newData, null, 2));
                      }}
                      className="font-medium"
                    />
                    
                    {chartData.datasets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDataset(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dataset.data.map((value, dataIndex) => (
                      <div key={dataIndex} className="space-y-1">
                        <label className="text-xs text-gray-600">
                          {chartData.labels[dataIndex]}
                        </label>
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            const newData = { ...chartData };
                            newData.datasets[index].data[dataIndex] = parseFloat(e.target.value) || 0;
                            setChartData(newData);
                            setDataInput(JSON.stringify(newData, null, 2));
                          }}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 生成按钮 */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !!error}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <BarChart className="h-4 w-4" />
                生成图表
              </>
            )}
          </Button>
          
          {generatedChartUrl && (
            <>
              <Button
                variant="outline"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-1" />
                复制链接
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
              >
                <Download className="h-4 w-4 mr-1" />
                保存图表
              </Button>
            </>
          )}
        </div>

        {/* 预览区域 */}
        {generatedChartUrl && (
          <Card className="p-4">
            <h3 className="font-medium mb-3">图表预览</h3>
            <div className="bg-white rounded-lg border p-4 text-center">
              <img
                src={generatedChartUrl}
                alt="Generated Chart"
                className="max-w-full h-auto mx-auto"
              />
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}